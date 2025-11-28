# Environment Variables Setup for Sepolia

## Quick Setup

1. Copy the example file:
```bash
cd contracts
cp .env.example .env
```

2. Edit `.env` with your values (see below)

## .env File Structure

Here's exactly how your `.env` file should look:

```env
# ============================================
# SEPOLIA TESTNET CONFIGURATION
# ============================================

# RPC URL - REQUIRED
# Choose ONE option below:

# Option 1: Infura (Recommended - Free)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Option 2: Alchemy (Alternative - Free)
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY

# Option 3: Public RPC (Less reliable, but free)
# SEPOLIA_RPC_URL=https://rpc.sepolia.org


# ============================================
# DEPLOYMENT ACCOUNT
# ============================================

# Private Key - REQUIRED
# Your wallet's private key (testnet account only!)
# Format: 0x followed by 64 hex characters
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef


# ============================================
# ETHERSCAN VERIFICATION (Optional)
# ============================================

# Etherscan API Key - OPTIONAL
# Only needed if you want to verify contracts on Etherscan
# Get it from: https://etherscan.io/apis
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY_HERE


# ============================================
# OPTIONAL CONFIGURATION
# ============================================

# Alchemy API Key - OPTIONAL
# Only needed for forking mainnet/testnet
# ALCHEMY_API_KEY=your_alchemy_api_key_here

# Local Private Key - OPTIONAL
# Only needed if you want to use a specific account on local network
# LOCAL_PRIVATE_KEY=your_local_private_key_here
```

## Step-by-Step Setup

### Step 1: Get RPC URL

**Option A: Infura (Recommended)**
1. Go to https://infura.io/
2. Sign up (free)
3. Create a new project
4. Select "Sepolia" network
5. Copy the HTTPS URL
6. It looks like: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

**Option B: Alchemy**
1. Go to https://www.alchemy.com/
2. Sign up (free)
3. Create a new app
4. Select "Ethereum" and "Sepolia" network
5. Copy the HTTP URL
6. It looks like: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`

**Option C: Public RPC (No signup needed)**
- Use: `https://rpc.sepolia.org`
- ⚠️ Less reliable, may have rate limits

### Step 2: Get Your Private Key

**From MetaMask:**
1. Open MetaMask
2. Click the three dots menu
3. Go to "Account details"
4. Click "Show private key"
5. Enter your password
6. Copy the private key (starts with `0x`)

**⚠️ IMPORTANT: Private Key Format**
- ✅ Must start with `0x` (hex format)
- ✅ Must be 66 characters total (0x + 64 hex chars)
- ✅ Example: `0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef`

**If your key starts with something else (like `034`, `5K`, `L1`):**
- ❌ This is NOT an Ethereum private key
- ❌ You might be looking at a public key or WIF format
- ✅ Go back to your wallet and look for "Export Private Key" or "Show Private Key"
- ✅ The correct key will start with `0x`

**⚠️ IMPORTANT SECURITY NOTES:**
- ✅ Only use a testnet account (no real funds)
- ✅ Never share your private key
- ✅ Never commit `.env` to git
- ✅ Create a dedicated testnet account if possible

### Step 3: Get Etherscan API Key (Optional)

1. Go to https://etherscan.io/
2. Sign up (free)
3. Go to "API-KEYs" section
4. Click "Add" to create new API key
5. Copy the API key

### Step 4: Create .env File

```bash
cd contracts
cp .env.example .env
```

Then edit `.env` and replace:
- `YOUR_INFURA_PROJECT_ID` → Your actual Infura project ID
- `your_private_key_here` → Your actual private key (with `0x` prefix)
- `your_etherscan_api_key_here` → Your Etherscan API key (optional)

## Example .env File

Here's a complete example (with fake values):

```env
# RPC URL from Infura
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/abc123def456ghi789jkl012mno345pq

# Private key (testnet account only!)
PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Etherscan API key
ETHERSCAN_API_KEY=ABCD1234EFGH5678IJKL9012MNOP3456
```

## Verification

After setting up your `.env` file, verify it works:

```bash
# Test connection (this will show your account balance)
npx hardhat run scripts/deploy.js --network sepolia --dry-run
```

Or just try deploying:

```bash
npm run deploy:sepolia
```

If you see your account address and balance, you're good to go! ✅

## Common Issues

### Issue: "Missing network config"
**Solution**: Make sure `SEPOLIA_RPC_URL` is set correctly in `.env`

### Issue: "Invalid private key"
**Solution**: 
- Ensure private key starts with `0x` (not `034`, `5K`, `L1`, etc.)
- If your key doesn't start with `0x`, you're looking at the wrong thing
- Go back to your wallet and find "Export Private Key" or "Show Private Key"
- Check for extra spaces or newlines
- Verify it's exactly 66 characters (0x + 64 hex chars)
- See `PRIVATE_KEY_HELP.md` for more details

### Issue: "Insufficient funds"
**Solution**: Get Sepolia ETH from a faucet:
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

### Issue: "Cannot connect to network"
**Solution**: 
- Check your RPC URL is correct
- Try a different RPC provider
- Check your internet connection

## Security Checklist

Before deploying:

- [ ] `.env` file is in `.gitignore` ✅ (already configured)
- [ ] Using testnet account only
- [ ] Private key has no real funds
- [ ] Never shared private key
- [ ] RPC URL is correct
- [ ] Have Sepolia ETH for gas

## Quick Reference

**Minimum Required for Sepolia:**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x...
```

**Full Setup (Recommended):**
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
```

That's it! Once your `.env` is configured, you can deploy with:
```bash
npm run deploy:sepolia
```

