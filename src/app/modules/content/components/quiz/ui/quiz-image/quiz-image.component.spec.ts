import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizImageComponent } from './quiz-image.component';

describe('QuizImageComponent', () => {
  let component: QuizImageComponent;
  let fixture: ComponentFixture<QuizImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizImageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
