const sosolVideosAbi = require("./sosolVideos.abi.json");
const sosolNFTMarketplaceAbi = require("./SosolNFTMarketplace.abi.json");
const sosolNFTAbi = require("./SosolNFT.abi.json");
const contractAddress = require("./contractAddress.json");
const sosolVideosContractAddress = contractAddress.sosolVideos;
const sosolNFTMarketplaceContractAddress = contractAddress.sosolNFTMarketplace;
module.exports = {
    sosolVideosAbi,
    sosolNFTMarketplaceAbi,
    sosolNFTAbi,
    sosolVideosContractAddress,
    sosolNFTMarketplaceContractAddress,
};
