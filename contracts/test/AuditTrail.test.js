const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("AuditTrail", function () {
  let auditTrail;
  let admin, actor;
  const AuditType = {
    DataAccess: 0,
    ConsentChange: 1,
    AIDiagnostic: 2,
    SystemEvent: 3,
  };

  beforeEach(async function () {
    [admin, actor] = await ethers.getSigners();

    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    auditTrail = await upgrades.deployProxy(
      AuditTrail,
      [admin.address],
      { initializer: "initialize" }
    );
    await auditTrail.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct admin", async function () {
      expect(await auditTrail.hasRole(
        await auditTrail.DEFAULT_ADMIN_ROLE(),
        admin.address
      )).to.be.true;
    });
  });

  describe("Log Data Access", function () {
    it("Should log data access successfully", async function () {
      const resourceId = ethers.keccak256(ethers.toUtf8Bytes("resource-1"));
      const reason = "Valid consent exists";

      const tx = await auditTrail
        .connect(actor)
        .logDataAccess(actor.address, resourceId, true, reason);

      await expect(tx)
        .to.emit(auditTrail, "AuditLogged")
        .withArgs(
          (entryId) => entryId !== ethers.ZeroHash,
          AuditType.DataAccess,
          actor.address,
          resourceId,
          (timestamp) => timestamp > 0,
          true,
          reason
        );
    });

    it("Should reject invalid actor address", async function () {
      const resourceId = ethers.keccak256(ethers.toUtf8Bytes("resource-1"));
      await expect(
        auditTrail
          .connect(actor)
          .logDataAccess(ethers.ZeroAddress, resourceId, true, "reason")
      ).to.be.revertedWith("Invalid actor address");
    });
  });

  describe("Log Consent Change", function () {
    it("Should log consent change successfully", async function () {
      const consentId = ethers.keccak256(ethers.toUtf8Bytes("consent-1"));
      const action = "granted";

      const tx = await auditTrail
        .connect(actor)
        .logConsentChange(actor.address, consentId, action);

      await expect(tx)
        .to.emit(auditTrail, "AuditLogged")
        .withArgs(
          (entryId) => entryId !== ethers.ZeroHash,
          AuditType.ConsentChange,
          actor.address,
          consentId,
          (timestamp) => timestamp > 0,
          true,
          action
        );
    });
  });

  describe("Log AI Diagnostic", function () {
    it("Should log AI diagnostic successfully", async function () {
      const modelId = ethers.keccak256(ethers.toUtf8Bytes("model-1"));
      const recordId = ethers.keccak256(ethers.toUtf8Bytes("record-1"));
      const confidence = 8500; // 85.00%

      const tx = await auditTrail
        .connect(actor)
        .logAIDiagnostic(modelId, recordId, confidence);

      await expect(tx)
        .to.emit(auditTrail, "AuditLogged")
        .withArgs(
          (entryId) => entryId !== ethers.ZeroHash,
          AuditType.AIDiagnostic,
          ethers.ZeroAddress,
          recordId,
          (timestamp) => timestamp > 0,
          true,
          (reason) => reason.length > 0
        );
    });

    it("Should reject invalid confidence score", async function () {
      const modelId = ethers.keccak256(ethers.toUtf8Bytes("model-1"));
      const recordId = ethers.keccak256(ethers.toUtf8Bytes("record-1"));

      await expect(
        auditTrail
          .connect(actor)
          .logAIDiagnostic(modelId, recordId, 10001) // > 10000
      ).to.be.revertedWith("Invalid confidence score");
    });
  });

  describe("Get Audit Trail", function () {
    it("Should retrieve audit trail for resource", async function () {
      const resourceId = ethers.keccak256(ethers.toUtf8Bytes("resource-1"));

      await auditTrail
        .connect(actor)
        .logDataAccess(actor.address, resourceId, true, "reason");

      const trail = await auditTrail.getResourceAuditTrail(resourceId);
      expect(trail.length).to.equal(1);
    });

    it("Should retrieve audit trail for actor", async function () {
      const resourceId = ethers.keccak256(ethers.toUtf8Bytes("resource-1"));

      await auditTrail
        .connect(actor)
        .logDataAccess(actor.address, resourceId, true, "reason");

      const trail = await auditTrail.getActorAuditTrail(actor.address);
      expect(trail.length).to.equal(1);
    });
  });
});

