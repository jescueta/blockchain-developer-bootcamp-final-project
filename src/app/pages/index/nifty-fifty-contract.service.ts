import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Moralis  from 'moralis';
import { execPath } from 'process';
import {BehaviorSubject, Observable, Observer, ReplaySubject, Subject} from 'rxjs';
import { environment } from 'src/environments/environment';
import Web3 from 'web3';
import * as abi from './NiftyFiftyNFT.json';
import {ToastrService} from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NiftyFiftyContractService {

  private web3: Web3;

  private account: any;

  private smartContract: any

  private ABI:any = abi;

  private accountChange: Subject<string> = new ReplaySubject(1);

  private netMap = {
    1: 'Ethereum Mainnet',
    3: 'Ropsten Testnet',
    4: 'Rinkeby Testnet',
    97: 'Binance SmartChain Testnet',
    80001: 'Polygon Mumbai Testnet'
  };

  private mintSubject = new ReplaySubject(1);

  public onMint(f: any): void {
    this.mintSubject.subscribe(f);
  }

  constructor(private http: HttpClient, private toastrService: ToastrService) {
    this.web3 = new Web3(Web3.givenProvider);

    const accountInterval = setInterval(() => {
      this.web3.eth.getAccounts((err, accs) => {
        if (this.account !== accs[0]) {
          console.info('Switching Account: ' + accs[0]);
          this.web3.eth.defaultAccount = accs[0];
          this.account = accs[0];
          this.accountChange.next(this.account);
        }
      });
    });

    this.smartContract = new this.web3.eth.Contract(this.ABI.abi, environment.network.contractAddresses.niftyFifty);
  }

  subscribeToAccountChanges(a: any): void {
    this.accountChange.subscribe(a);
  }

  async getNetwork() {
    return await this.web3.eth.net.getId();
  }

  getNetworkName(n: number): string {
    return this.netMap[n];
  }
  async getNftTokensOwned(artistWallet: string) {
    const tokens = await this.smartContract.methods.getTokenIds(artistWallet).call({from: this.account});
    const allNftUris = [];
    for (const tokensKey in tokens) {
     await allNftUris.push(this.getNftTokenUri(parseInt(tokens[tokensKey])));
    }
    const uris = await Promise.all(allNftUris);
    const response = [];
    for (const urisKey in uris) {
      response.push({token_id: tokens[urisKey], token_uri: uris[urisKey]});
    }
    return response;
  }

  async getNftTokenUri(tokenId: number) {
    return await this.smartContract.methods.tokenURI(tokenId).call({from: this.account});
  }

  async mintToken(_tokenUri: string, tokenAddress: string, amount: number) {
    try {
      const minted = await this.smartContract.methods.mint(tokenAddress, amount, _tokenUri)
          .send({from: this.account})
          .once('error', (err: any) => {
            this.toastrService.error(err.message);
          });
      this.mintSubject.next(minted);
      return minted;
    } catch (e){
      throw e;
    }
  }

  loadNftMetadata(nft: any): Observable<any> {
    return this.loadUrl(nft.token_uri);
  }

  loadUrl(url: any): Observable<any> {
    return this.http.get<any>(url);
  }
}
