// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title KoosiToken
 * @dev Multi-token system for Koosi platform managing different types of access tokens and NFTs
 */
contract KoosiToken is ERC1155, AccessControl, Pausable, ERC1155Supply {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    
    // Token type constants
    uint256 public constant ACCESS_TOKEN = 1;
    uint256 public constant PREMIUM_TOKEN = 2;
    uint256 public constant SPECIAL_CAPSULE = 3;

    // Mapping for token metadata URIs
    mapping(uint256 => string) private _tokenURIs;
    
    // Cross-chain transaction tracking
    mapping(bytes32 => bool) public processedCrossChainTxs;

    event TokenMinted(address indexed to, uint256 indexed id, uint256 amount);
    event CrossChainTransferInitiated(bytes32 indexed txHash, address indexed from, bytes32 destinationChain);
    event MetadataUpdated(uint256 indexed tokenId, string newUri);

    constructor() ERC1155("https://api.koosi.com/token/{id}.json") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    function setURI(uint256 tokenId, string memory newuri) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenURIs[tokenId] = newuri;
        emit MetadataUpdated(tokenId, newuri);
    }

    function uri(uint256 tokenId) public view virtual override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        return bytes(tokenURI).length > 0 ? tokenURI : super.uri(tokenId);
    }

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        _mint(to, id, amount, data);
        emit TokenMinted(to, id, amount);
    }

    function mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyRole(MINTER_ROLE) whenNotPaused {
        _mintBatch(to, ids, amounts, data);
        for (uint256 i = 0; i < ids.length; i++) {
            emit TokenMinted(to, ids[i], amounts[i]);
        }
    }

    function initiateCrossChainTransfer(
        bytes32 destinationChain,
        address from,
        uint256[] memory ids,
        uint256[] memory amounts
    ) public onlyRole(BRIDGE_ROLE) whenNotPaused returns (bytes32) {
        bytes32 txHash = keccak256(abi.encodePacked(block.timestamp, from, destinationChain));
        require(!processedCrossChainTxs[txHash], "Transaction already processed");

        // Lock tokens on Ethereum side
        for (uint256 i = 0; i < ids.length; i++) {
            _burn(from, ids[i], amounts[i]);
        }

        processedCrossChainTxs[txHash] = true;
        emit CrossChainTransferInitiated(txHash, from, destinationChain);
        return txHash;
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // Override required functions
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) whenNotPaused {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC1155, AccessControl) returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
