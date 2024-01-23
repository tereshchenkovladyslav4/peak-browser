import { Pipe, PipeTransform } from '@angular/core';
import { ContentTypesService } from '../services/content-types.service';
import { ContentType } from '../resources/models/content';

@Pipe({
  name: 'epContentTypeIcon',
  pure: false,
})
export class ContentTypeIconPipe implements PipeTransform {
  constructor(private contentTypesService: ContentTypesService) {}

  transform(contentType: ContentType): string {
    return this.contentTypesService.getContentInfoIconUrl(contentType, null);
  }
}
