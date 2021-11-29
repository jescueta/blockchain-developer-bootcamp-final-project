export interface Env {
  production: boolean;
  env: 'dev' | 'prod';

  network: {
    chain: any;
    moralis: {
      /** Moralis Application ID */
      appId: string;
      /** Moralis Server URL */
      serverUrl: string;
    },
    contractAddresses: {
      /** contract address for NiftyFifty NFT **/
      niftyFifty: string;
    };
  };

}

export const defaultEnv: Env = {
  production: false,
    env: 'dev',
    network: {
      chain: 'rinkeby',
      moralis: {
        appId: 'MORALIS_APP_ID',
        serverUrl: 'MORALIS_SERVER_URL'
      },
      contractAddresses: {
        niftyFifty: '0x718692b5005cDecCcc0283682Bf77217C61e9198'
      }
    }

};
