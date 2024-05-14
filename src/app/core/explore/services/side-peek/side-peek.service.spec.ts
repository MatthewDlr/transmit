import { TestBed } from '@angular/core/testing';

import { SidePeekService } from './side-peek.service';

describe('SidePeekService', () => {
  let service: SidePeekService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidePeekService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
