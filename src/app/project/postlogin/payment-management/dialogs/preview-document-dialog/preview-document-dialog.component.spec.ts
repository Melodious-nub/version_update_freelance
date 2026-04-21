import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewDocumentDialogComponent } from './preview-document-dialog.component';

describe('PreviewDocumentDialogComponent', () => {
  let component: PreviewDocumentDialogComponent;
  let fixture: ComponentFixture<PreviewDocumentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewDocumentDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
