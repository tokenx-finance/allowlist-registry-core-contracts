import { ethers } from "hardhat";

async function main() {
  const allowlistRegistry = await ethers.deployContract("AllowlistRegistry");

  await allowlistRegistry.waitForDeployment();

  console.log("AllowlistRegistry deployed to:", await allowlistRegistry.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
