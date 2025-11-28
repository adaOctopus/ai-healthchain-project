const { ethers, upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Deployment script for AI Health Chains smart contracts
 * 
 * Deploys:
 * 1. ConsentManagement (UUPS upgradeable)
 * 2. AuditTrail (UUPS upgradeable)
 * 3. DataIntegrity (UUPS upgradeable)
 * 
 * All contracts use UUPS proxy pattern for upgradeability
 * 
 * Usage:
 *   Local: npm run deploy:local (after starting node with npm run node)
 *   Sepolia: npm run deploy:sepolia (requires .env configuration)
 */

async function main() {
  const network = await ethers.provider.getNetwork();
  const [deployer] = await ethers.getSigners();
  
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║   AI Health Chains - Smart Contract Deployment          ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
  
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  
  if (network.chainId !== 1337n) {
    // Check if balance is sufficient for deployment (estimate ~0.1 ETH)
    if (balance < ethers.parseEther("0.1")) {
      console.warn("\n⚠️  WARNING: Low balance! Deployment may fail.");
      console.warn("   Get Sepolia ETH from: https://sepoliafaucet.com/");
    }
  }

  // Deploy ConsentManagement
  console.log("\n=== Deploying ConsentManagement ===");
  const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
  console.log("Deploying proxy...");
  const consentManagement = await upgrades.deployProxy(
    ConsentManagement,
    [deployer.address], // admin
    { initializer: "initialize" }
  );
  await consentManagement.waitForDeployment();
  const consentAddress = await consentManagement.getAddress();
  console.log("✓ ConsentManagement deployed to:", consentAddress);

  // Deploy AuditTrail
  console.log("\n=== Deploying AuditTrail ===");
  const AuditTrail = await ethers.getContractFactory("AuditTrail");
  console.log("Deploying proxy...");
  const auditTrail = await upgrades.deployProxy(
    AuditTrail,
    [deployer.address], // admin
    { initializer: "initialize" }
  );
  await auditTrail.waitForDeployment();
  const auditAddress = await auditTrail.getAddress();
  console.log("✓ AuditTrail deployed to:", auditAddress);

  // Deploy DataIntegrity
  console.log("\n=== Deploying DataIntegrity ===");
  const DataIntegrity = await ethers.getContractFactory("DataIntegrity");
  console.log("Deploying proxy...");
  const dataIntegrity = await upgrades.deployProxy(
    DataIntegrity,
    [deployer.address], // admin
    { initializer: "initialize" }
  );
  await dataIntegrity.waitForDeployment();
  const integrityAddress = await dataIntegrity.getAddress();
  console.log("✓ DataIntegrity deployed to:", integrityAddress);

  // Print deployment summary
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║              Deployment Summary                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");
  console.log("ConsentManagement:", consentAddress);
  console.log("AuditTrail:       ", auditAddress);
  console.log("DataIntegrity:    ", integrityAddress);
  console.log("\n✓ Deployment completed successfully!");

  // Save deployment addresses to file
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      ConsentManagement: consentAddress,
      AuditTrail: auditAddress,
      DataIntegrity: integrityAddress,
    },
    timestamp: new Date().toISOString(),
  };

  // Save to deployments directory
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `deployment-${network.name}-${Date.now()}.json`
  );
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to:", deploymentFile);

  // Print interaction instructions
  if (network.name === "localhost" || network.name === "hardhat") {
    console.log("\n💡 To interact with contracts, use:");
    console.log("   npm run interact:local");
  } else {
    console.log("\n💡 To verify contracts on Etherscan:");
    console.log("   npm run verify:sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });

