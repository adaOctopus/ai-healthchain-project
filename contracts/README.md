# Smart Contracts for AI Health Chains

## Overview

This directory contains Solidity smart contracts for the AI Health Chains blockchain assessment. All contracts use the UUPS (Universal Upgradeable Proxy Standard) pattern for upgradeability.

## Contracts

### 1. ConsentManagement.sol

Manages patient consent grants and revocations on the blockchain.

**Features**:
- Role-based access control (Admin, Clinician, Patient)
- Reentrancy protection
- Gas-optimized struct packing
- Event-based logging

**Key Functions**:
- `grantConsent()`: Grant consent with expiration
- `revokeConsent()`: Revoke active consent
- `hasValidConsent()`: Check consent validity
- `getConsent()`: Retrieve consent record

### 2. AuditTrail.sol

Immutable audit logging for all system events.

**Features**:
- Immutable audit logging
- Event-based storage (gas optimization)
- Resource and actor trail tracking

**Key Functions**:
- `logDataAccess()`: Log data access events
- `logConsentChange()`: Log consent changes
- `logAIDiagnostic()`: Log AI diagnostic events
- `getResourceAuditTrail()`: Get trail for resource

### 3. DataIntegrity.sol

Stores Merkle roots and verifies data integrity.

**Features**:
- Merkle root storage
- Root verification
- Record set tracking

**Key Functions**:
- `storeMerkleRoot()`: Store Merkle root on-chain
- `verifyMerkleRoot()`: Verify root exists
- `getRecordSetRoots()`: Get all roots for record set

## Quick Start

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npm run compile
```

3. Start local Hardhat node (in separate terminal):
```bash
npm run node
```

4. Deploy to local network:
```bash
npm run deploy:local
```

5. Interact with contracts:
```bash
npm run interact:local
```

### Sepolia Testnet

1. Configure environment:
```bash
cp .env.example .env
# Edit .env with your RPC URL, private key, and Etherscan API key
```

2. Get Sepolia ETH from a faucet (https://sepoliafaucet.com/)

3. Deploy:
```bash
npm run deploy:sepolia
```

**📖 For detailed instructions, see:**
- [Quick Start Guide](./QUICK_START.md) - Get started in 5 minutes
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Comprehensive deployment instructions

## Security Features

- ✅ ReentrancyGuard on all state-changing functions
- ✅ AccessControl for role-based permissions
- ✅ UUPS upgradeable pattern
- ✅ Input validation
- ✅ Gas optimization (packed structs, events)

## Testing

Comprehensive test suites are provided for each contract:
- `test/ConsentManagement.test.js`
- `test/AuditTrail.test.js`
- `test/DataIntegrity.test.js`

## Deployment

### Available Scripts

- `npm run node` - Start local Hardhat node
- `npm run compile` - Compile contracts
- `npm run test` - Run tests
- `npm run deploy:local` - Deploy to local network
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run interact:local` - Interact with local contracts
- `npm run interact:sepolia` - Interact with Sepolia contracts
- `npm run verify:sepolia` - Verify contracts on Etherscan

### Deployment Scripts

- `scripts/deploy.js` - Deploys all contracts as UUPS upgradeable proxies
- `scripts/interact.js` - Example contract interactions

### Documentation

- [Quick Start Guide](./QUICK_START.md) - Fast setup guide
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Complete deployment instructions

## Dependencies

- `@openzeppelin/contracts-upgradeable`: ^5.0.0
- `@openzeppelin/hardhat-upgrades`: ^3.0.0
- `hardhat`: ^2.19.0

