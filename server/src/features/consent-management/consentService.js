/**
 * Consent Service - Service layer for consent management
 * 
 * This service provides business logic validation and error handling
 * for consent management operations.
 */

const ConsentContract = require('./ConsentContract.js');

class ConsentService {
  constructor(blockchain, data) {
    this.contract = new ConsentContract(blockchain);
    this.data = data; // Access to mock data (patients, clinicians, etc.)
  }

  /**
   * Grant consent with validation
   */
  async grantConsent(patientId, clinicianId, consentType, options = {}) {
    try {
      // Validate patient exists
      const patient = this.data.patients?.find(p => p.id === patientId);
      if (!patient) {
        throw new Error(`Patient with ID ${patientId} not found`);
      }

      // Validate clinician exists
      const clinician = this.data.clinicians?.find(c => c.id === clinicianId);
      if (!clinician) {
        throw new Error(`Clinician with ID ${clinicianId} not found`);
      }

      // Call contract to grant consent
      const result = this.contract.grantConsent(patientId, clinicianId, consentType, options);

      return {
        success: true,
        consent: result.consent,
        transaction: result.transaction
      };
    } catch (error) {
      throw new Error(`Failed to grant consent: ${error.message}`);
    }
  }

  /**
   * Revoke consent with validation
   */
  async revokeConsent(consentId, revokedBy) {
    try {
      if (!consentId || !revokedBy) {
        throw new Error('Consent ID and revoker ID are required');
      }

      // Call contract to revoke consent
      const result = this.contract.revokeConsent(consentId, revokedBy);

      return {
        success: true,
        consent: result.consent,
        transaction: result.transaction
      };
    } catch (error) {
      throw new Error(`Failed to revoke consent: ${error.message}`);
    }
  }

  /**
   * Check consent validity
   */
  async checkConsent(patientId, clinicianId, consentType) {
    try {
      if (!patientId || !clinicianId || !consentType) {
        throw new Error('Patient ID, clinician ID, and consent type are required');
      }

      const hasConsent = this.contract.hasValidConsent(patientId, clinicianId, consentType);

      return {
        hasConsent,
        patientId,
        clinicianId,
        consentType
      };
    } catch (error) {
      throw new Error(`Failed to check consent: ${error.message}`);
    }
  }

  /**
   * Get consent history
   */
  async getConsentHistory(patientId) {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      const history = this.contract.getConsentHistory(patientId);

      return {
        success: true,
        patientId,
        history,
        count: history.length
      };
    } catch (error) {
      throw new Error(`Failed to get consent history: ${error.message}`);
    }
  }

  /**
   * Get active consents
   */
  async getActiveConsents(patientId) {
    try {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }

      const activeConsents = this.contract.getActiveConsents(patientId);

      return {
        success: true,
        patientId,
        activeConsents,
        count: activeConsents.length
      };
    } catch (error) {
      throw new Error(`Failed to get active consents: ${error.message}`);
    }
  }
}

module.exports = ConsentService;

