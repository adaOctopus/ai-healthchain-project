# How to Use Your Deployed Contracts - Simple Guide

## What You Have

**Contract Addresses:**
```
ConsentManagement: 0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363
AuditTrail:        0xcacFd7298887451302DE75685A0eAC9b77E59157
DataIntegrity:     0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4
```

## What I Just Set Up For You

✅ **Addresses stored in**: `server/src/config/contracts.js`
✅ **ethers.js installed** in backend
✅ **Contract service created**: `server/src/services/ethersContractService.js`
✅ **API endpoints created**: `/api/contracts/consent/*`
✅ **Integrated into server**: `server/src/index.js`

## How to Use It

### Step 1: Start Hardhat Node

```bash
cd contracts
npm run node
```

**Keep this running!**

### Step 2: Start Backend

```bash
cd server
npm start
```

You should see:
```
✓ Connected to contracts:
  ConsentManagement: 0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363
  AuditTrail: 0xcacFd7298887451302DE75685A0eAC9b77E59157
  DataIntegrity: 0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4
✓ Real Solidity contract endpoints enabled at /api/contracts/*
```

### Step 3: Submit Transaction

```bash
curl -X POST http://localhost:3000/api/contracts/consent/grant \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "clinicianId": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "consentType": "Data Access"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Consent granted on blockchain",
  "transactionHash": "0x...",
  "blockNumber": 123,
  "gasUsed": "150000"
}
```

## Quick Test

```bash
cd server
node test-contract.js
```

This will:
1. Connect to contracts
2. Grant a consent
3. Check if consent exists
4. Show you it works!

## What Happens

1. **You call API**: `POST /api/contracts/consent/grant`
2. **Controller receives**: `consentEthersController.js`
3. **Service calls contract**: `ethersContractService.js` uses ethers.js
4. **Transaction sent**: To your deployed contract on Hardhat
5. **Transaction confirmed**: Returns hash and block number

## Files Created

- `server/src/config/contracts.js` - Your addresses (already set)
- `server/src/services/ethersContractService.js` - Connects to contracts
- `server/src/features/consent-management/consentEthersController.js` - API endpoints
- `server/test-contract.js` - Test script

## API Endpoints (Real Contracts)

- `POST /api/contracts/consent/grant` - Grant consent
- `POST /api/contracts/consent/revoke` - Revoke consent  
- `GET /api/contracts/consent/check/:patientId/:clinicianId/:type` - Check consent

## That's It!

**To submit transactions:**
1. Start Hardhat node
2. Start backend
3. Call `/api/contracts/consent/grant`

**Addresses are already configured. Just use the API!**

See `STEP_BY_STEP_CONTRACTS.md` for more details.

