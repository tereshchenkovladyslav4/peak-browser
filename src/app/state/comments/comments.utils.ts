import { Comment } from "src/app/services/apiService/classFiles/class.content";

/**
 * mutates comments by sorting array in place and adding view property
 * @param comments array of comments from state
 */
export function getEnrichedComments(comments: Comment[], userId: string): (Comment & { canDelete: boolean, localeDate: string })[] {
  if (!comments) {
    return [];
  }

  return comments
    .sort(comparePublishDate)
    .map((c: Comment) => ({
      ...c,
      canDelete: c.userId === userId,
    } as Comment & { canDelete: boolean, localeDate: string }));
}

function comparePublishDate(a: Comment, b: Comment): number {
  if (a.publishDate > b.publishDate) {
    return -1;
  }

  if (a.publishDate < b.publishDate) {
    return 1;
  }

  return 0;
}
