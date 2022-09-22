const networkConfig = {
    default: {
        name: "hardhat",
        // keepersUpdateInterval: "30",
    },
    31337: {
        name: "localhost",
        // subscriptionId: "588",
        // gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
        // keepersUpdateInterval: "30",
        // raffleEntranceFee: "100000000000000000", // 0.1 ETH
        // callbackGasLimit: "500000", // 500,000 gas
        title: "My Donate Entry",
        description: "Please Donate us",
        goal: "100",
    },
    80001: {
        name: "mumbai",
        vrfCoordinatorV2: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000", // 500,000 gas
        // mintFee: "10000000000000000", // 0.01 ETH
        subscriptionId: "1919", // add your ID here!
        tablelandRegistry: "0x4b48841d4b32c4650e4abc117a03fe8b51f38f68",
    },
    // 4: {
    //     name: "rinkeby",
    //     subscriptionId: "8868",
    //     gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    //     keepersUpdateInterval: "30",
    //     raffleEntranceFee: "100000000000000000", // 0.1 ETH
    //     callbackGasLimit: "500000", // 500,000 gas
    // },
    // 1: {
    //     name: "mainnet",
    //     keepersUpdateInterval: "30",
    // },
}

const developmentChains = ["hardhat", "localhost"]
const VERIFICATION_BLOCK_CONFIRMATIONS = 6
// const frontEndContractsFile = "../nextjs-nft-marketplace-moralis/constants/networkMapping.json"
// const frontEndContractsFile2 = "../nextjs-nft-marketplace-thegraph/constants/networkMapping.json"
// const frontEndAbiLocation = "../nextjs-nft-marketplace-moralis/constants/"
// const frontEndAbiLocation2 = "../nextjs-nft-marketplace-thegraph/constants/"

module.exports = {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
    // frontEndContractsFile,
    // frontEndContractsFile2,
    // frontEndAbiLocation,
    // frontEndAbiLocation2,
}
