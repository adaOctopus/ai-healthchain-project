/**
 * Audit Logger - Immutable logging system
 * 
 * This class provides tamper-proof audit logging by storing all logs
 * as immutable blockchain transactions.
 * 
 * Data Structure:
 * - Audit Log Entry: {
 *     type: string ('data-access' | 'consent-change' | 'ai-diagnostic')
 *     timestamp: number
 *     actorId: string
 *     resourceId: string (optional)
 *     resourceType: string (optional)
 *     action: string
 *     granted: boolean (optional)
 *     reason: string (optional)
 *     metadata: Object
 *   }
 */

class AuditLogger {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.contractAddress = 'audit-logger-v1';
  }

  /**
   * Log a data access attempt
   * 
   * @param {Object} accessLog - Access log data
   * @param {string} accessLog.actorId - ID of entity attempting access
   * @param {string} accessLog.resourceId - ID of resource being accessed
   * @param {string} accessLog.resourceType - Type of resource (e.g., 'medicalRecord')
   * @param {boolean} accessLog.granted - Whether access was granted
   * @param {string} accessLog.reason - Reason for grant/denial
   * @param {Object} accessLog.metadata - Additional metadata
   * @returns {Object} Transaction result
   */
  async logDataAccess(accessLog) {
    // Validate required fields
    if (!accessLog.actorId || !accessLog.resourceId || !accessLog.resourceType) {
      throw new Error('Actor ID, resource ID, and resource type are required');
    }

    const auditEntry = {
      type: 'data-access',
      timestamp: Date.now(),
      actorId: accessLog.actorId,
      resourceId: accessLog.resourceId,
      resourceType: accessLog.resourceType,
      action: 'read',
      granted: accessLog.granted !== undefined ? accessLog.granted : false,
      reason: accessLog.reason || 'Not specified',
      metadata: accessLog.metadata || {}
    };

    // Create blockchain transaction
    const transaction = {
      from: accessLog.actorId,
      to: this.contractAddress,
      data: {
        action: 'log',
        auditEntry
      }
    };

    const txResult = this.blockchain.addTransaction(transaction);

    return {
      transaction: txResult,
      auditEntry
    };
  }

  /**
   * Log a consent change
   * 
   * @param {Object} consentLog - Consent change log
   * @param {string} consentLog.consentId - Consent record ID
   * @param {string} consentLog.action - Action (granted, revoked, expired)
   * @param {string} consentLog.actorId - ID of entity performing action
   * @param {string} consentLog.patientId - Patient ID
   * @param {Object} consentLog.metadata - Additional metadata
   * @returns {Object} Transaction result
   */
  async logConsentChange(consentLog) {
    // Validate required fields
    if (!consentLog.consentId || !consentLog.action || !consentLog.actorId || !consentLog.patientId) {
      throw new Error('Consent ID, action, actor ID, and patient ID are required');
    }

    const validActions = ['granted', 'revoked', 'expired'];
    if (!validActions.includes(consentLog.action)) {
      throw new Error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
    }

    const auditEntry = {
      type: 'consent-change',
      timestamp: Date.now(),
      actorId: consentLog.actorId,
      resourceId: consentLog.consentId,
      resourceType: 'consent',
      action: consentLog.action,
      patientId: consentLog.patientId,
      metadata: {
        ...consentLog.metadata,
        clinicianId: consentLog.clinicianId,
        consentType: consentLog.consentType
      }
    };

    // Create blockchain transaction
    const transaction = {
      from: consentLog.actorId,
      to: this.contractAddress,
      data: {
        action: 'log',
        auditEntry
      }
    };

    const txResult = this.blockchain.addTransaction(transaction);

    return {
      transaction: txResult,
      auditEntry
    };
  }

  /**
   * Log an AI diagnostic submission
   * 
   * @param {Object} aiLog - AI diagnostic log
   * @param {string} aiLog.modelId - AI model ID
   * @param {string} aiLog.recordId - Medical record ID
   * @param {Object} aiLog.result - Diagnostic result
   * @param {number} aiLog.confidence - Confidence score
   * @param {string} aiLog.actorId - ID of entity submitting (optional)
   * @param {Object} aiLog.metadata - Additional metadata
   * @returns {Object} Transaction result
   */
  async logAIDiagnostic(aiLog) {
    // Validate required fields
    if (!aiLog.modelId || !aiLog.recordId || !aiLog.result) {
      throw new Error('Model ID, record ID, and result are required');
    }

    if (aiLog.confidence !== undefined && 
        (typeof aiLog.confidence !== 'number' || aiLog.confidence < 0 || aiLog.confidence > 1)) {
      throw new Error('Confidence must be a number between 0 and 1');
    }

    const auditEntry = {
      type: 'ai-diagnostic',
      timestamp: Date.now(),
      actorId: aiLog.actorId || 'ai-system',
      resourceId: aiLog.recordId,
      resourceType: 'medicalRecord',
      action: 'diagnostic',
      metadata: {
        modelId: aiLog.modelId,
        result: aiLog.result,
        confidence: aiLog.confidence || null,
        ...aiLog.metadata
      }
    };

    // Create blockchain transaction
    const transaction = {
      from: aiLog.actorId || 'ai-system',
      to: this.contractAddress,
      data: {
        action: 'log',
        auditEntry
      }
    };

    const txResult = this.blockchain.addTransaction(transaction);

    return {
      transaction: txResult,
      auditEntry
    };
  }

  /**
   * Query audit logs with filters
   * 
   * @param {Object} filters - Filter criteria
   * @param {string} filters.actorId - Filter by actor
   * @param {string} filters.resourceId - Filter by resource
   * @param {string} filters.resourceType - Filter by resource type
   * @param {string} filters.action - Filter by action
   * @param {string} filters.type - Filter by log type
   * @param {Date|number} filters.startDate - Start date (timestamp or Date)
   * @param {Date|number} filters.endDate - End date (timestamp or Date)
   * @returns {Array} Array of audit log entries
   */
  async queryLogs(filters = {}) {
    // Query all audit transactions
    const allTransactions = this.blockchain.searchTransactions({
      to: this.contractAddress
    });

    // Extract audit entries from transactions
    let logs = allTransactions
      .filter(tx => tx.data && tx.data.auditEntry)
      .map(tx => ({
        ...tx.data.auditEntry,
        transactionId: tx.id,
        blockIndex: tx.blockIndex,
        blockHash: tx.blockHash,
        blockTimestamp: tx.blockTimestamp
      }));

    // Apply filters
    if (filters.actorId) {
      logs = logs.filter(log => log.actorId === filters.actorId);
    }

    if (filters.resourceId) {
      logs = logs.filter(log => log.resourceId === filters.resourceId);
    }

    if (filters.resourceType) {
      logs = logs.filter(log => log.resourceType === filters.resourceType);
    }

    if (filters.action) {
      logs = logs.filter(log => log.action === filters.action);
    }

    if (filters.type) {
      logs = logs.filter(log => log.type === filters.type);
    }

    // Date range filtering
    if (filters.startDate) {
      const startTimestamp = filters.startDate instanceof Date 
        ? filters.startDate.getTime() 
        : filters.startDate;
      logs = logs.filter(log => log.timestamp >= startTimestamp);
    }

    if (filters.endDate) {
      const endTimestamp = filters.endDate instanceof Date 
        ? filters.endDate.getTime() 
        : filters.endDate;
      logs = logs.filter(log => log.timestamp <= endTimestamp);
    }

    // Sort by timestamp (most recent first)
    logs.sort((a, b) => b.timestamp - a.timestamp);

    return logs;
  }

  /**
   * Get audit trail for a specific resource
   * 
   * Returns all audit logs related to a specific resource in chronological order.
   * 
   * @param {string} resourceId - Resource ID
   * @param {string} resourceType - Resource type
   * @returns {Array} Audit trail (chronological)
   */
  async getAuditTrail(resourceId, resourceType) {
    if (!resourceId || !resourceType) {
      throw new Error('Resource ID and resource type are required');
    }

    const logs = await this.queryLogs({
      resourceId,
      resourceType
    });

    // Sort chronologically (oldest first for trail)
    logs.sort((a, b) => a.timestamp - b.timestamp);

    return logs;
  }
}

module.exports = AuditLogger;

