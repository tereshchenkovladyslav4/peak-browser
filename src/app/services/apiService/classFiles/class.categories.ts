import { ContentType_T, DescriptionFilter_T } from "./class.content"

export enum CategoryOrderBy_T {
    alphabetical =0,
    usage =1
}

export enum CategoryFilter_T {
    tenantOnly =0,
    tenantAndSubscription =1
}
export class Category {
	categoryID: string = "";
	name: string = "";
	imageURL: string = "";
    parentID: string = "";
    subCategories: Array<Category> = [];
}

export class CategoryFilter {
    public limit: number = -1;
    public offset: number = 0;
    public catFilter: CategoryFilter_T = CategoryFilter_T.tenantAndSubscription;
}

export class CategoryContentFilter {
    public limit: number = -1;
    public offset: number = 0;
    public contentTypeFilter: ContentType_T[];
    public descriptionFilter: DescriptionFilter_T;
}