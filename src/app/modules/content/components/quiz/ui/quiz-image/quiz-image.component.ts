import { Component, Input } from '@angular/core';

@Component({
  selector: 'ep-quiz-image',
  templateUrl: './quiz-image.component.html',
  styleUrls: ['./quiz-image.component.scss']
})
export class QuizImageComponent {
  @Input() imageUrl: string;
}
