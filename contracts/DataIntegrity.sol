// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title DataIntegrity
 * @dev Smart contract for storing Merkle roots and verifying data integrity
 * @notice Implements UUPS upgradeable proxy with gas-optimized Merkle root storage
 * 
 * Data Structures:
 * - MerkleRootRecord: Stores Merkle root with metadata
 * 
 * Security Features:
 * - ReentrancyGuard: Prevents reentrancy attacks
 * - AccessControl: Role-based access
 * - Immutable root storage
 */
contract DataIntegrity is 
    UUPSUpgradeable, 
    AccessControlUpgradeable, 
    ReentrancyGuardUpgradeable 
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct MerkleRootRecord {
        bytes32 root;           // 32 bytes
        bytes32 recordSetId;    // 32 bytes (identifier for the set of records)
        uint64 timestamp;       // 8 bytes
        uint32 recordCount;     // 4 bytes
        address storedBy;       // 20 bytes
        // Total: ~96 bytes
    }

    // State variables
    mapping(bytes32 => MerkleRootRecord) private _merkleRoots; // root => record
    mapping(bytes32 => bytes32[]) private _recordSetRoots;    // recordSetId => root[]
    bytes32[] private _allRoots; // For enumeration

    event MerkleRootStored(
        bytes32 indexed root,
        bytes32 indexed recordSetId,
        address indexed storedBy,
        uint32 recordCount,
        uint64 timestamp
    );

    event MerkleRootVerified(
        bytes32 indexed root,
        bool verified,
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
     * @dev Store a Merkle root on-chain
     * @param root The Merkle root hash
     * @param recordSetId Identifier for the set of records
     * @param recordCount Number of records in the set
     * @return success True if stored successfully
     */
    function storeMerkleRoot(
        bytes32 root,
        bytes32 recordSetId,
        uint32 recordCount
    ) 
        external 
        nonReentrant 
        returns (bool success) 
    {
        require(root != bytes32(0), "Invalid root");
        require(recordSetId != bytes32(0), "Invalid record set ID");
        require(recordCount > 0, "Invalid record count");
        require(
            hasRole(ADMIN_ROLE, msg.sender) || 
            hasRole(VERIFIER_ROLE, msg.sender),
            "Unauthorized"
        );

        // Check if root already exists
        require(_merkleRoots[root].root == bytes32(0), "Root already stored");

        MerkleRootRecord memory record = MerkleRootRecord({
            root: root,
            recordSetId: recordSetId,
            timestamp: uint64(block.timestamp),
            recordCount: recordCount,
            storedBy: msg.sender
        });

        _merkleRoots[root] = record;
        _recordSetRoots[recordSetId].push(root);
        _allRoots.push(root);

        emit MerkleRootStored(
            root,
            recordSetId,
            msg.sender,
            recordCount,
            record.timestamp
        );

        return true;
    }

    /**
     * @dev Verify if a Merkle root exists
     * @param root The Merkle root to verify
     * @return exists True if root exists
     * @return record The Merkle root record if exists
     */
    function verifyMerkleRoot(bytes32 root)
        external
        view
        returns (bool exists, MerkleRootRecord memory record)
    {
        record = _merkleRoots[root];
        exists = record.root != bytes32(0);
        
        if (exists) {
            emit MerkleRootVerified(root, true, uint64(block.timestamp));
        }
    }

    /**
     * @dev Get Merkle root record
     * @param root The Merkle root
     * @return record The Merkle root record
     */
    function getMerkleRootRecord(bytes32 root)
        external
        view
        returns (MerkleRootRecord memory record)
    {
        record = _merkleRoots[root];
        require(record.root != bytes32(0), "Root not found");
    }

    /**
     * @dev Get all roots for a record set
     * @param recordSetId The record set ID
     * @return roots Array of Merkle roots
     */
    function getRecordSetRoots(bytes32 recordSetId)
        external
        view
        returns (bytes32[] memory roots)
    {
        return _recordSetRoots[recordSetId];
    }

    /**
     * @dev Get total number of stored roots
     * @return count Total number of roots
     */
    function getTotalRoots() external view returns (uint256 count) {
        return _allRoots.length;
    }

    /**
     * @dev Get root at index (for enumeration)
     * @param index The index
     * @return root The Merkle root
     */
    function getRootAtIndex(uint256 index)
        external
        view
        returns (bytes32 root)
    {
        require(index < _allRoots.length, "Index out of bounds");
        return _allRoots[index];
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

