// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@tableland/evm/contracts/ITablelandTables.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SosolNFTTableland {
    uint256 private _marketTableId;
    string private _marketTableName;
    uint256 private _nftTableId;
    string private _nftTableName;
    string private _prefix = "sosol3";
    // Interface to the `TablelandTables` registry contract
    ITablelandTables private _tableland;

    constructor(address registry) {
        _tableland = ITablelandTables(registry);
        _marketTableId = _tableland.createTable(
            address(this),
            /*
             *  CREATE TABLE {prefix}_{chainId} (
             *    id integer primary key,
             *    message text
             *  );
             */
            string.concat(
                "CREATE TABLE ",
                _prefix,
                "_",
                Strings.toString(block.chainid),
                " (id integer primary key, userAddress text NOT NULL, nftAddress text NOT NULL, videoID integer NOT NULL);"
            )
        );

        _marketTableName = string.concat(
            _prefix,
            "_",
            Strings.toString(block.chainid),
            "_",
            Strings.toString(_marketTableId)
        );

        _nftTableId = _tableland.createTable(
            address(this),
            /*
             *  CREATE TABLE {prefix}_{chainId} (
             *    id integer primary key,
             *    message text
             *  );
             */
            string.concat(
                "CREATE TABLE ",
                _prefix,
                "_",
                Strings.toString(block.chainid),
                " (id integer primary key, userAddress text NOT NULL, nftAddress text NOT NULL, tokenIndex integer NOT NULL);"
            )
        );

        _nftTableName = string.concat(
            _prefix,
            "_",
            Strings.toString(block.chainid),
            "_",
            Strings.toString(_nftTableId)
        );
    }

    function _createNftEntry(
        address userAddress,
        address nftAddress,
        uint256 videoID
    ) internal virtual {
        _tableland.runSQL(
            address(this),
            _marketTableId,
            string.concat(
                "INSERT INTO ",
                _marketTableName,
                " (userAddress, nftAddress, videoID) VALUES (",
                "'",
                _addressToString(userAddress),
                "','",
                _addressToString(nftAddress),
                "','",
                Strings.toString(videoID),
                "');"
            )
        );
    }

    function _createNftMintEntry(
        address userAddress,
        address nftAddress,
        uint256 tokenIndex
    ) internal virtual {
        _tableland.runSQL(
            address(this),
            _nftTableId,
            string.concat(
                "INSERT INTO ",
                _nftTableName,
                " (userAddress, nftAddress, tokenIndex) VALUES (",
                "'",
                _addressToString(userAddress),
                "','",
                _addressToString(nftAddress),
                "','",
                Strings.toString(tokenIndex),
                "');"
            )
        );
    }

    function _addressToString(address x) public pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint256 i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2 * i] = char(hi);
            s[2 * i + 1] = char(lo);
        }
        return string.concat("0x", string(s));
    }

    function char(bytes1 b) public pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }

    function getMarketTableId() public view returns (uint256) {
        return _marketTableId;
    }

    function getMarketTableName() public view returns (string memory) {
        return _marketTableName;
    }

    function getNftTableId() public view returns (uint256) {
        return _nftTableId;
    }

    function getNftTableName() public view returns (string memory) {
        return _nftTableName;
    }
}
