import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../../../../../@teamplat/animations";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {merge, Observable, Subject} from "rxjs";
import {SuplyReport, SuplyReportPagenation} from "../manages.types";
import {TableConfig} from "../../../../../../@teamplat/components/common-table/common-table.types";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ManagesService} from "../manages.service";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {PopupStore} from "../../../../../core/common-popup/state/popup.store";
import {map, switchMap, takeUntil} from "rxjs/operators";

@Component({
    selector       : 'dms-manages-report',
    templateUrl    : './manages-report.component.html',
    styleUrls: ['./manages-report.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class ManagesReportComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isLoading: boolean = false;
    headerText: string = '보고 / 재보고';
    searchForm: FormGroup;
    suplyReportsCount: number = 0;
    year: CommonCode[] = null;
    suplyReports$: Observable<SuplyReport[]>;
    suplyReportsPagenation: SuplyReportPagenation = { length: 0, size: 0, page: 0, lastPage: 0, startIndex: 0, endIndex: 0 };


    suplyReportTable: TableConfig[] = [
        {headerText : '보고 기준 월' , dataField : 'suplyContStdmt', width: 50, display : true, type: 'text'},
        {headerText : '보고상태' , dataField : 'reportStatus', width: 50, display : true, type: 'text'},
        {headerText : '최종 보고 일시' , dataField : 'lastReportTime', width: 50, display : true, type: 'text'},
        {headerText : '보고(공급) 건수' , dataField : 'suplyCnt', width: 50, display : true, type: 'text'},
        {headerText : '보고 횟수' , dataField : 'reportCnt', width: 50, display : true, type: 'text'},
        {headerText : '최종 보고 가능 일' , dataField : 'lastReportDateLimit', width: 50, display : true, type: 'text'},
    ];

    suplyReportTableColumns: string[] = [
        'suplyContStdmt',
        'reportStatus',
        'lastReportTime',
        'suplyCnt',
        'reportCnt',
        'lastReportDateLimit',
        'report'
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public _matDialogRef: MatDialogRef<ManagesReportComponent>,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _managesService: ManagesService,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore) {
        this.year = _utilService.commonValue(_codeStore.getValue().data,'YEAR');

    }

    ngOnInit(): void {

        const today = new Date();
        const YYYY = today.getFullYear();

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            /*searchText: [''],*/
            year: [YYYY + ''],
            startSuplyContStdmt : [''],
            endSuplyContStdmt : [''],
        });

        this.suplyReports$ = this._managesService.suplyReports$;

        this._managesService.suplyReports$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((suplyReports: any) => {
                // Update the counts
                if(suplyReports !== null){
                    this.suplyReportsCount = suplyReports.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagenation
        this._managesService.suplyReportsPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagenation: SuplyReportPagenation) => {
                // Update the pagination
                this.suplyReportsPagenation = pagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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
                    return this._managesService.getSuplyReport(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._managesService.setInitList();
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    select(): void{

        const year = this.searchForm.getRawValue().year;
        if(year === (null && undefined && '')){
            this._functionService.cfn_alert('년도를 선택해주세요.');
            return;
        }
        const start = '01';
        const end = '12';
        this.searchForm.patchValue({'startSuplyContStdmt': year + start});
        this.searchForm.patchValue({'endSuplyContStdmt': year + end});
        this._managesService.getSuplyReport(0,12,'','asc',this.searchForm.getRawValue());
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, data: any): any {
        return data.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyReport(report) {
        console.log(report);
    }
}
