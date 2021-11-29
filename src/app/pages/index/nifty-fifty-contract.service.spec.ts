import { TestBed } from '@angular/core/testing';

import { NiftyFiftyContractService } from './nifty-fifty-contract.service';

describe('NiftyFiftyContractService', () => {
  let service: NiftyFiftyContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NiftyFiftyContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
