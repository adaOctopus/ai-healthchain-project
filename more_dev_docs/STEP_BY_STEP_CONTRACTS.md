# Step-by-Step: Using Your Deployed Contracts

You have contract addresses. Here's exactly what to do.

## Your Contract Addresses

```
ConsentManagement: 0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363
AuditTrail:        0xcacFd7298887451302DE75685A0eAC9b77E59157
DataIntegrity:     0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4
```

## Step 1: Install ethers.js in Backend

```bash
cd server
npm install ethers
```

## Step 2: Create Contract Configuration File

Create `server/src/config/contracts.js`:

```javascript
// Contract addresses (from your deployment)
module.exports = {
  ConsentManagement: '0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363',
  AuditTrail: '0xcacFd7298887451302DE75685A0eAC9b77E59157',
  DataIntegrity: '0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4',
  
  // Local Hardhat node
  RPC_URL: 'http://localhost:8545',
  
  // Use first Hardhat account (or set your own)
  PRIVATE_KEY: process.env.CONTRACT_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
};
```

## Step 3: Create Contract Service

Create `server/src/services/ethersContractService.js`:

```javascript
const { ethers } = require('ethers');
const contractAddresses = require('../config/contracts.js');
const path = require('path');
const fs = require('fs');

class EthersContractService {
  constructor() {
    // Connect to local Hardhat node
    this.provider = new ethers.JsonRpcProvider(contractAddresses.RPC_URL);
    
    // Create signer (account that will send transactions)
    this.signer = new ethers.Wallet(contractAddresses.PRIVATE_KEY, this.provider);
    
    // Load contract ABIs
    this.contracts = this._loadContracts();
  }

  _loadContracts() {
    const contractsDir = path.join(__dirname, '../../contracts/artifacts/contracts');
    
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
  }

  // ========== CONSENT MANAGEMENT ==========
  
  async grantConsent(patientId, clinicianId, consentType, expiresAt, purpose) {
    // Convert consentType string to enum
    const typeMap = {
      'Data Access': 0,
      'AI Analysis': 1,
      'Research': 2,
      'Sharing': 3
    };
    
    const type = typeMap[consentType] || 0;
    const expires = expiresAt ? Math.floor(new Date(expiresAt).getTime() / 1000) : 0;
    
    console.log('Calling grantConsent on contract:', contractAddresses.ConsentManagement);
    console.log('Params:', { patientId, clinicianId, type, expires, purpose });
    
    const tx = await this.contracts.consent.grantConsent(
      patientId,
      clinicianId,
      type,
      expires,
      purpose || 1
    );
    
    console.log('Transaction sent:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    
    return {
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    };
  }

  async revokeConsent(consentId) {
    const tx = await this.contracts.consent.revokeConsent(consentId);
    await tx.wait();
    return {
      success: true,
      transactionHash: tx.hash
    };
  }

  async hasValidConsent(patientId, clinicianId, consentType) {
    const typeMap = {
      'Data Access': 0,
      'AI Analysis': 1,
      'Research': 2,
      'Sharing': 3
    };
    const type = typeMap[consentType] || 0;
    
    return await this.contracts.consent.hasValidConsent(patientId, clinicianId, type);
  }

  // ========== AUDIT TRAIL ==========
  
  async logDataAccess(actorId, resourceId, granted, reason) {
    const tx = await this.contracts.audit.logDataAccess(
      actorId,
      resourceId,
      granted,
      reason
    );
    await tx.wait();
    return {
      success: true,
      transactionHash: tx.hash
    };
  }

  // ========== DATA INTEGRITY ==========
  
  async storeMerkleRoot(root, recordSetId, recordCount) {
    const tx = await this.contracts.integrity.storeMerkleRoot(
      root,
      recordSetId,
      recordCount
    );
    await tx.wait();
    return {
      success: true,
      transactionHash: tx.hash
    };
  }
}

module.exports = EthersContractService;
```

## Step 4: Add to Backend Server

Update `server/src/index.js`:

```javascript
// Add at the top with other requires
const EthersContractService = require('./services/ethersContractService.js');

// After blockchain initialization (around line 39)
let ethersContractService = null;
try {
  ethersContractService = new EthersContractService();
  console.log('✓ Connected to smart contracts');
} catch (error) {
  console.warn('⚠️  Could not connect to smart contracts:', error.message);
  console.warn('   Continuing with custom blockchain only');
}

// Add to app.locals
app.locals.ethersContractService = ethersContractService;
```

