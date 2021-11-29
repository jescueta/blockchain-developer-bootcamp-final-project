// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/// @title NiftyFiftyNFT - NFT Contract for minting Royalty NFTs for transfers (sales/trade) with royalty sharing with the contract owner.
/// @notice You may use this contract for basic minting and transfer functionalities.
/// @dev Based on ERC721 implementation from OpenZeppelin - This was created for the Consensys Blockchain Project for learning purposes 
contract NiftyFiftyNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint;

    /// @dev Token counter for NFTs minted
    Counters.Counter tokenIdCounter;

    struct RoyaltyDetail {
        address royaltyToken;
        uint amount;
        address artist;
        uint counter;
        uint maxRoyaltyCount;
    }

    /// @dev Token mapping for each artist of the NFT
    mapping(address => uint[]) internal tokenIdMap;

    /// @dev Royalty details mapping for each tokenId
    mapping(uint => RoyaltyDetail) internal royaltyDetails;

    /// @dev Total number of transfers that royalty will be shared with the contract owner
    uint maxRoyaltyCount;

    /// @notice Constructor
    constructor() ERC721('NiftyFiftyNFT', 'NIFNFT') {
        // this can be changed later on
        maxRoyaltyCount = 10;
    }

    /// @notice change the default maximum number of royalty sharing count for subsequent minting
    function updateMaxRoyaltyCount(uint count) public onlyOwner {
        maxRoyaltyCount = count;
    }

    /// @dev Accessor for the royalty details for a given NFT tokenId
    /// @param tokenId tokenId of the NFT
    /// @return royaltyDetails
    function getRoyaltyDetails(uint tokenId) public view returns (address, uint, address, uint) {
        return (royaltyDetails[tokenId].royaltyToken, royaltyDetails[tokenId].amount, royaltyDetails[tokenId].artist,
          royaltyDetails[tokenId].counter);
    }

    /// @dev Accessor for the tokenIds available for an artist
    /// @param artist NFT artist address
    /// @return array of tokenIds minted by an artist
    function getTokenIds(address artist) public view returns (uint [] memory) {
        return tokenIdMap[artist];
    }

    /// @dev Mint an NFT
    /// @param _royaltyToken ERC20 contract address for the preferred royalty token
    /// @param _amount Amount of the royalty token
    /// @param _tokenURI URI that stores the NFT metadata
    function mint(address _royaltyToken, uint _amount, string memory _tokenURI) public {
        require(_amount > 0, "Royalty amount should be more than 0.");
        tokenIdCounter.increment();
        uint tokenId = tokenIdCounter.current();
        royaltyDetails[tokenId].royaltyToken = _royaltyToken;
        royaltyDetails[tokenId].amount = _amount;
        royaltyDetails[tokenId].artist = msg.sender;
        royaltyDetails[tokenId].maxRoyaltyCount = maxRoyaltyCount;
        royaltyDetails[tokenId].counter = 0;
        _mint(msg.sender, tokenId);
        tokenIdMap[msg.sender].push(tokenId);
        _setTokenURI(tokenId, _tokenURI);
    }

    /// @dev Royalty splitting and payment
    /// @param from Address of the party paying the royalty
    /// @param tokenId tokenId of the NFT being paid for
    function _payRoyalty(address from, uint tokenId) internal {
        RoyaltyDetail memory _rdetails = royaltyDetails[tokenId];
        IERC20 token = IERC20(_rdetails.royaltyToken);
        if (_rdetails.counter >= _rdetails.maxRoyaltyCount) {
            if (from != _rdetails.artist) {
                bool success = transferERC20Token(token, from, _rdetails.artist, _rdetails.amount);
                require(success, "Royalty transfer to artist failed.");
            }
        } else {
            uint split = _rdetails.amount.div(2);
            royaltyDetails[tokenId].counter = royaltyDetails[tokenId].counter.add(1);
            bool success = transferERC20Token(token, from, owner(), split);
            require(success, "Royalty transfer to owner failed.");
            success = transferERC20Token(token, from, _rdetails.artist, split);
            require(success, "Royalty transfer to artist failed.");
        }
    }

    function transferERC20Token(IERC20 token, address from, address to, uint amount) internal returns (bool) {
        require(amount <= token.balanceOf(from), "Not enough balance.");
        return token.transferFrom(from, to, amount);
    }

    /// @dev Overridden function to add logic to pay the royalty for every transfer
    /// @param from Address of the sender
    /// @param to Address of the recipient
    /// @param tokenId tokenId of the NFT
    function transferFrom(address from, address to, uint tokenId) public override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _payRoyalty(from, tokenId);
        _transfer(from, to, tokenId);
    }

    /// @dev Overridden function to add logic to pay the royalty for every transfer
    /// @param from Address of the sender
    /// @param to Address of the recipient
    /// @param tokenId tokenId of the NFT
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        _payRoyalty(from, tokenId);
        safeTransferFrom(from, to, tokenId, "");
    }


    /// @dev Overridden function to add logic to pay the royalty for every transfer
    /// @param from Address of the sender
    /// @param to Address of the recipient
    /// @param tokenId tokenId of the NFT
    /// @param _data Additional data that can be included during the transfer
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: transfer caller is not owner nor approved");
        _payRoyalty(from, tokenId);
        _safeTransfer(from, to, tokenId, _data);
    }


}
