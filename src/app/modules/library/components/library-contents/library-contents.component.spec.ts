import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryContentsComponent } from './library-contents.component';

describe('LibraryContentsComponent', () => {
  let component: LibraryContentsComponent;
  let fixture: ComponentFixture<LibraryContentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LibraryContentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibraryContentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
