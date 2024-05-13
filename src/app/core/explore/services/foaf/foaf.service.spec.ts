import { TestBed } from '@angular/core/testing';

import { FoafService } from './foaf.service';

describe('FoafService', () => {
  let service: FoafService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FoafService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
