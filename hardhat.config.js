require("@nomicfoundation/hardhat-chai-matchers");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://eth-sepolia";
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "BaDda098";
const LOCAL_RPC_URL = process.env.LOCAL_RPC_URL || "https://127.0.1.1009";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "aok0-cmlm3";
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "url";
const GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY || "key";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [
            { version: "0.8.7" },
            { version: "0.4.19" },
            { version: "0.6.6" },
            { version: "0.6.12" },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL,
            },
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [SEPOLIA_PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
            gas: 6000000,
        },
        goerli: {
            url: GOERLI_RPC_URL,
            chainId: 5,
            accounts: [GOERLI_PRIVATE_KEY],
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        player: {
            default: 1,
        },
    },
    blockConfirmations: 1,
    mocha: {
        timeout: 500000,
    },
};
