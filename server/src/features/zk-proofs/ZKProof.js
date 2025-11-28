/**
 * Zero-Knowledge Proof Implementation
 * 
 * This class implements a simplified ZK proof system using cryptographic commitments.
 * 
 * Note: This is a simplified implementation for assessment purposes. In production,
 * you would use proper ZK-SNARKs/STARKs libraries like circom, snarkjs, or similar.
 * 
 * Data Structure:
 * - ZK Proof: {
 *     commitment: string (hash of data + salt)
 *     salt: string (random salt for commitment)
 *     verificationKey: string (hash for verification)
 *     timestamp: number
 *     metadata: Object (non-sensitive metadata)
 *   }
 * 
 * Approach:
 * - Uses cryptographic commitments (hash with salt) to hide sensitive data
 * - Prover commits to data without revealing it
 * - Verifier can verify commitment matches expected value
 * - Salt ensures same data produces different commitments
 */

const crypto = require('crypto');

class ZKProof {
  /**
   * Generate a ZK proof that proves consent exists without revealing details
   * 
   * Creates a cryptographic commitment to the consent data that can be verified
   * without revealing the original patient ID, clinician ID, or consent type.
   * 
   * @param {string} patientId - Patient ID (will be hidden)
   * @param {string} clinicianId - Clinician ID (will be hidden)
   * @param {string} consentType - Consent type (will be hidden)
   * @param {Object} consentData - Actual consent data (for commitment)
   * @returns {Object} ZK proof object
   */
  static generateProof(patientId, clinicianId, consentType, consentData) {
    // Validate inputs
    if (!patientId || !clinicianId || !consentType || !consentData) {
      throw new Error('All parameters are required for proof generation');
    }

    // Generate random salt for commitment
    const salt = crypto.randomBytes(32).toString('hex');

    // Create commitment: hash of (data + salt)
    // This hides the actual data while allowing verification
    const commitmentData = {
      patientId,
      clinicianId,
      consentType,
      consentId: consentData.consentId,
      status: consentData.status,
      grantedAt: consentData.grantedAt
    };

    const commitmentString = JSON.stringify(commitmentData) + salt;
    const commitment = crypto.createHash('sha256')
      .update(commitmentString)
      .digest('hex');

    // Create verification key (hash of commitment + public info)
    // This allows verification without revealing sensitive data
    const verificationKey = crypto.createHash('sha256')
      .update(commitment + JSON.stringify({
        status: consentData.status,
        grantedAt: consentData.grantedAt
      }))
      .digest('hex');

    return {
      commitment,
      salt, // In production, salt would be kept secret by prover
      verificationKey,
      timestamp: Date.now(),
      metadata: {
        // Only include non-sensitive metadata
        status: consentData.status,
        grantedAt: consentData.grantedAt,
        expiresAt: consentData.expiresAt || null
      }
    };
  }

  /**
   * Verify a ZK proof
   * 
   * Verifies that a proof is valid by checking the commitment structure
   * and verification key. Does not reveal the underlying data.
   * 
   * @param {Object} proof - ZK proof object
   * @param {string} expectedRoot - Expected root/commitment (if applicable)
   * @returns {boolean} True if proof is valid
   */
  static verifyProof(proof, expectedRoot = null) {
    if (!proof || !proof.commitment || !proof.verificationKey) {
      return false;
    }

    // Verify proof structure
    if (typeof proof.commitment !== 'string' || 
        typeof proof.verificationKey !== 'string') {
      return false;
    }

    // Verify commitment format (64 hex chars for SHA-256)
    if (!/^[a-f0-9]{64}$/i.test(proof.commitment)) {
      return false;
    }

    // Verify verification key format
    if (!/^[a-f0-9]{64}$/i.test(proof.verificationKey)) {
      return false;
    }

    // If expected root provided, verify commitment matches
    if (expectedRoot && proof.commitment !== expectedRoot) {
      return false;
    }

    // Verify verification key is correctly derived
    const expectedVerificationKey = crypto.createHash('sha256')
      .update(proof.commitment + JSON.stringify(proof.metadata || {}))
      .digest('hex');

    if (proof.verificationKey !== expectedVerificationKey) {
      return false;
    }

    return true;
  }

  /**
   * Generate proof that user has permission without revealing identity
   * 
   * Creates a ZK proof that demonstrates a user has specific permissions
   * without revealing the user's identity.
   * 
   * @param {string} userId - User ID to hide
   * @param {Array} permissions - Permissions to prove
   * @param {Object} permissionData - Actual permission data
   * @returns {Object} ZK proof
   */
  static generatePermissionProof(userId, permissions, permissionData) {
    if (!userId || !Array.isArray(permissions) || !permissionData) {
      throw new Error('User ID, permissions array, and permission data are required');
    }

    // Generate random salt
    const salt = crypto.randomBytes(32).toString('hex');

    // Create commitment to user and permissions
    const commitmentData = {
      userId,
      permissions: permissions.sort(), // Sort for consistency
      role: permissionData.role,
      grantedAt: permissionData.grantedAt
    };

    const commitmentString = JSON.stringify(commitmentData) + salt;
    const commitment = crypto.createHash('sha256')
      .update(commitmentString)
      .digest('hex');

    // Create verification key
    const verificationKey = crypto.createHash('sha256')
      .update(commitment + JSON.stringify({
        permissions: permissions.sort(),
        role: permissionData.role
      }))
      .digest('hex');

    return {
      commitment,
      salt,
      verificationKey,
      timestamp: Date.now(),
      metadata: {
        permissions: permissions, // Permissions can be public
        role: permissionData.role,
        grantedAt: permissionData.grantedAt
      }
    };
  }

  /**
   * Verify permission proof
   * 
   * Verifies that a proof demonstrates the required permissions without
   * revealing the user's identity.
   * 
   * @param {Object} proof - Permission proof
   * @param {Array} requiredPermissions - Permissions that must be proven
   * @returns {boolean} True if user has required permissions
   */
  static verifyPermissionProof(proof, requiredPermissions) {
    if (!proof || !requiredPermissions || !Array.isArray(requiredPermissions)) {
      return false;
    }

    // First verify proof structure
    if (!ZKProof.verifyProof(proof)) {
      return false;
    }

    // Check that proof metadata includes required permissions
    if (!proof.metadata || !proof.metadata.permissions) {
      return false;
    }

    const proofPermissions = proof.metadata.permissions;
    
    // Verify all required permissions are present
    for (const required of requiredPermissions) {
      if (!proofPermissions.includes(required)) {
        return false;
      }
    }

    return true;
  }
}

module.exports = ZKProof;

