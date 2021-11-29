const { bindNodeCallback } = require("rxjs");

const NiftyFiftyNFT = artifacts.require("NiftyFiftyNFT");

const RoyaltyToken = artifacts.require("RoyaltyToken");


function toBigNumber(n){
  return new web3.utils.BN(n);
}

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("NiftyFiftyNFTTest", function (accounts) {

  const [token_owner, artist1, artist2, recipient1, recipient2, recipient3, recipient4, recipient5, recipient6, royalty_wallet] = accounts

  const royaltyAmountTest = BigInt(1000000);

  let royaltyToken;

  let nft;

  beforeEach(async () => {
    // Setup the Test Tokens
    nft = await NiftyFiftyNFT.new({from: royalty_wallet});

    royaltyToken = await RoyaltyToken.new({from: token_owner});
    for (const account of accounts) {
      await royaltyToken.transfer(account, BigInt(100 * 10 ** 18), {from: token_owner});
    }
  }); 

  describe("NFT Minting", ()=> {

    it("Owner of the NFT will be the artist deploying the contract.", async function () {
      
      await nft.mint(royaltyToken.address, royaltyAmountTest, "" , {from: artist2});
      const tokenId = (await nft.getTokenIds(artist2))[0];
      
      const nftOwner = await nft.ownerOf(tokenId);

      assert.equal(await nftOwner, artist2, "Owner of the new NFT should be the artist.");

    });


    it("Minting NFT should save the token URI.", async function () {
      
      await nft.mint(royaltyToken.address, royaltyAmountTest, "TestTokenURI" , {from: artist2});
      const tokenId = (await nft.getTokenIds(artist2))[0];
      
      const uri = await nft.tokenURI(tokenId);

      assert.equal(uri, "TestTokenURI", "Owner of the new NFT should be the artist.");

    });
  });

  describe("NFT Royalty Distribution", ()=> {

    it("Artist should pay the Royalty Wallet upon initial transfer (sale).", async () => {

      const artist_of_nft = artist2;
      const buyer_of_nft = artist1;

      // mint NFT
      await nft.mint(royaltyToken.address, royaltyAmountTest, "", {from: artist_of_nft});

      const tokenId = (await nft.getTokenIds(artist_of_nft))[0];
      
      

      const {'0': _royaltyToken, '1': contractRoyaltyAmount, '2': _artist, '3': counter} = await nft.getRoyaltyDetails(tokenId)
      
      let artist_balance_before = (await royaltyToken.balanceOf(artist_of_nft));
      let royalty_wallet_before = (await royaltyToken.balanceOf(royalty_wallet));

      // Approve total royalty amount to be executed during the transfer
      await royaltyToken.approve(nft.address, contractRoyaltyAmount, {from: artist_of_nft});

      // Perform transfer
      const receipt = await nft.transferFrom(artist_of_nft, buyer_of_nft, tokenId, {from: artist_of_nft});
      
      
      

      let artist_balance_after = (await royaltyToken.balanceOf(artist_of_nft));
      let royalty_wallet_after = (await royaltyToken.balanceOf(royalty_wallet));

      assert.equal(royalty_wallet_after.sub(royalty_wallet_before).toString(),  contractRoyaltyAmount.div(new web3.utils.BN(2)).toString(), "Incomplete royalties received by the royalty wallet.");
      
      // artist pays the royalty for the first transfer (sell)
      assert.equal(artist_balance_after.toString(), artist_balance_before.sub(contractRoyaltyAmount.div(new web3.utils.BN(2))).toString(), "Incomplete royalties received by the artist.");  
      
    });

    async function _doMultipleTransfers(artist_of_nft, buyers) {
      // Artist mints the NFT
      await nft.mint(royaltyToken.address, royaltyAmountTest, "", {from: artist_of_nft});
      
      const tokenId = (await nft.getTokenIds(artist_of_nft))[0];
      

      const {'0': _royaltyToken, '1': contractRoyaltyAmount, '2': _artist, '3': counter} = await nft.getRoyaltyDetails(tokenId)

      
      for (const buyer of buyers) { // transfer 11 multiple times but only send 10 to the royalty wallet
        const current_nft_owner = await nft.ownerOf(tokenId);   
        // Approve total royalty amount to be executed during the transfer
        await royaltyToken.approve(nft.address, contractRoyaltyAmount, {from: current_nft_owner});
        // Perform transfer
        await nft.transferFrom(current_nft_owner, buyer, tokenId, {from: current_nft_owner});
        assert.equal(await nft.ownerOf(tokenId), buyer, "Owner of the NFT is not the artist deploying the NFT.");
      }

      return tokenId;
    }


    it("Royalty Wallet can only receive royalties after 10 transfers.", async () => {

      const artist_of_nft = artist2;
      const buyer_of_nft = artist1;

      const buyers = [recipient1, recipient2, recipient3, recipient4, recipient5, recipient6, recipient6, recipient5,
        recipient4, recipient3, recipient2];

      let royalty_wallet_before = (await royaltyToken.balanceOf(royalty_wallet));

      const tokenId = await _doMultipleTransfers(artist_of_nft, buyers);      


      const {'0': _royaltyToken, '1': contractRoyaltyAmount, '2': _artist, '3': counter} = await nft.getRoyaltyDetails(tokenId);

      let royalty_wallet_after = (await royaltyToken.balanceOf(royalty_wallet));
      assert.equal(royalty_wallet_after.sub(royalty_wallet_before).toString(), (contractRoyaltyAmount.div(toBigNumber(2))).mul(toBigNumber(10)).toString(), "Incorrect royalties received.");


      

    });

    it("Artist will initially pay half the royalties to the royalty wallet, then receive the full royalties after 10 transfers.", async () => {

      const artist_of_nft = artist2;
      const buyer_of_nft = artist1;

      const buyers = [recipient1, recipient2, recipient3, recipient4, recipient5, recipient6, recipient6, recipient5,
        recipient4, recipient3, recipient2];

      let artist_balance_before = (await royaltyToken.balanceOf(artist_of_nft));

      
      const tokenId = await _doMultipleTransfers(artist_of_nft, buyers);      


      const {'0': _royaltyToken, '1': contractRoyaltyAmount, '2': _artist, '3': counter} = await nft.getRoyaltyDetails(tokenId);

      
      let artist_balance_after = (await royaltyToken.balanceOf(artist_of_nft));
      
      const artist_expected_royalties = (contractRoyaltyAmount.div(toBigNumber(2))).mul(toBigNumber(-1))  // first transfer, the artist pays the royalty as he is the owner
                                        .add((contractRoyaltyAmount.div(toBigNumber(2))).mul(toBigNumber(9)))  // 9 more transfers, the artist splits the royalties with the royalty wallet
                                        .add(contractRoyaltyAmount) ; // after 10 transfers, the artist gets all the royalties

      assert.equal(artist_expected_royalties.toString(), artist_balance_after.sub(artist_balance_before).toString(), "Incorrect royalties received.");



    });

  })
  
});
