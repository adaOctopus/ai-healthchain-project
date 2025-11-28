/**
 * Consent Contract - Smart Contract for Patient Consent Management
 * 
 * This contract manages patient consent grants and revocations on the blockchain.
 * All consent operations are stored as immutable blockchain transactions.
 * 
 * Data Structure:
 * - ConsentRecord: {
 *     consentId: string (UUID)
 *     patientId: string
 *     clinicianId: string
 *     consentType: string ('Data Access' | 'AI Analysis' | 'Research' | 'Sharing')
 *     status: string ('granted' | 'revoked' | 'expired')
 *     grantedAt: number (timestamp)
 *     expiresAt: number (timestamp | null)
 *     purpose: string
 *     metadata: Object
 *   }
 */

const crypto = require('crypto');

class ConsentContract {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.contractAddress = 'consent-contract-v1';
  }

  /**
   * Grant consent for a patient to a clinician
   * 
   * @param {string} patientId - Patient ID
   * @param {string} clinicianId - Clinician ID
   * @param {string} consentType - Type of consent (e.g., 'Data Access', 'AI Analysis')
   * @param {Object} options - Additional options (expiresAt, purpose, metadata)
   * @returns {Object} Transaction result with consent record
   */
  grantConsent(patientId, clinicianId, consentType, options = {}) {
    // Validate inputs
    if (!patientId || !clinicianId || !consentType) {
      throw new Error('Patient ID, clinician ID, and consent type are required');
    }

    const validConsentTypes = ['Data Access', 'AI Analysis', 'Research', 'Sharing'];
    if (!validConsentTypes.includes(consentType)) {
      throw new Error(`Invalid consent type. Must be one of: ${validConsentTypes.join(', ')}`);
    }

    // Check for existing active consent
    if (this.hasValidConsent(patientId, clinicianId, consentType)) {
      throw new Error('Active consent already exists for this patient-clinician-type combination');
    }

    // Create consent record
    const consentId = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = options.expiresAt 
      ? new Date(options.expiresAt).getTime() 
      : null;

    const consentRecord = {
      consentId,
      patientId,
      clinicianId,
      consentType,
      status: 'granted',
      grantedAt: now,
      expiresAt,
      purpose: options.purpose || 'Treatment',
      metadata: options.metadata || {}
    };

    // Create blockchain transaction
    const transaction = {
      from: 'system',
      to: this.contractAddress,
      data: {
        action: 'grant',
        consentRecord
      }
    };

    const txResult = this.blockchain.addTransaction(transaction);

    return {
      transaction: txResult,
      consent: consentRecord
    };
  }

  /**
   * Revoke consent
   * 
   * @param {string} consentId - Consent record ID
   * @param {string} revokedBy - ID of entity revoking (patient or authorized party)
   * @returns {Object} Transaction result
   */
  revokeConsent(consentId, revokedBy) {
    if (!consentId || !revokedBy) {
      throw new Error('Consent ID and revoker ID are required');
    }

    // Find the consent record
    const consentHistory = this._queryConsentTransactions({ consentId });
    if (consentHistory.length === 0) {
      throw new Error('Consent record not found');
    }

    // Get the most recent consent record
    const latestConsent = consentHistory[consentHistory.length - 1];
    const consentRecord = latestConsent.data.consentRecord;

    // Check if already revoked
    if (consentRecord.status === 'revoked') {
      throw new Error('Consent is already revoked');
    }

    // Check if expired
    if (consentRecord.status === 'expired') {
      throw new Error('Consent is already expired');
    }

    // Verify authorization (patient can revoke their own consent)
    if (consentRecord.patientId !== revokedBy) {
      // In production, check if revokedBy is authorized
      console.warn(`Revocation by ${revokedBy} - authorization should be verified`);
    }

    // Create revocation record
    const revocationRecord = {
      ...consentRecord,
      status: 'revoked',
      revokedAt: Date.now(),
      revokedBy
    };

    // Create blockchain transaction
    const transaction = {
      from: revokedBy,
      to: this.contractAddress,
      data: {
        action: 'revoke',
        consentId,
        revocationRecord
      }
    };

    const txResult = this.blockchain.addTransaction(transaction);

    return {
      transaction: txResult,
      consent: revocationRecord
    };
  }

  /**
   * Check if consent exists and is valid
   * 
   * @param {string} patientId - Patient ID
   * @param {string} clinicianId - Clinician ID
   * @param {string} consentType - Type of consent to check
   * @returns {boolean} True if valid consent exists
   */
  hasValidConsent(patientId, clinicianId, consentType) {
    const now = Date.now();
    
    // Query all consent transactions for this patient-clinician-type
    const transactions = this._queryConsentTransactions({
      patientId,
      clinicianId,
      consentType
    });

    if (transactions.length === 0) {
      return false;
    }

    // Process transactions chronologically to determine current state
    let currentStatus = null;
    let currentConsent = null;

    for (const tx of transactions) {
      if (tx.data.action === 'grant') {
        currentConsent = tx.data.consentRecord;
        currentStatus = 'granted';
      } else if (tx.data.action === 'revoke') {
        if (tx.data.consentId === currentConsent?.consentId) {
          currentStatus = 'revoked';
        }
      }
    }

    // Check if consent is valid
    if (currentStatus !== 'granted' || !currentConsent) {
      return false;
    }

    // Check expiration
    if (currentConsent.expiresAt && currentConsent.expiresAt < now) {
      return false;
    }

    return true;
  }

  /**
   * Get consent history for a patient
   * 
   * @param {string} patientId - Patient ID
   * @returns {Array} Array of consent records in chronological order
   */
  getConsentHistory(patientId) {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    const transactions = this._queryConsentTransactions({ patientId });
    
    // Transform transactions into consent records with metadata
    const history = transactions.map(tx => ({
      ...tx.data.consentRecord || tx.data.revocationRecord,
      transactionId: tx.id,
      blockIndex: tx.blockIndex,
      timestamp: tx.timestamp,
      action: tx.data.action
    }));

    // Sort by timestamp
    history.sort((a, b) => a.timestamp - b.timestamp);

    return history;
  }

  /**
   * Get active consents for a patient
   * 
   * @param {string} patientId - Patient ID
   * @returns {Array} Array of active consent records
   */
  getActiveConsents(patientId) {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    const history = this.getConsentHistory(patientId);
    const now = Date.now();
    const activeConsents = [];

    // Track most recent state per consentId
    const consentStates = new Map();

    for (const record of history) {
      const key = `${record.patientId}-${record.clinicianId}-${record.consentType}`;
      
      if (record.action === 'grant') {
        consentStates.set(key, record);
      } else if (record.action === 'revoke') {
        consentStates.delete(key);
      }
    }

    // Filter for active (not expired) consents
    for (const record of consentStates.values()) {
      if (!record.expiresAt || record.expiresAt > now) {
        activeConsents.push(record);
      }
    }

    return activeConsents;
  }

  /**
   * Internal method to query consent transactions from blockchain
   * 
   * @param {Object} criteria - Search criteria
   * @returns {Array} Matching transactions
   */
  _queryConsentTransactions(criteria) {
    const allTransactions = this.blockchain.searchTransactions({
      to: this.contractAddress
    });

    return allTransactions.filter(tx => {
      const data = tx.data;
      
      if (criteria.consentId) {
        const record = data.consentRecord || data.revocationRecord;
        if (record?.consentId !== criteria.consentId) {
          return false;
        }
      }

      if (criteria.patientId) {
        const record = data.consentRecord || data.revocationRecord;
        if (record?.patientId !== criteria.patientId) {
          return false;
        }
      }

      if (criteria.clinicianId) {
        const record = data.consentRecord || data.revocationRecord;
        if (record?.clinicianId !== criteria.clinicianId) {
          return false;
        }
      }

      if (criteria.consentType) {
        const record = data.consentRecord || data.revocationRecord;
        if (record?.consentType !== criteria.consentType) {
          return false;
        }
      }

      return true;
    });
  }
}

module.exports = ConsentContract;

