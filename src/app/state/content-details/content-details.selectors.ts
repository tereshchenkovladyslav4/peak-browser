import { createPropertySelectors, Selector } from "@ngxs/store";
import { ContentDetailsStateModel, ContentDetailsState } from "./content-details.state";

export class ContentDetailsSelectors {
  static slices = createPropertySelectors<ContentDetailsStateModel>(ContentDetailsState);

  @Selector()
  static lpName(state: ContentDetailsStateModel) {
    return state.contentDetails.name;
  }

  @Selector()
  static lpDescription(state: ContentDetailsStateModel) {
    return state.contentDetails.description;
  }
}