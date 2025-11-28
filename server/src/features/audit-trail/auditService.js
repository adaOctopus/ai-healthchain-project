/**
 * Audit Service
 * 
 * This service provides audit logging functionality with error handling
 * and result formatting.
 */

const AuditLogger = require('./AuditLogger.js');

class AuditService {
  constructor(blockchain, data) {
    this.logger = new AuditLogger(blockchain);
    this.data = data;
  }

  /**
   * Log data access
   */
  async logDataAccess(accessLog) {
    try {
      const result = await this.logger.logDataAccess(accessLog);

      return {
        success: true,
        auditEntry: result.auditEntry,
        transaction: result.transaction
      };
    } catch (error) {
      throw new Error(`Failed to log data access: ${error.message}`);
    }
  }

  /**
   * Log consent change
   */
  async logConsentChange(consentLog) {
    try {
      const result = await this.logger.logConsentChange(consentLog);

      return {
        success: true,
        auditEntry: result.auditEntry,
        transaction: result.transaction
      };
    } catch (error) {
      throw new Error(`Failed to log consent change: ${error.message}`);
    }
  }

  /**
   * Log AI diagnostic
   */
  async logAIDiagnostic(aiLog) {
    try {
      const result = await this.logger.logAIDiagnostic(aiLog);

      return {
        success: true,
        auditEntry: result.auditEntry,
        transaction: result.transaction
      };
    } catch (error) {
      throw new Error(`Failed to log AI diagnostic: ${error.message}`);
    }
  }

  /**
   * Query logs with filters
   */
  async queryLogs(filters = {}) {
    try {
      const logs = await this.logger.queryLogs(filters);

      return {
        success: true,
        logs,
        count: logs.length,
        filters
      };
    } catch (error) {
      throw new Error(`Failed to query logs: ${error.message}`);
    }
  }

  /**
   * Get audit trail for a resource
   */
  async getAuditTrail(resourceId, resourceType) {
    try {
      if (!resourceId || !resourceType) {
        throw new Error('Resource ID and resource type are required');
      }

      const trail = await this.logger.getAuditTrail(resourceId, resourceType);

      return {
        success: true,
        resourceId,
        resourceType,
        trail,
        count: trail.length
      };
    } catch (error) {
      throw new Error(`Failed to get audit trail: ${error.message}`);
    }
  }
}

module.exports = AuditService;

