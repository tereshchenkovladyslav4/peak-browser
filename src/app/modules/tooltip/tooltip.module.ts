import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { TooltipComponent } from "src/app/components/tooltip/tooltip.component";
import { TooltipDirective } from "src/app/directives/tooltip.directive";

@NgModule({
  declarations: [
    TooltipComponent,
    TooltipDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
      TooltipDirective
  ]
})
export class TooltipModule {}