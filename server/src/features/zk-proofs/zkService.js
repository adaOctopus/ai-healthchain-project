/**
 * ZK Proof Service
 * 
 * This service provides zero-knowledge proof generation and verification
 * for consent and permission verification without revealing sensitive data.
 */

const ZKProof = require('./ZKProof.js');
const ConsentContract = require('../consent-management/ConsentContract.js');

class ZKService {
  constructor(blockchain, data) {
    this.blockchain = blockchain;
    this.data = data;
    this.consentContract = new ConsentContract(blockchain);
  }

  /**
   * Generate consent proof
   * 
   * Creates a ZK proof that demonstrates consent exists without revealing
   * patient ID, clinician ID, or consent type.
   */
  async generateConsentProof(patientId, clinicianId, consentType) {
    try {
      if (!patientId || !clinicianId || !consentType) {
        throw new Error('Patient ID, clinician ID, and consent type are required');
      }

      // Check if consent exists
      const hasConsent = this.consentContract.hasValidConsent(patientId, clinicianId, consentType);
      if (!hasConsent) {
        throw new Error('Valid consent does not exist');
      }

      // Get consent history to find the active consent
      const history = this.consentContract.getConsentHistory(patientId);
      const activeConsent = history
        .filter(c => c.clinicianId === clinicianId && c.consentType === consentType)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      if (!activeConsent || activeConsent.status !== 'granted') {
        throw new Error('Active consent not found');
      }

      // Generate ZK proof
      const proof = ZKProof.generateProof(
        patientId,
        clinicianId,
        consentType,
        activeConsent
      );

      return {
        success: true,
        proof,
        metadata: {
          status: activeConsent.status,
          grantedAt: activeConsent.grantedAt
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate consent proof: ${error.message}`);
    }
  }

  /**
   * Verify consent proof
   * 
   * Verifies a ZK proof without revealing the underlying consent data.
   */
  async verifyConsentProof(proof, expectedRoot = null) {
    try {
      if (!proof) {
        throw new Error('Proof is required');
      }

      const isValid = ZKProof.verifyProof(proof, expectedRoot);

      return {
        success: true,
        valid: isValid,
        proof
      };
    } catch (error) {
      throw new Error(`Failed to verify consent proof: ${error.message}`);
    }
  }

  /**
   * Generate permission proof
   * 
   * Creates a ZK proof that demonstrates a user has specific permissions
   * without revealing the user's identity.
   */
  async generatePermissionProof(userId, permissions) {
    try {
      if (!userId || !Array.isArray(permissions) || permissions.length === 0) {
        throw new Error('User ID and permissions array are required');
      }

      // In a real system, this would query actual permission data
      // For this assessment, we'll create a mock permission data structure
      const permissionData = {
        userId,
        role: this._getUserRole(userId),
        grantedAt: Date.now(),
        permissions
      };

      // Generate ZK proof
      const proof = ZKProof.generatePermissionProof(userId, permissions, permissionData);

      return {
        success: true,
        proof,
        metadata: {
          permissions,
          role: permissionData.role
        }
      };
    } catch (error) {
      throw new Error(`Failed to generate permission proof: ${error.message}`);
    }
  }

  /**
   * Verify permission proof
   * 
   * Verifies that a proof demonstrates the required permissions.
   */
  async verifyPermissionProof(proof, requiredPermissions) {
    try {
      if (!proof) {
        throw new Error('Proof is required');
      }

      if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
        throw new Error('Required permissions array is required');
      }

      const hasPermissions = ZKProof.verifyPermissionProof(proof, requiredPermissions);

      return {
        success: true,
        hasPermissions,
        requiredPermissions,
        proofMetadata: proof.metadata
      };
    } catch (error) {
      throw new Error(`Failed to verify permission proof: ${error.message}`);
    }
  }

  /**
   * Internal helper to get user role
   * 
   * @private
   */
  _getUserRole(userId) {
    // Check if user is a clinician
    const clinician = this.data.clinicians?.find(c => c.id === userId);
    if (clinician) {
      return clinician.role || 'clinician';
    }

    // Check if user is a patient
    const patient = this.data.patients?.find(p => p.id === userId);
    if (patient) {
      return 'patient';
    }

    return 'unknown';
  }
}

module.exports = ZKService;

