import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizResultsComponent } from './quiz-results.component';
import { CircleProgressComponent } from 'src/app/components/circle-progress/circle-progress.component';

describe('QuizResultsComponent', () => {
  let component: QuizResultsComponent;
  let fixture: ComponentFixture<QuizResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizResultsComponent ],
      imports: [CircleProgressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
