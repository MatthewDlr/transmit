import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePeekComponent } from './side-peek.component';

describe('SidePeekComponent', () => {
  let component: SidePeekComponent;
  let fixture: ComponentFixture<SidePeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidePeekComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SidePeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
