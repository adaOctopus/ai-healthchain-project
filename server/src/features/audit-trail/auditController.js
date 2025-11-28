/**
 * Audit Controller - API endpoints
 * 
 * TODO: Implement API endpoints
 */

const express = require('express');
const AuditService = require('./auditService.js');

const router = express.Router();

let auditService = null;

router.use((req, res, next) => {
  if (!auditService) {
    auditService = new AuditService(
      req.app.locals.blockchain,
      req.app.locals.data
    );
  }
  next();
});

/**
 * POST /api/audit/data-access
 * Log data access
 */
router.post('/data-access', async (req, res, next) => {
  try {
    const { actorId, resourceId, resourceType, granted, reason, metadata } = req.body;

    if (!actorId || !resourceId || !resourceType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['actorId', 'resourceId', 'resourceType']
      });
    }

    const result = await auditService.logDataAccess({
      actorId,
      resourceId,
      resourceType,
      granted,
      reason,
      metadata
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/audit/consent
 * Log consent change
 */
router.post('/consent', async (req, res, next) => {
  try {
    const { consentId, action, actorId, patientId, clinicianId, consentType, metadata } = req.body;

    if (!consentId || !action || !actorId || !patientId) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['consentId', 'action', 'actorId', 'patientId']
      });
    }

    const result = await auditService.logConsentChange({
      consentId,
      action,
      actorId,
      patientId,
      clinicianId,
      consentType,
      metadata
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/audit/ai-diagnostic
 * Log AI diagnostic
 */
router.post('/ai-diagnostic', async (req, res, next) => {
  try {
    const { modelId, recordId, result, confidence, actorId, metadata } = req.body;

    if (!modelId || !recordId || !result) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['modelId', 'recordId', 'result']
      });
    }

    const auditResult = await auditService.logAIDiagnostic({
      modelId,
      recordId,
      result,
      confidence,
      actorId,
      metadata
    });

    res.status(201).json(auditResult);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/query
 * Query audit logs
 */
router.get('/query', async (req, res, next) => {
  try {
    const filters = {
      actorId: req.query.actorId,
      resourceId: req.query.resourceId,
      resourceType: req.query.resourceType,
      action: req.query.action,
      type: req.query.type,
      startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate) : undefined
    };

    // Remove undefined filters
    Object.keys(filters).forEach(key => 
      filters[key] === undefined && delete filters[key]
    );

    const result = await auditService.queryLogs(filters);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/trail/:resourceId/:resourceType
 * Get audit trail for resource
 */
router.get('/trail/:resourceId/:resourceType', async (req, res, next) => {
  try {
    const { resourceId, resourceType } = req.params;

    const result = await auditService.getAuditTrail(resourceId, resourceType);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

