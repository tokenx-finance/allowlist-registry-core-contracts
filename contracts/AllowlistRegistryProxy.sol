// SPDX-License-Identifier: GPL-2.0-or-later
// TokenX Contracts v1.0.0 (contracts/AllowlistRegistryProxy.sol)
pragma solidity 0.8.19;

import "./Storage.sol";
import "../extensions/Ownable.sol";
import "../extensions/Blacklistable.sol";
import "../interfaces/IAllowlistRegistry.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

/**
 * @dev Contract module that provides capabilities for managing allowlist registries.
 *
 * Only the owner is allowed to manage allowlist registries.
 */
contract AllowlistRegistryProxy is Storage, Ownable, Blacklistable, Initializable {
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @dev Error indicating that the registry already exists in the allowlist registry proxy.
     */
    error ExistRegistry(address registry);

    /**
     * @dev Error indicating that the registry does not exist in the allowlist registry proxy.
     */
    error NotExistRegistry(address registry);

    /**
     * @dev Error indicating that the registry is paused.
     */
    error PausedRegistry(address registry);

    /**
     * @dev Error indicating that the registry is unpaused.
     */
    error UnpausedRegistry(address registry);

    /**
     * @dev Emitted when a new registry is added to the allowlist registry proxy.
     */
    event RegistryAdded(string provider, address indexed registry);

    /**
     * @dev Emitted when a registry is removed from the allowlist registry proxy.
     */
    event RegistryRemoved(address indexed registry);

    /**
     * @dev Emitted when a registry is paused.
     */
    event RegistryPaused(address registry);

    /**
     * @dev Emitted when a registry is unpaused.
     */
    event RegistryUnpaused(address registry);

    modifier existRegistry(address registry) {
        if (!Storage._registries.contains(registry)) {
            revert NotExistRegistry(registry);
        }
        _;
    }

    modifier notExistRegistry(address registry) {
        if (Storage._registries.contains(registry)) {
            revert ExistRegistry(registry);
        }
        _;
    }

    modifier pausedRegistry(address registry) {
        if (!Storage._registryInfo[registry].pause) {
            revert UnpausedRegistry(registry);
        }
        _;
    }

    modifier unpausedRegistry(address registry) {
        if (Storage._registryInfo[registry].pause) {
            revert PausedRegistry(registry);
        }
        _;
    }

    /**
     * @dev Initializes the contract with the provided name and sets the owner.
     */
    function initialize(string memory proxyName) public initializer {
        Storage._proxyName = proxyName;
        _transferOwnership(msg.sender);
    }

    /**
     * @dev Returns the version of the allowlist registry proxy.
     */
    function version() public pure returns (string memory) {
        return '1.0.0';
    }

    /**
     * @dev Returns the name of the allowlist registry proxy.
     */
    function name() public view returns (string memory) {
        return Storage._proxyName;
    }


    // ##############################
    // #          REGISTRY          #
    // ##############################
    /**
     *
     * @dev Returns an array of registered registry addresses.
     * @return registry addresses.
     */
    function registries() public view returns (address[] memory) {
        return Storage._registries.values();
    }

    /**
     * @dev Returns the total count of registries in the allowlist registry proxy.
     * @return total count of registries.
     */
    function totalRegistry() public view returns (uint256) {
        return Storage._registries.length();
    }

    /**
     * @dev Returns registry information of the given registry address.
     * @param registry The address of the registry.
     * @return provider name and pause status of the registry.
     */
    function getRegistryInfo(address registry) public view returns (string memory, bool) {
        RegistryInfo memory registryInfo = Storage._registryInfo[registry];
        return (registryInfo.provider, registryInfo.pause);
    }

    /**
     * @dev Adds a new registry to the allowlist registry proxy.
     * @param provider The provider name of the registry.
     * @param registry The address of the registry.
     *
     * Requirements:
     *
     * - the caller must be owner.
     * - the registry should not already exist in the allowlist registry proxy.
     */
    function addRegistry(string memory provider, address registry) public onlyOwner notExistRegistry(registry) {
        Storage._registries.add(registry);
        Storage._registryInfo[registry] = RegistryInfo(provider, false);

        emit RegistryAdded(provider, registry);
    }

    /**
     * @dev Removes a registry from the allowlist registry proxy.
     * @param registry The address of the registry.
     *
     * Requirements:
     *
     * - the caller must be owner.
     * - the registry should exist in the allowlist registry proxy.
     */
    function removeRegistry(address registry) public onlyOwner existRegistry(registry) {
        Storage._registries.remove(registry);
        delete Storage._registryInfo[registry];

        emit RegistryRemoved(registry);
    }

    /**
     * @dev Pauses a registry in the allowlist registry proxy.
     * @param registry The address of the registry.
     *
     * Requirements:
     *
     * - the caller must be owner.
     * - the registry should not be paused.
     */
    function pauseRegistry(address registry) public onlyOwner existRegistry(registry) unpausedRegistry(registry) {
        Storage._registryInfo[registry].pause = true;

        emit RegistryPaused(registry);
    }

    /**
     * @dev Unpauses a registry in the allowlist registry proxy.
     * @param registry The address of the registry.
     *
     * Requirements:
     *
     * - the caller must be owner.
     * - the registry should be paused.
     */
    function unpauseRegistry(address registry) public onlyOwner existRegistry(registry) pausedRegistry(registry) {
        Storage._registryInfo[registry].pause = false;

        emit RegistryUnpaused(registry);
    }


    // ##############################
    // #          BLACKLIST         #
    // ##############################
    /**
     * @dev Adds an account to the blacklist.
     * @param account The address of the account.
     *
     * See {Blacklistable-addBlacklist}.
     *
     * Requirements:
     *
     * - the caller must be owner.
     */
    function addBlacklist(address account) public override onlyOwner {
        super.addBlacklist(account);
    }

    /**
     * @dev Removes an account from the blacklist.
     * @param account The address of the account.
     *
     * See {Blacklistable-removeBlacklist}.
     *
     * Requirements:
     *
     * - the caller must be owner.
     */
    function removeBlacklist(address account) public override onlyOwner {
        super.removeBlacklist(account);
    }

    /**
    * @dev Returns the blacklist status of an account.
    * @param account The address of the account to check.
    *
    * See {Blacklistable-isBlacklist}.
    */
    function isBlacklist(address account) public override view returns (bool) {
        return super.isBlacklist(account);
    }


    // ##############################
    // #     ALLOWLIST REGISTRY     #
    // ##############################
    /**
     * @dev Returns the allowlist status of an account.
     * @param account The address of the account.
     */
    function isAllowlist(address account) public view returns (bool) {
        if (isBlacklist(account)) {
            return false;
        }

        uint256 count = Storage._registries.length();
        for (uint256 i = 0; i < count; i++) {
            address registry = Storage._registries.at(i);

            if (!Storage._registryInfo[registry].pause && IAllowlistRegistry(registry).isAllowlist(account)) {
                return true;
            }
        }

        return false;
    }
}