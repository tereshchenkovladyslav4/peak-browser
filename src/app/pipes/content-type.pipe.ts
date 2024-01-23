import { Pipe, PipeTransform } from '@angular/core';
import { ContentTypesService } from '../services/content-types.service';
import { ContentType } from '../resources/models/content';

@Pipe({
  name: 'epContentType',
  pure: false,
})
export class ContentTypePipe implements PipeTransform {
  constructor(private contentTypesService: ContentTypesService) {}

  transform(contentType: ContentType): string {
    return this.contentTypesService.getContentInfoTranslationText(contentType, null);
  }
}
