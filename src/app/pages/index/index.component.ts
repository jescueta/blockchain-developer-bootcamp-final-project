import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import Moralis  from "moralis";
import User = Moralis.User;
import {IpfsUploadService} from "./ipfs-upload.service";
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { NiftyFiftyContractService } from './nifty-fifty-contract.service';
import { env } from 'process';
import { ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AsyncSubject, ReplaySubject, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  uploaded = {url: ''};

  @ViewChild('fileInput')
  fileInput: any;

  public _currentUser?: User;

  public userLogin: Subject<User> = new ReplaySubject(1);

  currentSection = 'home';


  /**
   * Window scroll method
   */
  // tslint:disable-next-line: typedef
  windowScroll() {
    const navbar = document.getElementById('navbar');
    if (document.body.scrollTop > 40 || document.documentElement.scrollTop > 40) {
      navbar.style.backgroundColor = '#1a1a1a';
      navbar.style.padding = '15px 0px';
    }
    else {
      navbar.style.backgroundColor = '';
      navbar.style.padding = '20px';
    }
  }

  /**
   * Toggle navbar
   */
  toggleMenu() {
    document.getElementById('navbarCollapse').classList.toggle('show');
  }

  /**
   * Section changed method
   * @param sectionId specify the current sectionID
   */
  onSectionChange(sectionId: string) {
    this.currentSection = sectionId;
  }

  mintNftForm = this.formBuilder.group({
    name: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
    tokenAddress: new FormControl(null, [Validators.required]),
    amount: new FormControl(10, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]),
    file: new FormControl(null, [Validators.required]),
    fileSource: new FormControl(null, [Validators.required])
  });

  nfts: any = [];


  constructor(private cdr: ChangeDetectorRef,
    private ipfsUploadService:IpfsUploadService,
    private contractService:NiftyFiftyContractService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService){}

  ngOnInit(): void {
    // this.initMoralis(null);
    this.initMoralis(null);
    // this.contractService.subscribeToAccountChanges((s) => {
    //   this.login('metamask');
    // })
  }

  checkWeb3() {
    const eth = window['ethereum'];
    const installed = !eth || !eth.on;
    if (!eth || !eth.on) {
      this.toastrService.warning("Metamask is not installed. Please install Metamask.")
    }
    return !installed;
  }

  initMoralis(acct: string) {
    // this.logout();
    if (this.checkWeb3()) {
      Moralis.start({
        appId: environment.network.moralis.appId,
        serverUrl: environment.network.moralis.serverUrl,
      }).then(() => {
        console.info('Moralis has been initialised.');
      }).catch((e) => {
        this.toastrService.error('Unable to connect to the Moralis Server.');
      }).finally(() => {
        console.debug(Moralis.User.current());
        this.setLoggedInUser(Moralis.User.current());
      });
    }
  }

  login(provider: 'metamask' | 'walletconnect' = 'metamask') {
    (provider === 'metamask'
        ? Moralis.Web3.authenticate()
        : Moralis.Web3.authenticate({provider}))
        .then(async (loggedInUser) => {
          this.setLoggedInUser(loggedInUser);
          const network = await this.contractService.getNetwork();
          if (network === 4) {
            this.toastrService.info('Connected to ' + this.contractService.getNetworkName(await this.contractService.getNetwork()));
          } else {
            this.toastrService.warning('Connect to the ' + environment.network.chain + ' network instaed of the ' +
                this.contractService.getNetworkName(await this.contractService.getNetwork()));
          }

        })
        .catch((e) => {
          this.toastrService.error("Unable to connect to the Moralis server.");
          console.error(`Moralis '${provider}' login error:`, e)
        });
  }

  logout() {
    Moralis.User.logOut()
      .then((loggedOutUser) => console.info('logout', loggedOutUser))
      // Set user to undefined
      .then(() => this.setLoggedInUser(undefined))
      // Disconnect Web3 wallet
      .then(() => Moralis.Web3.cleanup())
      .catch((e) => console.error('Moralis logout error:', e));
  }

  async handleFileInput(event: any) {
    const uploaded: any =await this.ipfsUploadService.upload(event.target.files[0]);
    console.info( (await this.ipfsUploadService.upload(event.target.files[0])).toJSON());
  }


  async getMetadata(nft: any) {

    const data = await this.contractService.loadNftMetadata(nft).toPromise();
    return data;
  }




  async setLoggedInUser(user?: User) {
    this._currentUser = user;
    this.userLogin.next(user);
    this.cdr.detectChanges();
  }
}
function Observer<T>(): import("rxjs").Observer<string> {
  throw new Error('Function not implemented.');
}

