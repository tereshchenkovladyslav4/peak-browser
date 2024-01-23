import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapseButtonComponent } from './collapse-button.component';

describe('CollapseButtonComponent', () => {
  let component: CollapseButtonComponent;
  let fixture: ComponentFixture<CollapseButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CollapseButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollapseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
