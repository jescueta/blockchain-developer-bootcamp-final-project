pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RoyaltyToken is ERC20 {

    constructor() ERC20("Royalty Token", "RTKN") {
        // mint supply of tokens
        _mint(msg.sender, 10000 * 10 ** 18);
    }
}
