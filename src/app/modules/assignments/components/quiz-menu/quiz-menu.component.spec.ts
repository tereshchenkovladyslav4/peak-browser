import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizMenuComponent } from './quiz-menu.component';

describe('QuizMenuComponent', () => {
  let component: QuizMenuComponent;
  let fixture: ComponentFixture<QuizMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
