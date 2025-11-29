# Where to Interact with Contracts & Submit Transactions

Quick reference guide for interacting with deployed smart contracts.

## 🎯 Quick Answer

### Current System (Custom JavaScript Blockchain)

**Submit transactions via Backend API:**

```bash
# Grant Consent
curl -X POST http://localhost:3000/api/consent/grant \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-uuid",
    "clinicianId": "clinician-uuid",
    "consentType": "Data Access"
  }'
```

**Code Location**: 
- API Endpoint: `server/src/features/consent-management/consentController.js` (line 37)
- Service: `server/src/features/consent-management/consentService.js` (line 33)
- Contract: `server/src/features/consent-management/ConsentContract.js` (line 125)
- Transaction: `server/src/features/consent-management/ConsentContract.js` (line 83)

---

### Real Solidity Contracts (Deployed)

**You have 3 options:**

#### Option 1: Hardhat Console (Fastest for Testing)

```bash
cd contracts
npx hardhat console --network localhost
```

```javascript
const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
const consent = ConsentManagement.attach("0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363");

// Submit transaction
const tx = await consent.grantConsent(
  "0xPatientAddress",
  "0xClinicianAddress",
  0, // ConsentType.DataAccess
  0, // No expiration
  1  // Purpose
);
await tx.wait();
console.log("TX Hash:", tx.hash);
```

#### Option 2: Interaction Script

```bash
cd contracts
# Update addresses in scripts/interact.js first
npm run interact:local
```

#### Option 3: Backend Integration (Recommended)

**Create**: `server/src/services/contractService.js` (see CONTRACT_INTEGRATION.md)

Then use in controllers:
```javascript
const contractService = req.app.locals.contractService;
const txHash = await contractService.grantConsent(...);
```

---

## 📍 File Locations

### Backend API Endpoints (Current System)

| Feature | Controller File | Endpoint |
|---------|----------------|----------|
| Consent | `server/src/features/consent-management/consentController.js` | `/api/consent/*` |
| Integrity | `server/src/features/data-integrity/integrityController.js` | `/api/integrity/*` |
| ZK Proofs | `server/src/features/zk-proofs/zkController.js` | `/api/zk/*` |
| Audit | `server/src/features/audit-trail/auditController.js` | `/api/audit/*` |
| Consensus | `server/src/features/consensus/consensusController.js` | `/api/consensus/*` |

### Contract Logic (Where Transactions Are Created)

| Feature | Contract File | Transaction Creation |
|---------|--------------|---------------------|
| Consent | `server/src/features/consent-management/ConsentContract.js` | Line 83 (`blockchain.addTransaction`) |
| Audit | `server/src/features/audit-trail/AuditLogger.js` | Line 67 (`blockchain.addTransaction`) |
| Integrity | `server/src/features/data-integrity/integrityService.js` | Line 191 (`blockchain.addTransaction`) |

### Frontend (Where Users Interact)

- Main App: `client/src/App.jsx`
- API calls: Uses `axios` to call backend endpoints
- Current: Frontend → Backend API → Custom Blockchain
- **To use real contracts**: Add ethers.js integration (see CONTRACT_INTEGRATION.md)

---

## 🔄 Transaction Flow

### Current Flow (Custom Blockchain)

```
User/Frontend
    ↓
POST /api/consent/grant
    ↓
consentController.js (line 37)
    ↓
consentService.js (line 33)
    ↓
ConsentContract.js (line 125)
    ↓
blockchain.addTransaction() (line 83)
    ↓
Custom Blockchain (in-memory)
```

### Real Contract Flow (To Implement)

```
User/Frontend
    ↓
POST /api/contracts/consent/grant
    ↓
contractController.js
    ↓
contractService.js (ethers.js)
    ↓
Solidity Contract (on Hardhat/EVM)
    ↓
Transaction on Blockchain
```

---

## 🚀 Quick Start Examples

### Example 1: Grant Consent via API

```bash
curl -X POST http://localhost:3000/api/consent/grant \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-123",
    "clinicianId": "clinician-456",
    "consentType": "Data Access",
    "expiresAt": "2025-12-31T00:00:00Z"
  }'
```

**Code path**: `consentController.js:37` → `consentService.js:33` → `ConsentContract.js:125`

### Example 2: Grant Consent via Real Contract

```bash
cd contracts
npx hardhat console --network localhost
```

```javascript
const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
const consent = ConsentManagement.attach("0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363");
const [signer] = await ethers.getSigners();

const tx = await consent.connect(signer).grantConsent(
  signer.address, // patient
  signer.address, // clinician
  0, // DataAccess
  0, // no expiration
  1  // purpose
);

await tx.wait();
console.log("Success! TX:", tx.hash);
```

### Example 3: Check Consent Status

```bash
curl http://localhost:3000/api/consent/check/patient-123/clinician-456/Data%20Access
```

**Code path**: `consentController.js:77` → `consentService.js:50` → `ConsentContract.js:70`

---

## 📝 Contract Addresses

Your deployed contracts (from `contracts/addresses.txt`):

```
ConsentManagement: 0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363
AuditTrail:        0xcacFd7298887451302DE75685A0eAC9b77E59157
DataIntegrity:     0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4
```

---

## 🎨 Frontend Integration

### Current (API-based)

Frontend calls backend API:
```javascript
// client/src/App.jsx
const response = await axios.post('/api/consent/grant', {
  patientId, clinicianId, consentType
});
```

### With Real Contracts (Direct)

```javascript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const signer = await provider.getSigner();
const contract = new ethers.Contract(address, abi, signer);

const tx = await contract.grantConsent(...);
await tx.wait();
```

---

## 📚 Full Documentation

- **Integration Guide**: `CONTRACT_INTEGRATION.md` - How to connect real contracts
- **Local Setup**: `LOCAL_SETUP.md` - Running everything locally
- **Deployment**: `contracts/DEPLOYMENT_GUIDE.md` - Deploying contracts

---

## Summary

**To submit transactions RIGHT NOW:**

1. **Via Backend API** (uses custom blockchain):
   - Endpoints: `/api/consent/*`, `/api/integrity/*`, etc.
   - Files: `server/src/features/*/consentController.js`

2. **Via Real Contracts** (uses Solidity contracts):
   - Hardhat console: `npx hardhat console --network localhost`
   - Scripts: `contracts/scripts/interact.js`
   - **To integrate**: See `CONTRACT_INTEGRATION.md`

**Current system uses custom blockchain. To use real Solidity contracts, integrate ethers.js (see CONTRACT_INTEGRATION.md).**