## Step 5: Create New API Endpoints for Real Contracts

Create `server/src/features/consent-management/consentEthersController.js`:

```javascript
const express = require('express');
const router = express.Router();

/**
 * POST /api/contracts/consent/grant
 * Grant consent using REAL Solidity contract
 */
router.post('/grant', async (req, res, next) => {
  try {
    const { patientId, clinicianId, consentType, expiresAt, purpose } = req.body;
    
    if (!patientId || !clinicianId || !consentType) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['patientId', 'clinicianId', 'consentType']
      });
    }

    const contractService = req.app.locals.ethersContractService;
    
    if (!contractService) {
      return res.status(503).json({
        error: 'Smart contract service not available',
        message: 'Make sure Hardhat node is running and contracts are deployed'
      });
    }

    // Convert string addresses to Ethereum addresses if needed
    // If patientId/clinicianId are UUIDs, you'll need to map them to addresses
    // For now, assuming they're already addresses
    const patientAddress = patientId.startsWith('0x') ? patientId : `0x${patientId}`;
    const clinicianAddress = clinicianId.startsWith('0x') ? clinicianId : `0x${clinicianId}`;

    const result = await contractService.grantConsent(
      patientAddress,
      clinicianAddress,
      consentType,
      expiresAt,
      purpose
    );

    res.status(201).json({
      success: true,
      message: 'Consent granted on blockchain',
      ...result
    });
  } catch (error) {
    console.error('Contract interaction error:', error);
    next(error);
  }
});

/**
 * GET /api/contracts/consent/check/:patientId/:clinicianId/:type
 * Check consent using REAL Solidity contract
 */
router.get('/check/:patientId/:clinicianId/:type', async (req, res, next) => {
  try {
    const { patientId, clinicianId, type } = req.params;
    
    const contractService = req.app.locals.ethersContractService;
    
    if (!contractService) {
      return res.status(503).json({
        error: 'Smart contract service not available'
      });
    }

    const patientAddress = patientId.startsWith('0x') ? patientId : `0x${patientId}`;
    const clinicianAddress = clinicianId.startsWith('0x') ? clinicianId : `0x${clinicianId}`;

    const hasConsent = await contractService.hasValidConsent(
      patientAddress,
      clinicianAddress,
      type
    );

    res.json({
      hasConsent,
      patientId: patientAddress,
      clinicianId: clinicianAddress,
      consentType: type
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

## Step 6: Add Route to Server

In `server/src/index.js`, add:

```javascript
// Add after other feature routes (around line 82)
if (ethersContractService) {
  app.use('/api/contracts/consent', require('./features/consent-management/consentEthersController.js'));
  console.log('✓ Real contract endpoints enabled at /api/contracts/*');
}
```

## Step 7: Test It!

1. **Make sure Hardhat node is running:**
```bash
cd contracts
npm run node
```

2. **Start backend:**
```bash
cd server
npm start
```

3. **Submit transaction:**
```bash
curl -X POST http://localhost:3000/api/contracts/consent/grant \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "clinicianId": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "consentType": "Data Access"
  }'
```

**You'll see:**
- Transaction hash
- Block number
- Gas used

## Summary: What You Did

1. ✅ Put addresses in `server/src/config/contracts.js`
2. ✅ Installed ethers.js
3. ✅ Created service to connect to contracts
4. ✅ Created API endpoints that use real contracts
5. ✅ Submit transactions via `/api/contracts/consent/grant`

## Quick Test Script

Create `server/test-contract.js`:

```javascript
const EthersContractService = require('./src/services/ethersContractService.js');

async function test() {
  const service = new EthersContractService();
  
  // Get first account from Hardhat
  const accounts = await service.provider.listAccounts();
  const patient = accounts[0];
  const clinician = accounts[1];
  
  console.log('Patient:', patient);
  console.log('Clinician:', clinician);
  
  // Grant consent
  const result = await service.grantConsent(
    patient,
    clinician,
    'Data Access',
    null,
    1
  );
  
  console.log('Result:', result);
  
  // Check consent
  const hasConsent = await service.hasValidConsent(patient, clinician, 'Data Access');
  console.log('Has consent:', hasConsent);
}

test().catch(console.error);
```

Run:
```bash
cd server
node test-contract.js
```

That's it! You're now using real Solidity contracts. 🎉

