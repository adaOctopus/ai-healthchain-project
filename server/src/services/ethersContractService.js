const { ethers } = require('ethers');
const contractAddresses = require('../config/contracts.js');
const path = require('path');
const fs = require('fs');

/**
 * Service to interact with deployed Solidity contracts using ethers.js
 * 
 * This connects to your deployed contracts and allows you to submit
 * real blockchain transactions.
 */
class EthersContractService {
  constructor() {
    // Connect to local Hardhat node
    this.provider = new ethers.JsonRpcProvider(contractAddresses.RPC_URL);
    
    // Create signer (account that will send transactions)
    this.signer = new ethers.Wallet(contractAddresses.PRIVATE_KEY, this.provider);
    
    // Load contract ABIs and create contract instances
    this.contracts = this._loadContracts();
    
    console.log('Connected to contracts:');
    console.log('  ConsentManagement:', contractAddresses.ConsentManagement);
    console.log('  AuditTrail:', contractAddresses.AuditTrail);
    console.log('  DataIntegrity:', contractAddresses.DataIntegrity);
  }

  /**
   * Load contract ABIs from Hardhat artifacts
   */
  _loadContracts() {
    const contractsDir = path.join(__dirname, '../../contracts/artifacts/contracts');
    
    try {
      // Load ConsentManagement
      const consentArtifact = JSON.parse(
        fs.readFileSync(
          path.join(contractsDir, 'ConsentManagement.sol/ConsentManagement.json'),
          'utf8'
        )
      );
      
      // Load AuditTrail
      const auditArtifact = JSON.parse(
        fs.readFileSync(
          path.join(contractsDir, 'AuditTrail.sol/AuditTrail.json'),
          'utf8'
        )
      );
      
      // Load DataIntegrity
      const integrityArtifact = JSON.parse(
        fs.readFileSync(
          path.join(contractsDir, 'DataIntegrity.sol/DataIntegrity.json'),
          'utf8'
        )
      );

      return {
        consent: new ethers.Contract(
          contractAddresses.ConsentManagement,
          consentArtifact.abi,
          this.signer
        ),
        audit: new ethers.Contract(
          contractAddresses.AuditTrail,
          auditArtifact.abi,
          this.signer
        ),
        integrity: new ethers.Contract(
          contractAddresses.DataIntegrity,
          integrityArtifact.abi,
          this.signer
        )
      };
    } catch (error) {
      console.error('Error loading contract ABIs:', error.message);
      console.error('Make sure contracts are compiled: cd contracts && npm run compile');
      throw error;
    }
  }

  // ========== CONSENT MANAGEMENT ==========
  
  /**
   * Grant consent on the blockchain
   * @param {string} patientId - Patient address (0x...)
   * @param {string} clinicianId - Clinician address (0x...)
   * @param {string} consentType - 'Data Access' | 'AI Analysis' | 'Research' | 'Sharing'
   * @param {string|null} expiresAt - ISO date string or null
   * @param {number} purpose - Purpose code (default: 1)
   * @returns {Promise<Object>} Transaction result
   */
  async grantConsent(patientId, clinicianId, consentType, expiresAt, purpose) {
    // Convert consentType string to enum
    const typeMap = {
      'Data Access': 0,
      'AI Analysis': 1,
      'Research': 2,
      'Sharing': 3
    };
    
    const type = typeMap[consentType] ?? 0;
    const expires = expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : 0;
    
    console.log('📝 Calling grantConsent on contract:', contractAddresses.ConsentManagement);
    console.log('   Patient:', patientId);
    console.log('   Clinician:', clinicianId);
    console.log('   Type:', consentType, '(enum:', type, ')');
    
    try {
      const tx = await this.contracts.consent.grantConsent(
        patientId,
        clinicianId,
        type,
        expires,
        purpose || 1
      );
      
      console.log('⏳ Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
      
      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('❌ Transaction failed:', error.message);
      throw error;
    }
  }

  /**
   * Revoke consent
   */
  async revokeConsent(consentId) {
    const tx = await this.contracts.consent.revokeConsent(consentId);
    await tx.wait();
    return {
      success: true,
      transactionHash: tx.hash
    };
  }

  /**
   * Check if valid consent exists
   */
  async hasValidConsent(patientId, clinicianId, consentType) {
    const typeMap = {
      'Data Access': 0,
      'AI Analysis': 1,
      'Research': 2,
      'Sharing': 3
    };
    const type = typeMap[consentType] ?? 0;
    
    return await this.contracts.consent.hasValidConsent(patientId, clinicianId, type);
  }

  /**
   * Get consent record
   */
  async getConsent(consentId) {
    return await this.contracts.consent.getConsent(consentId);
  }

  // ========== AUDIT TRAIL ==========
  
  /**
   * Log data access event
   */
  async logDataAccess(actorId, resourceId, granted, reason) {
    // Convert resourceId to bytes32 if it's a string
    const resourceBytes = typeof resourceId === 'string' && !resourceId.startsWith('0x')
      ? ethers.id(resourceId)
      : resourceId;
    
    const tx = await this.contracts.audit.logDataAccess(
      actorId,
      resourceBytes,
      granted,
      reason
    );
    await tx.wait();
    return {
      success: true,
      transactionHash: tx.hash
    };
  }

  /**
   * Log consent change
   */
  async logConsentChange(actorId, consentId, action) {
    const consentBytes = typeof consentId === 'string' && !consentId.startsWith('0x')
      ? ethers.id(consentId)
      : consentId;
    
    const tx = await this.contracts.audit.logConsentChange(
      actorId,
      consentBytes,
      action
    );
    await tx.wait();
    return {
      success: true,
      transactionHash: tx.hash
    };
  }

  // ========== DATA INTEGRITY ==========
  
  /**
   * Store Merkle root on-chain
   */
  async storeMerkleRoot(root, recordSetId, recordCount) {
    // Convert to bytes32 if needed
    const rootBytes = typeof root === 'string' && !root.startsWith('0x')
      ? ethers.id(root)
      : root;
    const setIdBytes = typeof recordSetId === 'string' && !recordSetId.startsWith('0x')
      ? ethers.id(recordSetId)
      : recordSetId;
    
    const tx = await this.contracts.integrity.storeMerkleRoot(
      rootBytes,
      setIdBytes,
      recordCount
    );
    await tx.wait();
    return {
      success: true,
      transactionHash: tx.hash
    };
  }

  /**
   * Verify Merkle root exists
   */
  async verifyMerkleRoot(root) {
    const rootBytes = typeof root === 'string' && !root.startsWith('0x')
      ? ethers.id(root)
      : root;
    
    return await this.contracts.integrity.verifyMerkleRoot(rootBytes);
  }
}

module.exports = EthersContractService;

