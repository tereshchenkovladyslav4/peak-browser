import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentFooterPrerequisitesComponent } from './content-footer-prerequisites.component';

describe('ContentFooterPrerequisitesComponent', () => {
  let component: ContentFooterPrerequisitesComponent;
  let fixture: ComponentFixture<ContentFooterPrerequisitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContentFooterPrerequisitesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContentFooterPrerequisitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
