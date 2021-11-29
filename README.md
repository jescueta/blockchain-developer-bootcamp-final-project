# Nifty Fifty NFT

## About

This is a simple DApp that allows users/artists to mint their own NFT and receive royalties as they transfer/sell/trade them. The artist can select any ERC20 token of choice, and the amount of royalty. Royalties will be shared, 50-50, with the contract owner for the first 10 transfers. And thenafter, the artist will receive the royalties in full for all subsequent transfers.

The smart contract leverages on ERC721 and ERC20 implementation from OpenZeppelin. This project uses Moralis for IPFS storage for the NFT image and metadata.

## Directory Structure

For simplicity, I created the project on the same root as the Angular project. So the truffle files are just located in different folders and both share the same `package.json`.

Below are the key files/folders to take note of for this project.

    .
    ├── contracts              # Solidity Contracts
    ├── migrations             # Truffle migration scripts
    ├── src                    # Angular app source files
    │   ├── environments
    │   │    └── env.ts        # Angular config file which contains the contract address and Moralis server details
    │   └── ...
    ├── test                   # Truffle test scripts
    ├── .env                   # File that needs to be created and contain the MNEMONIC environment variable for truffle
    ├── package.json           # Angular dependencies together with Truffle dependencies (in devDependencies)
    ├── README.md              # Main project documentation
    ├── truffle-config.js      # Truffle configuration
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

```MNEMONIC=<your mnemonic>```

Install all other dependencies

```npm install```

### Run the tests

Start ganache locally

```ganache-cli --port 8545```

Deploy the contracts to ganache

```truffle migrate```

Run the tests

```truffle test```

### Deploying the contracts public Testnets

Technically, this can be deployed in other networks (Polygon, BSC, Ropsten, etc), but for this project, I have deployed in Rinkeby.

You may use the same mnemonic for deploying the contract.  

You may run the command below to derive the private key for your mnemonic.

```npx mnemonic-to-private-key "<your mnemonic phrase>"``` 

You may import it to metamask to keep track of the funds using the private key. 

A good faucet for the Rinkeby network can be accessed here: https://faucets.chain.link/rinkeby. Just put the wallet address to get funds.

You may get a wallet provider either from Moralis or Infura and set the `RINKEBY_WALLET_PROVIDER` in the `.env` file.

To deploy, execute the migration through truffle.

```truffle migrate --network=rinkeby```

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


