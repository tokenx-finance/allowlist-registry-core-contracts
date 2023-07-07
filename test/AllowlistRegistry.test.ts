import { expect } from "chai";
import { ethers } from "hardhat";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

describe("AllowlistRegistry", async () => {
  let registry: any;
  let OWNER: any;
  let ADDR1: any;

  beforeEach(async () => {
    const Registry = await ethers.getContractFactory("AllowlistRegistry");
    [OWNER, ADDR1] = await ethers.getSigners();

    registry = await Registry.deploy();
  });

  describe("addAllowlist", () => {
    it("should addAllowlist success", async () => {
      await registry.addAllowlist(ZERO_ADDRESS);

      expect(await registry.isAllowlist(ZERO_ADDRESS)).to.be.true;
    });

    it("should addAllowlist failed when sender is not the owner", async () => {
      await expect(
        registry.connect(ADDR1).addAllowlist(ZERO_ADDRESS)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("removeAllowlist", () => {
    it("should removeAllowlist success", async () => {
      await registry.addAllowlist(ZERO_ADDRESS);

      expect(await registry.isAllowlist(ZERO_ADDRESS)).to.be.true;

      await registry.removeAllowlist(ZERO_ADDRESS);

      expect(await registry.isAllowlist(ZERO_ADDRESS)).to.be.false;
    });

    it("should removeAllowlist failed when sender is not the owner", async () => {
      await expect(
        registry.connect(ADDR1).removeAllowlist(ZERO_ADDRESS)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("isAllowlist", () => {
    it("should return true", async () => {
      await registry.addAllowlist(ZERO_ADDRESS);

      expect(await registry.isAllowlist(ZERO_ADDRESS)).to.be.true;
    });

    it("should return false", async () => {
      expect(await registry.isAllowlist(ZERO_ADDRESS)).to.be.false;
    });
  });
});
