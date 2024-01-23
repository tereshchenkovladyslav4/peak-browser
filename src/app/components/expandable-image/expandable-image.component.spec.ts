import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpandableImageComponent } from './expandable-image.component';

describe('ExpandableImageComponent', () => {
  let component: ExpandableImageComponent;
  let fixture: ComponentFixture<ExpandableImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ ExpandableImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpandableImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
