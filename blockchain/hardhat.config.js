require("@nomiclabs/hardhat-ethers");

module.exports = {
    solidity: "0.8.28", // Make sure this matches your contract version
    networks: {
        hardhat: {
            chainId: 1337, // Default local testnet chain ID for Hardhat
        },
        localhost: {
            url: "http://127.0.0.1:8545"
        },
    },
};
