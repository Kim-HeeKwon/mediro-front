import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {merge, Observable, Subject} from 'rxjs';
import {Estimate, EstimateHeader, EstimateHeaderPagenation} from './estimate.types';
import {EstimateService} from './estimate.service';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {MatSort} from '@angular/material/sort';
import {MatPaginator} from '@angular/material/paginator';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationExtras, Router, RouterModule} from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';
import {DeviceDetectorService} from 'ngx-device-detector';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';

@Component({
    selector: 'app-estimate',
    templateUrl: './estimate.component.html',
    styleUrls: ['./estimate.component.scss']
})
export class EstimateComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator) private _estimateHeaderPagenator: MatPaginator;
    @ViewChild(MatSort) private _estimateHeaderSort: MatSort;
    isMobile: boolean = false;

    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    estimateHeaders$: Observable<EstimateHeader[]>;
    estimateHeaderPagenation: EstimateHeaderPagenation | null = null;
    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    estimateHeadersCount: number = 0;
    estimateHeadersTableColumns: string[] = [
        'select',
        'no',
        'qtCreDate',
        'qtDate',
        'qtNo',
        'account',
        'accountNm',
        'type',
        'status',
        'email',
        'qtAmt',
        'remarkHeader',
        'soNo',
    ];
    selectedEstimateHeader: EstimateHeader = new EstimateHeader();
    searchForm: FormGroup;

    status: CommonCode[] = null;
    type: CommonCode[] = null;
    accountType: CommonCode[] = null;
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 명'
        }];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    selection = new SelectionModel<any>(true, []);

    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _formBuilder: FormBuilder,
        private _estimateService: EstimateService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,)
    {
        this.status = _utilService.commonValue(_codeStore.getValue().data,'QT_STATUS');
        this.type = _utilService.commonValue(_codeStore.getValue().data,'QT_TYPE');
        this.accountType = _utilService.commonValue(_codeStore.getValue().data,'ACCOUNT_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            status: ['ALL'],
            type: ['ALL'],
            account: [''],
            accountNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this._estimateService.getHeader();

        // getHeader
        this.estimateHeaders$ = this._estimateService.estimateHeaders$;

        this._estimateService.estimateHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaders: any) => {
                // Update the counts
                if(estimateHeaders !== null){
                    this.estimateHeadersCount = estimateHeaders.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagenation
        this._estimateService.estimateHeaderPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeaderPagenation: EstimateHeaderPagenation) => {
                // Update the pagination
                this.estimateHeaderPagenation = estimateHeaderPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * After view init
     */
    ngAfterViewInit(): void {

        if(this._estimateHeaderSort !== undefined){
            // Get products if sort or page changes
            merge(this._estimateHeaderSort.sortChange, this._estimateHeaderPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._estimateService.getHeader(this._estimateHeaderPagenator.pageIndex, this._estimateHeaderPagenator.pageSize, this._estimateHeaderSort.active, this._estimateHeaderSort.direction, this.searchForm.getRawValue());
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
    trackByFn(index: number, estimateHeader: any): any {
        return estimateHeader.id || index;
    }

    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }
        this._estimateService.getHeader(0,10,'accountNm','asc',this.searchForm.getRawValue());
        this.selectClear();
    }

    selectDoubleClickRow(row: any): void {
        this._router.navigate(['estimate-order/estimate/estimate-detail' , row]);
    }

    selectClickRow(row: any): void{
        this._router.navigate(['estimate-order/estimate/estimate-detail' , row]);
    }

    newEstimate(): void{
        this._router.navigate(['estimate-order/estimate/estimate-new' , {}]);
    }
    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }
        this.estimateHeaders$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateHeader) =>{
                this.selection.select(...estimateHeader);
            });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.estimateHeadersCount;
        return numSelected === numRows;
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.no + 1}`;
    }

    // 발송
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    estimateSend() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('발송 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status === 'CF' || this.selection.selected[i].status === 'C'){
                    this._functionService.cfn_alert('발송할 수 없는 상태입니다. 견적번호 : ' + this.selection.selected[i].qtNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title      : '',
                    message    : '발송하시겠습니까?',
                    icon       : this._formBuilder.group({
                        show : true,
                        name : 'heroicons_outline:mail',
                        color: 'primary'
                    }),
                    actions    : this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show : true,
                            label: '발송',
                            color: 'accent'
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
                            this.estimateSendCall(this.selection.selected);
                        }else{
                            this.selectClear();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }
    estimateSendCall(sendData: Estimate[]): void{
        if(sendData){
            this._estimateService.estimateSend(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this._functionService.cfn_alertCheckMessage(estimate);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    // 확정
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    estimateConfirm() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('확정 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status === 'CF' || this.selection.selected[i].status === 'N' || this.selection.selected[i].status === 'C'){
                    this._functionService.cfn_alert('확정할 수 없는 상태입니다. 견적번호 : ' + this.selection.selected[i].qtNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const confirmation = this._teamPlatConfirmationService.open({
                    title  : '',
                    message: '확정하시겠습니까?',
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
                            this.estimateConfirmCall(this.selection.selected);
                        }else{
                            this.selectClear();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }
    estimateConfirmCall(sendData: Estimate[]): void{
        if(sendData){
            this._estimateService.estimateConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this._functionService.cfn_alertCheckMessage(estimate);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }
    // 취소
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    estimateCancel() {
        if(this.selection.selected.length < 1){
            this._functionService.cfn_alert('취소 대상을 선택해주세요.');
            return;
        }else{
            let check = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<this.selection.selected.length; i++){
                if(this.selection.selected[i].status !== 'N'){
                    this._functionService.cfn_alert('취소할 수 없는 상태입니다. 견적번호 : ' + this.selection.selected[i].qtNo);
                    check = false;
                    return false;
                }
            }

            if(check){
                const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                    title      : '',
                    message    : '취소하시겠습니까?',
                    icon       : this._formBuilder.group({
                        show : true,
                        name : 'heroicons_outline:exclamation',
                        color: 'warn'
                    }),
                    actions    : this._formBuilder.group({
                        confirm: this._formBuilder.group({
                            show : true,
                            label: '취소',
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
                        if (result) {
                            this.estimateCancelCall(this.selection.selected);
                        }else{
                            this.selectClear();
                        }
                    });
            }
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }
    estimateCancelCall(sendData: Estimate[]): void {
        if(sendData){
            this._estimateService.estimateCancel(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimate: any) => {
                    this._functionService.cfn_alertCheckMessage(estimate);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                    this.selectHeader();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    selectClear() {
        this.selection.clear();
        this._changeDetectorRef.markForCheck();
    }

}
