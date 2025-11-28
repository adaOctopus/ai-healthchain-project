const { ethers, upgrades } = require("hardhat");

/**
 * Deployment script for AI Health Chains smart contracts
 * 
 * Deploys:
 * 1. ConsentManagement (UUPS upgradeable)
 * 2. AuditTrail (UUPS upgradeable)
 * 3. DataIntegrity (UUPS upgradeable)
 * 
 * All contracts use UUPS proxy pattern for upgradeability
 */

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ConsentManagement
  console.log("\n=== Deploying ConsentManagement ===");
  const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
  const consentManagement = await upgrades.deployProxy(
    ConsentManagement,
    [deployer.address], // admin
    { initializer: "initialize" }
  );
  await consentManagement.waitForDeployment();
  const consentAddress = await consentManagement.getAddress();
  console.log("ConsentManagement deployed to:", consentAddress);

  // Deploy AuditTrail
  console.log("\n=== Deploying AuditTrail ===");
  const AuditTrail = await ethers.getContractFactory("AuditTrail");
  const auditTrail = await upgrades.deployProxy(
    AuditTrail,
    [deployer.address], // admin
    { initializer: "initialize" }
  );
  await auditTrail.waitForDeployment();
  const auditAddress = await auditTrail.getAddress();
  console.log("AuditTrail deployed to:", auditAddress);

  // Deploy DataIntegrity
  console.log("\n=== Deploying DataIntegrity ===");
  const DataIntegrity = await ethers.getContractFactory("DataIntegrity");
  const dataIntegrity = await upgrades.deployProxy(
    DataIntegrity,
    [deployer.address], // admin
    { initializer: "initialize" }
  );
  await dataIntegrity.waitForDeployment();
  const integrityAddress = await dataIntegrity.getAddress();
  console.log("DataIntegrity deployed to:", integrityAddress);

  // Print deployment summary
  console.log("\n=== Deployment Summary ===");
  console.log("ConsentManagement:", consentAddress);
  console.log("AuditTrail:", auditAddress);
  console.log("DataIntegrity:", integrityAddress);
  console.log("\nDeployment completed successfully!");

  // Save deployment addresses (for use in tests/frontend)
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      ConsentManagement: consentAddress,
      AuditTrail: auditAddress,
      DataIntegrity: integrityAddress,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== Deployment Info ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

