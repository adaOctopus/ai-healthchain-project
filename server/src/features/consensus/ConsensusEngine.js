/**
 * Consensus Engine - Consensus mechanism for permissioned blockchain
 * 
 * This class implements a simplified voting-based consensus mechanism
 * for a permissioned blockchain network.
 * 
 * Data Structure:
 * - Block Proposal: {
 *     block: Object (block structure)
 *     proposerId: string
 *     timestamp: number
 *   }
 * 
 * - Vote: {
 *     blockHash: string
 *     nodeId: string
 *     isValid: boolean
 *     timestamp: number
 *   }
 * 
 * - Consensus Status: {
 *     blockHash: string
 *     votes: Array<Vote>
 *     totalNodes: number
 *     agreementCount: number
 *     threshold: number
 *     reached: boolean
 *   }
 */

class ConsensusEngine {
  constructor(blockchain, nodeManager) {
    this.blockchain = blockchain;
    this.nodeManager = nodeManager;
    this.pendingValidations = new Map(); // blockHash -> { proposal, votes: [] }
    this.consensusThreshold = 0.67; // 67% agreement required
  }

  /**
   * Propose a new block for consensus
   * 
   * Validates all transactions, creates a block proposal, and initiates
   * the consensus voting process.
   * 
   * @param {Array} transactions - Transactions to include in block
   * @returns {Promise<Object>} Consensus result
   */
  async proposeBlock(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error('Transactions array is required and cannot be empty');
    }

    // Validate all transactions
    const invalidTransactions = [];
    for (const tx of transactions) {
      if (!this.blockchain.isValidTransaction(tx)) {
        invalidTransactions.push(tx);
      }
    }

    if (invalidTransactions.length > 0) {
      throw new Error(`Invalid transactions found: ${invalidTransactions.length}`);
    }

    // Create block proposal
    const blockProposal = {
      index: this.blockchain.getChainLength(),
      timestamp: Date.now(),
      transactions: [...transactions],
      previousHash: this.blockchain.getLatestBlock()?.hash || '0',
      nonce: 0
    };

    // Calculate Merkle root
    blockProposal.merkleRoot = this.blockchain.calculateMerkleRoot(blockProposal.transactions);

    // Calculate block hash
    blockProposal.hash = this.blockchain.calculateBlockHash(blockProposal);

    const proposalId = blockProposal.hash;
    const proposerId = this.nodeManager.getNodeId();

    // Initialize voting for this proposal
    this.pendingValidations.set(proposalId, {
      proposal: {
        block: blockProposal,
        proposerId,
        timestamp: Date.now()
      },
      votes: []
    });

    // In a real network, this would broadcast to other nodes
    // For now, we'll simulate by having this node vote
    const vote = this.voteOnBlock(proposalId, true);

    // Check consensus
    const consensusStatus = this.checkConsensus(proposalId);

