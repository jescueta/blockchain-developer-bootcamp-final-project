# Nifty Fifty NFT

## About

This is a simple DApp that allows users/artists to mint their own NFT and receive royalties as they transfer/sell/trade them. The artist can select any ERC20 token of choice, and the amount of royalty. Royalties will be shared, 50-50, with the contract owner for the first 10 transfers. And thenafter, the artist will receive the royalties in full for all subsequent transfers.

The smart contract leverages on ERC721 and ERC20 implementation from OpenZeppelin. This project uses Moralis for IPFS storage for the NFT image and metadata.

### Tech Stack
1. Front-end:
   1. Angular 11
   2. Moralis SDK (used this for IPFS and played around with their SDK a bit)
   3. web3.js
2. Smart Contract
   1. OpenZeppelin
   2. Truffle
   3. Ganache
   4. Solidity

### Requirements
1. Node v14/16
2. Moralis Server (Used for IPFS - You may set this up for free at https://moralis.io)
3. Truffle v5
4. Ganache
5. Metamask Plugin

## Directory Structure

For simplicity, I created the project on the same root as the Angular project. So the truffle files are just located in different folders and both share the same `package.json`.

Below are the key files/folders to take note of for this project.

    .
    ├── contracts                            # Solidity Contracts
    ├── docs                                 # Required project docs
    │   ├── avoiding_common_attacks.md       # avoiding common attacks
    │   └── design_pattern_decisions.md      # design pattern decisions
    ├── migrations                           # Truffle migration scripts
    ├── src                                  # Angular app source files
    │   ├── environments
    │   │    └── env.ts                      # Angular config file which contains the contract address and Moralis server details
    │   └── ...
    ├── test                                 # Truffle test scripts
    ├── .env                                 # File that needs to be created and contain the MNEMONIC environment variable for truffle
    ├── package.json                         # Angular dependencies together with Truffle dependencies (in devDependencies)
    ├── README.md                            # Main project documentation
    ├── truffle-config.js                    # Truffle configuration
    └── ...
    

## Smart Contract Testing

The smart contract was developed using Truffle Suite. Install truffle and ganache-cli to be able to run the tests.

### Install required tools

Install truffle.

```npm i truffle```

Install ganache-cli

```npm i ganache-cli```

### Configure wallet

Create a .env file and add in the MNEMONIC environment variable for your test wallet. If you don't have this, just run the command below to generate your mnemonic.

```npx mnemonics```

Add the generated mnemonic to the .env file you created.

```
MNEMONIC=<your mnemonic>
RINKEBY_WALLET_PROVIDER=<wallet provider URL from Moralis or Infura>
```

Install all other dependencies

```npm install```

### Run the tests

1. Start ganache locally at port `8545`

```ganache-cli --port 8545```

2. Deploy the contracts to ganache

```truffle migrate```

3. Run the tests

```truffle test```

### Deploying the contracts Public Testnets

Technically, this can be deployed in other networks (Polygon, BSC, Ropsten, etc), but for this project, I have deployed in `Rinkeby Testnet`.

You may use the same mnemonic for deploying the contract.  

Run the command below to derive the private key for your mnemonic.

```npx mnemonic-to-private-key "<your mnemonic phrase>"``` 

You may import it to metamask to keep track of the funds using the private key. 

A good faucet for the Rinkeby network can be accessed here: https://faucets.chain.link/rinkeby. Just put the wallet address to get funds.

To deploy, execute the migration through truffle.

```truffle migrate --network=rinkeby```

```
Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



Starting migrations...
======================
> Network name:    'rinkeby'
> Network id:      4
> Block gas limit: 30000000 (0x1c9c380)


1_initial_migration.js
======================

   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0xe8165adb62653878dab79798793104f05f749153f480ef03fecc353a091e3987
   > Blocks: 2            Seconds: 20
   > contract address:    0xbe5a79B3CAc98Cd4bEa77553926a08C40368eA6a
   > block number:        9722701
   > block timestamp:     1638123901
   > account:             0x043fE6384c421141ec2D2B79ee4FbacebeF4907c
   > balance:             0.09951689249806757
   > gas used:            193243 (0x2f2db)
   > gas price:           2.50000001 gwei
   > value sent:          0 ETH
   > total cost:          0.00048310750193243 ETH

   Pausing for 2 confirmations...
   ------------------------------
   > confirmation number: 1 (block: 9722702)
   > confirmation number: 2 (block: 9722703)

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.00048310750193243 ETH


2_deploy_NiftyFiftyNft.js
=========================

   Deploying 'NiftyFiftyNFT'
   -------------------------
   > transaction hash:    0x642294807e4feab1e33aba3abb8452de63517237fb78d02a6be25102393893b7
   > Blocks: 1            Seconds: 12
   > contract address:    0xA63eBd72D4f8021EBD40E7b734Bb0c9616a96b50
   > block number:        9722705
   > block timestamp:     1638123961
   > account:             0x043fE6384c421141ec2D2B79ee4FbacebeF4907c
   > balance:             0.191472074962670373
   > gas used:            3172189 (0x30675d)
   > gas price:           2.500000011 gwei
   > value sent:          0 ETH
   > total cost:          0.007930472534894079 ETH

   Pausing for 2 confirmations...
   ------------------------------
   > confirmation number: 1 (block: 9722706)
   > confirmation number: 2 (block: 9722707)

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.007930472534894079 ETH


Summary
=======
> Total deployments:   2
> Final cost:          0.008413580036826509 ETH

```

After the deployment get the contract address for the deployed NiftyFiftyNFT smart contract and update the Angular DApp contract in `src/environments/env.ts` file.

# DApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.4.

For this project, I wanted to play around and learn about the Moralis SDK. For this project, I used Moralis SDK which requires a server endpoint to be created and accessed by the DApp. Get your Moralis server URL and key here - https://moralis.io/.

## Configure the DApp

Secure the Application ID and Moralis Server URL from `https://moralis.io`

Update the file in `src/environments/env.ts` to .

```typescript
export const defaultEnv: Env = {
  production: false,
  env: 'dev',
  network: {
    chain: 'rinkeby',
    moralis: {
      appId: {MORALIS_APPLICATION_ID},
      serverUrl: {MORALIS_SERVER_URL}
    },
    contractAddresses: {
        // modify as needed if you want to deploy into a different network
        // this should contain the NiftyFiftyNFT contract address
        niftyFifty: '0xA63eBd72D4f8021EBD40E7b734Bb0c9616a96b50'
    }
  }
};
```

## Run the DApp locally

Install project dependencies (if you have not done this yet).

```npm install```

For some installations, you may encounter `Error: error:0308010C:digital envelope routines::unsupported`. To fix this issue, export the environment variable below.

```export NODE_OPTIONS=--openssl-legacy-provider```

Configure

Run the DApp locally

```npm start```


Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.


## DApp deployed to Rinkeby Testnet

https://niftyfifty.jescueta.com/


