/**
 * Data Integrity Controller - API endpoints
 * 
 * TODO: Implement API endpoints
 */

const express = require('express');
const IntegrityService = require('./integrityService.js');

const router = express.Router();

let integrityService = null;

router.use((req, res, next) => {
  if (!integrityService) {
    integrityService = new IntegrityService(
      req.app.locals.blockchain,
      req.app.locals.data
    );
  }
  next();
});

/**
 * POST /api/integrity/tree
 * Create Merkle tree from records
 */
router.post('/tree', async (req, res, next) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        error: 'Records array is required and cannot be empty'
      });
    }

    const result = await integrityService.createMerkleTree(records);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/integrity/proof
 * Generate proof for a record
 */
router.post('/proof', async (req, res, next) => {
  try {
    const { record, root } = req.body;

    if (!record) {
      return res.status(400).json({
        error: 'Record is required'
      });
    }

    const result = await integrityService.generateProof(record, root);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/integrity/verify
 * Verify record integrity
 */
router.post('/verify', async (req, res, next) => {
  try {
    const { record, proof, root } = req.body;

    if (!record || !proof || !root) {
      return res.status(400).json({
        error: 'Record, proof, and root are required'
      });
    }

    const result = await integrityService.verifyIntegrity(record, proof, root);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/integrity/verify-batch
 * Verify batch of records
 */
router.post('/verify-batch', async (req, res, next) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        error: 'Records array is required and cannot be empty'
      });
    }

    const result = await integrityService.verifyBatch(records);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

