const { ethers } = require("hardhat");

/**
 * Interaction script for AI Health Chains smart contracts
 * 
 * This script demonstrates how to interact with deployed contracts.
 * 
 * Usage:
 *   Local: npm run interact:local
 *   Sepolia: npm run interact:sepolia
 * 
 * Note: Update contract addresses in this script after deployment
 */

// Contract addresses - Update these after deployment
const CONTRACT_ADDRESSES = {
  ConsentManagement: process.env.CONSENT_MANAGEMENT_ADDRESS || "",
  AuditTrail: process.env.AUDIT_TRAIL_ADDRESS || "",
  DataIntegrity: process.env.DATA_INTEGRITY_ADDRESS || "",
};

async function main() {
  const network = await ethers.provider.getNetwork();
  const [signer] = await ethers.getSigners();

  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   AI Health Chains - Contract Interaction                 ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Interacting with account:", signer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH\n");

  // Example 1: Interact with ConsentManagement
  if (CONTRACT_ADDRESSES.ConsentManagement) {
    console.log("=== ConsentManagement Interaction ===\n");
    
    const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
    const consentContract = ConsentManagement.attach(CONTRACT_ADDRESSES.ConsentManagement);

    // Get contract version
    const version = await consentContract.version();
    console.log("Contract version:", version);

    // Check if account has admin role
    const ADMIN_ROLE = await consentContract.ADMIN_ROLE();
    const isAdmin = await consentContract.hasRole(ADMIN_ROLE, signer.address);
    console.log("Is admin:", isAdmin);

    // Example: Grant a role (if admin)
    if (isAdmin) {
      console.log("\nGranting CLINICIAN_ROLE to signer...");
      const CLINICIAN_ROLE = await consentContract.CLINICIAN_ROLE();
      const tx = await consentContract.grantRole(CLINICIAN_ROLE, signer.address);
      await tx.wait();
      console.log("✓ Role granted! Transaction:", tx.hash);
    }

    // Example: Check consent (will return false for new deployment)
    const hasConsent = await consentContract.hasValidConsent(
      signer.address,
      signer.address,
      0 // ConsentType.DataAccess
    );
    console.log("Has valid consent:", hasConsent);
  } else {
    console.log("⚠️  ConsentManagement address not set. Update CONTRACT_ADDRESSES in this script.");
  }

  // Example 2: Interact with AuditTrail
  if (CONTRACT_ADDRESSES.AuditTrail) {
    console.log("\n=== AuditTrail Interaction ===\n");
    
    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    const auditContract = AuditTrail.attach(CONTRACT_ADDRESSES.AuditTrail);

    const version = await auditContract.version();
    console.log("Contract version:", version);

    // Example: Log a data access event
    const resourceId = ethers.id("test-resource-1");
    console.log("Logging data access for resource:", resourceId);
    
    const tx = await auditContract.logDataAccess(
      signer.address,
      resourceId,
      true,
      "Test data access"
    );
    await tx.wait();
    console.log("✓ Data access logged! Transaction:", tx.hash);

    // Get audit trail for resource
    const trail = await auditContract.getResourceAuditTrail(resourceId);
    console.log("Audit trail entries:", trail.length);
  } else {
    console.log("⚠️  AuditTrail address not set. Update CONTRACT_ADDRESSES in this script.");
  }

  // Example 3: Interact with DataIntegrity
  if (CONTRACT_ADDRESSES.DataIntegrity) {
    console.log("\n=== DataIntegrity Interaction ===\n");
    
    const DataIntegrity = await ethers.getContractFactory("DataIntegrity");
    const integrityContract = DataIntegrity.attach(CONTRACT_ADDRESSES.DataIntegrity);

    const version = await integrityContract.version();
    console.log("Contract version:", version);

    // Get total stored roots
    const totalRoots = await integrityContract.getTotalRoots();
    console.log("Total Merkle roots stored:", totalRoots.toString());
  } else {
    console.log("⚠️  DataIntegrity address not set. Update CONTRACT_ADDRESSES in this script.");
  }

  console.log("\n✓ Interaction completed!");
  console.log("\n💡 Tip: Update CONTRACT_ADDRESSES in this script with your deployed addresses.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Interaction failed:");
    console.error(error);
    process.exit(1);
  });

