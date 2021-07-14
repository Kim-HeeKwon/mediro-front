import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {InService} from '../in.service';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {SelectionModel} from '@angular/cdk/collections';
import {ActivatedRoute, Router} from "@angular/router";
import {TableConfig, TableStyle} from "@teamplat/components/common-table/common-table.types";


@Component({
    selector     : 'in-header',
    templateUrl  : './in-header.component.html',
    styleUrls    : ['./in-header.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class InHeaderComponent implements OnInit, OnDestroy
{
    showMobile$: Observable<boolean>;
    showMobile: boolean = false;

    sizeLeft: number = 60;
    sizeRight: number = 40;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    itemsCount: number = 1;
    itemsTableColumns: string[] = ['select','name', 'sku', 'price'];
    selectedItemsForm: FormGroup;

    selection = new SelectionModel<any>(true, []);

    testData: any[] = [
        {name: 'name1', sku: 'sku1', price:1},
        {name: 'name2', sku: 'sku2', price:2},
        {name: 'name3', sku: 'sku3', price:3},
        {name: 'name4', sku: 'sku4', price:4},
        {name: 'name5', sku: 'sku5', price:5},
        {name: 'name6', sku: 'sku6', price:6},
        {name: 'name7', sku: 'sku7', price:7},
        {name: 'name8', sku: 'sku8', price:8},
        {name: 'name9', sku: 'sku9', price:9},
    ];

    inHeaderTableStyle: TableStyle = new TableStyle();
    inHeaderTable: TableConfig[] = [
        {headerText : '작성일' , dataField : 'createDate', display : false},
        {headerText : '입고일' , dataField : 'ibDate', width: 80, display : true, type: 'text'},
        {headerText : '입고번호' , dataField : 'ibNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급사' , dataField : 'account', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '상태' , dataField : 'status', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '입고수량' , dataField : 'totalCnt', width: 50, display : true, type: 'number', style: this.inHeaderTableStyle.textAlign.center},
        {headerText : '구매가' , dataField : 'totalPrice', width: 50, display : true, type: 'number', style: this.inHeaderTableStyle.textAlign.center},
        {headerText : '입고명세서' , dataField : 'outPage', width: 100, display : true, type: 'text'},
    ];

    /**
     * Constructor
     */
    constructor(
        private _inService: InService,
        private _route: ActivatedRoute,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // 모바일에서 페이지 나누기 옵션
        this.showMobile$ = this._inService.showMobile$;

        this._inService.showMobile$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((showMobile: any) => {
                this.showMobile = showMobile;
                console.log(showMobile);
                if(showMobile){
                    this.sizeLeft = 60;
                    this.sizeRight = 40;
                }else{
                    this.sizeLeft = 60;
                    this.sizeRight = 40;
                }
            });
    }

    /**
     * On Destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    clickTest(): void {
        this._inService.setShowMobile(true);
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.testData.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.selection.select(...this.testData);
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    rowClick(row?: any): void {
        this.selection.toggle(row);
        this._inService.setShowMobile(true);
        this._router.navigate(['in-out/in/inbox/1', row.price]);
        //this._router.snapshot.nav(['/product-list'], {  queryParams: {  page: pageNum } });
    }
}
