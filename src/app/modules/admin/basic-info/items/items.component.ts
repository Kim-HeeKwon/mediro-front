import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, AfterViewInit, OnDestroy {

  isLoading: boolean = false;
  searchInputControl: FormControl = new FormControl();
  itemsCount: number = 1;
  itemsTableColumns: string[] = ['name','sku','price'];
  selectedItemsForm: FormGroup;

  formFieldHelpers: string[] = [''];

  items: any= [{'name':'test1','sku':'1','price':'1000'},
               {'name':'test2','sku':'2','price':'2000'},
               {'name':'test3','sku':'3','price':'3000'},
              {'name':'test4','sku':'4','price':'1000'},
              {'name':'test5','sku':'5','price':'2000'},
              {'name':'test6','sku':'6','price':'3000'},
              {'name':'test7','sku':'7','price':'1000'},
              {'name':'test8','sku':'8','price':'2000'},
              {'name':'test9','sku':'9','price':'3000'},
              {'name':'test10','sku':'10','price':'1000'},
              {'name':'test11','sku':'11','price':'2000'},
              {'name':'test12','sku':'12','price':'3000'}];

  pagination: any={
      endIndex: 9,
      lastPage: 3,
      length: 23,
      page: 0,
      size: 10,
      startIndex: 0
  };

  constructor(
      private _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
      // 아이템(상품) Form 생성
      this.selectedItemsForm = this._formBuilder.group({
          id               : [''],
          category         : [''],
          name             : ['', [Validators.required]],
          description      : [''],
          sku              : [''],
          barcode          : [''],
          brand            : [''],
          vendor           : [''],
          stock            : [''],
          reserved         : [''],
          cost             : [''],
          basePrice        : [''],
          taxPercent       : [''],
          price            : [''],
          weight           : [''],
          thumbnail        : [''],
          images           : [[]],
          currentImageIndex: [0], // Image index that is currently being viewed
          active           : [false]
      });
  }

    /**
     * After view init
     */
    ngAfterViewInit(): void
    {

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        //this._unsubscribeAll.next();
        //this._unsubscribeAll.complete();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }


}
