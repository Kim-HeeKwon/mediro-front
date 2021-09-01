import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CommonScanComponent} from '@teamplat/components/common-scan';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatDialog} from '@angular/material/dialog';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {Manages, ManagesPagenation} from './manages.types';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {TableConfig, TableStyle} from '../../../../../@teamplat/components/common-table/common-table.types';
import {ManagesService} from './manages.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {ManagesReportComponent} from './manages-report/manages-report.component';
import {ManagesDetailComponent} from "./manages-detail/manages-detail.component";
import {CommonPopupComponent} from "../../../../../@teamplat/components/common-popup";
import {ManagesNewComponent} from "./manages-new";

@Component({
    selector: 'app-manages',
    templateUrl: './manages.component.html',
    styleUrls: ['./manages.component.scss']
})
export class ManagesComponent implements OnInit, OnDestroy, AfterViewInit {

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;
    selection = new SelectionModel<any>(true, []);
    manages$: Observable<Manages[]>;
    managesPagenation: ManagesPagenation = { length: 0, size: 0, page: 0, lastPage: 0, startIndex: 0, endIndex: 0 };

    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    pageEvent: PageEvent;

    isLoading: boolean = false;
    managesCount: number = 0;
    managesTableStyle: TableStyle = new TableStyle();
    managesTable: TableConfig[] = [
        {headerText : '공급구분' , dataField : 'suplyFlagCode', width: 80, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '공급형태' , dataField : 'suplyTypeCode', width: 120, display : true, disabled : true, type: 'text',combo: true},
        {headerText : '보고자료 일련번호' , dataField : 'suplyContSeq', width: 100, display : false, disabled : true, type: 'text'},
        {headerText : '품목일련번호' , dataField : 'meddevItemSeq', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '표준코드' , dataField : 'stdCode', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '로트번호' , dataField : 'lotNo', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '제조연월' , dataField : 'manufYm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급받은자 코드' , dataField : 'bcncCode', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급받은자' , dataField : 'bcncEntpName', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급일자' , dataField : 'suplyDate', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '공급수량' , dataField : 'suplyQty', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '공급단가' , dataField : 'suplyUntpc', width: 80, display : true, disabled : true, type: 'text'},
        {headerText : '공급금액' , dataField : 'suplyAmt', width: 80, display : true, disabled : true, type: 'text'},
    ];
    managesTableColumns: string[] = [
        'select',
        'no',
        'suplyFlagCode',
        'suplyTypeCode',
        /*'suplyContSeq',*/
        'meddevItemSeq',
        'stdCode',
        'lotNo',
        'manufYm',
        'bcncCode',
        'bcncEntpName',
        'suplyDate',
        'suplyQty',
        'suplyUntpc',
        'suplyAmt',
    ];
    month: CommonCode[] = null;
    year: CommonCode[] = null;
    suplyTypeCode: CommonCode[] = null;
    suplyFlagCode: CommonCode[] = null;
    searchForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _matDialog: MatDialog,
        private _codeStore: CodeStore,
        private _managesService: ManagesService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private readonly breakpointObserver: BreakpointObserver,
        private _deviceService: DeviceDetectorService,
    ) {
        this.isMobile = this._deviceService.isMobile();
        this.month = _utilService.commonValue(_codeStore.getValue().data,'MONTH');
        this.year = _utilService.commonValue(_codeStore.getValue().data,'YEAR');
        this.suplyTypeCode = _utilService.commonValue(_codeStore.getValue().data,'SUPLYTYPECODE');
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data,'SUPLYFLAGCODE');
    }

    ngOnInit(): void {
        // 검색 Form 생성
        const today = new Date();
        const YYYY = today.getFullYear();
        const mm = today.getMonth()+1; //January is 0!
        let MM;
        if(mm<10) {
            MM = String('0'+mm);
        }else{
            MM = String(mm);
        }
        this.searchForm = this._formBuilder.group({
            year: [YYYY + ''],
            month: [MM + ''],
            searchText: [''],
            suplyContStdmt: [''],
            offset: [1],
            limit: [100],
        });

        this.manages$ = this._managesService.manages$;
        this._managesService.manages$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((manages: any) => {
                if(manages !== null || manages === 'null'){
                    this.managesCount = manages.length;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._managesService.managesPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((managesPagenation: ManagesPagenation) => {
                if(managesPagenation !== null){
                    this.managesPagenation = managesPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._managesService.getHeader();
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
                    return this._managesService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
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

    openScanPopup(): void {
        if(!this.isMobile){
            this._matDialog.open(CommonScanComponent, {
                autoFocus: false,
                disableClose: true,
                data     : {
                    note: {}
                },
            });
        }else{
            const d = this._matDialog.open(CommonScanComponent, {
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
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'suplyFlagCode'){
            combo = this.suplyFlagCode;
        }else if(column.dataField === 'suplyTypeCode'){
            combo = this.suplyTypeCode;
        }
        return combo;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    pageChange($event: PageEvent) {
        this.searchForm.patchValue({'offset': this._paginator.pageIndex + 1});
        this.searchForm.patchValue({'limit': this._paginator.pageSize});

        const day = this.searchForm.getRawValue().year + this.searchForm.getRawValue().month;
        this.searchForm.patchValue({'suplyContStdmt': day});
        this._managesService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
    }

    select(): void{

        const day = this.searchForm.getRawValue().year + this.searchForm.getRawValue().month;
        this.searchForm.patchValue({'suplyContStdmt': day});
        this._managesService.getHeader(0,100,'','asc',this.searchForm.getRawValue());
        this.selectClear();
    }


    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.manages$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((manages) =>{
                this.selection.select(...manages);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.managesCount;
        return numSelected === numRows;
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.suplyContSeq + 1}`;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    selectClear() {
        this.selection.clear();
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyReport() {
        const d = this._matDialog.open(ManagesReportComponent, {
            data: {
                headerText : '',
                url : 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                searchList : ['companyName', 'taxNo', 'cobFlagCode'],
                code: 'UDI_BCNC',
                tail : false,
                mediroUrl : 'bcnc/company-info',
                tailKey : '',
            },
            autoFocus: false,
            maxHeight: '80vh',
            disableClose: true
        });

    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyUpdate() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('수정 대상을 선택해주세요.');
            return;
        }else{
            const confirmation = this._teamPlatConfirmationService.open({
                title  : '',
                message: '수정하시겠습니까?',
                actions: {
                    confirm: {
                        label: '확인'
                    },
                    cancel: {
                        label: '닫기'
                    }
                }
            });
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this._managesService.updateSupplyInfo(this.selection.selected)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((manage: any) => {
                                this._functionService.cfn_alertCheckMessage(manage);
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                                this.select();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyDelete() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }else{
            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title      : '',
                message    : '삭제하시겠습니까?',
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : true,
                        label: '삭제',
                        color: 'warn'
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this._managesService.deleteSupplyInfo(this.selection.selected)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((manage: any) => {
                                this._functionService.cfn_alertCheckMessage(manage);
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                                this.select();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();

        }
    }

    selectDoubleClickRow(row: any): void{
        if(!this.isMobile){
            this._matDialog.open(ManagesDetailComponent, {
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true,
                data     : row,
            });
        }else{
            const d = this._matDialog.open(ManagesDetailComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true,
                data : row
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    suplyCreate(): void{
        const popup =this._matDialog.open(ManagesNewComponent, {
            autoFocus: false,
            maxHeight: '90vh',
            disableClose: true
        });

        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                }
            });
    }
}
