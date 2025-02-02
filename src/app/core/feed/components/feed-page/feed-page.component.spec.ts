import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedPageComponent } from './feed-page.component';

describe('FeedPageComponent', () => {
  let component: FeedPageComponent;
  let fixture: ComponentFixture<FeedPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FeedPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
