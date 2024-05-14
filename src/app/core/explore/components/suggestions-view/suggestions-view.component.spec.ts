import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionsViewComponent } from './suggestions-view.component';

describe('SuggestionsViewComponent', () => {
  let component: SuggestionsViewComponent;
  let fixture: ComponentFixture<SuggestionsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionsViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuggestionsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
