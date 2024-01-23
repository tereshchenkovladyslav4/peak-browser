import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyDocumentMenuComponent } from './my-document-menu.component';

describe('MyDocumentMenuComponent', () => {
  let component: MyDocumentMenuComponent;
  let fixture: ComponentFixture<MyDocumentMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyDocumentMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyDocumentMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
