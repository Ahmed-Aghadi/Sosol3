// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@tableland/evm/contracts/ITablelandTables.sol";

contract SosolVideos is ERC721Holder {
    uint256 private _tableId;
    string private _tableName;
    string private _prefix = "sosol3";
    // Interface to the `TablelandTables` registry contract
    ITablelandTables private _tableland;

    constructor(address registry) {
        _tableland = ITablelandTables(registry);
        _tableId = _tableland.createTable(
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
                " (id integer primary key, userAddress text NOT NULL, title text NOT NULL, thumbnailCid text NOT NULL, finalCid text NOT NULL);"
            )
        );

        _tableName = string.concat(
            _prefix,
            "_",
            Strings.toString(block.chainid),
            "_",
            Strings.toString(_tableId)
        );
    }

    // function create(string memory prefix) public payable {
    //     require(tableId == 0, "Table already created!");
    //     tableId = _tableland.createTable(
    //         address(this),
    //         /*
    //          *  CREATE TABLE {prefix}_{chainId} (
    //          *    id integer primary key,
    //          *    message text
    //          *  );
    //          */
    //         string.concat(
    //             "CREATE TABLE ",
    //             prefix,
    //             "_",
    //             Strings.toString(block.chainid),
    //             " (id integer primary key, userAddress text NOT NULL, title text NOT NULL, thumbnailCid text NOT NULL, videoCid text NOT NULL);"
    //         )
    //     );

    //     tableName = string.concat(
    //         prefix,
    //         "_",
    //         Strings.toString(block.chainid),
    //         "_",
    //         Strings.toString(tableId)
    //     );
    // }

    function upload(
        string memory title,
        string memory thumbnailCid,
        string memory finalCid
    ) public {
        require(_tableId != 0, "Table not created!");
        _tableland.runSQL(
            address(this),
            _tableId,
            string.concat(
                "INSERT INTO ",
                _tableName,
                " (userAddress, title, thumbnailCid, finalCid) VALUES (",
                "'",
                _addressToString(msg.sender),
                "','",
                title,
                "','",
                thumbnailCid,
                "','",
                finalCid,
                "');"
            )
        );
    }

    function getTableName() public view returns (string memory) {
        return _tableName;
    }

    function getTableId() public view returns (uint256) {
        return _tableId;
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
}
