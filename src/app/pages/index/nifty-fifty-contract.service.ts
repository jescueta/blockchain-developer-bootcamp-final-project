import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Moralis  from 'moralis';
import { execPath } from 'process';
import { BehaviorSubject, Observer, ReplaySubject, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import Web3 from 'web3';
import * as abi from './NiftyFiftyNFT.json';

@Injectable({
  providedIn: 'root'
})
export class NiftyFiftyContractService {

  private web3: Web3;

  private account: any;

  private smartContract: any

  private ABI:any = abi;

  private accountChange:Subject<string> = new ReplaySubject(1);

  private netMap = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten Testnet',
    4: 'Rinkeby Testnet',
    97: 'Binance SmartChain Testnet',
    80001: 'Polygon Mumbai Testnet'
  };

  constructor(private http:HttpClient) {
    this.web3 = new Web3(Web3.givenProvider)
    
    // this.web3.eth.getAccounts((err, accs) => {
    //   this.web3.eth.defaultAccount = accs[0];
    //   this.account = accs[0];
    // });

    var accountInterval = setInterval(() => {
      this.web3.eth.getAccounts((err, accs) => {
        if (this.account!== accs[0]) {
          console.info("Switching Account: "+ accs[0]);
          this.web3.eth.defaultAccount = accs[0];
          this.account = accs[0];
          this.accountChange.next(this.account);
        }
      });
    });

    this.smartContract = new this.web3.eth.Contract(this.ABI.abi, environment.network.contractAddresses.niftyFifty);
  }

  subscribeToAccountChanges(a: any) {
    this.accountChange.subscribe(a);
  }

  async getNetwork() {
    return await this.web3.eth.net.getId();
  }

  getNetworkName(n: number){
    return this.netMap[n];
  }

  async mintToken(_tokenUri: string, tokenAddress: string, amount: number) {
    try{
      return await this.smartContract.methods.mint(tokenAddress, amount, _tokenUri).send({ from: this.account})
      .once("error", (err: any) => {
        debugger;
        console.error(err);
      });
    } catch(e){
      throw e;
    }
  }

  loadNftMetadata(nft: any) {
    return this.http.get<any>(nft.token_uri);
  }
}
