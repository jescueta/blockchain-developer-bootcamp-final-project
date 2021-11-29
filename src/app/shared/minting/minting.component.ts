import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import Moralis  from "moralis";
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subject } from 'rxjs';
import { IpfsUploadService } from 'src/app/pages/index/ipfs-upload.service';
import { NiftyFiftyContractService } from 'src/app/pages/index/nifty-fifty-contract.service';
import { environment } from 'src/environments/environment';
import User = Moralis.User;

@Component({
  selector: 'app-minting',
  templateUrl: './minting.component.html',
  styleUrls: ['./minting.component.scss']
})

export class MintingComponent implements OnInit {

  _currentUser: User;

  isMinting = false;

  tokenInput: number = 2;

  minting: Subject<boolean> = new BehaviorSubject(false);

  @Input()
  private userLogin: Subject<User>;

  erc20Tokens: any = []

  mintNftForm = this.formBuilder.group({
    name: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
    tokenAddress: new FormControl(null, [Validators.required]),
    amount: new FormControl(10, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]),
    file: new FormControl(null, [Validators.required]),
    fileSource: new FormControl(null, [Validators.required])
  });

  nfts: any;



  constructor(private cdr: ChangeDetectorRef,
    private ipfsUploadService:IpfsUploadService,
    private contractService:NiftyFiftyContractService,
    private formBuilder: FormBuilder,
    private toastrService: ToastrService){}

  ngOnInit(): void {
    this.getErc20Tokens();
    this.minting.subscribe((m) => {
      this.isMinting = m;
    })
  }

  setTokenInput(n: number) {
    this.tokenInput = n;
  }

  getErc20Tokens() {
    this.userLogin.subscribe(async (user) => {
      this._currentUser = user;
      if (!user) {
        this.erc20Tokens = [];
        return;
      }
      const erc20Tokens = await Moralis.Web3.getAllERC20({chain: environment.network.chain, address: user?.attributes['ethAddress']})
      this.erc20Tokens = erc20Tokens.filter((e) => e.contractType === 'ERC20');
    });
  }

  async handleFileInput(event: any) {
    const uploaded: any =await this.ipfsUploadService.upload(event.target.files[0]);
    console.info( (await this.ipfsUploadService.upload(event.target.files[0])).toJSON());
  }

  onFileChanged(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.mintNftForm.patchValue({
        file: file
      });
    }
  }

  onSubmit() {
    this.minting.next(true);
    this.ipfsUploadService.uploadFormToIpfs(this.mintNftForm).then(async (uploaded: any)=>{
      uploaded.ipfs();
      const form = this.mintNftForm;
      try{
        await this.contractService.mintToken(uploaded.ipfs(), form.get('tokenAddress').value, form.get('amount').value).then((response: any) => {
        this.minting.next(false);

        this.toastrService.info(`Your NFT has been successfuly minted with transaction hash +`+response.transactionHash, "Success");
        
        this.mintNftForm.reset();
        // TODO: handle successful mint
      });
      }catch(err) {
        this.minting.next(false);
        this.toastrService.error(err.message, "Unable to mint NFT")
      }
    });

  }

  async getMetadata(nft: any) {
    const data = await this.contractService.loadNftMetadata(nft).toPromise();
    return data;
  }

}
