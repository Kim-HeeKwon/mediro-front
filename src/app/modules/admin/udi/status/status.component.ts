import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {SupplyStatus, SupplyStatusPagenation} from './status.types';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {StatusService} from './status.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-supply-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;
    selection = new SelectionModel<any>(true, []);
    supplyStatus$: Observable<SupplyStatus[]>;
    supplyStatusPagenation: SupplyStatusPagenation | null = null;

    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    isLoading: boolean = false;
    supplyStatusCount: number = 0;
    suplyFlagCode: CommonCode[] = null;
    mFlag: CommonCode[] = null;
    udiFlag: CommonCode[] = null;
    suplyTypeCode: CommonCode[] = null;

    supplyStatusTableStyle: TableStyle = new TableStyle();
    supplyStatusTable: TableConfig[] = [
        {headerText : '생성여부' , dataField : 'mflag', width: 100, display : true, disabled : true, type: 'text',combo: true},
        {headerText : 'serialkey' , dataField : 'serialkey', width: 80, display : false, disabled : true, type: 'text'},
        {headerText : '공급구분' , dataField : 'suplyFlagCode', width: 80, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '공급형태' , dataField : 'suplyTypeCode', width: 120, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '품목일련번호' , dataField : 'meddevItemSeq', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '표준코드' , dataField : 'stdCode', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '로트번호' , dataField : 'lotNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '제조연월' , dataField : 'manufYm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급받은자 코드' , dataField : 'bcncCode', width: 100, display : true, disabled : true, type: 'text'},
        /*{headerText : '공급받은자' , dataField : 'bcncEntpName', width: 100, display : true, disabled : true, type: 'text'},*/
        {headerText : '공급일자' , dataField : 'suplyDate', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급수량' , dataField : 'suplyQty', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '공급단가' , dataField : 'suplyUntpc', width: 80, display : false, disabled : true, type: 'text'},
        {headerText : '공급금액' , dataField : 'suplyAmt', width: 80, display : false, disabled : true, type: 'text'},
        {headerText : '상태' , dataField : 'udiFlag', width: 80, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '메세지' , dataField : 'message', width: 80, display : false, disabled : true, type: 'text'},
    ];
    supplyStatusTableColumns: string[] = [
        /*'no',*/
        'mflag',
        /*'serialkey',*/
        'suplyFlagCode',
        'suplyTypeCode',
        'meddevItemSeq',
        'stdCode',
        'lotNo',
        'manufYm',
        'bcncCode',
        /*'bcncEntpName',*/
        'suplyDate',
        'suplyQty',
        /*'suplyUntpc',
        'suplyAmt',*/
        'udiFlag',
        /*'message',*/
    ];
    searchForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _matDialog: MatDialog,
        private _codeStore: CodeStore,
        private _statusService: StatusService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private readonly breakpointObserver: BreakpointObserver,
        private _deviceService: DeviceDetectorService,
    ){
        this.isMobile = this._deviceService.isMobile();
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data,'SUPLYFLAGCODE');
        this.udiFlag = _utilService.commonValue(_codeStore.getValue().data,'UDI_FLAG');
        this.mFlag = _utilService.commonValue(_codeStore.getValue().data,'M_FLAG');
        this.suplyTypeCode = _utilService.commonValue(_codeStore.getValue().data,'SUPLYTYPECODE');
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            searchText: [''],
        });
        this.supplyStatus$ = this._statusService.supplyStatus$;
        this._statusService.supplyStatus$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((status: any) => {
                if(status !== null){
                    this.supplyStatusCount = status.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._statusService.suppleyStatusPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((statusPagenation: SupplyStatusPagenation) => {
                this.supplyStatusPagenation = statusPagenation;
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
     * After view init
     */
    ngAfterViewInit(): void {
        if(this._sort !== undefined){
            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._statusService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, validity: any): any {
        return validity.id || index;
    }

    select(): void{

        this._statusService.getHeader(0,10,'','asc',this.searchForm.getRawValue());

        this._statusService.supplyStatus$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((status: any) => {
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'suplyFlagCode'){
            combo = this.suplyFlagCode;
        }else if(column.dataField === 'udiFlag'){
            combo = this.udiFlag;
        }else if(column.dataField === 'suplyTypeCode'){
            combo = this.suplyTypeCode;
        }else if(column.dataField === 'mflag'){
            combo = this.mFlag;
        }
        return combo;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyResend() {

    }
}
