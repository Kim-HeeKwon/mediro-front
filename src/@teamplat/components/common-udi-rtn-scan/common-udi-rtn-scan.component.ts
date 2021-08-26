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
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../common-table/common-table.types';
import {InBoundDetailPagenations, InBoundDetails} from './common-udi-rtn-scan.types';
import {CommonCode, FuseUtilsService} from '../../services/utils';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, Validators} from '@angular/forms';
import {CodeStore} from '../../../app/core/common-code/state/code.store';
import {FunctionService} from '../../services/function';
import {PopupStore} from '../../../app/core/common-popup/state/popup.store';
import {takeUntil} from 'rxjs/operators';
import {CommonScanComponent} from '../common-scan';
import {CommonUdiRtnScanService} from './common-udi-rtn-scan.service';

@Component({
    selector: 'app-common-udi-rtn-scan',
    templateUrl: './common-udi-rtn-scan.component.html',
    styleUrls: ['./common-udi-rtn-scan.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class CommonUdiRtnScanComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _outBoundDetailSort: MatSort;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    selection = new SelectionModel<any>(true, []);
    isLoading: boolean = false;
    inboundDetailsCount: number = 0;
    inBoundDetails$ = new Observable<InBoundDetails[]>();
    inBoundDetailsTableStyle: TableStyle = new TableStyle();
    inBoundDetailsTable: TableConfig[] = [
        {headerText : '라인번호' , dataField : 'ibLineNo', display : false},
        {headerText : '품목코드' , dataField : 'itemCd', width: 80, display : false, disabled : true, type: 'text'},
        {headerText : '품목명' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '입고대상수량' , dataField : 'ibExpQty', width: 100, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '수량' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '입고수량' , dataField : 'ibQty', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '보고 기준월' , dataField : 'suplyContStdmt', width: 100, display : true, type: 'month',max: '9999-12-31'},
        {headerText : '공급 형태' , dataField : 'suplyTypeCode', width: 100, display : false, type: 'text',combo: true},
        {headerText : 'UDI Code' , dataField : 'udiCode', width: 100, display : true, type: 'text'},
        //{headerText : 'UDI-DI 일련번호' , dataField : 'udiDiSeq', width: 100, display : true, type: 'text'},
        {headerText : '비고' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    inBoundDetailsTableColumns: string[] = [
        'select',
        'no',
        'ibLineNo',
        'itemCd',
        'itemNm',
        'ibExpQty',
        'qty',
        'ibQty',
        'suplyContStdmt',
        'suplyTypeCode',
        'udiCode',
        //'udiDiSeq',
        'remarkDetail',
    ];
    headerText: string = 'UDI 스캔';
    inBoundData: any;
    isMobile: boolean = false;
    suplyTypeCode: CommonCode[] = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    filterList: string[];
    inBoundDetailPagenation: InBoundDetailPagenations | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _matDialog: MatDialog,
        public _matDialogRef: MatDialogRef<CommonUdiRtnScanComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _commonScanService: CommonUdiRtnScanService,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore,
        private dialog: MatDialog,
        private readonly breakpointObserver: BreakpointObserver
        //private commonAlertDialog: CommonAlertService
    ) {
        this.filterList = ['ALL'];
        this.inBoundData = data.detail;
        this.suplyTypeCode = _utilService.commonValueFilter(_codeStore.getValue().data,'SUPLYTYPECODE',this.filterList);
        this._commonScanService.setData(this.inBoundData);
    }

    ngOnInit(): void {
        this.inBoundDetails$ = this._commonScanService.inBoundDetails$;
        this._commonScanService.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail: any) => {
                // Update the counts
                if(inBoundDetail !== null){
                    this.inboundDetailsCount = inBoundDetail.length;
                }else{
                    inBoundDetail = this.inBoundData;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._commonScanService.inBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetailPagenation: InBoundDetailPagenations) => {
                // Update the pagination
                if(inBoundDetailPagenation !== null){
                    this.inBoundDetailPagenation = inBoundDetailPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        this.inBoundDetails$ = this._commonScanService.inBoundDetails$;
        this._commonScanService.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail: any) => {
                // Update the counts
                if(inBoundDetail !== null){
                    this.inboundDetailsCount = inBoundDetail.length;
                }else{
                    inBoundDetail = this.inBoundData;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._commonScanService.inBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetailPagenation: InBoundDetailPagenations) => {
                // Update the pagination
                if(inBoundDetailPagenation !== null){
                    this.inBoundDetailPagenation = inBoundDetailPagenation;
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
        const numRows = this.inboundDetailsCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                this.selection.select(...inBoundDetail);
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
                    confirmText : '입고',
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
    inBound() {
        let inBoundData;
        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                inBoundData = inBoundDetail;
            });
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for(let i=0; i<inBoundData.length; i++){
            if(inBoundData[i].udiCode === undefined){
                this._functionService.cfn_alert('UDI Code는 필수값 입니다. 품목코드 : ' + inBoundData[i].itemCd);
                return;
            }

            if(inBoundData[i].suplyContStdmt === undefined){
                this._functionService.cfn_alert('보고 기준월은 필수값 입니다. 품목코드 : ' + inBoundData[i].itemCd);
                return;
            }
            if(inBoundData[i].suplyContStdmt === null){
                this._functionService.cfn_alert('보고 기준월은 필수값 입니다. 품목코드 : ' + inBoundData[i].itemCd);
                return;
            }
            /*if(inBoundData[i].suplyTypeCode === undefined){
                this._functionService.cfn_alert('공급형태는 필수값 입니다. 품목코드 : ' + inBoundData[i].itemCd);
                return;
            }*/
            /*if(inBoundData[i].suplyTypeCode === null){
                this._functionService.cfn_alert('공급형태는 필수값 입니다. 품목코드 : ' + inBoundData[i].itemCd);
                return;
            }*/

            if(inBoundData[i].obExpQty < (Number(inBoundData[i].qty) + inBoundData[i].obQty)){
                this._functionService.cfn_alert('수량이 초과되었습니다. 품목코드 : ' + inBoundData[i].itemCd);
                return;
            }
        }

        this._matDialogRef.close(inBoundData);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'suplyTypeCode'){
            combo = this.suplyTypeCode;
        }
        return combo;
    }
}