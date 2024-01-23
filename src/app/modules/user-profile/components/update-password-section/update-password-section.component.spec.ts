import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePasswordSectionComponent } from './update-password-section.component';

describe('UpdatePasswordSectionComponent', () => {
  let component: UpdatePasswordSectionComponent;
  let fixture: ComponentFixture<UpdatePasswordSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdatePasswordSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePasswordSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
