import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import Moralis from "moralis";
import File = Moralis.File;

@Injectable({
  providedIn: 'root'
})
export class IpfsUploadService {

  constructor() {

  }

  async upload(toUpload: any) {

    return new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(toUpload);

      reader.onload = async () => {
        //me.modelvalue = reader.result;
        const b64: String = <String>reader.result;
        const file:any = new File("image.jpeg", {'base64': b64.split(',')[1]});
        let resolvedFile;
        resolve(await file.saveIPFS());
      }
    });

  }


  createMetadata(form: FormGroup, ipfsUrl: string): File {
    const metadata = {
      "name": form.get("name")?.value,
      "description": form.get("description")?.value,
      "image": ipfsUrl
    }
    return new File("metadata.json", {base64: btoa(JSON.stringify(metadata))});
  }

  async uploadFormToIpfs(form: FormGroup) { 
    // upload the image
    const uploadedImage = await this.upload(form.get('file')?.value); 
    const ipfsUri = uploadedImage.ipfs();

    // prepare metadata
    const metadataFile = this.createMetadata(form, ipfsUri);
    
    // upload metadata
    return await metadataFile.saveIPFS();
  }
}
