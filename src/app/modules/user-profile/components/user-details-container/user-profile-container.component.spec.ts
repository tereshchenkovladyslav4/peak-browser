import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileContainerComponent } from './user-profile-container.component';

describe('UserProfileContainerComponent', () => {
  let component: UserProfileContainerComponent;
  let fixture: ComponentFixture<UserProfileContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserProfileContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfileContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
