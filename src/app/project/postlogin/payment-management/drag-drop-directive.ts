import {
    Directive,
    HostBinding,
    HostListener,
    Output,
    EventEmitter,
    Input
  } from "@angular/core";
  import {DomSanitizer} from '@angular/platform-browser';
import { ToastrService } from "ngx-toastr";
  
  export interface FileHandle {
    file: File
  }
  
  @Directive({
    selector: "[appDrag]"
  })
  export class DragDirective {
    @Output() files: EventEmitter<any> = new EventEmitter();
    @Input() disabled: boolean = false;
    @HostBinding("style.background") private background = "#eee";
  
    constructor(private sanitizer: DomSanitizer,public toastr:ToastrService) { }
  
    @HostListener("dragover", ["$event"]) public onDragOver(evt: DragEvent) {
      evt.preventDefault();
      evt.stopPropagation();
      this.background = "#999";
    }
  
    @HostListener("dragleave", ["$event"]) public onDragLeave(evt: DragEvent) {
      evt.preventDefault();
      evt.stopPropagation();
      this.background = "#eee";
    }
  
    @HostListener('drop', ['$event']) public onDrop(evt: DragEvent) {
      evt.preventDefault();
      evt.stopPropagation();
      if(this.disabled){
        this.toastr.error("You dont have permission to change file");
      }
      else{
      this.background = '#eee';
    
      const file = evt.dataTransfer.files[0];
      const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      
      this.files.emit(file);
      }
      
    }
  }
  