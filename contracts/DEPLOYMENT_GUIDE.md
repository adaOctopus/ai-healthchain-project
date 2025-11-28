# Deployment Guide

This guide covers deploying and interacting with AI Health Chains smart contracts on both local Hardhat network and Sepolia testnet.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Sepolia Testnet Deployment](#sepolia-testnet-deployment)
3. [Contract Interaction](#contract-interaction)
4. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Step 1: Install Dependencies

```bash
cd contracts
npm install
```

### Step 2: Compile Contracts

```bash
npm run compile
```

### Step 3: Start Local Hardhat Node

In a **separate terminal**, start a local Hardhat node:

```bash
npm run node
```

This will:
- Start a local blockchain node on `http://127.0.0.1:8545`
- Create 20 test accounts with 10,000 ETH each
- Display account addresses and private keys

**Keep this terminal running** while you deploy and interact with contracts.

### Step 4: Deploy Contracts to Local Network

In a **new terminal** (with the node still running):

```bash
cd contracts
npm run deploy:local
```

This will deploy all three contracts (ConsentManagement, AuditTrail, DataIntegrity) to your local network.

### Step 5: Interact with Contracts

```bash
npm run interact:local
```

**Note**: Update contract addresses in `scripts/interact.js` after deployment, or set them as environment variables.

### Local Network Benefits

- ✅ Free (no gas costs)
- ✅ Instant transactions
- ✅ 20 pre-funded accounts
- ✅ Perfect for development and testing
- ✅ No external dependencies

---

## Sepolia Testnet Deployment

### Prerequisites

1. **Sepolia ETH**: You need Sepolia testnet ETH to pay for gas
   - Get it from: https://sepoliafaucet.com/
   - Or: https://faucet.quicknode.com/ethereum/sepolia

2. **RPC URL**: You need an RPC endpoint to connect to Sepolia
   - **Option 1: Infura** (Free)
     - Sign up at: https://infura.io/
     - Create a new project
     - Copy the Sepolia RPC URL
   - **Option 2: Alchemy** (Free)
     - Sign up at: https://www.alchemy.com/
     - Create a new app (Sepolia network)
     - Copy the HTTP URL
   - **Option 3: Public RPC** (Less reliable)
     - `https://rpc.sepolia.org`
     - `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

3. **Etherscan API Key** (Optional, for contract verification)
   - Sign up at: https://etherscan.io/
   - Go to API-KEYs section
   - Create a new API key

### Step 1: Configure Environment Variables

Copy the example environment file:

```bash
cd contracts
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Sepolia RPC URL (choose one)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# OR
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Your private key (from MetaMask or wallet)
# ⚠️  WARNING: Never use a mainnet account! Only use testnet accounts.
PRIVATE_KEY=your_private_key_here

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Security Note**: 
- Never commit `.env` file to git
- Only use testnet accounts with no real funds
- Consider using a dedicated testnet account

### Step 2: Get Sepolia ETH

1. Connect MetaMask to Sepolia testnet
2. Copy your account address
3. Visit a Sepolia faucet:
   - https://sepoliafaucet.com/
   - https://faucet.quicknode.com/ethereum/sepolia
   - https://www.alchemy.com/faucets/ethereum-sepolia
4. Request testnet ETH (you'll need ~0.1 ETH for deployment)

### Step 3: Compile Contracts

```bash
npm run compile
```

### Step 4: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

The script will:
- Connect to Sepolia using your RPC URL
- Deploy all three contracts
- Save deployment addresses to `deployments/` directory
- Display contract addresses

**Expected Output:**
```
Network: sepolia
Chain ID: 11155111
Deploying with account: 0x...
Account balance: 0.5 ETH

=== Deploying ConsentManagement ===
✓ ConsentManagement deployed to: 0x...

=== Deploying AuditTrail ===
✓ AuditTrail deployed to: 0x...

=== Deploying DataIntegrity ===
✓ DataIntegrity deployed to: 0x...
```

### Step 5: Verify Contracts on Etherscan (Optional)

After deployment, verify your contracts on Etherscan:

```bash
# Verify ConsentManagement
npx hardhat verify --network sepolia <CONSENT_MANAGEMENT_ADDRESS> <ADMIN_ADDRESS>

# Verify AuditTrail
npx hardhat verify --network sepolia <AUDIT_TRAIL_ADDRESS> <ADMIN_ADDRESS>

# Verify DataIntegrity
npx hardhat verify --network sepolia <DATA_INTEGRITY_ADDRESS> <ADMIN_ADDRESS>
```

### Step 6: Interact with Contracts

Update contract addresses in `scripts/interact.js` or set environment variables:

```bash
export CONSENT_MANAGEMENT_ADDRESS=0x...
export AUDIT_TRAIL_ADDRESS=0x...
export DATA_INTEGRITY_ADDRESS=0x...
npm run interact:sepolia
```

---

## Contract Interaction

### Using Hardhat Console

Start an interactive console:

```bash
# Local network
npx hardhat console --network localhost

# Sepolia
npx hardhat console --network sepolia
```

Example interaction:

```javascript
const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
const consent = ConsentManagement.attach("0x..."); // Your contract address

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

### Using Scripts

See `scripts/interact.js` for example interactions.

### Using Frontend/Backend

Contract ABIs are in `artifacts/contracts/` after compilation. Use these with:
- ethers.js
- web3.js
- Hardhat plugins

---

## Deployment Addresses

Deployment addresses are automatically saved to:
```
contracts/deployments/deployment-{network}-{timestamp}.json
```

Example structure:
```json
{
  "network": "sepolia",
  "chainId": "11155111",
  "deployer": "0x...",
  "contracts": {
    "ConsentManagement": "0x...",
    "AuditTrail": "0x...",
    "DataIntegrity": "0x..."
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Troubleshooting

### Local Network Issues

**Problem**: `Error: could not detect network`
- **Solution**: Make sure Hardhat node is running (`npm run node`)

**Problem**: `Error: insufficient funds`
- **Solution**: Restart the node to get fresh accounts with 10,000 ETH

**Problem**: Contracts not found
- **Solution**: Run `npm run compile` first

### Sepolia Deployment Issues

**Problem**: `Error: missing revert data`
- **Solution**: Check your RPC URL is correct and accessible

**Problem**: `Error: insufficient funds for gas`
- **Solution**: Get more Sepolia ETH from a faucet

**Problem**: `Error: nonce too high`
- **Solution**: Wait a few minutes or reset your account nonce

**Problem**: `Error: contract verification failed`
- **Solution**: 
  - Check Etherscan API key is correct
  - Ensure constructor arguments match
  - Wait a few minutes after deployment before verifying

### RPC Connection Issues

**Problem**: Cannot connect to Sepolia
- **Solution**: 
  - Check your RPC URL is correct
  - Try a different RPC provider (Infura, Alchemy, QuickNode)
  - Check your internet connection
  - Some RPC providers have rate limits on free tiers

---

## Quick Reference

### Local Development
```bash
# Terminal 1: Start node
npm run node

# Terminal 2: Deploy
npm run deploy:local

# Terminal 2: Interact
npm run interact:local
```

### Sepolia Testnet
```bash
# 1. Configure .env file
cp .env.example .env
# Edit .env with your values

# 2. Get Sepolia ETH from faucet

# 3. Deploy
npm run deploy:sepolia

# 4. Interact
npm run interact:sepolia
```

### Useful Commands
```bash
npm run compile      # Compile contracts
npm run test         # Run tests
npm run clean        # Clean build artifacts
npm run node         # Start local node
```

---

## RPC Providers Comparison

| Provider | Free Tier | Rate Limits | Setup Difficulty |
|----------|-----------|-------------|------------------|
| Infura   | ✅ Yes    | 100k req/day | Easy |
| Alchemy  | ✅ Yes    | 300M compute units/month | Easy |
| QuickNode| ❌ Paid   | None        | Easy |
| Public   | ✅ Yes    | Very low    | None |

**Recommendation**: Start with Infura or Alchemy for reliable free access.

---

## Security Best Practices

1. ✅ Never commit `.env` file
2. ✅ Use separate accounts for testnet and mainnet
3. ✅ Never share private keys
4. ✅ Use hardware wallets for mainnet
5. ✅ Verify contracts on Etherscan
6. ✅ Test thoroughly on testnet before mainnet

---

## Next Steps

After deployment:

1. **Verify contracts** on Etherscan (Sepolia)
2. **Test interactions** using scripts or console
3. **Integrate with backend** using contract ABIs
4. **Monitor contracts** using Etherscan or block explorers
5. **Upgrade contracts** using UUPS pattern (if needed)

For questions or issues, check the main README or open an issue.

