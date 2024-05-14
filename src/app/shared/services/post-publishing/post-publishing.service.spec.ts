import { TestBed } from '@angular/core/testing';

import { PostPublishingService } from './post-publishing.service';

describe('PostPublishingService', () => {
  let service: PostPublishingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostPublishingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
