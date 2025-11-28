/**
 * ZK Proof Controller - API endpoints
 * 
 * TODO: Implement API endpoints
 */

const express = require('express');
const ZKService = require('./zkService.js');

const router = express.Router();

let zkService = null;

router.use((req, res, next) => {
  if (!zkService) {
    zkService = new ZKService(
      req.app.locals.blockchain,
      req.app.locals.data
    );
  }
  next();
});

/**
 * POST /api/zk/consent-proof
 * Generate consent ZK proof
 */
router.post('/consent-proof', async (req, res, next) => {
  try {
    const { patientId, clinicianId, consentType } = req.body;

    if (!patientId || !clinicianId || !consentType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['patientId', 'clinicianId', 'consentType']
      });
    }

    const result = await zkService.generateConsentProof(patientId, clinicianId, consentType);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/zk/verify-consent
 * Verify consent ZK proof
 */
router.post('/verify-consent', async (req, res, next) => {
  try {
    const { proof, expectedRoot } = req.body;

    if (!proof) {
      return res.status(400).json({
        error: 'Proof is required'
      });
    }

    const result = await zkService.verifyConsentProof(proof, expectedRoot);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/zk/permission-proof
 * Generate permission ZK proof
 */
router.post('/permission-proof', async (req, res, next) => {
  try {
    const { userId, permissions } = req.body;

    if (!userId || !Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        error: 'User ID and permissions array are required'
      });
    }

    const result = await zkService.generatePermissionProof(userId, permissions);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/zk/verify-permission
 * Verify permission ZK proof
 */
router.post('/verify-permission', async (req, res, next) => {
  try {
    const { proof, requiredPermissions } = req.body;

    if (!proof || !Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
      return res.status(400).json({
        error: 'Proof and requiredPermissions array are required'
      });
    }

    const result = await zkService.verifyPermissionProof(proof, requiredPermissions);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

