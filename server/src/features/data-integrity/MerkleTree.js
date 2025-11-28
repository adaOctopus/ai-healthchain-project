/**
 * Merkle Tree Implementation
 * 
 * This class implements a binary Merkle tree for data integrity verification.
 * 
 * Data Structure:
 * - Tree Structure: Binary tree where each node is a hash
 * - Leaf Nodes: Hashes of original data items
 * - Internal Nodes: Hashes of concatenated child nodes
 * - Root: Single hash representing entire dataset
 * 
 * Proof Structure:
 * - Proof: {
 *     leaf: string (hash of data)
 *     path: Array<{hash: string, position: 'left'|'right'}>
 *     root: string (expected root hash)
 *   }
 */

const crypto = require('crypto');

class MerkleTree {
  constructor(data = []) {
    this.leaves = [];
    this.root = null;
    this.levels = []; // Store all tree levels for proof generation
    
    if (data.length > 0) {
      this.buildTree(data);
    }
  }

  /**
   * Hash a piece of data using SHA-256
   * 
   * @param {string|Object} data - Data to hash
   * @returns {string} Hexadecimal hash value
   */
  hash(data) {
    const dataString = typeof data === 'string' 
      ? data 
      : JSON.stringify(data);
    
    return crypto.createHash('sha256')
      .update(dataString)
      .digest('hex');
  }

  /**
   * Build Merkle tree from data items
   * 
   * Algorithm:
   * 1. Hash all data items to create leaves
   * 2. Build tree bottom-up by pairing nodes
   * 3. For odd number of nodes, duplicate the last node
   * 4. Continue until single root node remains
   * 
   * @param {Array} data - Array of data items (strings or objects)
   */
  buildTree(data) {
    if (data.length === 0) {
      this.root = this.hash('');
      this.levels = [[this.root]];
      return;
    }

    // Hash all leaves
    this.leaves = data.map(item => this.hash(item));
    this.levels = [this.leaves]; // First level is leaves

    // Build tree levels bottom-up
    let currentLevel = [...this.leaves];
    
    while (currentLevel.length > 1) {
      const nextLevel = [];
      
      // Process pairs
      for (let i = 0; i < currentLevel.length; i += 2) {
        if (i + 1 < currentLevel.length) {
          // Pair exists - hash concatenation
          const left = currentLevel[i];
          const right = currentLevel[i + 1];
          const combined = this.hash(left + right);
          nextLevel.push(combined);
        } else {
          // Odd number - duplicate last node
          const last = currentLevel[i];
          const combined = this.hash(last + last);
          nextLevel.push(combined);
        }
      }
      
      this.levels.push(nextLevel);
      currentLevel = nextLevel;
    }

    // Root is the single remaining node
    this.root = currentLevel[0];
  }

  /**
   * Get Merkle root hash
   * 
   * @returns {string} Root hash
   */
  getRoot() {
    if (!this.root) {
      throw new Error('Tree has not been built');
    }
    return this.root;
  }

  /**
   * Generate Merkle proof for a data item
   * 
   * A proof consists of:
   * - The leaf hash (hash of the data)
   * - A path of sibling hashes and their positions
   * - The root hash
   * 
   * @param {string|Object} data - Data item to prove
   * @returns {Object} Proof object
   */
  getProof(data) {
    if (this.leaves.length === 0) {
      throw new Error('Tree is empty');
    }

    const leafHash = this.hash(data);
    
    // Find leaf index
    const leafIndex = this.leaves.findIndex(hash => hash === leafHash);
    if (leafIndex === -1) {
      throw new Error('Data item not found in tree');
    }

    // Build proof path
    const path = [];
    let currentIndex = leafIndex;
    
    // Traverse from leaf to root
    for (let level = 0; level < this.levels.length - 1; level++) {
      const currentLevel = this.levels[level];
      const isLeft = currentIndex % 2 === 0;
      const siblingIndex = isLeft ? currentIndex + 1 : currentIndex - 1;
      
      // If sibling exists, add to path
      if (siblingIndex < currentLevel.length) {
        path.push({
          hash: currentLevel[siblingIndex],
          position: isLeft ? 'right' : 'left'
        });
      } else {
        // Odd node at end - duplicate itself
        path.push({
          hash: currentLevel[currentIndex],
          position: isLeft ? 'right' : 'left'
        });
      }
      
      // Move to parent level
      currentIndex = Math.floor(currentIndex / 2);
    }

    return {
      leaf: leafHash,
      path,
      root: this.root
    };
  }

  /**
   * Verify a Merkle proof against root
   * 
   * Algorithm:
   * 1. Hash the data to get leaf hash
   * 2. Reconstruct path by combining with siblings
   * 3. Compare final hash with root
   * 
   * @param {string|Object} data - Original data
   * @param {Object} proof - Proof object with path and root
   * @param {string} root - Expected root hash (optional, uses proof.root if not provided)
   * @returns {boolean} True if proof is valid
   */
  static verifyProof(data, proof, root = null) {
    if (!proof || !proof.path || !proof.root) {
      return false;
    }

    const expectedRoot = root || proof.root;
    const leafHash = crypto.createHash('sha256')
      .update(typeof data === 'string' ? data : JSON.stringify(data))
      .digest('hex');

    // Verify leaf matches
    if (proof.leaf !== leafHash) {
      return false;
    }

    // Reconstruct path
    let currentHash = leafHash;
    
    for (const sibling of proof.path) {
      if (sibling.position === 'left') {
        // Sibling is on left, current is on right
        currentHash = crypto.createHash('sha256')
          .update(sibling.hash + currentHash)
          .digest('hex');
      } else {
        // Sibling is on right, current is on left
        currentHash = crypto.createHash('sha256')
          .update(currentHash + sibling.hash)
          .digest('hex');
      }
    }

    // Compare with root
    return currentHash === expectedRoot;
  }

  /**
   * Verify multiple proofs in batch
   * 
   * Efficiently verifies multiple proofs, returning true only if all are valid.
   * 
   * @param {Array} proofs - Array of {data, proof, root} objects
   * @returns {boolean} True if all proofs are valid
   */
  static verifyBatch(proofs) {
    if (!Array.isArray(proofs) || proofs.length === 0) {
      return false;
    }

    for (const { data, proof, root } of proofs) {
      if (!data || !proof) {
        return false;
      }

      const isValid = MerkleTree.verifyProof(data, proof, root);
      if (!isValid) {
        return false;
      }
    }

    return true;
  }
}

module.exports = MerkleTree;

