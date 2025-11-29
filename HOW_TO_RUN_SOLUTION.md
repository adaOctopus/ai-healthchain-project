# Quick Testing Guide

## Prerequisites

- Node.js installed
- MetaMask browser extension (for frontend contract interaction)
- Sepolia testnet ETH (for gas fees) - get from https://sepoliafaucet.com/

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
# Install contract dependencies
cd contracts && npm install

# Install backend dependencies
cd ../server && npm install

# Install frontend dependencies
cd ../client && npm install
```

### 2. Grant Roles (Required for Contract Interaction)

```bash
cd contracts
npx hardhat run scripts/grantRoles.js --network sepolia
```

This grants `CLINICIAN_ROLE` and `PATIENT_ROLE` to your addresses so you can interact with contracts.

### 3. Start Services

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 4. Test Features

Open `http://localhost:5173` in your browser:

- **Consent Management**: Connect MetaMask → Grant consent on Sepolia blockchain
- **Data Integrity**: Test Merkle tree creation, proof generation, verification
- **ZK Proofs**: Generate and verify zero-knowledge proofs (works with mock data)
- **Audit Trail**: Log data access, consent changes, AI diagnostics
- **Consensus**: Test block proposal, voting, chain synchronization

## What's Working

✅ **Frontend Contract Interaction**: Connect MetaMask, submit transactions to Sepolia  
✅ **Backend APIs**: All feature endpoints tested and working  
✅ **Custom Blockchain**: Merkle trees, ZK proofs, audit logging, consensus  
✅ **Solidity Contracts**: Deployed on Sepolia with role-based access control  

## Network Configuration

- **Frontend**: Connects to Sepolia via MetaMask (or local Hardhat if configured)
- **Backend**: Uses custom JavaScript blockchain (port 3000)
- **Contracts**: Deployed on Sepolia testnet

## Troubleshooting

- **"Unauthorized" error**: Run `grantRoles.js` script to grant roles
- **MetaMask connection issues**: Make sure MetaMask is unlocked and on Sepolia network
- **Backend not responding**: Check that server is running on port 3000
- **No Sepolia ETH**: Get testnet ETH from a faucet

## Full Documentation

See `official_docs/` folder for detailed guides on each feature.

---

**Ready to test!** Start the backend and frontend, then explore each feature page in the browser.

