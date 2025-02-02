import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPostsPageComponent } from './my-posts-page.component';

describe('MyPostsPageComponent', () => {
  let component: MyPostsPageComponent;
  let fixture: ComponentFixture<MyPostsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPostsPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyPostsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
