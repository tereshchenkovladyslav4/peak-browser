import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateLanguageSectionComponent } from './update-language-section.component';

describe('UpdateLanguageSectionComponent', () => {
  let component: UpdateLanguageSectionComponent;
  let fixture: ComponentFixture<UpdateLanguageSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpdateLanguageSectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateLanguageSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
