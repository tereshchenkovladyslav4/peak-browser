import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownMenuContainerComponent } from './dropdown-menu-container.component';

describe('DropdownMenuContainerComponent', () => {
  let component: DropdownMenuContainerComponent;
  let fixture: ComponentFixture<DropdownMenuContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropdownMenuContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownMenuContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
