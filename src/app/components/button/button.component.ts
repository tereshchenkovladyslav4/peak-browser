import { Component, Input, TemplateRef } from '@angular/core';
import { EpButtonIconPosition, EpButtonShape, EpButtonType } from 'src/app/resources/models/button/button';

@Component({
  selector: 'button[ep-button], a[ep-button]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  host: {
    // Apply bootstrap styles to host <button> element.
    class: 'btn',

    //buttonType
    '[class.btn-primary]': 'buttonType === "primary"',
    '[class.btn-light]': 'buttonType === "normal"',
    '[class.btn-danger]': 'buttonType === "danger"',
    '[class.btn-secondary]': 'buttonType === "secondary"',
    '[class.btn-green]': 'buttonType === "green"',

    //buttonShape
    '[class.pill]': 'buttonShape === "pill" || buttonShape === "pilldropdown"',

    // Provide default type as a convenience. Can be overriden
    // by specifying the type attribute on the host button.
    // (e.g. <button type="submit" ep-icon-button></button>)
    type: 'button',
  },
  // This won't work until Angular 15.
  // https://github.com/angular/angular/issues/8785#issuecomment-1183980050
  // Once it does, we can remove the directives from
  // the host <button> and dynamically create them
  // here since every button like uses them in the design.
  //hostDirectives: [
  //    EpTooltip,
  //    { directive: EpTooltipPlacement, inputs: ['top'] },
  //    { directive: EpTooltipArrow, inputs: [true] },
  //    { directive: EpTooltipTheme, inputs: ['dark'] }
  //]
})
export class EpButtonComponent {
  @Input() iconUri: string | undefined;
  @Input() svgTemplate: TemplateRef<any>;
  @Input() buttonType: EpButtonType = 'normal';
  @Input() buttonShape: EpButtonShape = 'normal';
  @Input() iconPosition: EpButtonIconPosition = 'left';
  @Input() gap: number; // gap between icon and text in px
}

export class EpButtonCodeGenerator {
  btnLabel: string = 'Button Text';
  btnDisable: boolean = false;

  btnType: EpButtonType = 'normal';
  btnTypeList: Array<string> = ['success', 'normal', 'danger', 'primary'];

  btnShape: EpButtonShape = 'normal';
  btnShapeList: Array<EpButtonShape> = ['normal', 'pill'];

  btnTitle: string = 'Tooltip Label';
  includeToolTip: boolean = true;

  btnIcon: string = '';
  btnIconSampleList: Array<string> = [
    '',
    'assets/img/associated-learning/plus.svg',
    'assets/images/Edit.svg',
    'assets/images/Trash.svg',
    'assets/images/Search.svg',
  ];

  getHtmlCode(): string {
    let tempBLabel = '';
    if (this.btnLabel != '') {
      tempBLabel = '\t' + this.btnLabel + '\n';
    }

    let attributes = '';

    if (this.btnDisable) {
      attributes += `\n\t[disabled]="${this.btnDisable}"`;
    }

    if (this.btnType === 'secondary' || this.btnType === 'danger' || this.btnType === 'primary') {
      attributes += `\n\tbuttonType="${this.btnType}"`;
    }

    if (this.btnShape === 'pill') {
      attributes += `\n\tbuttonShape="${this.btnShape}"`;
    }

    let iconUri = '';
    if (this.btnIcon != '') {
      attributes += `\n\ticonUri="${this.btnIcon}"`;
    }

    attributes += `\n\ttitle="${this.btnTitle}"`;

    if (this.includeToolTip) {
      attributes += '\n\tepTooltip epTooltipPlacement="top" epTooltipArrow="true" epTooltipTheme="dark"';
    }

    let buttonCode = `
<button ep-button${attributes}>
${tempBLabel}</button>`;

    return buttonCode.trimEnd();
  }
}
