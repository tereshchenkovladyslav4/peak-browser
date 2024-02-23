import { RIGHT_BUTTON_ICON_URL } from "src/app/modules/content/components/learning-path/course-nav-buttons/ui/course-nav-buttons-view.component";

export interface ButtonOptions {
  label: string;
  type: EpButtonType;
  shape: EpButtonShape;
  iconUri: string;
  iconPosition: EpButtonIconPosition;
  disabled: boolean;
}

export type EpButtonType = 'normal' | 'danger' | 'primary' | 'secondary' | 'green';
export type EpButtonShape = 'normal' | 'pill' | 'pilldropdown'
export type EpButtonIconPosition = 'left' | 'right'

// COURSE NAV BUTTON PRESETS
export const PreviousBtn: ButtonOptions = {
  label: 'Previous',
  type: 'normal',
  shape: 'normal',
  iconUri: '',
  iconPosition: 'left',
  disabled: false
}

export const NextBtn: ButtonOptions = {
  label: 'Next',
  type: 'secondary',
  shape: 'normal',
  iconUri: RIGHT_BUTTON_ICON_URL,
  iconPosition: 'right',
  disabled: false
}

export const NextQuestionButton: ButtonOptions = {
  label: 'Next Question',
  type: 'secondary',
  shape: 'pill',
  iconUri: RIGHT_BUTTON_ICON_URL,
  iconPosition: 'right',
  disabled: false
}

export const SubmitQuizBtn: ButtonOptions = {
  label: 'Finish Quiz',
  type: 'primary',
  shape: 'pill',
  iconUri: '',
  iconPosition: 'right',
  disabled: false
}

export const RetakeQuizBtn: ButtonOptions = {
  label: 'Retake Quiz',
  type: 'primary',
  shape: 'normal',
  iconUri: '',
  iconPosition: 'left',
  disabled: false
}

export const TakeQuizBtn: ButtonOptions = {
  label: 'Take Quiz',
  type: 'primary',
  shape: 'normal',
  iconUri: '',
  iconPosition: 'left',
  disabled: false
}

export const FinishCourseBtn: ButtonOptions = {
  label: 'Finish Course',
  type: 'primary',
  shape: 'normal',
  iconUri: '',
  iconPosition: 'left',
  disabled: false
}

export const DropCourseBtn: ButtonOptions = {
  label: 'Drop Course',
  type: 'danger',
  shape: 'normal',
  iconUri: '',
  iconPosition: 'left',
  disabled: false
}
