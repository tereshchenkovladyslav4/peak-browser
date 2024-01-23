import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TooltipModule } from 'src/app/modules/tooltip/tooltip.module';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        TooltipModule
    ],
    selector: 'ep-topic-info',
    templateUrl: './topic-info.component.html',
    styleUrls: ['./topic-info.component.scss']
})
export class TopicInfoComponent {
    @Input() imageUrl: string;
    @Input() topicName: string;
    @Input() subtopicName: string;
    @Input() imgWidth: number = 30;
    @Input() topicFontSize: string = '0.75rem'
    @Input() subtopicFontSize: string = '0.625rem'
}
