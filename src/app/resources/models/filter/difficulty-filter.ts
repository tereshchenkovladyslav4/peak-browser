import {ContentDifficulty} from "../../enums/content-difficulty.enum";

export enum DifficultyString {
  NONE = 'NONE',
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export function mapContentDifficultyToDifficultyString(contentDifficulty: ContentDifficulty): DifficultyString {
  const map = {
    [ContentDifficulty.None]: DifficultyString.NONE,
    [ContentDifficulty.Beginner]: DifficultyString.BEGINNER,
    [ContentDifficulty.Intermediate]: DifficultyString.INTERMEDIATE,
    [ContentDifficulty.Advanced]: DifficultyString.ADVANCED,
  };

  return map[contentDifficulty];
}

export function mapDifficultyStringToContentDifficulty(contentTypeString: DifficultyString | string): ContentDifficulty {
  const map = {
    [DifficultyString.NONE]: ContentDifficulty.None,
    [DifficultyString.BEGINNER]: ContentDifficulty.Beginner,
    [DifficultyString.INTERMEDIATE]: ContentDifficulty.Intermediate,
    [DifficultyString.ADVANCED]: ContentDifficulty.Advanced,
  };

  return map[contentTypeString];
}
