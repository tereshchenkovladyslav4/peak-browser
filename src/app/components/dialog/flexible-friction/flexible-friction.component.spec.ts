import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexibleFrictionComponent } from './flexible-friction.component';

describe('FlexibleFrictionComponent', () => {
  let component: FlexibleFrictionComponent;
  let fixture: ComponentFixture<FlexibleFrictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlexibleFrictionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlexibleFrictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
