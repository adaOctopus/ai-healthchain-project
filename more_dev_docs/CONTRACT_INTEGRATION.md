# Smart Contract Integration Guide

Where to interact with deployed contracts and submit transactions.

## Current Architecture

You have **two separate systems**:

1. **Backend JavaScript Blockchain** (`server/src/core/Blockchain.js`)
   - Custom in-memory blockchain
   - Used by backend API endpoints
   - Stores transactions in memory

2. **Deployed Solidity Contracts** (on Hardhat/EVM)
   - Real smart contracts on blockchain
   - Deployed addresses in `contracts/addresses.txt`
   - Need ethers.js to interact

## Integration Points

### Option 1: Backend API (Current - Uses Custom Blockchain)

**Location**: `server/src/features/*/consentController.js` (and other controllers)

**How it works**:
```
Frontend → Backend API → ConsentContract.js → Blockchain.js (custom)
```

**Example - Grant Consent**:
```javascript
// Frontend or Postman
POST http://localhost:3000/api/consent/grant
{
  "patientId": "patient-uuid",
  "clinicianId": "clinician-uuid",
  "consentType": "Data Access"
}
```

**Flow**:
1. Request hits `consentController.js` (line 37)
2. Calls `consentService.js` → `grantConsent()` (line 33)
3. Calls `ConsentContract.js` → `grantConsent()` (line 125)
4. Creates transaction via `blockchain.addTransaction()` (line 83)

**Files**:
- `server/src/features/consent-management/consentController.js` - API endpoints
- `server/src/features/consent-management/consentService.js` - Business logic
- `server/src/features/consent-management/ConsentContract.js` - Contract logic

---

### Option 2: Direct Solidity Contract Interaction (NEW - For Real Contracts)

To interact with your **deployed Solidity contracts**, you need to add ethers.js integration.

#### Step 1: Install ethers.js in Backend

```bash
cd server
npm install ethers
```

#### Step 2: Create Contract Service

Create `server/src/services/contractService.js`:

```javascript
const { ethers } = require('ethers');

// Contract addresses (from your deployment)
const CONTRACT_ADDRESSES = {
  ConsentManagement: process.env.CONSENT_MANAGEMENT_ADDRESS || '0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363',
  AuditTrail: process.env.AUDIT_TRAIL_ADDRESS || '0xcacFd7298887451302DE75685A0eAC9b77E59157',
  DataIntegrity: process.env.DATA_INTEGRITY_ADDRESS || '0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4',
};

class ContractService {
  constructor() {
    // Connect to local Hardhat node
    this.provider = new ethers.JsonRpcProvider('http://localhost:8545');
    
    // Use first account from Hardhat (or your private key)
    this.signer = new ethers.Wallet(
      process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
      this.provider
    );
    
    // Load contract ABIs (from artifacts after compilation)
    this.consentContract = this._loadContract('ConsentManagement');
    this.auditContract = this._loadContract('AuditTrail');
    this.integrityContract = this._loadContract('DataIntegrity');
  }

  _loadContract(contractName) {
    const artifact = require(`../../contracts/artifacts/contracts/${contractName}.sol/${contractName}.json`);
    return new ethers.Contract(
      CONTRACT_ADDRESSES[contractName],
      artifact.abi,
      this.signer
    );
  }

  // Consent Management Methods
  async grantConsent(patientId, clinicianId, consentType, expiresAt, purpose) {
    const tx = await this.consentContract.grantConsent(
      patientId,
      clinicianId,
      consentType, // 0 = DataAccess, 1 = AIAnalysis, etc.
      expiresAt,
      purpose
    );
    await tx.wait();
    return tx.hash;
  }

  async revokeConsent(consentId) {
    const tx = await this.consentContract.revokeConsent(consentId);
    await tx.wait();
    return tx.hash;
  }

  async hasValidConsent(patientId, clinicianId, consentType) {
    return await this.consentContract.hasValidConsent(patientId, clinicianId, consentType);
  }

  // Audit Trail Methods
  async logDataAccess(actorId, resourceId, granted, reason) {
    const tx = await this.auditContract.logDataAccess(actorId, resourceId, granted, reason);
    await tx.wait();
    return tx.hash;
  }

  // Data Integrity Methods
  async storeMerkleRoot(root, recordSetId, recordCount) {
    const tx = await this.integrityContract.storeMerkleRoot(root, recordSetId, recordCount);
    await tx.wait();
    return tx.hash;
  }
}

module.exports = ContractService;
```

#### Step 3: Update Backend to Use Real Contracts

Modify `server/src/index.js`:

```javascript
// Add at top
const ContractService = require('./services/contractService.js');

// After blockchain initialization
const contractService = new ContractService();
app.locals.contractService = contractService;
```

#### Step 4: Create New Controller for Real Contracts

Create `server/src/features/consent-management/consentContractController.js`:

