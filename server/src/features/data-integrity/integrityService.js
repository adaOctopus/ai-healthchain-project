/**
 * Data Integrity Service
 * 
 * This service manages Merkle tree creation, proof generation, and verification
 * for medical records to ensure data integrity.
 */

const MerkleTree = require('./MerkleTree.js');

class IntegrityService {
  constructor(blockchain, data) {
    this.blockchain = blockchain;
    this.data = data;
    this.trees = new Map(); // Store trees by root hash
  }

  /**
   * Create Merkle tree for a batch of records
   * 
   * @param {Array} records - Array of medical records
   * @returns {Object} Merkle tree and root
   */
  async createMerkleTree(records) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Records array is required and cannot be empty');
    }

    try {
      // Create Merkle tree from records
      const tree = new MerkleTree(records);
      const root = tree.getRoot();

      // Store tree for later proof generation
      this.trees.set(root, { tree, records, createdAt: Date.now() });

      return {
        success: true,
        root,
        recordCount: records.length,
        tree
      };
    } catch (error) {
      throw new Error(`Failed to create Merkle tree: ${error.message}`);
    }
  }

  /**
   * Generate proof for a specific record
   * 
   * @param {Object} record - Medical record
   * @param {string} root - Merkle root hash (optional, will find if not provided)
   * @returns {Object} Proof object
   */
  async generateProof(record, root = null) {
    if (!record) {
      throw new Error('Record is required');
    }

    try {
      let tree;
      
      if (root) {
        // Use tree with specified root
        const treeData = this.trees.get(root);
        if (!treeData) {
          throw new Error(`Tree with root ${root} not found`);
        }
        tree = treeData.tree;
      } else {
        // Find tree containing this record
        let foundTree = null;
        for (const [treeRoot, treeData] of this.trees.entries()) {
          const recordIndex = treeData.records.findIndex(r => 
            JSON.stringify(r) === JSON.stringify(record)
          );
          if (recordIndex !== -1) {
            foundTree = treeData.tree;
            root = treeRoot;
            break;
          }
        }
        
        if (!foundTree) {
          throw new Error('Record not found in any stored tree');
        }
        tree = foundTree;
      }

      const proof = tree.getProof(record);

      return {
        success: true,
        proof,
        root: root || tree.getRoot()
      };
    } catch (error) {
      throw new Error(`Failed to generate proof: ${error.message}`);
    }
  }

  /**
   * Verify record integrity
   * 
   * @param {Object} record - Medical record
   * @param {Object} proof - Merkle proof
   * @param {string} root - Expected root hash
   * @returns {boolean} True if valid
   */
  async verifyIntegrity(record, proof, root) {
    if (!record || !proof || !root) {
      throw new Error('Record, proof, and root are required');
    }

    try {
      const isValid = MerkleTree.verifyProof(record, proof, root);

      return {
        success: true,
        valid: isValid,
        record,
        root
      };
    } catch (error) {
      throw new Error(`Failed to verify integrity: ${error.message}`);
    }
  }

  /**
   * Verify batch of records
   * 
   * @param {Array} records - Array of {data, proof, root} objects
   * @returns {Object} Verification results
   */
  async verifyBatch(records) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error('Records array is required and cannot be empty');
    }

    try {
      // Prepare proofs for batch verification
      const proofs = records.map(({ data, proof, root }) => ({
        data,
        proof,
        root
      }));

      const allValid = MerkleTree.verifyBatch(proofs);

      // Individual results
      const results = records.map(({ data, proof, root }) => ({
        data,
        valid: MerkleTree.verifyProof(data, proof, root)
      }));

      return {
        success: true,
        allValid,
        results,
        total: records.length,
        validCount: results.filter(r => r.valid).length
      };
    } catch (error) {
      throw new Error(`Failed to verify batch: ${error.message}`);
    }
  }

  /**
   * Store Merkle root on blockchain
   * 
   * @param {string} root - Merkle root hash
   * @param {string} description - Description of what this root represents
   * @returns {Object} Transaction result
   */
  async storeRootOnChain(root, description = '') {
    if (!root) {
      throw new Error('Root hash is required');
    }

    try {
      const transaction = {
        from: 'system',
        to: 'merkle-root-registry',
        data: {
          action: 'store-root',
          root,
          description,
          timestamp: Date.now()
        }
      };

      const txResult = this.blockchain.addTransaction(transaction);

      return {
        success: true,
        root,
        transaction: txResult
      };
    } catch (error) {
      throw new Error(`Failed to store root on chain: ${error.message}`);
    }
  }
}

module.exports = IntegrityService;

