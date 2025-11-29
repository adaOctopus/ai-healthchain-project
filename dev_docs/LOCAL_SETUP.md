# Local Development Setup - Complete Guide

Run everything locally: Backend, Frontend, and Smart Contracts.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Quick Start (3 Terminals)

### Terminal 1: Smart Contracts (Local Blockchain)

```bash
cd contracts
npm install
npm run compile
npm run node
```

**Keep this running!** This starts a local Hardhat node with 20 test accounts.

### Terminal 2: Backend Server

```bash
cd server
npm install

# Generate mock data (first time only)
cd ../data-generator
npm install
node generate-data.js

# Start backend
cd ../server
npm start
```

Backend runs on: `http://localhost:3000`

### Terminal 3: Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173` (or similar)

---

## Step-by-Step Setup

### 1. Setup Smart Contracts

```bash
cd contracts
npm install
npm run compile
```

**Start local blockchain:**
```bash
npm run node
```

You'll see 20 accounts with 10,000 ETH each. **Keep this terminal open.**

### 2. Deploy Contracts

**In a new terminal:**
```bash
cd contracts
npm run deploy:local
```

This deploys all contracts. Save the addresses shown.

### 3. Setup Backend

```bash
cd server
npm install
```

**Generate mock data (first time only):**
```bash
cd ../data-generator
npm install
node generate-data.js
```

**Start backend:**
```bash
cd ../server
npm start
```

Backend API: `http://localhost:3000`

### 4. Setup Frontend

```bash
cd client
npm install
npm run dev
```

Frontend: `http://localhost:5173`

---

## Interacting with Contracts

### Option 1: Using Backend API

The backend has endpoints for all contract operations:

```bash
# Health check
curl http://localhost:3000/health

# Grant consent
curl -X POST http://localhost:3000/api/consent/grant \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-id",
    "clinicianId": "clinician-id",
    "consentType": "Data Access"
  }'

# Check consent
curl http://localhost:3000/api/consent/check/patient-id/clinician-id/Data%20Access

# Create Merkle tree
curl -X POST http://localhost:3000/api/integrity/tree \
  -H "Content-Type: application/json" \
  -d '{
    "records": [{"id": "1", "data": "test"}]
  }'
```

### Option 2: Using Hardhat Console

```bash
cd contracts
npx hardhat console --network localhost
```

Then in the console:
```javascript
const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
const consent = ConsentManagement.attach("YOUR_CONTRACT_ADDRESS");

// Get version
await consent.version();

// Grant consent
await consent.grantConsent(
  "0xPatientAddress",
  "0xClinicianAddress",
  0, // ConsentType.DataAccess
  0, // No expiration
  1  // Purpose
);
```

### Option 3: Using Interaction Script

```bash
cd contracts
# Update contract addresses in scripts/interact.js first
npm run interact:local
```

---

## Available Services

### Backend API Endpoints

- `GET /health` - Health check
- `GET /api/blockchain/info` - Blockchain info

**Consent:**
- `POST /api/consent/grant` - Grant consent
- `POST /api/consent/revoke` - Revoke consent
- `GET /api/consent/check/:patientId/:clinicianId/:type` - Check consent
- `GET /api/consent/history/:patientId` - Get history
- `GET /api/consent/active/:patientId` - Get active consents

**Data Integrity:**
- `POST /api/integrity/tree` - Create Merkle tree
- `POST /api/integrity/proof` - Generate proof
- `POST /api/integrity/verify` - Verify proof
- `POST /api/integrity/verify-batch` - Batch verify

**ZK Proofs:**
- `POST /api/zk/consent-proof` - Generate consent proof
- `POST /api/zk/verify-consent` - Verify consent proof
- `POST /api/zk/permission-proof` - Generate permission proof
- `POST /api/zk/verify-permission` - Verify permission proof

**Audit Trail:**
- `POST /api/audit/data-access` - Log data access
- `POST /api/audit/consent` - Log consent change
- `POST /api/audit/ai-diagnostic` - Log AI diagnostic
- `GET /api/audit/query` - Query logs
- `GET /api/audit/trail/:resourceId/:resourceType` - Get audit trail

**Consensus:**
- `POST /api/consensus/propose` - Propose block
- `POST /api/consensus/vote` - Vote on block
- `POST /api/consensus/sync` - Sync chain

### Smart Contracts

- **ConsentManagement** - Manage patient consents
- **AuditTrail** - Immutable audit logging
- **DataIntegrity** - Merkle root storage

---

## Quick Reference

### Start Everything

```bash
# Terminal 1: Contracts
cd contracts && npm run node

# Terminal 2: Backend
cd server && npm start

# Terminal 3: Frontend
cd client && npm run dev
```

### Contract Commands

```bash
cd contracts
npm run compile          # Compile contracts
npm run node            # Start local node
npm run deploy:local    # Deploy to local network
npm run interact:local  # Interact with contracts
npm test                # Run tests
```

### Backend Commands

```bash
cd server
npm start               # Start server
npm run dev             # Start with watch mode
```

### Frontend Commands

```bash
cd client
npm run dev             # Start dev server
npm run build           # Build for production
```

---

## Troubleshooting

### Port Already in Use

**Port 8545 (Hardhat node):**
```bash
lsof -ti:8545 | xargs kill -9
```

**Port 3000 (Backend):**
```bash
lsof -ti:3000 | xargs kill -9
```

### Contracts Not Deployed

1. Make sure Hardhat node is running
2. Run `npm run deploy:local` again
3. Check deployment addresses in `contracts/deployments/`

### Backend Can't Connect to Blockchain

1. Verify Hardhat node is running on port 8545
2. Check `server/src/index.js` uses correct network
3. Restart backend after deploying contracts

### Frontend Can't Connect to Backend

1. Verify backend is running on port 3000
2. Check `client` configuration for API URL
3. Check CORS settings in backend

---

## File Structure

```
aihealthchains-blockchain-assessment/
├── contracts/          # Smart contracts
│   ├── contracts/     # Solidity files
│   ├── scripts/       # Deployment & interaction
│   └── test/          # Contract tests
├── server/            # Backend API
│   └── src/
│       ├── core/      # Blockchain core
│       └── features/  # Feature modules
├── client/            # Frontend
└── data-generator/   # Mock data generator
```

---

## Next Steps

1. **Test Backend API**: Use Postman or curl to test endpoints
2. **Interact with Contracts**: Use Hardhat console or scripts
3. **Frontend Integration**: Connect frontend to backend API
4. **Read Documentation**: Check `SOLUTION_DOCUMENTATION.md` for details

That's it! You're ready to develop locally. 🚀

