import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { FormsService } from 'src/app/service/forms.service';
import { ApiService } from 'src/app/service/api.service';
import { ToastrService } from 'ngx-toastr';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'add-raw-material',
  templateUrl: './add-raw-material-dialog.component.html',
  styleUrls: ['./add-raw-material-dialog.component.scss'],
})
export class AddRawMaterialDialogComponent implements OnInit {
  productForm: UntypedFormGroup;
  title: string = 'Add Raw Material';

  constructor(
    public dialogRef: MatDialogRef<AddRawMaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _fb: UntypedFormBuilder,
    private formsService: FormsService,
    public apiService: ApiService,
    public toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.productForm = this.formsService.createProductForm();

  }

  cancel(): void {
    this.dialogRef.close();
  }

  /**
   * Recursively cleans the data by removing attribute value objects with null attributeValue
   * This prevents backend NullPointerException when trying to call .scale() on null BigDecimal
   */
  private cleanAttributeValues(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanAttributeValues(item)).filter(item => item !== null && item !== undefined);
    }

    if (typeof obj === 'object') {
      const cleaned: any = {};
      
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          
          // Check if this is an attribute value object with null attributeValue
          if (typeof value === 'object' && value !== null && 'attributeValue' in value) {
            if (value.attributeValue === null || value.attributeValue === undefined) {
              // Skip this property entirely - don't include it in the cleaned object
              continue;
            } else {
              // Keep the attribute value object but clean any nested objects
              cleaned[key] = this.cleanAttributeValues(value);
            }
          } else {
            // Recursively clean nested objects
            const cleanedValue = this.cleanAttributeValues(value);
            // Only add if the cleaned value is not an empty object
            if (cleanedValue !== null && cleanedValue !== undefined) {
              if (typeof cleanedValue === 'object' && !Array.isArray(cleanedValue)) {
                if (Object.keys(cleanedValue).length > 0) {
                  cleaned[key] = cleanedValue;
                }
              } else {
                cleaned[key] = cleanedValue;
              }
            }
          }
        }
      }
      
      return cleaned;
    }

    return obj;
  }

  async save() {
    console.log(this.productForm.getRawValue());
    try {
      let data = this.productForm.getRawValue();
      
      // Clean null attribute values before sending
      // This removes objects with { attributeValue: null } to prevent backend NullPointerException
      data = this.cleanAttributeValues(data);
      
      // Ensure required fields are set
      data.status = 'PUBLISHED';
      data.isRawMaterial = true;
      
      // Ensure productMeta exists (required field)
      if (!data.productMeta) {
        data.productMeta = this.productForm.get('productMeta').value;
      }
      
      const res = await this.apiService.saveProductValues(data);
      this.dialogRef.close(true);
    } catch (err: any) {
      console.log(err);
      this.toastr.error(err?.error?.userMessage ?? 'Some Error Occurred');
    }
  }

    onDrop(event: CdkDragDrop<any[]>) {
    
    }
} 