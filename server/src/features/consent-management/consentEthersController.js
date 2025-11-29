const express = require('express');
const router = express.Router();

/**
 * API endpoints for interacting with REAL Solidity contracts
 * 
 * These endpoints use ethers.js to call your deployed contracts
 * on the Hardhat/EVM blockchain.
 */

/**
 * POST /api/contracts/consent/grant
 * Grant consent using REAL Solidity contract
 */
router.post('/grant', async (req, res, next) => {
  try {
    const { patientId, clinicianId, consentType, expiresAt, purpose } = req.body;
    
    if (!patientId || !clinicianId || !consentType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['patientId', 'clinicianId', 'consentType']
      });
    }

    const contractService = req.app.locals.ethersContractService;
    
    if (!contractService) {
      return res.status(503).json({
        error: 'Smart contract service not available',
        message: 'Make sure Hardhat node is running and contracts are deployed'
      });
    }

    // Ensure addresses start with 0x
    const patientAddress = patientId.startsWith('0x') ? patientId : `0x${patientId}`;
    const clinicianAddress = clinicianId.startsWith('0x') ? clinicianId : `0x${clinicianId}`;

    const result = await contractService.grantConsent(
      patientAddress,
      clinicianAddress,
      consentType,
      expiresAt,
      purpose
    );

    res.status(201).json({
      success: true,
      message: 'Consent granted on blockchain',
      ...result
    });
  } catch (error) {
    console.error('Contract interaction error:', error);
    res.status(500).json({
      error: 'Transaction failed',
      message: error.message,
      reason: error.reason || 'Unknown error'
    });
  }
});

/**
 * POST /api/contracts/consent/revoke
 * Revoke consent using REAL Solidity contract
 */
router.post('/revoke', async (req, res, next) => {
  try {
    const { consentId } = req.body;
    
    if (!consentId) {
      return res.status(400).json({
        error: 'Missing consentId'
      });
    }

    const contractService = req.app.locals.ethersContractService;
    
    if (!contractService) {
      return res.status(503).json({
        error: 'Smart contract service not available'
      });
    }

    const result = await contractService.revokeConsent(consentId);

    res.json({
      success: true,
      message: 'Consent revoked on blockchain',
      ...result
    });
  } catch (error) {
    console.error('Contract interaction error:', error);
    res.status(500).json({
      error: 'Transaction failed',
      message: error.message
    });
  }
});

/**
 * GET /api/contracts/consent/check/:patientId/:clinicianId/:type
 * Check consent using REAL Solidity contract
 */
router.get('/check/:patientId/:clinicianId/:type', async (req, res, next) => {
  try {
    const { patientId, clinicianId, type } = req.params;
    
    const contractService = req.app.locals.ethersContractService;
    
    if (!contractService) {
      return res.status(503).json({
        error: 'Smart contract service not available'
      });
    }

    const patientAddress = patientId.startsWith('0x') ? patientId : `0x${patientId}`;
    const clinicianAddress = clinicianId.startsWith('0x') ? clinicianId : `0x${clinicianId}`;

    const hasConsent = await contractService.hasValidConsent(
      patientAddress,
      clinicianAddress,
      type
    );

    res.json({
      hasConsent,
      patientId: patientAddress,
      clinicianId: clinicianAddress,
      consentType: type
    });
  } catch (error) {
    console.error('Contract read error:', error);
    res.status(500).json({
      error: 'Failed to check consent',
      message: error.message
    });
  }
});

module.exports = router;

