const { getNamedAccounts, ethers } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");
const { formatEther } = require("ethers");

async function main() {
    await getWeth();
    const { deployer } = await getNamedAccounts();
    const signer = await ethers.getSigner(deployer);
    // LendingPoolAddressProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"
    const lendingPool = await getLendingPool(signer);
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    // approve
    await approveErc20(wethTokenAddress, lendingPool.target, AMOUNT, signer);
    // deposit
    console.log("Depositing....");
    await lendingPool.deposit(wethTokenAddress, AMOUNT, signer, 0);
    console.log("Deposited!");
    // Get user available borrowed amount in ETH
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        signer,
    );
    // Convert available borrowed amount to DAI
    const daiPrice = await getDaiPrice();
    const amountDaiToBorrow = (
        availableBorrowsETH.toString() *
        0.95 *
        (1 / Number(daiPrice))
    ).toFixed(2);
    console.log(`You can borrow ${amountDaiToBorrow} DAI`);
    const amountDaiToBorrowWei = ethers.parseEther(
        amountDaiToBorrow.toString(),
    );
    // Borrow
    const daiTokenAddress = "0x6b175474e89094c44da98b954eedeac495271d0f";
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, signer);
    await getBorrowUserData(lendingPool, signer);
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, signer);
    await getBorrowUserData(lendingPool, signer);
}

async function borrowDai(
    daiAddress,
    lendingPool,
    amountDaiToBorrowWei,
    account,
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowWei,
        2,
        0,
        account,
    ); // 1 = stable interest, 2 = variable, stable borrow doesn't available now
    // 0 referal
    await borrowTx.wait(1);
    console.log(`You borrowed ${formatEther(amountDaiToBorrowWei)} DAI!`);
}

async function repay(amount, daiAddress, lendingPool, account) {
    await approveErc20(daiAddress, lendingPool.target, amount, account);
    const repayTx = await lendingPool.repay(daiAddress, amount, 2, account);
    await repayTx.wait(1);
    console.log("Repaid!");
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4",
    );
    const price = (await daiEthPriceFeed.latestRoundData())[1];
    console.log(`The DAI/ETH price is ${formatEther(price.toString())}`);
    return price;
}

async function getLendingPool(account) {
    const LendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account,
    );
    const lendingPoolAddress =
        await LendingPoolAddressesProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        lendingPoolAddress,
        account,
    );
    return lendingPool;
}

async function approveErc20(
    erc20Address,
    spenderAddress,
    amountToSpend,
    account,
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        erc20Address,
        account,
    );
    const tx = await erc20Token.approve(spenderAddress, amountToSpend);
    await tx.wait(1);
    console.log("Approved!");
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account);
    console.log(
        `You have ${formatEther(totalCollateralETH)} worth of ETH deposited`,
    );
    console.log(`You have ${formatEther(totalDebtETH)} worth of ETH borrowed`);
    console.log(
        `You can borrow ${formatEther(availableBorrowsETH)} worth of ETH`,
    );
    return { availableBorrowsETH, totalDebtETH };
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
