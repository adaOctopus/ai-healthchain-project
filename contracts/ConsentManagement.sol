// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";

/**
 * @title ConsentManagement
 * @dev Smart contract for managing patient consent on the blockchain
 * @notice Implements UUPS upgradeable proxy pattern with reentrancy protection
 * 
 * Data Structures:
 * - ConsentRecord: Stores consent information with expiration tracking
 * - ConsentStatus: Enum for consent states (None, Granted, Revoked, Expired)
 * 
 * Security Features:
 * - ReentrancyGuard: Prevents reentrancy attacks
 * - AccessControl: Role-based access control
 * - UUPS Proxy: Upgradeable contract pattern
 * - Gas Optimization: Packed structs, events for off-chain queries
 */
contract ConsentManagement is 
    UUPSUpgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant CLINICIAN_ROLE = keccak256("CLINICIAN_ROLE");
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");

    // Consent status enum
    enum ConsentStatus {
        None,      // 0
        Granted,   // 1
        Revoked,   // 2
        Expired    // 3
    }

    // Consent types enum
    enum ConsentType {
        DataAccess,    // 0
        AIAnalysis,    // 1
        Research,     // 2
        Sharing        // 3
    }

    // Consent record structure - packed for gas optimization
    struct ConsentRecord {
        bytes32 consentId;        // 32 bytes
        address patientId;        // 20 bytes
        address clinicianId;      // 20 bytes
        ConsentType consentType;  // 1 byte
        ConsentStatus status;     // 1 byte
        uint64 grantedAt;         // 8 bytes
        uint64 expiresAt;         // 8 bytes (0 = no expiration)
        uint32 purpose;           // 4 bytes (encoded purpose)
        // Total: ~94 bytes (fits in 2 storage slots)
    }

    // State variables
    CountersUpgradeable.Counter private _consentIdCounter;
    
    // Mapping: patientId => clinicianId => consentType => consentId
    mapping(address => mapping(address => mapping(ConsentType => bytes32))) 
        private _activeConsents;
    
    // Mapping: consentId => ConsentRecord
    mapping(bytes32 => ConsentRecord) private _consents;
    
    // Mapping: patientId => consentId[]
    mapping(address => bytes32[]) private _patientConsents;

    // Events for off-chain indexing (gas optimization)
    event ConsentGranted(
        bytes32 indexed consentId,
        address indexed patientId,
        address indexed clinicianId,
        ConsentType consentType,
        uint64 grantedAt,
        uint64 expiresAt
    );

    event ConsentRevoked(
        bytes32 indexed consentId,
        address indexed revokedBy,
        uint64 revokedAt
    );

    event ConsentExpired(
        bytes32 indexed consentId,
        address indexed patientId
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initialize the contract (replaces constructor for upgradeable contracts)
     */
    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /**
     * @dev Grant consent for a patient to a clinician
     * @param patientId Address of the patient
     * @param clinicianId Address of the clinician
     * @param consentType Type of consent being granted
     * @param expiresAt Expiration timestamp (0 = no expiration)
     * @param purpose Encoded purpose identifier
     * @return consentId The ID of the created consent record
     */
    function grantConsent(
        address patientId,
        address clinicianId,
        ConsentType consentType,
        uint64 expiresAt,
        uint32 purpose
    ) 
        external 
        nonReentrant 
        returns (bytes32 consentId) 
    {
        // Validate inputs
        require(patientId != address(0), "Invalid patient address");
        require(clinicianId != address(0), "Invalid clinician address");
        require(
            hasRole(CLINICIAN_ROLE, clinicianId) || 
            hasRole(PATIENT_ROLE, patientId),
            "Unauthorized"
        );

        // Check for existing active consent
        bytes32 existingConsentId = _activeConsents[patientId][clinicianId][consentType];
        if (existingConsentId != bytes32(0)) {
            ConsentRecord storage existing = _consents[existingConsentId];
            require(
                existing.status != ConsentStatus.Granted || 
                (existing.expiresAt > 0 && existing.expiresAt < block.timestamp),
                "Active consent already exists"
            );
        }

        // Generate new consent ID
        _consentIdCounter.increment();
        consentId = keccak256(
            abi.encodePacked(
                patientId,
                clinicianId,
                consentType,
                block.timestamp,
                _consentIdCounter.current()
            )
        );

        // Create consent record
        ConsentRecord memory newConsent = ConsentRecord({
            consentId: consentId,
            patientId: patientId,
            clinicianId: clinicianId,
            consentType: consentType,
            status: ConsentStatus.Granted,
            grantedAt: uint64(block.timestamp),
            expiresAt: expiresAt,
            purpose: purpose
        });

        // Store consent
        _consents[consentId] = newConsent;
        _activeConsents[patientId][clinicianId][consentType] = consentId;
        _patientConsents[patientId].push(consentId);

        // Emit event
        emit ConsentGranted(
            consentId,
            patientId,
            clinicianId,
            consentType,
            newConsent.grantedAt,
            expiresAt
        );

        return consentId;
    }

    /**
     * @dev Revoke a consent
     * @param consentId ID of the consent to revoke
     */
    function revokeConsent(bytes32 consentId) 
        external 
        nonReentrant 
    {
        ConsentRecord storage consent = _consents[consentId];
        
        require(consent.consentId != bytes32(0), "Consent not found");
        require(
            consent.status == ConsentStatus.Granted,
            "Consent not active"
        );
        require(
            msg.sender == consent.patientId || 
            hasRole(ADMIN_ROLE, msg.sender),
            "Unauthorized to revoke"
        );

        // Update status
        consent.status = ConsentStatus.Revoked;
        
        // Clear active consent mapping
        delete _activeConsents[
            consent.patientId
        ][
            consent.clinicianId
        ][
            consent.consentType
        ];

        emit ConsentRevoked(consentId, msg.sender, uint64(block.timestamp));
    }

    /**
     * @dev Check if valid consent exists
     * @param patientId Address of the patient
     * @param clinicianId Address of the clinician
     * @param consentType Type of consent to check
     * @return exists True if valid consent exists
     */
    function hasValidConsent(
        address patientId,
        address clinicianId,
        ConsentType consentType
    ) 
        external 
        view 
        returns (bool exists) 
    {
        bytes32 consentId = _activeConsents[patientId][clinicianId][consentType];
        
        if (consentId == bytes32(0)) {
            return false;
        }

        ConsentRecord storage consent = _consents[consentId];
        
        // Check status
        if (consent.status != ConsentStatus.Granted) {
            return false;
        }

        // Check expiration
        if (consent.expiresAt > 0 && consent.expiresAt < block.timestamp) {
            return false;
        }

        return true;
    }

    /**
     * @dev Get consent record by ID
     * @param consentId ID of the consent
     * @return record The consent record
     */
    function getConsent(bytes32 consentId)
        external
        view
        returns (ConsentRecord memory record)
    {
        record = _consents[consentId];
        require(record.consentId != bytes32(0), "Consent not found");
    }

    /**
     * @dev Get all consent IDs for a patient
     * @param patientId Address of the patient
     * @return consentIds Array of consent IDs
     */
    function getPatientConsents(address patientId)
        external
        view
        returns (bytes32[] memory consentIds)
    {
        return _patientConsents[patientId];
    }

    /**
     * @dev Authorize upgrade (UUPS pattern)
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(ADMIN_ROLE)
    {}

    /**
     * @dev Get contract version
     */
    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}

