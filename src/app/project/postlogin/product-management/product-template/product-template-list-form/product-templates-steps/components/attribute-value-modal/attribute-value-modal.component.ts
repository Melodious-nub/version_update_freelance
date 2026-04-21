import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/service/api.service';
import { SortFormArrayPipe } from 'src/app/shared/pipes/sort-formarray-sortorder.pipe';
@Component({
  selector: 'app-attribute-value-modal',
  templateUrl: './attribute-value-modal.component.html',
  styleUrls: ['./attribute-value-modal.component.scss']
})
export class AttributeValueModalComponent implements OnInit {
  public attributeValue = []
  public saveData: any
  labelTypeAttributeIds:any
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,public sortFormArray:SortFormArrayPipe, public dialogRef: MatDialogRef<AttributeValueModalComponent>,public apiService:ApiService) {

  }

  ngOnInit(): void {
    this.attributeValue = this.data.elementdata;
    this.labelTypeAttributeIds = this.data.labelTypeAttributeIds
  }

  drop(event: CdkDragDrop<string[]>) {
    // let labelIndex= this.attributeValue.find((it)=>it.get(''))
    // console.log(labelIndex)
    // if(event.currentIndex<labelIndex) {
    //   return
    // }
    if (event.previousContainer === event.container) {
      moveItemInArray(this.attributeValue, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }

    // this.save()
    // this.setLabelInsideArrangement()
  }

  getAttributeObjectdescriptionById(attributeId: any) {
    if (attributeId) {
      let selectedAttribute = this.apiService.allAttributes.find(
        (x) => x['id'] == attributeId
      );

      return selectedAttribute?.description;
    } else {
      return;
    }
  }



  save() {
    let k = 1;
      this.attributeValue.forEach(
        (element,i) => {
          if(!this.labelTypeAttributeIds.includes(element.get('attributeId').value)) {
            element.get('sortOrder').setValue(k);
            k++;
          }
        }
      );
  }

  setLabelInsideArrangement() {
    let index = this.attributeValue.findIndex(
      (item: any) =>
        this.getAttributeTypeObjectById(
          this.getAttributeObjectById(item.get('attributeId').value).attributeTypeId
        )?.description == 'Label'
    );
    this.attributeValue.forEach(
      (element,i) => {
        if(this.labelTypeAttributeIds.includes(element.get('attributeId').value)) {
          element.get('sortOrder').setValue(this.attributeValue[index].get('sortOrder').value + (i+1)/10);
        }
      }
    );
  }


  getAttributeObjectById(attributeId: any) {
    if (attributeId) {
      let selectedAttribute = this.apiService.allAttributes.find(
        (x) => x['id'] == attributeId
      );

      return selectedAttribute;
    } else {
      return;
    }
  }

  getAttributeTypeObjectById(attributeTypeId: any) {
    if (attributeTypeId) {
      let selectedAttribute = this.apiService.allAttributesTypes.find(
        (x) => x['id'] == attributeTypeId
      );
      return selectedAttribute;
    } else {
      return;
    }
  }
}
