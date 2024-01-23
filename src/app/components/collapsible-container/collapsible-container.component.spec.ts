import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollapsibleContainerComponent } from './collapsible-container.component';

describe('CollapasibleContainerComponent', () => {
  let component: CollapsibleContainerComponent;
  let fixture: ComponentFixture<CollapsibleContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollapsibleContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollapsibleContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
