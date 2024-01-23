import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublisherFilterComponent } from './publisher-filter.component';

describe('PublisherFilterComponent', () => {
  let component: PublisherFilterComponent;
  let fixture: ComponentFixture<PublisherFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PublisherFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublisherFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
