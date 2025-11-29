# Simple Frontend Guide - Sepolia Network

## Overview

The frontend connects directly to **Sepolia testnet** via MetaMask. You can interact with deployed smart contracts from the browser without needing the backend running.

---

## Quick Setup (4 Steps)

### Step 1: Grant Roles to Your Address (REQUIRED)

**⚠️ IMPORTANT**: The contract requires roles. You must grant yourself a role before you can interact.

```bash
cd contracts
npx hardhat run scripts/grantRoles.js --network sepolia
```

This grants `CLINICIAN_ROLE` and `PATIENT_ROLE` to your addresses. **Edit the script** to add your MetaMask address if needed.

**See `ROLES_SETUP.md` for detailed instructions.**

### Step 2: Configure Sepolia RPC (Optional)

If you want to use a custom Sepolia RPC, create `client/.env` or `client/.env.local`:

```bash
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

**If you don't set this**, the frontend will use MetaMask's default Sepolia network.

### Step 3: Start Frontend

```bash
cd client
npm run dev
```

### Step 4: Connect & Use

1. Open browser: `http://localhost:5173`
2. Click **"Consent Management"** in navigation
3. Click **"Connect Wallet"** button
4. Approve MetaMask connection
5. **Make sure MetaMask is on Sepolia network** (if not, switch manually)
6. Fill form and click **"Grant Consent"**

**Done!** Transaction submitted to Sepolia blockchain.

---

## How It Works

### Frontend → Sepolia Flow

1. **User clicks "Connect Wallet"**
   - Frontend requests MetaMask connection
   - MetaMask prompts user to approve
   - Frontend gets user's wallet address

2. **User submits transaction**
   - Frontend uses ethers.js to call contract function
   - MetaMask prompts user to sign transaction
   - Transaction sent to Sepolia network
   - Transaction hash returned

3. **Transaction confirmed**
   - View transaction on [Sepolia Etherscan](https://sepolia.etherscan.io)
   - Transaction hash displayed in UI

---

## Contract Addresses (Sepolia)

The frontend is configured with these deployed contract addresses:

```
ConsentManagement: 0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363
AuditTrail:        0xcacFd7298887451302DE75685A0eAC9b77E59157
DataIntegrity:     0xE47027C4c595f88B33c010FB42E9Fa608fe1a5d4
```

These are stored in `client/src/config/contracts.js` and automatically used when you interact with contracts.

---

## What You Can Do

### Grant Consent

1. Connect wallet
2. Enter patient address (or leave empty for default)
3. Enter clinician address (or leave empty for default)
4. Select consent type
5. Click **"Grant Consent"**
6. Approve transaction in MetaMask
7. Wait for confirmation

### Check Consent

1. Connect wallet
2. Enter patient and clinician addresses
3. Select consent type
4. Click **"Check Consent"**
5. See if consent exists (read-only, no transaction)

---

## Network Requirements

### MetaMask Setup

1. **Install MetaMask** (if not installed)
2. **Add Sepolia Network** (if not added):
   - Network Name: `Sepolia`
   - RPC URL: `https://rpc.sepolia.org` (or your custom RPC)
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.etherscan.io`

3. **Get Sepolia ETH** (for gas fees):
   - Visit: https://sepoliafaucet.com/
   - Or: https://faucet.quicknode.com/ethereum/sepolia
   - Request testnet ETH to your MetaMask address

### Network Switching

The frontend **does NOT automatically switch networks**. If you're on the wrong network:

1. **Manual switch**: Click MetaMask → Select "Sepolia" network
2. **Or use the switch button** (if added to UI later)

---

## Troubleshooting

### "MetaMask not found"
- **Solution**: Install MetaMask browser extension

### "Connection rejected"
- **Solution**: Click "Connect" in MetaMask popup

### "Transaction failed" or "Unauthorized"
- **Check**: Did you grant roles? Run `npx hardhat run scripts/grantRoles.js --network sepolia`
- **Check**: Are you on Sepolia network?
- **Check**: Do you have Sepolia ETH for gas?
- **Check**: Is the contract address correct?
- **Check**: Does your address have CLINICIAN_ROLE or PATIENT_ROLE? See `ROLES_SETUP.md`

### "Network mismatch"
- **Solution**: Switch MetaMask to Sepolia network manually

### "Insufficient funds"
- **Solution**: Get Sepolia ETH from a faucet (see above)

---

## Environment Variables

### Optional: Custom Sepolia RPC

Create `client/.env`:

```bash
# Optional: Custom Sepolia RPC URL
# If not set, uses MetaMask's default Sepolia network
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

**Free RPC Providers:**
- Infura: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- Alchemy: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
- Public: `https://rpc.sepolia.org` (rate limited)

---

## What You DON'T Need

- ❌ Backend server running
- ❌ Local Hardhat node
- ❌ Pre-generated data
- ❌ Database setup

**Just:**
- ✅ Frontend running
- ✅ MetaMask installed
- ✅ Sepolia network added
- ✅ Sepolia ETH for gas

---

## Viewing Transactions

After submitting a transaction:

1. **Copy transaction hash** from the UI
2. **Visit**: https://sepolia.etherscan.io
3. **Paste hash** in search box
4. **View transaction details**

---

## Summary

**To interact with contracts from frontend:**

1. Start frontend: `cd client && npm run dev`
2. Open browser → Go to Consent Management page
3. Connect MetaMask wallet
4. Make sure you're on Sepolia network
5. Submit transactions directly from UI

**That's it!** No backend, no local node, just frontend + MetaMask + Sepolia.

---

## Quick Reference

**Start Frontend:**
```bash
cd client
npm run dev
```

**Open Browser:**
```
http://localhost:5173
```

**Contract Addresses:**
- See `client/src/config/contracts.js`

**Network:**
- Sepolia (Chain ID: 11155111)

**Get Testnet ETH:**
- https://sepoliafaucet.com/
