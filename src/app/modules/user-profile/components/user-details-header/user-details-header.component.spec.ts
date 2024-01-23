import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailsHeaderComponent } from './user-details-header.component';

describe('UserDetailsHeaderComponent', () => {
  let component: UserDetailsHeaderComponent;
  let fixture: ComponentFixture<UserDetailsHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserDetailsHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetailsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
