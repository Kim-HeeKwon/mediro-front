import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../animations';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FuseUtilsService} from '../../services/utils';
import {FormBuilder, Validators} from '@angular/forms';
import {CodeStore} from '../../../app/core/common-code/state/code.store';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';
import {merge, Observable, Subject} from 'rxjs';
import {OutBoundDetails, OutBoundDetailPagenations} from './common-udi-scan.types';
import {TableConfig, TableStyle} from '../common-table/common-table.types';
import {CommonUdiScanService} from './common-udi-scan.service';
import {SelectionModel} from '@angular/cdk/collections';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {MatTable} from '@angular/material/table';
import {CommonScanComponent} from '../common-scan';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {FunctionService} from '../../services/function';

@Component({
    selector: 'app-common-udi-scan',
    templateUrl: './common-udi-scan.component.html',
    styleUrls: ['./common-udi-scan.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonUdiScanComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _outBoundDetailSort: MatSort;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    selection = new SelectionModel<any>(true, []);
    isLoading: boolean = false;
    outboundDetailsCount: number = 0;
    outBoundDetails$ = new Observable<OutBoundDetails[]>();
    outBoundDetailsTableStyle: TableStyle = new TableStyle();
    outBoundDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'obLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : false, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '출고대상수량' , dataField : 'obExpQty', width: 50, display : true, disabled : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
        {headerText : '출고수량' , dataField : 'obQty', width: 60, display : true, disabled : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
        {headerText : '보고 기준월' , dataField : 'suplyContStdmt', width: 100, display : true, type: 'month',max: '9999-12-31'},
        {headerText : 'UDI Code' , dataField : 'udiCode', width: 100, display : true, type: 'text'},
        //{headerText : 'UDI-DI 일련번호' , dataField : 'udiDiSeq', width: 100, display : true, type: 'text'},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    outBoundDetailsTableColumns: string[] = [
        'select',
        'no',
        'obLineNo',
        'itemCd',
        'itemNm',
        'obExpQty',
        'qty',
        'obQty',
        'suplyContStdmt',
        'udiCode',
        //'udiDiSeq',
        'remarkDetail',
    ];
    headerText: string = 'UDI 스캔';
    outBoundData: any;
    isMobile: boolean = false;
    outBoundDetailPagenation: OutBoundDetailPagenations | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _matDialog: MatDialog,
        public _matDialogRef: MatDialogRef<CommonUdiScanComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _commonScanService: CommonUdiScanService,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore,
        private dialog: MatDialog,
        private readonly breakpointObserver: BreakpointObserver
        //private commonAlertDialog: CommonAlertService
    ) {
        this.outBoundData = data.outBoundDetail;
        this._commonScanService.setData(this.outBoundData);

    }
    ngOnInit(): void {

        //this._commonScanService.setData(this.outBoundData);

        this.outBoundDetails$ = this._commonScanService.outBoundDetails$;
        this._commonScanService.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail: any) => {
                // Update the counts
                if(outBoundDetail !== null){
                    this.outboundDetailsCount = outBoundDetail.length;
                }else{
                    outBoundDetail = this.outBoundData;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._commonScanService.outBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetailPagenation: OutBoundDetailPagenations) => {
                // Update the pagination
                if(outBoundDetailPagenation !== null){
                    this.outBoundDetailPagenation = outBoundDetailPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {
        this.outBoundDetails$ = this._commonScanService.outBoundDetails$;
        this._commonScanService.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail: any) => {
                // Update the counts
                if(outBoundDetail !== null){
                    this.outboundDetailsCount = outBoundDetail.length;
                }else{
                    outBoundDetail = this.outBoundData;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._commonScanService.outBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetailPagenation: OutBoundDetailPagenations) => {
                // Update the pagination
                if(outBoundDetailPagenation !== null){
                    this.outBoundDetailPagenation = outBoundDetailPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, outBoundDetail: any): any {
        return outBoundDetail.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateRowData(element, column: TableConfig, i) {
        if(element.flag !== 'C' || !element.flag){
            element.flag = 'U';
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.outboundDetailsCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) => {
                this.selection.select(...outBoundDetail);
            });
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableClear(){
        this._table.renderRows();
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {
        if(column.dataField === 'udiCode'){
            this.openScanPopup(element,column,i);
        }
    }

    openScanPopup(element, column: TableConfig, i): void {
        if(!this.isMobile){
            const d = this._matDialog.open(CommonScanComponent, {
                autoFocus: false,
                disableClose: true,
                data     : {
                },
            });
            d.afterClosed().subscribe((result) => {
                if(result !== undefined){
                    element.udiCode = result[0].udiDiCode;
                    this.tableClear();
                    this._changeDetectorRef.markForCheck();
                }
            });
        }else{
            const d = this._matDialog.open(CommonScanComponent, {
                data: {
                    confirmText : '출고',
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe((result) => {

                if(result !== undefined){
                    element.udiCode = result[0].udiDiCode;
                    this.tableClear();
                    this._changeDetectorRef.markForCheck();
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBound() {
        let outBoundData;
        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) => {
                outBoundData = outBoundDetail;
            });
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for(let i=0; i<outBoundData.length; i++){
            if(outBoundData[i].udiCode === undefined){
                this._functionService.cfn_alert('UDI Code는 필수값 입니다. 품목코드 : ' + outBoundData[i].itemCd);
                return;
            }

            if(outBoundData[i].suplyContStdmt === undefined){
                this._functionService.cfn_alert('보고 기준월은 필수값 입니다. 품목코드 : ' + outBoundData[i].itemCd);
                return;
            }

            if(outBoundData[i].obExpQty < (Number(outBoundData[i].qty) + outBoundData[i].obQty)){
                this._functionService.cfn_alert('수량이 초과되었습니다. 품목코드 : ' + outBoundData[i].itemCd);
                return;
            }
        }

        this._matDialogRef.close(outBoundData);
    }
}
