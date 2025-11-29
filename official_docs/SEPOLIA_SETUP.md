# Using Sepolia Network - Frontend & Backend

## The Problem

- **Backend**: Configured for Sepolia (or can be)
- **Frontend**: Hardcoded to Hardhat (localhost)
- **Contracts**: Deployed on Sepolia

**Solution**: Configure both to use Sepolia network.

---

## Quick Fix (Already Done!)

✅ **Frontend config updated** - Now uses environment variable  
✅ **Backend config** - Already supports environment variables  
✅ **Network switching** - Automatically switches MetaMask to Sepolia

### Step 1: Set Frontend Environment Variable

Create `client/.env` or `client/.env.local`:

```bash
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

### Step 2: Set Backend Environment Variable

Create `server/.env`:

```bash
CONTRACT_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
CONTRACT_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

### Step 3: Restart Both

```bash
# Frontend
cd client && npm run dev

# Backend  
cd server && npm start
```

**That's it!** Both will now use Sepolia automatically.

---

## Detailed Setup

### Option A: Use Environment Variables (Recommended)

#### Frontend (`client/.env` or `client/.env.local`):

```bash
VITE_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

Then update `client/src/config/contracts.js`:

```javascript
export const RPC_URL = import.meta.env.VITE_SEPOLIA_RPC_URL || 'http://localhost:8545';
export const NETWORK_ID = 11155111; // Sepolia
```

#### Backend (`server/.env`):

```bash
CONTRACT_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
CONTRACT_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

### Option B: Hardcode Sepolia (Quick Test)

#### Frontend (`client/src/config/contracts.js`):

```javascript
// RPC URL - Sepolia Network
export const RPC_URL = 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID';
export const NETWORK_ID = 11155111;
```

#### Backend (`server/src/config/contracts.js`):

```javascript
RPC_URL: process.env.CONTRACT_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
```

---

## How It Works

### Frontend Flow:

1. **User clicks "Connect Wallet"**
2. **MetaMask opens** → User connects
3. **MetaMask network** → If Sepolia, works. If not, prompt to switch.
4. **Contracts use MetaMask's network** → Automatically correct

### Backend Flow:

1. **Backend starts** → Reads `CONTRACT_RPC_URL` from `.env`
2. **Connects to Sepolia** → Uses your private key
3. **API calls** → Submit transactions to Sepolia

---

## MetaMask Network Switching

Add this to your frontend component to prompt network switch:

```javascript
const switchToSepolia = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
    });
  } catch (switchError) {
    // If network doesn't exist, add it
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0xaa36a7',
          chainName: 'Sepolia',
          rpcUrls: ['https://sepolia.infura.io/v3/YOUR_PROJECT_ID'],
          nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
          }
        }],
      });
    }
  }
};
```

---

## Free Sepolia RPC Providers

1. **Infura**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
2. **Alchemy**: `https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY`
3. **Public RPC**: `https://rpc.sepolia.org` (rate limited)

---

## Testing

### Frontend:
1. Start frontend: `cd client && npm run dev`
2. Open browser → Connect MetaMask
3. Make sure MetaMask is on **Sepolia network**
4. Submit transaction → Check on [Sepolia Etherscan](https://sepolia.etherscan.io)

### Backend:
1. Set `.env` with Sepolia RPC
2. Start backend: `cd server && npm start`
3. Call API: `POST /api/contracts/consent/grant`
4. Check transaction on Sepolia Etherscan

---

## Summary

**The Problem:**
- Backend: Can use Sepolia (via env)
- Frontend: Was hardcoded to Hardhat
- Contracts: Deployed on Sepolia

**The Solution:**
✅ Frontend now reads `VITE_SEPOLIA_RPC_URL` from env  
✅ Backend already reads `CONTRACT_RPC_URL` from env  
✅ MetaMask automatically switches to Sepolia when connecting

**To Use Sepolia:**
1. Set `VITE_SEPOLIA_RPC_URL` in `client/.env`
2. Set `CONTRACT_RPC_URL` in `server/.env`
3. Restart both frontend and backend

**Both now use same Sepolia contracts** ✅

