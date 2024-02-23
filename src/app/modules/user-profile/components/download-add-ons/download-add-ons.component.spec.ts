import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadAddOnsComponent } from './download-add-ons.component';

describe('DownloadAddOnsComponent', () => {
  let component: DownloadAddOnsComponent;
  let fixture: ComponentFixture<DownloadAddOnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownloadAddOnsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadAddOnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
