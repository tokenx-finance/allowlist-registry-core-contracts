import { expect } from "chai";
import { ethers } from "hardhat";

const NAME = "INVESTMENT_TOKEN";
const VERSION = "1.0.0";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("AllowlistRegistryProxy", async () => {
  let proxy: any;
  let registry: any;
  let OWNER: any;
  let ADDR1: any;

  beforeEach(async () => {
    const Registry = await ethers.getContractFactory("AllowlistRegistry");
    const Proxy = await ethers.getContractFactory(
      "AllowlistRegistryProxy"
    );
    [OWNER, ADDR1] = await ethers.getSigners();

    registry = await Registry.deploy();
    proxy = await Proxy.deploy();

    await proxy.initialize(NAME);
  });

  describe("initialize", () => {
    it("should initialize success", async () => {
      const Proxy2 = await ethers.getContractFactory(
        "AllowlistRegistryProxy"
      );
      const proxy2 = await Proxy2.deploy();

      expect(await proxy2.name()).to.equal("");

      await proxy2.initialize("INVESTMENT_TOKEN_2");

      expect(await proxy2.name()).to.equal("INVESTMENT_TOKEN_2");
    });

    it("should initialize failed when already initialized", async () => {
      await expect(proxy.initialize(NAME)).to.be.revertedWith(
        "Initializable: contract is already initialized"
      );
    });
  });

  describe("version", () => {
    it("should get the version of the allowlist registry proxy", async () => {
      const version = await proxy.version();
      expect(version).to.equal(VERSION);
    });
  });

  describe("name", () => {
    it("should get the name of the allowlist registry proxy", async () => {
      expect(await proxy.name()).to.equal(NAME);
    });
  });

  describe("registries", () => {
    it("should get registries success", async () => {
      await proxy.addRegistry("Token X", registry.target);

      const registries = await proxy.registries();

      expect(registries).to.contain(registry.target);
    });

    it("should get empty registries", async () => {
      const registries = await proxy.registries();

      expect(registries).to.be.empty;
    });
  });

  describe("totalRegistry", () => {
    it("should get totalRegistry success", async () => {
      await proxy.addRegistry("Token X", registry.target);

      const total = await proxy.totalRegistry();

      expect(total).to.be.equal(1);
    });

    it("should get zero totalRegistry", async () => {
      const total = await proxy.totalRegistry();

      expect(total).to.be.equal(0);
    });
  });

  describe("getRegistryInfo", () => {
    it("should return the provider name and pause status of the allowlist registry", async () => {
      await proxy.addRegistry("Token X", registry.target);

      const info = await proxy["getRegistryInfo(address)"](
        registry.target
      );

      expect(info[0]).to.equal("Token X");
      expect(info[1]).to.be.false;
    });

    it("should return the provider name and pause status of the allowlist registry on invalid address", async () => {
      const info = await proxy["getRegistryInfo(address)"](ZERO_ADDRESS);

      expect(info[0]).to.equal("");
      expect(info[1]).to.be.false;
    });
  });

  describe("addRegistry", () => {
    it("should addRegistry success", async () => {
      await proxy.addRegistry("Token X", registry.target);

      const info = await proxy.getRegistryInfo(registry.target);

      expect(info[0]).to.equal("Token X");
      expect(info[1]).to.be.false;
    });

    it("Should addRegistry failed when sender is not the owner", async () => {
      await expect(
        proxy.connect(ADDR1).addRegistry("Token X", registry.target)
      ).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount");
    });

    it("should addRegistry failed when registry already exist", async () => {
      await proxy.addRegistry("Token X", registry.target);

      await expect(
        proxy.addRegistry("Token X", registry.target)
      ).to.be.revertedWithCustomError(proxy, "ExistRegistry");
    });
  });

  describe("removeRegistry", () => {
    it("should removeRegistry success", async () => {
      await proxy.addRegistry("Token X", registry.target);

      await proxy.removeRegistry(registry.target);

      const info = await proxy["getRegistryInfo(address)"](
        registry.target
      );

      expect(info[0]).to.equal("");
      expect(info[1]).to.be.false;
    });

    it("Should removeRegistry failed when sender is not the owner", async () => {
      await expect(
        proxy.connect(ADDR1).removeRegistry(registry.target)
      ).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount");
    });

    it("should removeRegistry failed when registry not exist", async () => {
      await expect(
        proxy.removeRegistry(registry.target)
      ).to.be.revertedWithCustomError(proxy, "NotExistRegistry");
    });
  });

  describe("pauseRegistry", () => {
    it("should pauseRegistry success", async () => {
      await proxy.addRegistry("Token X", registry.target);

      await proxy.pauseRegistry(registry.target);

      const info = await proxy["getRegistryInfo(address)"](
        registry.target
      );

      expect(info[0]).to.equal("Token X");
      expect(info[1]).to.be.true;
    });

    it("Should pauseRegistry failed when sender is not the owner", async () => {
      await expect(
        proxy.connect(ADDR1).pauseRegistry(registry.target)
      ).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount");
    });

    it("Should pauseRegistry failed when registry not exist", async () => {
      await expect(
        proxy.pauseRegistry(ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(proxy, "NotExistRegistry");
    });

    it("Should pauseRegistry failed when registry are paused", async () => {
      await proxy.addRegistry("Token X", registry.target);

      await proxy.pauseRegistry(registry.target);

      await expect(
        proxy.pauseRegistry(registry.target)
      ).to.be.revertedWithCustomError(proxy, "PausedRegistry");
    });
  });

  describe("unpauseRegistry", () => {
    it("should unpauseRegistry success", async () => {
      await proxy.addRegistry("Token X", registry.target);

      await proxy.pauseRegistry(registry.target);

      await proxy.unpauseRegistry(registry.target);

      const info = await proxy["getRegistryInfo(address)"](
        registry.target
      );

      expect(info[0]).to.equal("Token X");
      expect(info[1]).to.be.false;
    });

    it("Should unpauseRegistry failed when sender is not the owner", async () => {
      await expect(
        proxy.connect(ADDR1).unpauseRegistry(registry.target)
      ).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount");
    });

    it("Should unpauseRegistry failed when registry not exist", async () => {
      await expect(
        proxy.unpauseRegistry(ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(proxy, "NotExistRegistry");
    });

    it("Should unpauseRegistry failed when registry are not paused", async () => {
      await proxy.addRegistry("Token X", registry.target);

      await expect(
        proxy.unpauseRegistry(registry.target)
      ).to.be.revertedWithCustomError(proxy, "UnpausedRegistry");
    });
  });

  describe("addBlacklist", () => {
    it("should addBlacklist success", async () => {
      await proxy.addBlacklist(ZERO_ADDRESS);

      expect(await proxy.isBlacklist(ZERO_ADDRESS)).to.be.true;
    });

    it("Should addBlacklist failed when sender is not the owner", async () => {
      await expect(
        proxy.connect(ADDR1).addBlacklist(ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount");
    });

    it("Should addBlacklist failed when account already blacklist", async () => {
      await proxy.addBlacklist(ZERO_ADDRESS);

      await expect(
        proxy.addBlacklist(ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(proxy, "AccountBlacklisted");
    });
  });

  describe("removeBlacklist", () => {
    it("should removeBlacklist success", async () => {
      await proxy.addBlacklist(ZERO_ADDRESS);

      await proxy.removeBlacklist(ZERO_ADDRESS);

      expect(await proxy.isBlacklist(ZERO_ADDRESS)).to.be.false;
    });

    it("Should removeBlacklist failed when sender is not the owner", async () => {
      await expect(
        proxy.connect(ADDR1).removeBlacklist(ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(proxy, "OwnableUnauthorizedAccount");
    });

    it("Should removeBlacklist failed when account are not blacklist", async () => {
      await expect(
        proxy.removeBlacklist(ZERO_ADDRESS)
      ).to.be.revertedWithCustomError(proxy, "AccountNotBlacklisted");
    });
  });

  describe("isBlacklist", () => {
    it("should isBlacklist return true", async () => {
      await proxy.addBlacklist(ZERO_ADDRESS);

      expect(await proxy.isBlacklist(ZERO_ADDRESS)).to.be.true;
    });

    it("should isBlacklist return false", async () => {
      expect(await proxy.isBlacklist(ZERO_ADDRESS)).to.be.false;
    });
  });

  describe("isAllowlist", () => {
    it("should isAllowlist return true", async () => {
      await registry.addAllowlist(ZERO_ADDRESS);

      await proxy.addRegistry("Token X", registry.target);

      expect(await proxy.isAllowlist(ZERO_ADDRESS)).to.be.true;
    });

    it("should isAllowlist return true if any registry has added to allowlist", async () => {
      const Registry2 = await ethers.getContractFactory("AllowlistRegistry");

      const registry2 = await Registry2.deploy();

      await registry2.addAllowlist(ZERO_ADDRESS);

      await proxy.addRegistry("Token X", registry.target);

      await proxy.addRegistry("Token XYZ", registry2.target);

      expect(await proxy.isAllowlist(ZERO_ADDRESS)).to.be.true;
    });

    it("should isAllowlist return false", async () => {
      await proxy.addRegistry("Token X", registry.target);

      expect(await proxy.isAllowlist(ZERO_ADDRESS)).to.be.false;
    });

    it("should isAllowlist return false when account are blacklist", async () => {
      await registry.addAllowlist(ZERO_ADDRESS);

      await proxy.addRegistry("Token X", registry.target);

      await proxy.addBlacklist(ZERO_ADDRESS);

      expect(await proxy.isAllowlist(ZERO_ADDRESS)).to.be.false;
    });

    it("should isAllowlist skip paused registry", async () => {
      const Registry2 = await ethers.getContractFactory("AllowlistRegistry");

      const registry2 = await Registry2.deploy();

      await registry.addAllowlist(ZERO_ADDRESS);

      await proxy.addRegistry("Token X", registry.target);

      await proxy.addRegistry("Token XYZ", registry2.target);

      await proxy.pauseRegistry(registry.target);

      expect(await proxy.isAllowlist(ZERO_ADDRESS)).to.be.false;
    });

    it("should isAllowlist return false when account has removed from allowlist", async () => {
      await registry.addAllowlist(ZERO_ADDRESS);

      await proxy.addRegistry("Token X", registry.target);

      expect(await proxy.isAllowlist(ZERO_ADDRESS)).to.be.true;

      await registry.removeAllowlist(ZERO_ADDRESS);

      expect(await proxy.isAllowlist(ZERO_ADDRESS)).to.be.false;
    });
  });
});
