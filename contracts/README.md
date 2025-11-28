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

## Setup

1. Install dependencies:
```bash
npm install
```

2. Compile contracts:
```bash
npm run compile
```

3. Run tests:
```bash
npm test
```

4. Deploy to local network:
```bash
npm run deploy:local
```

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

See `scripts/deploy.js` for deployment script. The script deploys all contracts as UUPS upgradeable proxies.

## Dependencies

- `@openzeppelin/contracts-upgradeable`: ^5.0.0
- `@openzeppelin/hardhat-upgrades`: ^3.0.0
- `hardhat`: ^2.19.0

