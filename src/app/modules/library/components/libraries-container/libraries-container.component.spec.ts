import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrariesContainerComponent } from './libraries-container.component';

describe('LibrariesContainerComponent', () => {
  let component: LibrariesContainerComponent;
  let fixture: ComponentFixture<LibrariesContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibrariesContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibrariesContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
