import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {merge, Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {SalesOrderDetail, SalesOrderDetailPagenation} from '../salesorder.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {SalesorderService} from '../salesorder.service';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {SalesOrder} from '../../../../admin/salesorder/salesorder/salesorder.types';

@Component({
    selector: 'app-dms-salesorder-detail',
    templateUrl: './salesorder-detail.component.html',
    styleUrls: ['./salesorder-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class SalesorderDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) private _salesorderDetailPagenator: MatPaginator;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
    orderBy: any = 'asc';
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    itemGrades: CommonCode[] = null;
    filterList: string[];
    estimateHeader: any;
    estimateDetail: any;

    salesorderHeaderForm: FormGroup;
    salesorderDetailPagenation: SalesOrderDetailPagenation | null = null;
    salesorderDetails$ = new Observable<SalesOrderDetail[]>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    salesorderDetailColumns: Columns[];
    // @ts-ignore
    salesorderDetailDataProvider: RealGrid.LocalDataProvider;
    salesorderDetailFields: DataFieldObject[] = [
        {fieldName: 'soLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'poReqQty', dataType: ValueType.NUMBER},
        {fieldName: 'invQty', dataType: ValueType.NUMBER},
        {fieldName: 'reqQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'soAmt', dataType: ValueType.NUMBER},
        {fieldName: 'remarkDetail', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _salesorderService: SalesorderService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'SO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data, 'SO_STATUS', this.filterList);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Form 생성
        this.salesorderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            soNo: [{value: '', disabled: true}],   // 주문번호
            account: [{value: '', disabled: true}, [Validators.required]], // 거래처 코드
            accountNm: [{value: '', disabled: true}],   // 거래처 명
            type: [{value: '', disabled: true}, [Validators.required]],   // 유형
            status: [{value: '', disabled: true}, [Validators.required]],   // 상태
            soAmt: [{value: '', disabled: true}],   // 주문금액
            obNo: [{value: '', disabled: true}],   // 출고번호
            soCreDate: [{value: '', disabled: true}],//주문 생성일자
            soDate: [{value: '', disabled: true}], //주문일자
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });

        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)) {
            this.salesorderHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this._salesorderService.getDetail(0, 20, 'soLineNo', 'asc', this.salesorderHeaderForm.getRawValue());
        }
        //페이지 라벨
        this._salesorderDetailPagenator._intl.itemsPerPageLabel = '';

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });
        //그리드 컬럼
        this.salesorderDetailColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|' +
                            'standard:standard|unit:unit|itemGrade:itemGrade|unitPrice:salesPrice|' +
                            'poReqQty:poQty|invQty:availQty'
                    }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'center-cell-text'}
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'}
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'},
                values: valuesItemGrades,
                labels: lablesItemGrades,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.itemGrades),
            },
            {
                name: 'poReqQty', fieldName: 'poReqQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '발주', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'invQty', fieldName: 'invQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '보유', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'reqQty', fieldName: 'reqQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '요청수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '단가', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'poAmt', fieldName: 'soAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '주문금액', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}
            },
        ];

        //그리드 Provider
        this.salesorderDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.salesorderDetailDataProvider,
            'salesorderDetailGrid',
            this.salesorderDetailColumns,
            this.salesorderDetailFields,
            gridListOption);

        //그리드 옵션
        this.gridList.setEditOptions({
            readOnly: false,
            insertable: false,
            appendable: false,
            editable: true,
            updatable: true,
            deletable: true,
            checkable: true,
            softDeleting: true,
        });
        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });
        this.gridList.setPasteOptions({
            enabled: true,
            startEdit: false,
            commitEdit: true,
            checkReadOnly: true
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.validateOnEdited = true;

        this._realGridsService.gfn_EditGrid(this.gridList);
        const validationList = ['itemCd'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //추가시
            if (dataCell.item.rowState === 'created') {
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            } else {
                //console.log(dataCell.dataColumn.renderer);
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade') {

                    this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }

            if (dataCell.dataColumn.fieldName === 'soAmt' ||
                dataCell.dataColumn.fieldName === 'poReqQty' ||
                dataCell.dataColumn.fieldName === 'invQty') {
                return {editable: false};
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.salesorderDetailDataProvider, this.salesorderDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                // eslint-disable-next-line max-len
                this._salesorderService.getDetail(this.salesorderDetailPagenation.page, this.salesorderDetailPagenation.size, clickData.column, this.orderBy, this.salesorderHeaderForm.getRawValue());
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        this.setGridData();

        this._salesorderService.salesorderDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderDetailPagenation: SalesOrderDetailPagenation) => {
                // Update the pagination
                this.salesorderDetailPagenation = salesorderDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {

        merge(this._salesorderDetailPagenator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._salesorderService.getDetail(this._salesorderDetailPagenator.pageIndex, this._salesorderDetailPagenator.pageSize, 'soLineNo', this.orderBy, this.salesorderHeaderForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.salesorderDetailDataProvider);
    }

    setGridData(): void {
        this.salesorderDetails$ = this._salesorderService.salesorderDetails$;
        this._salesorderService.salesorderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((salesorderDetail: any) => {
                // Update the counts
                if (salesorderDetail !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.salesorderDetailDataProvider, salesorderDetail);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    addRow(): void {
        const values = [
            '', '', '', '', '', '', 0, 0, 0, 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.salesorderDetailDataProvider, values);
    }

    delRow(): void {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.salesorderDetailDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }
        this._realGridsService.gfn_DelRow(this.gridList, this.salesorderDetailDataProvider);
    }

    salesorderSave(): void {
        const status = this.salesorderHeaderForm.controls['status'].value;

        //신규가 아니면 불가능
        if (status !== 'N') {
            this._functionService.cfn_alert('저장 할 수 없습니다.');
            return;
        }
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.salesorderHeaderForm.invalid) {
            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.salesorderDetailDataProvider);

            let detailCheck = false;

            if (rows.length === 0) {
                this._functionService.cfn_alert('수정된 행이 존재하지 않습니다.');
                detailCheck = true;
            }
            if (detailCheck) {
                return;
            }

            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
                message: '저장하시겠습니까?',
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
                    if (result) {
                        rows = this.headerDataSet(rows);
                        this._salesorderService.saveSalesorder(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((order: any) => {
                                this.isProgressSpinner = true;
                                this.alertMessage(order);
                                this._changeDetectorRef.markForCheck();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();

        } else {
            this._functionService.cfn_alert('필수값을 입력해주세요.');
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '주문 상세목록');
    }

    backPage(): void {
        this._router.navigate(['salesorder/salesorder']);
    }

    //페이징
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        this._salesorderService.getDetail(this._salesorderDetailPagenator.pageIndex, this._salesorderDetailPagenator.pageSize, 'poLineNo', this.orderBy, this.salesorderHeaderForm.getRawValue());
    }

    alertMessage(param: any): void {
        if (param.status !== 'SUCCESS') {
            this.isProgressSpinner = false;
            this._functionService.cfn_alert(param.msg);
        } else {
            this.backPage();
        }
    }

    /* 트랜잭션 전 data Set
     * @param sendData
     */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: SalesOrder[]) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            sendData[i].account = this.salesorderHeaderForm.controls['account'].value;
            sendData[i].soNo = this.salesorderHeaderForm.controls['soNo'].value;
            sendData[i].type = this.salesorderHeaderForm.controls['type'].value;
            sendData[i].status = this.salesorderHeaderForm.controls['status'].value;
            sendData[i].remarkHeader = this.salesorderHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }

    inBound(): void {
        const status = this.salesorderHeaderForm.controls['status'].value;

        if (status !== 'S') {
            this._functionService.cfn_alert('확정건에서만 가능합니다. 반품(입고) 할 수 없습니다.');
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '반품(입고)를 생성하시겠습니까?',
            actions: {
                confirm: {
                    label: '확인'
                },
                cancel: {
                    label: '닫기'
                }
            }
        });
        this.isProgressSpinner = true;
        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result) {
                    this._salesorderService.getDetail(0, 20, 'soLineNo', 'asc', this.salesorderHeaderForm.getRawValue());

                    this.salesorderDetails$ = this._salesorderService.salesorderDetails$;
                    this._salesorderService.salesorderDetails$
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((salesorderDetail: any) => {
                            if (salesorderDetail != null) {
                                const row = {header: this.salesorderHeaderForm.getRawValue(), detail: salesorderDetail};
                                // eslint-disable-next-line max-len
                                this._router.navigate(['bound/inbound/inbound-new'], {
                                    state: {
                                        'header': this.salesorderHeaderForm.getRawValue(),
                                        'detail': salesorderDetail
                                    }
                                });
                            }
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });
    }
}
