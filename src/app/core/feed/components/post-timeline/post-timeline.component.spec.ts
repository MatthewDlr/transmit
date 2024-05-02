import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostTimelineComponent } from './post-timeline.component';

describe('PostTimelineComponent', () => {
  let component: PostTimelineComponent;
  let fixture: ComponentFixture<PostTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostTimelineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PostTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
