/**
 * Consensus Controller - API endpoints
 * 
 * TODO: Implement API endpoints
 */

const express = require('express');
const ConsensusService = require('./consensusService.js');

const router = express.Router();

let consensusService = null;

router.use((req, res, next) => {
  if (!consensusService) {
    consensusService = new ConsensusService(
      req.app.locals.blockchain,
      req.app.locals.nodeManager
    );
  }
  next();
});

/**
 * POST /api/consensus/propose
 * Propose a new block
 */
router.post('/propose', async (req, res, next) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({
        error: 'Transactions array is required and cannot be empty'
      });
    }

    const result = await consensusService.proposeBlock(transactions);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/consensus/vote
 * Vote on a block proposal
 */
router.post('/vote', async (req, res, next) => {
  try {
    const { blockHash, isValid } = req.body;

    if (!blockHash) {
      return res.status(400).json({
        error: 'Block hash is required'
      });
    }

    const result = await consensusService.voteOnBlock(blockHash, isValid);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/consensus/sync
 * Synchronize chain with network
 */
router.post('/sync', async (req, res, next) => {
  try {
    const { networkChains } = req.body;

    const result = await consensusService.syncChain(networkChains || []);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

