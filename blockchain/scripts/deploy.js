const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    const RecyclingSystem = await hre.ethers.getContractFactory("CharityFund");
    const contract = await RecyclingSystem.deploy();

    await contract.deployed();
    console.log("Contract deployed at:", contract.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
