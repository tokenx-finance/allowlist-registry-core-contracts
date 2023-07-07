import { ethers, upgrades } from "hardhat";

const PROXY_ADDRESS = ''

async function main() {
  const AllowlistRegistryProxy = await ethers.getContractFactory("AllowlistRegistryProxy");
  const allowlistRegistryProxy = await upgrades.upgradeProxy(PROXY_ADDRESS, AllowlistRegistryProxy);
  await allowlistRegistryProxy.waitForDeployment();

  console.log(await allowlistRegistryProxy.getAddress(), "TransparentUpgradeableProxy");
  console.log(await upgrades.erc1967.getImplementationAddress(await allowlistRegistryProxy.getAddress()), "AllowlistRegistryProxy")
  console.log(await upgrades.erc1967.getAdminAddress(await allowlistRegistryProxy.getAddress()), "ProxyAdmin")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
