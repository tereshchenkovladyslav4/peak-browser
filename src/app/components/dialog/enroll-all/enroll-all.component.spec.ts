import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrollAllComponent } from './enroll-all.component';

describe('EnrollAllComponent', () => {
  let component: EnrollAllComponent;
  let fixture: ComponentFixture<EnrollAllComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnrollAllComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnrollAllComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
