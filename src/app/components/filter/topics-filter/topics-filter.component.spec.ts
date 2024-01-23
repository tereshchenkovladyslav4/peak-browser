import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicsFilterComponent } from './topics-filter.component';

describe('TopicsFilterComponent', () => {
  let component: TopicsFilterComponent;
  let fixture: ComponentFixture<TopicsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TopicsFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
