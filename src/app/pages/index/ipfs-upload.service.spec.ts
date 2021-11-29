import { TestBed } from '@angular/core/testing';

import { IpfsUploadService } from './ipfs-upload.service';

describe('IpfsUploadService', () => {
  let service: IpfsUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpfsUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
