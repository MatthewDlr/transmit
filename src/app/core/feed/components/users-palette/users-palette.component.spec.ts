import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersPaletteComponent } from './users-palette.component';

describe('UsersPaletteComponent', () => {
  let component: UsersPaletteComponent;
  let fixture: ComponentFixture<UsersPaletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersPaletteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersPaletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
