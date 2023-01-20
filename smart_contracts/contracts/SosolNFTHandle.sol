// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./SosolNFT.sol";
import "./SosolNFTTableland.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error NeedMoreETH();
error NFTNotAvailable();
error WithdrawFailed();
error NftContractNotExists();

contract SosolNFTHandle is SosolNFTTableland, Ownable {
    struct NftRequest {
        address requester;
        address nftContract;
    }
    event NFTCreated(address sosolNFT, address owner);
    event NftRequested(uint256 requestId, address requester);
    event NftMintRequested(address minter, address nftContract);

    mapping(address => address) private nftToOwner;
    // VRF Helpers
    mapping(uint256 => NftRequest) private s_requestIdToNftRequest;
    mapping(address => uint256) private ownerToBalance;
    mapping(address => uint256) private nftToTotalToken;

    uint256 private s_nftCreatePrice;

    constructor(address registry, uint256 nftCreatePrice) SosolNFTTableland(registry) {
        s_nftCreatePrice = nftCreatePrice;
    }

    function _createNFT(
        address msgSender,
        uint256 videoID,
        string memory nftName,
        string memory nftSymbol,
        uint256 mintFee,
        uint256[3] memory sosolTokenRarity,
        string[3] memory sosolTokenUris,
        uint256 sosolTotalToken
    ) internal virtual {
        if (msg.value < s_nftCreatePrice) {
            revert NeedMoreETH();
        }
        SosolNFT sosolNFT = new SosolNFT(
            nftName,
            nftSymbol,
            mintFee,
            sosolTokenRarity,
            sosolTokenUris,
            sosolTotalToken
        );
        nftToTotalToken[address(sosolNFT)] = sosolTotalToken;
        nftToOwner[address(sosolNFT)] = msgSender;
        // " (id integer primary key, userAddress text NOT NULL, nftAddress text NOT NULL, videoID integer NOT NULL);"
        _createNftEntry(msgSender, address(sosolNFT), videoID);
        emit NFTCreated(address(sosolNFT), msgSender);
    }

    // Assumes the subscription is funded sufficiently.
    function _requestNft(address nftContractAddress, uint256 requestId) internal virtual {
        if (nftToOwner[nftContractAddress] == address(0)) {
            revert NftContractNotExists();
        }
        SosolNFT sosolNFT = SosolNFT(nftContractAddress);
        if (msg.value < sosolNFT.getMintFee()) {
            revert NeedMoreETH();
        }
        if (nftToTotalToken[nftContractAddress] == 0) {
            revert NFTNotAvailable();
        }

        nftToTotalToken[nftContractAddress] -= 1;

        s_requestIdToNftRequest[requestId] = NftRequest(msg.sender, nftContractAddress);
        emit NftRequested(requestId, msg.sender);
    }

    /**
     * @dev This is the function that Chainlink VRF node
     * calls.
     */
    function _fulfillRandomWords(
        uint256 requestId, /* requestId */
        uint256[] memory randomWords
    ) internal virtual {
        address nftOwner = s_requestIdToNftRequest[requestId].requester;
        address nftAddress = s_requestIdToNftRequest[requestId].nftContract;
        SosolNFT nftContract = SosolNFT(nftAddress);
        uint256 tokenIndex = nftContract.mint(nftOwner, randomWords[0]);
        _createNftMintEntry(nftOwner, nftAddress, tokenIndex);
        ownerToBalance[nftToOwner[nftAddress]] += (nftContract.getMintFee() * 90) / 100;
        emit NftMintRequested(nftOwner, nftAddress);
    }

    function _withdraw(address msgSender) internal virtual {
        require(ownerToBalance[msgSender] > 0);
        uint256 amount = ownerToBalance[msgSender];
        ownerToBalance[msgSender] = 0;
        (bool success, ) = payable(msgSender).call{value: amount}("");
        if (!success) {
            revert WithdrawFailed();
        }
    }

    function _withdrawMarketplace() internal virtual onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        if (!success) {
            revert WithdrawFailed();
        }
    }

    function setNftCreatePrice(uint256 nftCreatePrice) public onlyOwner {
        s_nftCreatePrice = nftCreatePrice;
    }

    function getNftCreatePrice() public view returns (uint256) {
        return s_nftCreatePrice;
    }

    function getNftContractOwner(address nftContract) public view returns (address) {
        return nftToOwner[nftContract];
    }

    function getNftContractOwnerBalance(address nftContractOwner) public view returns (uint256) {
        return ownerToBalance[nftContractOwner];
    }

    function getNftTotalToken(address nftContract) public view returns (uint256) {
        return nftToTotalToken[nftContract];
    }
}