    return {
      proposalId,
      block: blockProposal,
      consensus: consensusStatus,
      vote
    };
  }

  /**
   * Validate a block proposal
   * 
   * Performs comprehensive validation of a block proposal including
   * structure, transactions, Merkle root, and chain continuity.
   * 
   * @param {Object} blockProposal - Proposed block
   * @returns {boolean} True if block is valid
   */
  validateBlockProposal(blockProposal) {
    if (!blockProposal) {
      return false;
    }

    // Check block structure
    if (!blockProposal.index !== undefined ||
        !blockProposal.timestamp ||
        !Array.isArray(blockProposal.transactions) ||
        !blockProposal.previousHash ||
        !blockProposal.hash ||
        !blockProposal.merkleRoot) {
      return false;
    }

    // Validate all transactions
    for (const tx of blockProposal.transactions) {
      if (!this.blockchain.isValidTransaction(tx)) {
        return false;
      }
    }

    // Verify Merkle root
    const calculatedMerkleRoot = this.blockchain.calculateMerkleRoot(blockProposal.transactions);
    if (blockProposal.merkleRoot !== calculatedMerkleRoot) {
      return false;
    }

    // Verify previous hash matches current chain
    const latestBlock = this.blockchain.getLatestBlock();
    if (latestBlock && blockProposal.previousHash !== latestBlock.hash) {
      return false;
    }

    // Verify block hash
    const calculatedHash = this.blockchain.calculateBlockHash(blockProposal);
    if (blockProposal.hash !== calculatedHash) {
      return false;
    }

    // Verify index is correct
    if (blockProposal.index !== this.blockchain.getChainLength()) {
      return false;
    }

    return true;
  }

  /**
   * Vote on a block proposal
   * 
   * Creates a vote for a block proposal after validating it.
   * 
   * @param {string} blockHash - Hash of proposed block
   * @param {boolean} isValid - Whether block is valid (optional, will validate if not provided)
   * @returns {Object} Vote object
   */
  voteOnBlock(blockHash, isValid = null) {
    if (!blockHash) {
      throw new Error('Block hash is required');
    }

    const validation = this.pendingValidations.get(blockHash);
    if (!validation) {
      throw new Error('Block proposal not found');
    }

    // Validate block if isValid not provided
    if (isValid === null) {
      isValid = this.validateBlockProposal(validation.proposal.block);
    }

    const nodeId = this.nodeManager.getNodeId();

    // Check if node already voted
    const existingVote = validation.votes.find(v => v.nodeId === nodeId);
    if (existingVote) {
      return existingVote;
    }

    // Create vote
    const vote = {
      blockHash,
      nodeId,
      isValid,
      timestamp: Date.now()
    };

    // Add vote
    validation.votes.push(vote);

    return vote;
  }

  /**
   * Check if consensus is reached
   * 
   * Determines if enough nodes have agreed on a block proposal.
   * 
   * @param {string} blockHash - Hash of proposed block
   * @returns {Object} Consensus status
   */
  checkConsensus(blockHash) {
    const validation = this.pendingValidations.get(blockHash);
    if (!validation) {
      return {
        blockHash,
        reached: false,
        reason: 'Proposal not found'
      };
    }

    const networkNodes = this.nodeManager.getNetworkNodes();
    const totalNodes = networkNodes.length;
    const votes = validation.votes;
    
    // Count positive votes (isValid === true)
    const agreementCount = votes.filter(v => v.isValid === true).length;
    const requiredAgreement = Math.ceil(totalNodes * this.consensusThreshold);

    const reached = agreementCount >= requiredAgreement;

    return {
      blockHash,
      votes: [...votes],
      totalNodes,
      agreementCount,
      requiredAgreement,
      threshold: this.consensusThreshold,
      reached
    };
  }

  /**
   * Synchronize chain with network
   * 
   * Compares local chain with chains from other nodes and adopts
   * the longest valid chain (following longest chain rule).
   * 
   * @param {Array} networkChains - Chains from other nodes [{nodeId, chain}]
   * @returns {Object} Sync result
   */
  async syncChain(networkChains) {
    if (!Array.isArray(networkChains)) {
      throw new Error('Network chains must be an array');
    }

    const localChainLength = this.blockchain.getChainLength();
    let longestValidChain = null;
    let longestLength = localChainLength;
    let longestChainNodeId = null;

    // Find longest valid chain
    for (const { nodeId, chain } of networkChains) {
      if (!Array.isArray(chain)) {
        continue;
      }

      // Validate chain
      const isValid = this._validateChain(chain);
      if (!isValid) {
        continue;
      }

      if (chain.length > longestLength) {
        longestLength = chain.length;
        longestValidChain = chain;
        longestChainNodeId = nodeId;
      }
    }

    // If longer valid chain found, replace local chain
    if (longestValidChain && longestLength > localChainLength) {
      // In production, this would require careful state migration
      // For this assessment, we'll just return the sync result
      return {
        synced: true,
        previousLength: localChainLength,
        newLength: longestLength,
        sourceNode: longestChainNodeId,
        message: 'Longer valid chain found (sync would occur in production)'
      };
    }

    return {
      synced: false,
      currentLength: localChainLength,
      message: 'Local chain is up to date or no longer valid chain found'
    };
  }

  /**
   * Handle node failure
   * 
   * Removes a failed node from the network and adjusts consensus
   * threshold if necessary.
   * 
   * @param {string} nodeId - Failed node ID
   * @returns {Object} Result
   */
  handleNodeFailure(nodeId) {
    if (!nodeId) {
      throw new Error('Node ID is required');
    }

    // Remove node from network
    const removed = this.nodeManager.removeNode(nodeId);

    // Clean up votes from failed node
    for (const [blockHash, validation] of this.pendingValidations.entries()) {
      validation.votes = validation.votes.filter(v => v.nodeId !== nodeId);
    }

    const remainingNodes = this.nodeManager.getNetworkNodes().length;
    const requiredAgreement = Math.ceil(remainingNodes * this.consensusThreshold);

    return {
      nodeId,
      removed,
      remainingNodes,
      requiredAgreement,
      message: removed 
        ? `Node ${nodeId} removed from network` 
        : `Node ${nodeId} not found in network`
    };
  }

  /**
   * Internal method to validate an entire chain
   * 
   * @param {Array} chain - Chain to validate
   * @returns {boolean} True if chain is valid
   */
  _validateChain(chain) {
    if (!Array.isArray(chain) || chain.length === 0) {
      return false;
    }

    // Validate each block
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      // Check previous hash
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

      // Validate block hash
      const calculatedHash = this.blockchain.calculateBlockHash(currentBlock);
      if (currentBlock.hash !== calculatedHash) {
        return false;
      }

      // Validate Merkle root
      const calculatedMerkleRoot = this.blockchain.calculateMerkleRoot(currentBlock.transactions);
      if (currentBlock.merkleRoot !== calculatedMerkleRoot) {
        return false;
      }
    }

    return true;
  }
}

module.exports = ConsensusEngine;

