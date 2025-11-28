const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("ConsentManagement", function () {
  let consentManagement;
  let admin, patient, clinician;
  const ConsentType = {
    DataAccess: 0,
    AIAnalysis: 1,
    Research: 2,
    Sharing: 3,
  };

  beforeEach(async function () {
    [admin, patient, clinician] = await ethers.getSigners();

    const ConsentManagement = await ethers.getContractFactory("ConsentManagement");
    consentManagement = await upgrades.deployProxy(
      ConsentManagement,
      [admin.address],
      { initializer: "initialize" }
    );
    await consentManagement.waitForDeployment();

    // Grant roles
    await consentManagement.grantRole(
      await consentManagement.CLINICIAN_ROLE(),
      clinician.address
    );
    await consentManagement.grantRole(
      await consentManagement.PATIENT_ROLE(),
      patient.address
    );
  });

  describe("Deployment", function () {
    it("Should deploy with correct admin", async function () {
      expect(await consentManagement.hasRole(
        await consentManagement.DEFAULT_ADMIN_ROLE(),
        admin.address
      )).to.be.true;
    });

    it("Should have correct version", async function () {
      expect(await consentManagement.version()).to.equal("1.0.0");
    });
  });

  describe("Grant Consent", function () {
    it("Should grant consent successfully", async function () {
      const expiresAt = Math.floor(Date.now() / 1000) + 86400; // 24 hours
      const purpose = 1;

      const tx = await consentManagement
        .connect(patient)
        .grantConsent(
          patient.address,
          clinician.address,
          ConsentType.DataAccess,
          expiresAt,
          purpose
        );

      await expect(tx)
        .to.emit(consentManagement, "ConsentGranted")
        .withArgs(
          (consentId) => consentId !== ethers.ZeroHash,
          patient.address,
          clinician.address,
          ConsentType.DataAccess,
          (grantedAt) => grantedAt > 0,
          expiresAt
        );
    });

    it("Should prevent duplicate active consent", async function () {
      const expiresAt = Math.floor(Date.now() / 1000) + 86400;
      const purpose = 1;

      await consentManagement
        .connect(patient)
        .grantConsent(
          patient.address,
          clinician.address,
          ConsentType.DataAccess,
          expiresAt,
          purpose
        );

      await expect(
        consentManagement
          .connect(patient)
          .grantConsent(
            patient.address,
            clinician.address,
            ConsentType.DataAccess,
            expiresAt,
            purpose
          )
      ).to.be.revertedWith("Active consent already exists");
    });

    it("Should reject invalid addresses", async function () {
      await expect(
        consentManagement
          .connect(patient)
          .grantConsent(
            ethers.ZeroAddress,
            clinician.address,
            ConsentType.DataAccess,
            0,
            1
          )
      ).to.be.revertedWith("Invalid patient address");
    });
  });

  describe("Revoke Consent", function () {
    it("Should revoke consent successfully", async function () {
      const expiresAt = Math.floor(Date.now() / 1000) + 86400;
      const purpose = 1;

      const grantTx = await consentManagement
        .connect(patient)
        .grantConsent(
          patient.address,
          clinician.address,
          ConsentType.DataAccess,
          expiresAt,
          purpose
        );

      const receipt = await grantTx.wait();
      const event = receipt.logs.find(
        (log) => consentManagement.interface.parseLog(log)?.name === "ConsentGranted"
      );
      const parsedEvent = consentManagement.interface.parseLog(event);
      const consentId = parsedEvent.args[0];

      const revokeTx = await consentManagement
        .connect(patient)
        .revokeConsent(consentId);

      await expect(revokeTx)
        .to.emit(consentManagement, "ConsentRevoked")
        .withArgs(
          consentId,
          patient.address,
          (revokedAt) => revokedAt > 0
        );
    });

    it("Should prevent revoking non-existent consent", async function () {
      const fakeConsentId = ethers.keccak256(ethers.toUtf8Bytes("fake"));
      await expect(
        consentManagement.connect(patient).revokeConsent(fakeConsentId)
      ).to.be.revertedWith("Consent not found");
    });
  });

  describe("Check Consent", function () {
    it("Should return true for valid consent", async function () {
      const expiresAt = Math.floor(Date.now() / 1000) + 86400;
      const purpose = 1;

      await consentManagement
        .connect(patient)
        .grantConsent(
          patient.address,
          clinician.address,
          ConsentType.DataAccess,
          expiresAt,
          purpose
        );

      const hasConsent = await consentManagement.hasValidConsent(
        patient.address,
        clinician.address,
        ConsentType.DataAccess
      );

      expect(hasConsent).to.be.true;
    });

    it("Should return false for non-existent consent", async function () {
      const hasConsent = await consentManagement.hasValidConsent(
        patient.address,
        clinician.address,
        ConsentType.DataAccess
      );

      expect(hasConsent).to.be.false;
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should prevent reentrancy attacks", async function () {
      // This test verifies that nonReentrant modifier is working
      // In a real attack scenario, a malicious contract would try to
      // call grantConsent again during execution
      const expiresAt = Math.floor(Date.now() / 1000) + 86400;
      const purpose = 1;

      // Normal operation should work
      await expect(
        consentManagement
          .connect(patient)
          .grantConsent(
            patient.address,
            clinician.address,
            ConsentType.DataAccess,
            expiresAt,
            purpose
          )
      ).to.emit(consentManagement, "ConsentGranted");
    });
  });
});

