const hre = require("hardhat");

/**
 * Grant CLINICIAN_ROLE and PATIENT_ROLE to addresses
 * Usage: npx hardhat run scripts/grantRoles.js --network sepolia
 */
async function main() {
  const ConsentManagement = await hre.ethers.getContractFactory("ConsentManagement");
  const consent = ConsentManagement.attach("0x9cFC59905B4b5Bb34ceb447a7dB5c0AB5621B363");
  
  const [signer] = await hre.ethers.getSigners();
  console.log("Admin address:", signer.address);
  
  // Addresses to grant roles to (add your MetaMask address here)
  const addressesToGrant = [
    signer.address, // Deployer/admin
    "0x91BcE66b1fA371F1dbFC3DB1e0257BAFfD1292a8", // Your MetaMask address
  ];
  
  const CLINICIAN_ROLE = await consent.CLINICIAN_ROLE();
  const PATIENT_ROLE = await consent.PATIENT_ROLE();
  
  console.log("\nGranting roles...");
  
  for (const address of addressesToGrant) {
    try {
      // Check if already has role
      const hasClinician = await consent.hasRole(CLINICIAN_ROLE, address);
      const hasPatient = await consent.hasRole(PATIENT_ROLE, address);
      
      if (!hasClinician) {
        console.log(`Granting CLINICIAN_ROLE to ${address}...`);
        const tx1 = await consent.grantRole(CLINICIAN_ROLE, address);
        await tx1.wait();
        console.log(`✓ CLINICIAN_ROLE granted! Tx: ${tx1.hash}`);
      } else {
        console.log(`✓ ${address} already has CLINICIAN_ROLE`);
      }
      
      if (!hasPatient) {
        console.log(`Granting PATIENT_ROLE to ${address}...`);
        const tx2 = await consent.grantRole(PATIENT_ROLE, address);
        await tx2.wait();
        console.log(`✓ PATIENT_ROLE granted! Tx: ${tx2.hash}`);
      } else {
        console.log(`✓ ${address} already has PATIENT_ROLE`);
      }
    } catch (error) {
      console.error(`Error granting roles to ${address}:`, error.message);
    }
  }
  
  console.log("\n✓ Done! Roles granted.");
  console.log("\nYou can now use these addresses in the frontend to grant consent.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

