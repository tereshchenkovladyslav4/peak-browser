import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KeywordsFilterComponent } from './keywords-filter.component';

describe('KeywordsFilterComponent', () => {
  let component: KeywordsFilterComponent;
  let fixture: ComponentFixture<KeywordsFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KeywordsFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KeywordsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
