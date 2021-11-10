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
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder,FormGroup, Validators} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatDialog} from '@angular/material/dialog';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {DeviceDetectorService} from "ngx-device-detector";
import {EstimateService} from "../../../estimate-order/estimate/estimate.service";
import {EstimateDetail, EstimateDetailPagenation} from "../../../estimate-order/estimate/estimate.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";

@Component({
    selector: 'app-detail',
    templateUrl    : './detail.component.html',
    styleUrls: ['./detail.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class DetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatPaginator, { static: true }) private _estimateDetailPagenator: MatPaginator;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];
    estimateHeaderForm: FormGroup;
    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    orderBy: any = 'asc';

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    gridList: RealGrid.GridView;
    estimateDetailColumns: Columns[];
    // @ts-ignore
    estimateDetailDataProvider: RealGrid.LocalDataProvider;
    estimateDetailFields: DataFieldObject[] = [
        {fieldName: 'qtLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'qtPrice', dataType: ValueType.NUMBER},
        {fieldName: 'qtAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remarkDetail', dataType: ValueType.TEXT},
    ];
    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _estimateService: EstimateService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_STATUS', this.filterList);
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {

        // Form 생성
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            qtNo: [{value:'',disabled:true}],   // 견적번호
            account: [{value:'',disabled:true},[Validators.required]], // 거래처 코드
            accountNm: [{value:'',disabled:true}],   // 거래처 명
            type: [{value:'',disabled:true}, [Validators.required]],   // 유형
            status: [{value:'',disabled:true}, [Validators.required]],   // 상태
            qtAmt: [{value:'',disabled:true}],   // 견적금액
            soNo: [{value:'',disabled:true}],   // 주문번호
            qtCreDate: [{value:'',disabled:true}],//견적 생성일자
            qtDate: [{value:'',disabled:true}], //견적일자
            email:[''],//이메일
            remarkHeader: [''], //비고
            toAccountNm: [''],
            deliveryDate: [''],
            custBusinessNumber: [''],// 사업자 등록번호
            custBusinessName: [''],//상호
            representName: [''],//성명
            address: [''],//주소
            businessCondition: [''],// 업태
            businessCategory: [''],// 종목
            phoneNumber: [''],// 전화번호
            fax: [''],// 팩스번호
            active: [false]  // cell상태
        });

        if(this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)){
            this.estimateHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            console.log(this.estimateHeaderForm.getRawValue());

            this._estimateService.getDetail(0,20,'qtLineNo','asc',this.estimateHeaderForm.getRawValue());
        }

        //그리드 컬럼
        this.estimateDetailColumns = [
            {name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}},
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'left-cell-text'}},
            {name: 'standard', fieldName: 'standard', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '규격' , styleName: 'left-cell-text'}},
            {name: 'unit', fieldName: 'unit', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '단위' , styleName: 'left-cell-text'}},
            {name: 'qty', fieldName: 'qty', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '수량' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'qtPrice', fieldName: 'qtPrice', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '단가' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'qtAmt', fieldName: 'qtAmt', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '견적금액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '비고' , styleName: 'left-cell-text'}},
        ];
        //그리드 Provider
        this.estimateDetailDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.estimateDetailDataProvider,
            'estimateDetailGrid',
            this.estimateDetailColumns,
            this.estimateDetailFields,
            gridListOption);

        //그리드 옵션
        this.gridList.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            //deletable: true,
            checkable: true,
            softDeleting: true,
            //hideDeletedRows: true,
        });
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if(clickData.cellType === 'header'){
                // eslint-disable-next-line max-len
                this._estimateService.getDetail(this.estimateDetailPagenation.page,this.estimateDetailPagenation.size,clickData.column,this.orderBy,this.estimateHeaderForm.getRawValue());
            }
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };

        //페이지 라벨
        this._estimateDetailPagenator._intl.itemsPerPageLabel = '';
        this.setGridData();

        this._estimateService.estimateDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetailPagenation: EstimateDetailPagenation) => {
                // Update the pagination
                this.estimateDetailPagenation = estimateDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {

        merge(this._estimateDetailPagenator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._estimateService.getDetail(this._estimateDetailPagenator.pageIndex, this._estimateDetailPagenator.pageSize, 'qtLineNo', this.orderBy, this.estimateHeaderForm.getRawValue());
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.estimateDetailDataProvider);
    }

    backPage(): void{
        this._router.navigate(['realgrid/realgridHD']);
    }
    reportEstimate(): void{

    }

    saveEstimate(): void{
    }

    transactionRow(action: string): void {

    }

    //페이징
    pageEvent($event: PageEvent): void {
        this._estimateService.getDetail(this._estimateDetailPagenator.pageIndex, this._estimateDetailPagenator.pageSize, 'qtLineNo', this.orderBy, this.estimateHeaderForm.getRawValue());
    }

    setGridData(): void {
        this.estimateDetails$ = this._estimateService.estimateDetails$;
        this._estimateService.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetail: any) => {
                // Update the counts
                if(estimateDetail !== null){
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.estimateDetailDataProvider, estimateDetail);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '견적 상세목록');
    }
}