import { HttpClient } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/service/api.service';
import { OrderManagementService } from '../../service/order-management.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
})
export class NotesListComponent implements OnInit {
  notesList: any[] = [];
  filterValue;
  public headers = [
    { name: 'NOTE TITLE',maxWidth:'300px',minWidth:'300px', prop: 'note_title', sortable: true },
    { name: 'NOTE DESCRIPTION', prop: 'description', sortable: true, maxWidth:'400px',minWidth:'250px' },
    {
      name: 'TRANSACTION CATEGORY',
      prop: 'transaction_categories',
      sortable: true,
    },
    { name: 'CREATED', prop: 'createdAt', sortable: true, maxWidth:'250px',minWidth:'250px' },
    { name: 'LAST MODIFIED', prop: 'lastModified', sortable: true, maxWidth:'250px',minWidth:'250px' },
    { name: 'ACTIONS', prop: 'action', type: 'menu' },
  ];

  public tabelActions: any = [
    {
      label: 'Edit',
      icon: 'edit',
    },
  ];
  pageIndex: any = 0;
  pageS = 20;
  sortQuery: any = 'audit.lastModifiedDate,desc';

  @Input() role: any;

  public pageConfig: any = {
    itemPerPage: 20,
    sizeOption: [20, 50, 75, 100],
  };
  constructor(
    public router: Router,
    public route: ActivatedRoute,
    public apiService: ApiService,
    public http: HttpClient,
    public ordermanagementService: OrderManagementService
  ) {}

  ngOnInit() {
    this.loadNotesList();
  }

  onActionClick(event) {
    switch (event.action.label) {
      case 'Edit':
        if (event?.row?.id) {
          this.router.navigateByUrl(
            'home/system-config/order-management/notes/edit/' + event.row.id
          );
        }
        break;

      case 'Copy':
        break;

      case 'Download':
        break;
    }
  }

  onInput(filterValue: string): void {
    this.filterValue = filterValue;
  }

  editRecord(event): void {
    this.router.navigateByUrl(
      'home/system-config/order-management/notes/edit/' + event.data.id
    );
  }

  sort(event) {
    if (event.active == 'description') {
      this.sortQuery = event.active + ',' + event.direction;
      this.loadNotesList();
    }
  }

  pageChange(event) {
    this.pageIndex = event.pageIndex;
    this.pageS = event.pageSize;
    this.loadNotesList();
  }

  addNote() {
    this.router.navigateByUrl('/home/system-config/order-management/notes/add');
  }

  loadNotesList() {
    this.ordermanagementService.getAllNotes().subscribe((res) => {
      this.notesList = res;
      this.notesList = this.notesList.map((item) => {
        return {
          ...item,
          lastModified:
            'By ' +
            item?.audit?.lastModifiedByName +
            ' on ' +
            (item?.audit?.lastModifiedDate
              ? new Date(item.audit.lastModifiedDate).toDateString()
              : 'N/A'),
          createdAt:
            'By ' +
            item?.audit?.createdByName +
            ' on ' +
            (item?.audit?.createdDate
              ? new Date(item.audit.createdDate).toDateString()
              : 'N/A'),
        };
      });
      this.pageConfig.totalElements = res?.totalElements;
      this.pageConfig.totalPages = res?.totalPages;
    });
  }
}
