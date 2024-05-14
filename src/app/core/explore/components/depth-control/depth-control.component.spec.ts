import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepthControlComponent } from './depth-control.component';

describe('DepthControlComponent', () => {
  let component: DepthControlComponent;
  let fixture: ComponentFixture<DepthControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepthControlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DepthControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
