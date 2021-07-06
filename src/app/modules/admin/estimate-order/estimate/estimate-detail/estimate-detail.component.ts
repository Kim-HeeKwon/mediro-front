import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {
    Estimate,
    EstimateDetail,
    EstimateDetailPagenation,
    EstimateHeader,
    EstimateHeaderPagenation
} from '../estimate.types';
import {ActivatedRoute, Router} from '@angular/router';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {EstimateService} from '../estimate.service';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';

@Component({
    selector       : 'estimate-detail',
    templateUrl    : './estimate-detail.component.html',
    styleUrls: ['./estimate-detail.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class EstimateDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator) private _estimateDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _estimateDetailSort: MatSort;

    isLoading: boolean = false;
    estimateHeader: EstimateHeader;
    estimateHeaderForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;
    estimateDetailsCount: number = 0;

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];

    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    estimateDetail: EstimateDetail = null;
    estimateDetailsTableColumns: string[] = [
        'qtLineNo',
        'itemCd',
        'itemNm',
        'standard',
        'unit',
        'qty',
        'qtPrice',
        'qtAmt',
        'remarkDetail',
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _estimateService: EstimateService,
        private _utilService: FuseUtilsService)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_STATUS', this.filterList);
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // 고객사 Form 생성
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            qtNo: [''],   // 견적번호
            account: ['', [Validators.required]], // 거래처 코드
            accountNm: [''],   // 거래처 명
            type: ['', [Validators.required]],   // 유형
            status: ['', [Validators.required]],   // 상태
            qtAmt: [''],   // 견적금액
            soNo: [''],   // 주문번호
            qtCreDate: [''],//견적 생성일자
            qtDate: [''], //견적일자
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });

        if(this._activatedRoute.snapshot.paramMap['params'].length !== (null || undefined)){

            this.estimateHeaderForm.patchValue(
                this.nullChk(this._activatedRoute.snapshot.paramMap['params'])
            );

            this._estimateService.getDetail(0,8,'itemCd','asc',this.estimateHeaderForm.getRawValue());

            this.estimateDetails$ = this._estimateService.estimateDetails$;

            this._estimateService.estimateDetails$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimateDetail: any) => {
                    // Update the counts
                    if(estimateDetail !== null){
                        this.estimateDetailsCount = estimateDetail.length;
                    }

                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }

        this._estimateService.estimateDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetailPagenation: EstimateDetailPagenation) => {
                // Update the pagination
                this.estimateDetailPagenation = estimateDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        //this.estimateHeaderForm.controls['qtNo'].disable();

    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

        if(this._estimateDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._estimateDetailSort.sortChange, this._estimateDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._estimateService.getDetail(this._estimateDetailPagenator.pageIndex, this._estimateDetailPagenator.pageSize, this._estimateDetailSort.active, this._estimateDetailSort.direction, this.estimateHeaderForm.getRawValue());
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

    backPage(): void{
        this._router.navigate(['estimate-order/estimate']);
    }

    commonTransactionData(route: string): void{

        const sendData: Estimate[] = [];
        const arr = this.estimateDetails$.subscribe({
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            next(estimateDetail) {
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i=0; i<estimateDetail.length; i++) {
                    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                    sendData.push(<Estimate>estimateDetail[i]);

                }
            },
        });
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i]['account'] = this.estimateHeaderForm.getRawValue().account;
            sendData[i]['qtNo'] = this.estimateHeaderForm.getRawValue().qtNo;
            sendData[i]['type'] = this.estimateHeaderForm.getRawValue().type;
            sendData[i]['status'] = this.estimateHeaderForm.getRawValue().status;
            sendData[i]['remarkHeader'] = this.estimateHeaderForm.getRawValue().remarkHeader;
        }
        if(route === 'C'){

        }else if(route === 'U'){

        }
    }

    createEstimate(): void{

        this.commonTransactionData('C');
    }

    nullChk(value: any): any{

        /*const data = {};
        // 검색조건 Null Check
        if ((Object.keys(value).length === 0) === false) {
            // eslint-disable-next-line guard-for-in
            for (const k in value) {
                data[k] = value[k];
            }
        }*/
        return value;
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, estimateDetail: any): any {
        return estimateDetail.id || index;
    }
}
