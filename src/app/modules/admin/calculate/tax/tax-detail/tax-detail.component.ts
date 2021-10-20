import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatTable} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";
import {merge, Observable, Subject} from "rxjs";
import {StockHistory, StockHistoryPagenation} from "../../../stock/stock/stock.types";
import {InvoiceDetail, InvoiceDetailPagenation} from "../tax.types";
import {TableConfig} from "../../../../../../@teamplat/components/common-table/common-table.types";
import {StockService} from "../../../stock/stock/stock.service";
import {MatDialog} from "@angular/material/dialog";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {TaxService} from "../tax.service";
import {map, switchMap, takeUntil} from "rxjs/operators";

@Component({
    selector       : 'tax-detail',
    templateUrl    : './tax-detail.component.html',
    styleUrls: ['./tax-detail.component.scss'],
})
export class TaxDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _invoiceDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _invoiceDetailSort: MatSort;
    isLoading: boolean = false;
    selection = new SelectionModel<any>(true, []);
    invoiceDetailsCount: number = 0;
    invoiceDetails$ = new Observable<InvoiceDetail[]>();

    invoiceDetailsTable: TableConfig[] = [
        {headerText : '품목코드' , dataField : 'itemCd', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 120, display : true, disabled : true, type: 'text'},
        {headerText : '규격' , dataField : 'standard', width: 120, display : true, disabled : true, type: 'text'},
        {headerText : '수량' , dataField : 'qty', width: 100, display : true, disabled : true, type: 'number'},
        {headerText : '금액' , dataField : 'amt', width: 120, display : true, disabled : true, type: 'number'},
    ];

    stockHistorysTableColumns: string[] = [
        'itemCd',
        'itemNm',
        'standard',
        'qty',
        'amt'
    ];

    invoiceDetailPagenation: InvoiceDetailPagenation | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _taxService: TaxService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService
    ){
        this.invoiceDetails$ = this._taxService.invoiceDetails$;
        this._taxService.invoiceDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((invoiceDetail: any) => {
                // Update the counts
                if(invoiceDetail !== null){
                    this.invoiceDetailsCount = invoiceDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        this._taxService.invoiceDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((invoiceDetailPagenation: InvoiceDetailPagenation) => {
                // Update the pagination
                if(invoiceDetailPagenation !== null){
                    this.invoiceDetailPagenation = invoiceDetailPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        let invoiceHeader = null;

        this._taxService.invoiceHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((invoiceHeaders: any) => {
                // Update the pagination
                if(invoiceHeader !== null){
                    invoiceHeader = invoiceHeaders;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if(invoiceHeader === null){
            invoiceHeader = {};
        }

        if(this._invoiceDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._invoiceDetailSort.sortChange, this._invoiceDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._taxService.getDetail(this._invoiceDetailPagenator.pageIndex, this._invoiceDetailPagenator.pageSize, this._invoiceDetailSort.active, this._invoiceDetailSort.direction, invoiceHeader);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, invoiceDetail: any): any {
        return invoiceDetail.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        // if(column.dataField === 'chgType'){
        // }
        return combo;
    }
}
