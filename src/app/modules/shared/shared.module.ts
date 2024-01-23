import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HighlightDirective } from 'src/app/directives/highlight.directive';
import { TranslatePipe } from 'src/app/pipes/translate.pipe';
import { EpButtonComponent } from '../../components/button/button.component';
import { AsPipe } from '../../pipes/as.pipe';
import { EpDatePipe } from '../../pipes/ep-date.pipe';
import { EpNumberToTimestampPipe } from '../../pipes/number-to-timestamp.pipe';
import { SpinnerComponent } from 'src/app/components/spinner/spinner.component';
import { ContentTypePipe } from 'src/app/pipes/content-type.pipe';
import { ContentTypeIconPipe } from 'src/app/pipes/content-type-icon.pipe';

const COMPONENTS = [EpButtonComponent];

const DIRECTIVES = [HighlightDirective];

const PIPES = [TranslatePipe, AsPipe, EpDatePipe, EpNumberToTimestampPipe, ContentTypePipe, ContentTypeIconPipe];

@NgModule({
  declarations: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
  imports: [CommonModule, SpinnerComponent],
  exports: [...COMPONENTS, ...DIRECTIVES, ...PIPES],
})
export class SharedModule {}
