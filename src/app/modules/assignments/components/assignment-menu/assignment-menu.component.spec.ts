import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentMenuComponent } from './assignment-menu.component';
import { TranslationService } from '../../../../services/translation.service';
import { BookmarksService } from '../../../../services/bookmarks/bookmarks.service';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';
import { DialogService } from '../../../../services/dialog/dialog.service';
import { Router } from '@angular/router';
import { Assignment } from '../../../../resources/models/assignment';

describe('AssignmentMenuComponent', () => {
  let component: AssignmentMenuComponent;
  let fixture: ComponentFixture<AssignmentMenuComponent>;
  let translationServiceMock: jest.Mocked<TranslationService>;
  let bookmarksServiceMock: jest.Mocked<BookmarksService>;
  let toastrServiceMock: jest.Mocked<ToastrService>;
  let storeMock: jest.Mocked<Store>;
  let dialogService: DialogService;

  beforeEach(async () => {
    translationServiceMock = {
      getTranslationFileData: jest.fn().mockImplementation((key: string) => {
        return key;
      }),
    } as unknown as jest.Mocked<TranslationService>;

    bookmarksServiceMock = {} as unknown as jest.Mocked<BookmarksService>;

    toastrServiceMock = {} as unknown as jest.Mocked<ToastrService>;

    storeMock = { dispatch: jest.fn().mockReturnValue(of({})) } as unknown as jest.Mocked<Store>;

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [
        { provide: TranslationService, useValue: translationServiceMock },
        { provide: BookmarksService, useValue: bookmarksServiceMock },
        { provide: ToastrService, useValue: toastrServiceMock },
        { provide: Store, useValue: storeMock },
        DialogService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssignmentMenuComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dropdownItems in ngOnInit', () => {
    component.ngOnInit();
    expect(component.dropdownItems.length).toEqual(13);
  });

  it('should navigate to learning path on resume()', () => {
    const router: Router = TestBed.inject(Router);
    const routerSpy = jest.spyOn(router, 'navigate');
    component.assignment = { learningPath: { id: '123' } } as Assignment;
    component.ngOnInit();
    const dropdownAction = component.dropdownItems?.[0]?.action;
    dropdownAction();
    expect(routerSpy).toHaveBeenCalledWith(['/content/learning-path', '123'], { queryParams: { r: true } });
  });

  it('should navigate to learning path on goToLearningPath()', () => {
    const router: Router = TestBed.inject(Router);
    const routerSpy = jest.spyOn(router, 'navigate');
    component.assignment = { learningPath: { id: '123' } } as Assignment;
    component.ngOnInit();
    const dropdownAction = component.dropdownItems?.[1]?.action;
    dropdownAction();
    expect(routerSpy).toHaveBeenCalledWith(['/content', '123']);
  });

  it('should open complete dialog and complete assignment on openCompleteDialog()', () => {
    const openSpy = jest.spyOn(dialogService, 'open');
    component.assignment = { progress: 100, course: { name: 'Test Course' } } as Assignment;
    component.ngOnInit();
    const dropdownAction = component.dropdownItems?.[2]?.action;
    dropdownAction();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should open change due date dialog on openChangeDueDateDialog()', () => {
    const openSpy = jest.spyOn(dialogService, 'open');
    component.ngOnInit();
    const dropdownAction = component.dropdownItems?.[3]?.action;
    dropdownAction();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should open change due date dialog on openDropCourseDialog()', () => {
    const openSpy = jest.spyOn(dialogService, 'open');
    component.assignment = { progress: 100, course: { name: 'Test Course' } } as Assignment;
    component.ngOnInit();
    const dropdownAction = component.dropdownItems?.[11]?.action;
    dropdownAction();
    expect(openSpy).toHaveBeenCalled();
  });

  it('should open change due date dialog on openDropLPDialog()', () => {
    const openSpy = jest.spyOn(dialogService, 'open');
    component.assignment = { progress: 100, learningPath: { name: 'Test Learning Path' } } as Assignment;
    component.ngOnInit();
    const dropdownAction = component.dropdownItems?.[12]?.action;
    dropdownAction();
    expect(openSpy).toHaveBeenCalled();
  });
});
