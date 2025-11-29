# Simple Frontend Interaction Guide

## Do I need to generate data first?

**NO.** You can interact directly from the frontend. The contracts are already deployed and ready.

---

## 3 Simple Steps

### Step 1: Start Hardhat Node
```bash
cd contracts
npm run node
```
**Keep this terminal open!**

### Step 2: Start Frontend
```bash
cd client
npm run dev
```

### Step 3: Use the Frontend
1. Open browser: `http://localhost:5173`
2. Click **"Consent Management"** in the nav
3. Click **"Connect Wallet"** button
4. Fill the form and click **"Grant Consent"**

**Done!** Transaction submitted to blockchain.

---

## That's It!

You don't need:
- ❌ Backend running
- ❌ Pre-generated data
- ❌ Any setup scripts

Just:
- ✅ Hardhat node running
- ✅ Frontend running
- ✅ MetaMask connected (or use the default Hardhat account)

---

## Quick Troubleshooting

**"No contract found"**
→ Make sure contract addresses in `client/src/config/contracts.js` match your deployed addresses

**"Cannot connect to network"**
→ Make sure Hardhat node is running on `http://127.0.0.1:8545`

**"Transaction failed"**
→ Make sure you're connected to the right network (Localhost 8545 in MetaMask)

