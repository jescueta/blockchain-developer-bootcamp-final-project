const contract = artifacts.require("NiftyFiftyNFT.sol");

module.exports = function (deployer) {
  deployer.deploy(contract);
};