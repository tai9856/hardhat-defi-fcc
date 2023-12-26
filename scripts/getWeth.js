const { isError } = require("ethers");
const { getNamedAccounts, ethers } = require("hardhat");

const AMOUNT = ethers.parseEther("0.1");

async function getWeth() {
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);
    const iWeth = await ethers.getContractAt(
        "IWeth",
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        signer,
    );
    const tx = await iWeth.deposit({ value: AMOUNT });
    await tx.wait(1);
    const wethBalance = await iWeth.balanceOf(deployer);
    console.log(`Got ${ethers.formatEther(wethBalance).toString()} WETH`);
}

module.exports = { getWeth, AMOUNT };
