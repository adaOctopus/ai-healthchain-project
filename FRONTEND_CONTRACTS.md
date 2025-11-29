# Frontend Contract Interaction Guide

## ✅ What's Set Up

1. **ethers.js installed** in frontend
2. **Contract addresses** in `client/src/config/contracts.js`
3. **React hook** `useContracts` for easy contract access
4. **Component** `ContractInteraction` ready to use
5. **Integrated** into App.jsx

## How It Works

### Option 1: Use the Component (Easiest)

The `ContractInteraction` component is already added to the Consent Management page.

1. **Start everything:**
```bash
# Terminal 1: Hardhat node
cd contracts && npm run node

# Terminal 2: Backend
cd server && npm start

# Terminal 3: Frontend
cd client && npm run dev
```

2. **Open frontend**: `http://localhost:5173`

3. **Go to**: Consent Management page

4. **Click**: "Connect Wallet" button

5. **Submit transactions** directly from the UI!

### Option 2: Use the Hook in Your Components

```javascript
import { useContracts } from './hooks/useContracts';
import { CONSENT_TYPES } from './config/contracts';

function MyComponent() {
  const { contracts, isConnected, account, connectWallet } = useContracts();
  const [txHash, setTxHash] = useState(null);

  const handleGrantConsent = async () => {
    if (!contracts.consent) {
      await connectWallet();
      return;
    }

    try {
      const tx = await contracts.consent.grantConsent(
        '0xPatientAddress',
        '0xClinicianAddress',
        CONSENT_TYPES['Data Access'],
        0, // No expiration
        1  // Purpose
      );
      
      await tx.wait();
      setTxHash(tx.hash);
      console.log('Transaction confirmed!', tx.hash);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <div>
      {!isConnected && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      
      {isConnected && (
        <div>
          <p>Connected: {account}</p>
          <button onClick={handleGrantConsent}>Grant Consent</button>
          {txHash && <p>TX: {txHash}</p>}
        </div>
      )}
    </div>
  );
}
```

## Available Contract Methods

### Consent Contract

```javascript
const { contracts } = useContracts();

// Grant consent
const tx = await contracts.consent.grantConsent(
  patientAddress,    // address
  clinicianAddress,  // address
  consentType,       // 0-3 (use CONSENT_TYPES)
  expiresAt,         // uint64 (timestamp or 0)
  purpose            // uint32
);
await tx.wait();

// Revoke consent
const tx = await contracts.consent.revokeConsent(consentId);
await tx.wait();

// Check consent
const hasConsent = await contracts.consent.hasValidConsent(
  patientAddress,
  clinicianAddress,
  consentType
);

// Get consent record
const consent = await contracts.consent.getConsent(consentId);
```

### Audit Contract

```javascript
// Log data access
const tx = await contracts.audit.logDataAccess(
  actorAddress,
  resourceId,  // bytes32 (use ethers.id('resource-1'))
  true,        // granted
  'reason'
);
await tx.wait();

// Log consent change
const tx = await contracts.audit.logConsentChange(
  actorAddress,
  consentId,   // bytes32
  'granted'    // action
);
await tx.wait();
```

### Data Integrity Contract

```javascript
// Store Merkle root
const tx = await contracts.integrity.storeMerkleRoot(
  root,         // bytes32
  recordSetId,  // bytes32
  recordCount   // uint32
);
await tx.wait();

// Verify root
const [exists, record] = await contracts.integrity.verifyMerkleRoot(root);
```

## Connection Methods

### Method 1: MetaMask (Production)

```javascript
const { connectWallet } = useContracts();

// This will prompt user to connect MetaMask
await connectWallet();
```

### Method 2: Local Hardhat Account (Development)

The hook automatically falls back to a local Hardhat account if MetaMask isn't available.

## Example: Full Consent Flow

```javascript
import { useContracts } from './hooks/useContracts';
import { CONSENT_TYPES } from './config/contracts';
import { useState } from 'react';

function ConsentForm() {
  const { contracts, isConnected, connectWallet } = useContracts();
  const [patient, setPatient] = useState('');
  const [clinician, setClinician] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setLoading(true);
    try {
      const tx = await contracts.consent.grantConsent(
        patient,
        clinician,
        CONSENT_TYPES['Data Access'],
        0,
        1
      );
      
      const receipt = await tx.wait();
      setTxHash(tx.hash);
      alert('Consent granted! TX: ' + tx.hash);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={patient}
        onChange={(e) => setPatient(e.target.value)}
        placeholder="Patient address (0x...)"
      />
      <input
        value={clinician}
        onChange={(e) => setClinician(e.target.value)}
        placeholder="Clinician address (0x...)"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Grant Consent'}
      </button>
      {txHash && <p>Transaction: {txHash}</p>}
    </form>
  );
}
```

## Listening to Events

```javascript
useEffect(() => {
  if (!contracts.consent) return;

  // Listen for ConsentGranted events
  const filter = contracts.consent.filters.ConsentGranted();
  
  contracts.consent.on(filter, (consentId, patientId, clinicianId, consentType, grantedAt, expiresAt) => {
    console.log('New consent granted!', {
      consentId,
      patientId,
      clinicianId,
      consentType,
      grantedAt,
      expiresAt
    });
  });

  return () => {
    contracts.consent.removeAllListeners();
  };
}, [contracts.consent]);
```

## Error Handling

```javascript
try {
  const tx = await contracts.consent.grantConsent(...);
  await tx.wait();
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    alert('User rejected transaction');
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    alert('Not enough ETH for gas');
  } else {
    alert('Error: ' + error.message);
  }
}
```

## Quick Reference

**Files:**
- `client/src/config/contracts.js` - Contract addresses
- `client/src/hooks/useContracts.js` - React hook
- `client/src/components/ContractInteraction.jsx` - Ready-to-use component

**Usage:**
```javascript
const { contracts, isConnected, connectWallet } = useContracts();
const tx = await contracts.consent.grantConsent(...);
```

**That's it!** You can now interact with contracts directly from your React frontend. 🎉

