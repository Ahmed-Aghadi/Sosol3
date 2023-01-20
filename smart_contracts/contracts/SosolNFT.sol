// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "base64-sol/base64.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SosolNFT is ERC721URIStorage, Ownable {
    uint256 private immutable i_mintFee;
    uint256 private s_tokenCounter;
    uint256 public s_requestId;
    string[] private s_sosolTokenUris;
    uint256[] private s_sosolTokenRarity;
    uint256 private s_sosolTotalToken;
    uint256 private constant MAX_CHANCE_VALUE = 100;

    // Events
    event NftMinted(uint256 index, address minter);

    /* Functions */
    constructor(
        string memory nftName,
        string memory nftSymbol,
        uint256 mintFee,
        uint256[3] memory sosolTokenRarity,
        string[3] memory sosolTokenUris,
        uint256 sosolTotalToken
    ) ERC721(nftName, nftSymbol) {
        require((mintFee * 90) / 100 != 0); //make sure that 90% of mint fee which owner will get isn't zero as it will be rounded off to int
        i_mintFee = mintFee;
        s_sosolTotalToken = sosolTotalToken;
        s_sosolTokenRarity = sosolTokenRarity;
        s_sosolTokenUris = sosolTokenUris;
    }

    function mint(address nftOwner, uint256 randomWord) public onlyOwner returns (uint256) {
        s_sosolTotalToken -= 1;
        uint256 newItemId = s_tokenCounter;
        s_tokenCounter = s_tokenCounter + 1;
        uint256 moddedRng = randomWord % MAX_CHANCE_VALUE;
        uint256 tokenIndex = 0;
        if (moddedRng < s_sosolTokenRarity[0]) {
            tokenIndex = 0;
        } else if (moddedRng < s_sosolTokenRarity[0] + s_sosolTokenRarity[1]) {
            tokenIndex = 1;
        } else {
            tokenIndex = 2;
        }
        _safeMint(nftOwner, newItemId);
        _setTokenURI(newItemId, s_sosolTokenUris[tokenIndex]);
        emit NftMinted(tokenIndex, nftOwner);
        return tokenIndex;
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getSosolTokenUris(uint256 index) public view returns (string memory) {
        return s_sosolTokenUris[index];
    }

    function getSosolTokenRarity(uint256 index) public view returns (uint256) {
        return s_sosolTokenRarity[index];
    }

    function getSosolTotalToken() public view returns (uint256) {
        return s_sosolTotalToken;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
