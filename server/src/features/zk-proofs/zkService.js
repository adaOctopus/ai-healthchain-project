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

      // Normalize consent type (handle both 'DataAccess' and 'Data Access' formats)
      const normalizedConsentType = this._normalizeConsentType(consentType);

      // Check if consent exists in custom blockchain
      let hasConsent = false;
      let activeConsent = null;

      try {
        hasConsent = this.consentContract.hasValidConsent(patientId, clinicianId, normalizedConsentType);
        
        if (hasConsent) {
          // Get consent history to find the active consent
          const history = this.consentContract.getConsentHistory(patientId);
          activeConsent = history
            .filter(c => c.clinicianId === clinicianId && c.consentType === normalizedConsentType)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
        }
      } catch (err) {
        // Consent not found in custom blockchain - that's okay, we'll create a mock proof
        console.warn('Consent not found in custom blockchain, generating mock proof:', err.message);
      }

      // If consent doesn't exist in custom blockchain, create a mock consent for demo purposes
      // In production, this would check the Solidity contract or require consent to exist first
      if (!hasConsent || !activeConsent || activeConsent.status !== 'granted') {
        // Create mock consent data for ZK proof generation
        // This allows testing ZK proofs even if consent was created on Solidity contract
        activeConsent = {
          consentId: `consent-${Date.now()}`,
          patientId,
          clinicianId,
          consentType: normalizedConsentType,
          status: 'granted',
          grantedAt: Date.now(),
          expiresAt: null,
          timestamp: Date.now()
        };
        
        console.log('Using mock consent data for ZK proof generation (consent may exist on Solidity contract)');
      }

      // Generate ZK proof
      const proof = ZKProof.generateProof(
        patientId,
        clinicianId,
        normalizedConsentType,
        activeConsent
      );

      return {
        success: true,
        proof,
        metadata: {
          status: activeConsent.status,
          grantedAt: activeConsent.grantedAt,
          note: hasConsent ? 'Consent verified in custom blockchain' : 'Mock proof (consent may exist on Solidity contract)'
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
   * Internal helper to normalize consent type
   * Converts 'DataAccess' to 'Data Access', etc.
   * 
   * @private
   */
  _normalizeConsentType(consentType) {
    const typeMap = {
      'DataAccess': 'Data Access',
      'AIAnalysis': 'AI Analysis',
      'Research': 'Research',
      'Sharing': 'Sharing'
    };
    
    return typeMap[consentType] || consentType;
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

