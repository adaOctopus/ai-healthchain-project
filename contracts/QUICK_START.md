# Quick Start Guide

Get up and running with AI Health Chains smart contracts in 5 minutes!

## Local Development (Fastest)

### 1. Install & Compile

```bash
cd contracts
npm install
npm run compile
```

### 2. Start Local Node

**Terminal 1:**
```bash
npm run node
```

Keep this running! You'll see 20 accounts with 10,000 ETH each.

### 3. Deploy Contracts

**Terminal 2:**
```bash
npm run deploy:local
```

Done! Contracts are deployed and ready to use.

### 4. Interact (Optional)

```bash
npm run interact:local
```

---

## Sepolia Testnet (For Sharing/Testing)

### 1. Setup

```bash
cd contracts
npm install
cp .env.example .env
```

### 2. Configure `.env`

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key_here
```

**Get RPC URL:**
- Infura: https://infura.io/ (free)
- Alchemy: https://www.alchemy.com/ (free)

**Get Sepolia ETH:**
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

### 3. Deploy

```bash
npm run compile
npm run deploy:sepolia
```

### 4. Verify (Optional)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <ADMIN_ADDRESS>
```

---

## What You Need for Sepolia

✅ **RPC URL** (Required)
- Get from Infura or Alchemy (both free)
- Or use public: `https://rpc.sepolia.org`

✅ **Sepolia ETH** (Required)
- Get from faucets (free)
- Need ~0.1 ETH for deployment

✅ **Private Key** (Required)
- From MetaMask or wallet
- ⚠️ Use testnet account only!

✅ **Etherscan API Key** (Optional)
- Only needed for contract verification
- Get from: https://etherscan.io/apis

---

## Troubleshooting

**Local node not working?**
- Make sure port 8545 is free
- Check if node is running: `lsof -i :8545`

**Sepolia deployment failing?**
- Check RPC URL is correct
- Ensure you have Sepolia ETH
- Verify private key is correct

**Need help?**
- See full guide: `DEPLOYMENT_GUIDE.md`
- Check contract README: `README.md`

---

## Next Steps

- Read full deployment guide: `DEPLOYMENT_GUIDE.md`
- Explore contract interactions: `scripts/interact.js`
- Run tests: `npm test`
- Check contract documentation in source files

Happy deploying! 🚀

