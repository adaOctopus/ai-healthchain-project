/**
 * Consent Controller - API endpoints for consent management
 * 
 * TODO: Implement API endpoints
 * 
 * Endpoints to implement:
 * - POST /api/consent/grant - Grant consent
 * - POST /api/consent/revoke - Revoke consent
 * - GET /api/consent/check/:patientId/:clinicianId/:type - Check consent
 * - GET /api/consent/history/:patientId - Get consent history
 * - GET /api/consent/active/:patientId - Get active consents
 */

const express = require('express');
const ConsentService = require('./consentService.js');

const router = express.Router();

// Initialize service (will be set by middleware)
let consentService = null;

// Middleware to initialize service
router.use((req, res, next) => {
  if (!consentService) {
    consentService = new ConsentService(
      req.app.locals.blockchain,
      req.app.locals.data
    );
  }
  next();
});

/**
 * POST /api/consent/grant
 * Grant consent
 */
router.post('/grant', async (req, res, next) => {
  try {
    const { patientId, clinicianId, consentType, expiresAt, purpose, metadata } = req.body;

    if (!patientId || !clinicianId || !consentType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['patientId', 'clinicianId', 'consentType']
      });
    }

    const options = { expiresAt, purpose, metadata };
    const result = await consentService.grantConsent(patientId, clinicianId, consentType, options);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/consent/revoke
 * Revoke consent
 */
router.post('/revoke', async (req, res, next) => {
  try {
    const { consentId, revokedBy } = req.body;

    if (!consentId || !revokedBy) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['consentId', 'revokedBy']
      });
    }

    const result = await consentService.revokeConsent(consentId, revokedBy);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/consent/check/:patientId/:clinicianId/:type
 * Check if consent exists and is valid
 */
router.get('/check/:patientId/:clinicianId/:type', async (req, res, next) => {
  try {
    const { patientId, clinicianId, type } = req.params;

    const result = await consentService.checkConsent(patientId, clinicianId, type);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/consent/history/:patientId
 * Get consent history for a patient
 */
router.get('/history/:patientId', async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const result = await consentService.getConsentHistory(patientId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/consent/active/:patientId
 * Get active consents for a patient
 */
router.get('/active/:patientId', async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const result = await consentService.getActiveConsents(patientId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

