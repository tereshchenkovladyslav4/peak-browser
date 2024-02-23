import { Router } from "@angular/router";

export function navigateToLPConsumptionPage(router: Router, learningPathId: string, resume: boolean = true): void {
  router.navigate(['/content/learning-path', learningPathId], {
    queryParams: {
      resume,
    },
  });
}
