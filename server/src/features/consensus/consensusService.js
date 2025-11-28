/**
 * Consensus Service
 * 
 * This service provides consensus operations for block proposal, validation,
 * voting, and chain synchronization.
 */

const ConsensusEngine = require('./ConsensusEngine.js');

class ConsensusService {
  constructor(blockchain, nodeManager) {
    this.engine = new ConsensusEngine(blockchain, nodeManager);
  }

  /**
   * Propose block for consensus
   */
  async proposeBlock(transactions) {
    try {
      if (!Array.isArray(transactions) || transactions.length === 0) {
        throw new Error('Transactions array is required and cannot be empty');
      }

      const result = await this.engine.proposeBlock(transactions);

      return {
        success: true,
        proposalId: result.proposalId,
        block: result.block,
        consensus: result.consensus,
        vote: result.vote
      };
    } catch (error) {
      throw new Error(`Failed to propose block: ${error.message}`);
    }
  }

  /**
   * Validate block proposal
   */
  async validateBlock(blockProposal) {
    try {
      if (!blockProposal) {
        throw new Error('Block proposal is required');
      }

      const isValid = this.engine.validateBlockProposal(blockProposal);

      return {
        success: true,
        valid: isValid,
        block: blockProposal
      };
    } catch (error) {
      throw new Error(`Failed to validate block: ${error.message}`);
    }
  }

  /**
   * Vote on block proposal
   */
  async voteOnBlock(blockHash, isValid = null) {
    try {
      if (!blockHash) {
        throw new Error('Block hash is required');
      }

      const vote = this.engine.voteOnBlock(blockHash, isValid);

      // Check consensus after vote
      const consensus = this.engine.checkConsensus(blockHash);

      return {
        success: true,
        vote,
        consensus
      };
    } catch (error) {
      throw new Error(`Failed to vote on block: ${error.message}`);
    }
  }

  /**
   * Sync chain with network
   */
  async syncChain(networkChains = []) {
    try {
      // In a real network, this would fetch chains from other nodes
      // For this assessment, we accept networkChains as parameter
      const result = await this.engine.syncChain(networkChains);

      return {
        success: true,
        ...result
      };
    } catch (error) {
      throw new Error(`Failed to sync chain: ${error.message}`);
    }
  }
}

module.exports = ConsensusService;

