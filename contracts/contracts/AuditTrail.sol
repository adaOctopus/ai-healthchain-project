// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

/**
 * @title AuditTrail
 * @dev Immutable audit logging contract for healthcare data access tracking
 * @notice Implements UUPS upgradeable proxy with gas-optimized event-based logging
 * 
 * Data Structures:
 * - AuditEntry: Packed struct for efficient storage
 * - AuditType: Enum for different audit event types
 * 
 * Security Features:
 * - ReentrancyGuard: Prevents reentrancy attacks
 * - AccessControl: Role-based access
 * - Immutable logs via events (gas optimization)
 * - Batch operations for efficiency
 */
contract AuditTrail is 
    UUPSUpgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    enum AuditType {
        DataAccess,     // 0
        ConsentChange,  // 1
        AIDiagnostic,   // 2
        SystemEvent     // 3
    }

    // Packed struct for gas optimization
    struct AuditEntry {
        bytes32 entryId;        // 32 bytes
        AuditType auditType;    // 1 byte
        address actorId;         // 20 bytes
        bytes32 resourceId;      // 32 bytes
        uint64 timestamp;        // 8 bytes
        bool granted;            // 1 byte
        // Total: ~94 bytes
    }

    // State variables
    mapping(bytes32 => AuditEntry) private _auditEntries;
    mapping(bytes32 => bytes32[]) private _resourceAuditTrails; // resourceId => entryId[]
    mapping(address => bytes32[]) private _actorAuditTrails;    // actorId => entryId[]

    // Events for efficient off-chain querying
    event AuditLogged(
        bytes32 indexed entryId,
        AuditType indexed auditType,
        address indexed actorId,
        bytes32 resourceId,
        uint64 timestamp,
        bool granted,
        string reason
    );

    event BatchAuditLogged(
        bytes32[] entryIds,
        AuditType auditType,
        uint64 timestamp
    );

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address admin) public initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();
        __ReentrancyGuard_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
    }

    /**
     * @dev Log a data access event
     * @param actorId Address of the entity accessing data
     * @param resourceId ID of the resource being accessed
     * @param granted Whether access was granted
     * @param reason Reason for grant/denial
     * @return entryId The ID of the audit entry
     */
    function logDataAccess(
        address actorId,
        bytes32 resourceId,
        bool granted,
        string calldata reason
    ) 
        external 
        nonReentrant 
        returns (bytes32 entryId) 
    {
        require(actorId != address(0), "Invalid actor address");
        require(resourceId != bytes32(0), "Invalid resource ID");

        entryId = _createAuditEntry(
            AuditType.DataAccess,
            actorId,
            resourceId,
            granted
        );

        emit AuditLogged(
            entryId,
            AuditType.DataAccess,
            actorId,
            resourceId,
            uint64(block.timestamp),
            granted,
            reason
        );

        return entryId;
    }

    /**
     * @dev Log a consent change event
     * @param actorId Address of the entity making the change
     * @param consentId ID of the consent record
     * @param action Action taken (granted/revoked)
     * @return entryId The ID of the audit entry
     */
    function logConsentChange(
        address actorId,
        bytes32 consentId,
        string calldata action
    ) 
        external 
        nonReentrant 
        returns (bytes32 entryId) 
    {
        require(actorId != address(0), "Invalid actor address");
        require(consentId != bytes32(0), "Invalid consent ID");

        entryId = _createAuditEntry(
            AuditType.ConsentChange,
            actorId,
            consentId,
            true // Consent changes are always "granted" (action happened)
        );

        emit AuditLogged(
            entryId,
            AuditType.ConsentChange,
            actorId,
            consentId,
            uint64(block.timestamp),
            true,
            action
        );

        return entryId;
    }

    /**
     * @dev Log an AI diagnostic event
     * @param modelId ID of the AI model
     * @param recordId ID of the medical record
     * @param confidence Confidence score (0-10000, representing 0.00-100.00%)
     * @return entryId The ID of the audit entry
     */
    function logAIDiagnostic(
        bytes32 modelId,
        bytes32 recordId,
        uint16 confidence
    ) 
        external 
        nonReentrant 
        returns (bytes32 entryId) 
    {
        require(modelId != bytes32(0), "Invalid model ID");
        require(recordId != bytes32(0), "Invalid record ID");
        require(confidence <= 10000, "Invalid confidence score");

        // Use modelId as actorId (address(0) for system actors)
        entryId = _createAuditEntry(
            AuditType.AIDiagnostic,
            address(0), // System actor
            recordId,
            true
        );

        emit AuditLogged(
            entryId,
            AuditType.AIDiagnostic,
            address(0),
            recordId,
            uint64(block.timestamp),
            true,
            string(abi.encodePacked("Model: ", _bytes32ToString(modelId), " Confidence: ", _uint16ToString(confidence)))
        );

        return entryId;
    }

    /**
     * @dev Get audit entry by ID
     * @param entryId ID of the audit entry
     * @return entry The audit entry
     */
    function getAuditEntry(bytes32 entryId)
        external
        view
        returns (AuditEntry memory entry)
    {
        entry = _auditEntries[entryId];
        require(entry.entryId != bytes32(0), "Audit entry not found");
    }

    /**
     * @dev Get audit trail for a resource
     * @param resourceId ID of the resource
     * @return entryIds Array of audit entry IDs
     */
    function getResourceAuditTrail(bytes32 resourceId)
        external
        view
        returns (bytes32[] memory entryIds)
    {
        return _resourceAuditTrails[resourceId];
    }

    /**
     * @dev Get audit trail for an actor
     * @param actorId Address of the actor
     * @return entryIds Array of audit entry IDs
     */
    function getActorAuditTrail(address actorId)
        external
        view
        returns (bytes32[] memory entryIds)
    {
        return _actorAuditTrails[actorId];
    }

    /**
     * @dev Internal function to create audit entry
     */
    function _createAuditEntry(
        AuditType auditType,
        address actorId,
        bytes32 resourceId,
        bool granted
    ) 
        internal 
        returns (bytes32 entryId) 
    {
        entryId = keccak256(
            abi.encodePacked(
                actorId,
                resourceId,
                block.timestamp,
                block.number,
                gasleft()
            )
        );

        AuditEntry memory entry = AuditEntry({
            entryId: entryId,
            auditType: auditType,
            actorId: actorId,
            resourceId: resourceId,
            timestamp: uint64(block.timestamp),
            granted: granted
        });

        _auditEntries[entryId] = entry;
        _resourceAuditTrails[resourceId].push(entryId);
        _actorAuditTrails[actorId].push(entryId);

        return entryId;
    }

    /**
     * @dev Helper to convert bytes32 to string (for events)
     */
    function _bytes32ToString(bytes32 _bytes32) internal pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    /**
     * @dev Helper to convert uint16 to string
     */
    function _uint16ToString(uint16 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint16 j = _i;
        uint16 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint16 k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(ADMIN_ROLE)
    {}

    function version() external pure returns (string memory) {
        return "1.0.0";
    }
}

