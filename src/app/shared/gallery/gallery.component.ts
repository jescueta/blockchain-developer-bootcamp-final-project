import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import Moralis  from "moralis";
import { BehaviorSubject, Subject } from 'rxjs';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { IpfsUploadService } from 'src/app/pages/index/ipfs-upload.service';
import { NiftyFiftyContractService } from 'src/app/pages/index/nifty-fifty-contract.service';
import { environment } from 'src/environments/environment';
import User = Moralis.User;

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})

export class GalleryComponent implements OnInit {

  _currentUser: User;

  @Input()
  private userLogin: Subject<User>;

  nfts: any;


  constructor(private cdr: ChangeDetectorRef,
    private contractService:NiftyFiftyContractService,
    private formBuilder: FormBuilder){}

  ngOnInit(): void {
    this.getNfts();
  }



  getNfts(){
    this.userLogin.subscribe(async (user) => {
      this._currentUser = user;
      if (!user) {
        this.nfts = [];
        return;
      }
      const nfts = await Moralis.Web3.getNFTs({chain: environment.network.chain, address: user?.attributes['ethAddress']});
      this.nfts = [];
      nfts.forEach(async element => {
        element['metadata'] = await this.getMetadata(element);
        this.nfts.push(element)
      });

    });

  }


  async getMetadata(nft: any) {

    const data = await this.contractService.loadNftMetadata(nft).toPromise();
    return data;
  }

}
