# Design Pattern Decisions

## Access Control Design Patterns
Use of `Ownable` to restrict access of certain functions only to the owner of the contract. 
In this case, in the `updateMaxRoyaltyCount`  only the owner of the contract can change the total number of sharing for subsequent NFT mints.

## Inter-contract Execution
One of the features of the project is to be able to allow NFTs to be minted by specifying the preferred ERC20 token as royalty. Minting an NFT would require you to specify a contract address of an ERC20 token of choice. 

I leveraged on the IERC20 interface definition in OpenZeppelin, which allowed me to invoke `transferFrom` of the provided ERC20 tokens.

## Inheritance and Interfaces
I leveraged on the abstract contract `ERC721URIStorage` which extends from the `ERC721` implementations from OpenZeppelin. 
Using this, I was able to create NFTs and store the IPFS metadata for the minted NFT. 
