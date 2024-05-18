import { TestBed } from '@angular/core/testing';

import { PostSuggestionService } from './post-suggestion.service';

describe('PostSuggestionService', () => {
  let service: PostSuggestionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostSuggestionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
