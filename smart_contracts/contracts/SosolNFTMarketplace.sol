// SPDX-License-Identifier: MIT

pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "./SosolNFTTableland.sol";
import "./SosolNFTHandle.sol";

contract SosolNFTMarketplace is ERC721Holder, VRFConsumerBaseV2, SosolNFTTableland, SosolNFTHandle {
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;

    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;

    constructor(
        address registry,
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane, // keyH
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) SosolNFTHandle(registry) {
        i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
    }

    function createNFT(
        uint256 videoID,
        string memory nftName,
        string memory nftSymbol,
        uint256 mintFee,
        uint256[3] memory sosolTokenRarity,
        string[3] memory sosolTokenUris,
        uint256 sosolTotalToken
    ) public {
        _createNFT(
            msg.sender,
            videoID,
            nftName,
            nftSymbol,
            mintFee,
            sosolTokenRarity,
            sosolTokenUris,
            sosolTotalToken
        );
    }

    // Assumes the subscription is funded sufficiently.
    function requestNft(address nftContractAddress) public payable returns (uint256 requestId) {
        requestId = i_vrfCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
        _requestNft(nftContractAddress, requestId);
    }

    /**
     * @dev This is the function that Chainlink VRF node
     * calls.
     */
    function fulfillRandomWords(
        uint256 requestId, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        _fulfillRandomWords(requestId, randomWords);
    }

    function withdraw() public {
        _withdraw(msg.sender);
    }
}
