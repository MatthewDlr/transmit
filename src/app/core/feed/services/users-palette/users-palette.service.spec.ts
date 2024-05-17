import { TestBed } from '@angular/core/testing';

import { UsersPaletteService } from './users-palette.service';

describe('UsersPaletteService', () => {
  let service: UsersPaletteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersPaletteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