```javascript
const express = require('express');
const router = express.Router();

router.post('/grant', async (req, res, next) => {
  try {
    const { patientId, clinicianId, consentType, expiresAt, purpose } = req.body;
    const contractService = req.app.locals.contractService;
    
    // Convert consentType string to enum
    const typeMap = {
      'Data Access': 0,
      'AI Analysis': 1,
      'Research': 2,
      'Sharing': 3
    };
    
    const txHash = await contractService.grantConsent(
      patientId,
      clinicianId,
      typeMap[consentType] || 0,
      expiresAt || 0,
      purpose || 1
    );
    
    res.json({
      success: true,
      transactionHash: txHash,
      message: 'Consent granted on blockchain'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

Add route in `server/src/index.js`:
```javascript
app.use('/api/contracts/consent', require('./features/consent-management/consentContractController.js'));
```

---

### Option 3: Frontend Direct Interaction

#### Install ethers.js in Frontend

```bash
cd client
npm install ethers
```

#### Create Contract Hook

Create `client/src/hooks/useContracts.js`:

```javascript
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Contract addresses
const CONTRACT_ADDRESSES = {
  ConsentManagement: '0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363',
  AuditTrail: '0xcacFd7298887451302DE75685A0eAC9b77E59157',
  DataIntegrity: '0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4',
};

export function useContracts() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});

  useEffect(() => {
    async function init() {
      // Connect to local Hardhat node
      const provider = new ethers.JsonRpcProvider('http://localhost:8545');
      setProvider(provider);

      // Request account access (MetaMask) or use local account
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setSigner(signer);
      } else {
        // Use local Hardhat account
        const wallet = new ethers.Wallet(
          '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
          provider
        );
        setSigner(wallet);
      }

      // Load contracts (you'll need to copy ABIs to frontend)
      // For now, use minimal ABI
      const consentABI = [
        "function grantConsent(address,address,uint8,uint64,uint32) returns(bytes32)",
        "function hasValidConsent(address,address,uint8) view returns(bool)"
      ];

      const consentContract = new ethers.Contract(
        CONTRACT_ADDRESSES.ConsentManagement,
        consentABI,
        signer
      );

      setContracts({ consent: consentContract });
    }

    init();
  }, []);

  return { provider, signer, contracts };
}
```

#### Use in Component

Update `client/src/App.jsx`:

```javascript
import { useContracts } from './hooks/useContracts';

function ConsentManagement() {
  const { contracts } = useContracts();
  const [txHash, setTxHash] = useState(null);

  const handleGrantConsent = async () => {
    try {
      const tx = await contracts.consent.grantConsent(
        '0xPatientAddress',
        '0xClinicianAddress',
        0, // DataAccess
        0, // No expiration
        1  // Purpose
      );
      await tx.wait();
      setTxHash(tx.hash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      <button onClick={handleGrantConsent}>Grant Consent</button>
      {txHash && <p>Transaction: {txHash}</p>}
    </div>
  );
}
```

---

### Option 4: Hardhat Console (Quick Testing)

```bash
cd contracts
npx hardhat console --network localhost
```

```javascript
const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
const consent = ConsentManagement.attach("0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363");

// Grant consent
const tx = await consent.grantConsent(
  "0xPatientAddress",
  "0xClinicianAddress",
  0, // ConsentType.DataAccess
  0, // No expiration
  1  // Purpose
);
await tx.wait();
console.log("Transaction hash:", tx.hash);
```

---

## Summary: Where to Submit Transactions

### Current System (Custom Blockchain)
- **Location**: `server/src/features/*/consentController.js`
- **Method**: HTTP POST to `/api/consent/grant`
- **Flow**: API → Service → Contract → Custom Blockchain

### Real Solidity Contracts (Recommended)
- **Option A - Backend Integration**: 
  - Create `server/src/services/contractService.js`
  - Use ethers.js to call contracts
  - Expose via new API endpoints

- **Option B - Frontend Integration**:
  - Use `useContracts` hook
  - Direct contract calls from React
  - Requires MetaMask or local account

- **Option C - Scripts**:
  - `contracts/scripts/interact.js`
  - Hardhat console
  - Direct testing

---

## Quick Setup for Real Contracts

1. **Install ethers.js**:
```bash
cd server && npm install ethers
cd ../client && npm install ethers
```

2. **Copy contract ABIs** to backend/frontend:
```bash
# From contracts/artifacts/contracts/ConsentManagement.sol/ConsentManagement.json
```

3. **Set contract addresses** in environment or config

4. **Create contract service** (see Option 2 above)

5. **Update controllers** to use real contracts instead of custom blockchain

---

## Transaction Examples

### Grant Consent (Real Contract)
```javascript
// Backend
const tx = await contractService.grantConsent(
  '0xPatientAddress',
  '0xClinicianAddress',
  0, // DataAccess
  Math.floor(Date.now() / 1000) + 86400, // 24h expiration
  1  // Purpose
);
```

### Log Audit Event (Real Contract)
```javascript
const tx = await contractService.logDataAccess(
  '0xActorAddress',
  ethers.id('resource-1'),
  true,
  'Valid consent exists'
);
```

---

**Next Steps**: Choose an integration method and implement it. Option 2 (Backend Integration) is recommended for production.

