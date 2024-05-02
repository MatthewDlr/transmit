import { TestBed } from '@angular/core/testing';

import { PostListService } from './post-extraction.service';

describe('PostExtractionService', () => {
  let service: PostListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
