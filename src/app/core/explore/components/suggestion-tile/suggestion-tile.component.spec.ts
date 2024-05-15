import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionTileComponent } from './suggestion-tile.component';

describe('SuggestionTileComponent', () => {
  let component: SuggestionTileComponent;
  let fixture: ComponentFixture<SuggestionTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionTileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuggestionTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
