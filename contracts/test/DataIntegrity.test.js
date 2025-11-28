const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("DataIntegrity", function () {
  let dataIntegrity;
  let admin, verifier;

  beforeEach(async function () {
    [admin, verifier] = await ethers.getSigners();

    const DataIntegrity = await ethers.getContractFactory("DataIntegrity");
    dataIntegrity = await upgrades.deployProxy(
      DataIntegrity,
      [admin.address],
      { initializer: "initialize" }
    );
    await dataIntegrity.waitForDeployment();

    // Grant verifier role
    await dataIntegrity.grantRole(
      await dataIntegrity.VERIFIER_ROLE(),
      verifier.address
    );
  });

  describe("Deployment", function () {
    it("Should deploy with correct admin", async function () {
      expect(await dataIntegrity.hasRole(
        await dataIntegrity.DEFAULT_ADMIN_ROLE(),
        admin.address
      )).to.be.true;
    });
  });

  describe("Store Merkle Root", function () {
    it("Should store Merkle root successfully", async function () {
      const root = ethers.keccak256(ethers.toUtf8Bytes("merkle-root-1"));
      const recordSetId = ethers.keccak256(ethers.toUtf8Bytes("record-set-1"));
      const recordCount = 100;

      const tx = await dataIntegrity
        .connect(verifier)
        .storeMerkleRoot(root, recordSetId, recordCount);

      await expect(tx)
        .to.emit(dataIntegrity, "MerkleRootStored")
        .withArgs(
          root,
          recordSetId,
          verifier.address,
          recordCount,
          (timestamp) => timestamp > 0
        );
    });

    it("Should reject duplicate root", async function () {
      const root = ethers.keccak256(ethers.toUtf8Bytes("merkle-root-1"));
      const recordSetId = ethers.keccak256(ethers.toUtf8Bytes("record-set-1"));
      const recordCount = 100;

      await dataIntegrity
        .connect(verifier)
        .storeMerkleRoot(root, recordSetId, recordCount);

      await expect(
        dataIntegrity
          .connect(verifier)
          .storeMerkleRoot(root, recordSetId, recordCount)
      ).to.be.revertedWith("Root already stored");
    });

    it("Should reject invalid inputs", async function () {
      const recordSetId = ethers.keccak256(ethers.toUtf8Bytes("record-set-1"));

      await expect(
        dataIntegrity
          .connect(verifier)
          .storeMerkleRoot(ethers.ZeroHash, recordSetId, 100)
      ).to.be.revertedWith("Invalid root");

      const root = ethers.keccak256(ethers.toUtf8Bytes("merkle-root-1"));
      await expect(
        dataIntegrity
          .connect(verifier)
          .storeMerkleRoot(root, recordSetId, 0)
      ).to.be.revertedWith("Invalid record count");
    });
  });

  describe("Verify Merkle Root", function () {
    it("Should verify existing root", async function () {
      const root = ethers.keccak256(ethers.toUtf8Bytes("merkle-root-1"));
      const recordSetId = ethers.keccak256(ethers.toUtf8Bytes("record-set-1"));
      const recordCount = 100;

      await dataIntegrity
        .connect(verifier)
        .storeMerkleRoot(root, recordSetId, recordCount);

      const [exists, record] = await dataIntegrity.verifyMerkleRoot(root);
      expect(exists).to.be.true;
      expect(record.root).to.equal(root);
    });

    it("Should return false for non-existent root", async function () {
      const root = ethers.keccak256(ethers.toUtf8Bytes("non-existent"));
      const [exists] = await dataIntegrity.verifyMerkleRoot(root);
      expect(exists).to.be.false;
    });
  });

  describe("Get Record Set Roots", function () {
    it("Should retrieve all roots for a record set", async function () {
      const recordSetId = ethers.keccak256(ethers.toUtf8Bytes("record-set-1"));
      const root1 = ethers.keccak256(ethers.toUtf8Bytes("merkle-root-1"));
      const root2 = ethers.keccak256(ethers.toUtf8Bytes("merkle-root-2"));

      await dataIntegrity
        .connect(verifier)
        .storeMerkleRoot(root1, recordSetId, 100);
      await dataIntegrity
        .connect(verifier)
        .storeMerkleRoot(root2, recordSetId, 200);

      const roots = await dataIntegrity.getRecordSetRoots(recordSetId);
      expect(roots.length).to.equal(2);
      expect(roots).to.include(root1);
      expect(roots).to.include(root2);
    });
  });
});

