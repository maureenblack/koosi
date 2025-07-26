// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./KoosiToken.sol";

/**
 * @title KoosiBridge
 * @dev Handles cross-chain token transfers between Ethereum and Cardano
 */
contract KoosiBridge is AccessControl, Pausable {
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant FIREFLY_ROLE = keccak256("FIREFLY_ROLE");

    KoosiToken public koosiToken;
    
    // Mapping to track cross-chain transactions
    mapping(bytes32 => CrossChainTx) public crossChainTxs;
    
    // Mapping for Cardano address verification
    mapping(bytes32 => bool) public validCardanoAddresses;

    struct CrossChainTx {
        address ethereumAddress;
        bytes32 cardanoAddress;
        uint256[] tokenIds;
        uint256[] amounts;
        bool completed;
        uint256 timestamp;
    }

    event CrossChainTransferInitiated(
        bytes32 indexed txHash,
        address indexed from,
        bytes32 indexed toCardanoAddress,
        uint256[] tokenIds,
        uint256[] amounts
    );

    event CrossChainTransferCompleted(
        bytes32 indexed txHash,
        bytes32 indexed cardanoTxHash
    );

    constructor(address tokenAddress) {
        koosiToken = KoosiToken(tokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
        _grantRole(FIREFLY_ROLE, msg.sender);
    }

    function initiateTransferToCardano(
        bytes32 cardanoAddress,
        uint256[] memory tokenIds,
        uint256[] memory amounts
    ) public whenNotPaused returns (bytes32) {
        require(validCardanoAddresses[cardanoAddress], "Invalid Cardano address");
        require(tokenIds.length == amounts.length, "Array length mismatch");

        bytes32 txHash = keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            cardanoAddress,
            tokenIds,
            amounts
        ));

        require(crossChainTxs[txHash].timestamp == 0, "Transaction already exists");

        // Lock tokens on Ethereum side
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(
                koosiToken.balanceOf(msg.sender, tokenIds[i]) >= amounts[i],
                "Insufficient token balance"
            );
            // Tokens will be burned by initiateCrossChainTransfer
        }

        // Initiate the cross-chain transfer which will burn the tokens
        koosiToken.initiateCrossChainTransfer(cardanoAddress, msg.sender, tokenIds, amounts);

        crossChainTxs[txHash] = CrossChainTx({
            ethereumAddress: msg.sender,
            cardanoAddress: cardanoAddress,
            tokenIds: tokenIds,
            amounts: amounts,
            completed: false,
            timestamp: block.timestamp
        });

        emit CrossChainTransferInitiated(
            txHash,
            msg.sender,
            cardanoAddress,
            tokenIds,
            amounts
        );

        return txHash;
    }

    function confirmCardanoTransfer(
        bytes32 txHash,
        bytes32 cardanoTxHash
    ) public onlyRole(ORACLE_ROLE) whenNotPaused {
        require(crossChainTxs[txHash].timestamp > 0, "Transaction not found");
        require(!crossChainTxs[txHash].completed, "Transaction already completed");

        crossChainTxs[txHash].completed = true;
        emit CrossChainTransferCompleted(txHash, cardanoTxHash);
    }

    function registerCardanoAddress(
        bytes32 cardanoAddress
    ) public onlyRole(FIREFLY_ROLE) {
        validCardanoAddresses[cardanoAddress] = true;
    }

    function unregisterCardanoAddress(
        bytes32 cardanoAddress
    ) public onlyRole(FIREFLY_ROLE) {
        validCardanoAddresses[cardanoAddress] = false;
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
