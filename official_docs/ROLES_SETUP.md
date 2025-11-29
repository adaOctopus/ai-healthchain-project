# How to Grant Roles for Contract Interaction

## The Problem

When you try to call `grantConsent`, you get an **"Unauthorized"** error because the contract requires roles:

- **CLINICIAN_ROLE** - Required for the `clinicianId` address
- **PATIENT_ROLE** - Required for the `patientId` address

The contract checks: `hasRole(CLINICIAN_ROLE, clinicianId) || hasRole(PATIENT_ROLE, patientId)`

## Solution: Grant Roles to Your Address

You need to grant yourself a role before you can call `grantConsent`. Only the **ADMIN** can grant roles.

---

## Method 1: Grant Role via Hardhat Console (Recommended)

### Step 1: Get Contract Address

Your deployed contract address:
```
ConsentManagement: 0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363
```

### Step 2: Connect to Sepolia via Hardhat Console

```bash
cd contracts
npx hardhat console --network sepolia
```

### Step 3: Grant Role to Your Address

In the console, run:

```javascript
// Load contract
const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
const consent = ConsentManagement.attach("0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363");

// Get your address (the deployer/admin)
const [signer] = await ethers.getSigners();
console.log("Your address:", signer.address);

// Get role constants
const CLINICIAN_ROLE = await consent.CLINICIAN_ROLE();
const PATIENT_ROLE = await consent.PATIENT_ROLE();

// Grant CLINICIAN_ROLE to your address
const tx1 = await consent.grantRole(CLINICIAN_ROLE, signer.address);
await tx1.wait();
console.log("✓ CLINICIAN_ROLE granted!");

// Grant PATIENT_ROLE to your address (optional, if you want to test as patient)
const tx2 = await consent.grantRole(PATIENT_ROLE, signer.address);
await tx2.wait();
console.log("✓ PATIENT_ROLE granted!");

// Verify roles
const hasClinician = await consent.hasRole(CLINICIAN_ROLE, signer.address);
const hasPatient = await consent.hasRole(PATIENT_ROLE, signer.address);
console.log("Has CLINICIAN_ROLE:", hasClinician);
console.log("Has PATIENT_ROLE:", hasPatient);
```

### Step 4: Grant Role to Your MetaMask Address

If you want to use your MetaMask address:

```javascript
// Replace with your MetaMask address
const metamaskAddress = "0x91BcE66b1fA371F1dbFC3DB1e0257BAFfD1292a8";

// Grant CLINICIAN_ROLE to MetaMask address
const tx = await consent.grantRole(CLINICIAN_ROLE, metamaskAddress);
await tx.wait();
console.log("✓ Role granted to MetaMask address!");
```

---

## Method 2: Create a Script to Grant Roles

Create `contracts/scripts/grantRoles.js`:

```javascript
const hre = require("hardhat");

async function main() {
  const ConsentManagement = await hre.ethers.getContractFactory("ConsentManagement");
  const consent = ConsentManagement.attach("0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Granting roles to:", signer.address);
  
  const CLINICIAN_ROLE = await consent.CLINICIAN_ROLE();
  const PATIENT_ROLE = await consent.PATIENT_ROLE();
  
  // Grant CLINICIAN_ROLE
  const tx1 = await consent.grantRole(CLINICIAN_ROLE, signer.address);
  await tx1.wait();
  console.log("✓ CLINICIAN_ROLE granted");
  
  // Grant PATIENT_ROLE
  const tx2 = await consent.grantRole(PATIENT_ROLE, signer.address);
  await tx2.wait();
  console.log("✓ PATIENT_ROLE granted");
  
  // Verify
  const hasClinician = await consent.hasRole(CLINICIAN_ROLE, signer.address);
  const hasPatient = await consent.hasRole(PATIENT_ROLE, signer.address);
  console.log("\nRoles verified:");
  console.log("  CLINICIAN_ROLE:", hasClinician);
  console.log("  PATIENT_ROLE:", hasPatient);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run it:
```bash
cd contracts
npx hardhat run scripts/grantRoles.js --network sepolia
```

---

## Method 3: Grant Role from Frontend (Advanced)

You can add a function to grant roles from the frontend, but **only if you're the admin**:

```javascript
// In your frontend component
const grantRole = async () => {
  const CLINICIAN_ROLE = await contracts.consent.CLINICIAN_ROLE();
  const tx = await contracts.consent.grantRole(CLINICIAN_ROLE, account);
  await tx.wait();
  console.log("Role granted!");
};
```

**⚠️ Warning**: Only admins can grant roles. Make sure your address is the admin.

---

## Quick Fix: Grant Role to Your MetaMask Address

**Fastest way:**

1. Open Hardhat console on Sepolia:
   ```bash
   cd contracts
   npx hardhat console --network sepolia
   ```

2. Run this (replace with your MetaMask address):
   ```javascript
   const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
   const consent = ConsentManagement.attach("0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363");
   const CLINICIAN_ROLE = await consent.CLINICIAN_ROLE();
   const tx = await consent.grantRole(CLINICIAN_ROLE, "0x91BcE66b1fA371F1dbFC3DB1e0257BAFfD1292a8");
   await tx.wait();
   console.log("✓ Done!");
   ```

3. Now try your frontend transaction again - it should work!

---

## Check Who is Admin

To check who the admin is:

```javascript
const DEFAULT_ADMIN_ROLE = await consent.DEFAULT_ADMIN_ROLE();
const adminAddress = await consent.getRoleMember(DEFAULT_ADMIN_ROLE, 0);
console.log("Admin address:", adminAddress);
```

---

## Summary

**The Issue:**
- Contract requires `CLINICIAN_ROLE` or `PATIENT_ROLE` to call `grantConsent`
- Your address doesn't have these roles yet

**The Fix:**
1. Connect to Sepolia via Hardhat console
2. Grant `CLINICIAN_ROLE` to your MetaMask address (or the addresses you're using)
3. Try the transaction again

**After granting roles, your frontend transactions will work!** ✅

