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
import {Order, OrderDetail, OrderDetailPagenation} from '../order.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {OrderService} from '../order.service';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ReportHeaderData} from '../../../../../../@teamplat/components/common-report/common-report.types';
import {CommonReportComponent} from '../../../../../../@teamplat/components/common-report';

@Component({
    selector: 'app-dms-order-detail',
    templateUrl: './order-detail.component.html',
    styleUrls: ['./order-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class OrderDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) private _orderDetailPagenator: MatPaginator;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isProgressSpinner: boolean = false;
    orderBy: any = 'asc';
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    reportHeaderData: ReportHeaderData = new ReportHeaderData();

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    itemGrades: CommonCode[] = null;
    filterList: string[];
    estimateHeader: any;
    estimateDetail: any;

    orderHeaderForm: FormGroup;
    orderDetailPagenation: OrderDetailPagenation | null = null;
    orderDetails$ = new Observable<OrderDetail[]>();

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    orderDetailColumns: Columns[];
    // @ts-ignore
    orderDetailDataProvider: RealGrid.LocalDataProvider;
    orderDetailFields: DataFieldObject[] = [
        {fieldName: 'poLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'poReqQty', dataType: ValueType.NUMBER},
        {fieldName: 'invQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'poQty', dataType: ValueType.NUMBER},
        {fieldName: 'reqQty', dataType: ValueType.NUMBER},
        {fieldName: 'unitPrice', dataType: ValueType.NUMBER},
        {fieldName: 'poAmt', dataType: ValueType.NUMBER},
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
        private _orderService: OrderService,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'PO_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data, 'PO_STATUS', this.filterList);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Form 생성
        this.orderHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            poNo: [{value: '', disabled: true}],   // 발주번호
            account: [{value: '', disabled: true}, [Validators.required]], // 거래처 코드
            accountNm: [{value: '', disabled: true}],   // 거래처 명
            type: [{value: '', disabled: true}, [Validators.required]],   // 유형
            status: [{value: '', disabled: true}, [Validators.required]],   // 상태
            poAmt: [{value: '', disabled: true}],   // 발주금액
            poCreDate: [{value: '', disabled: true}],//발주 생성일자
            poDate: [{value: '', disabled: true}], //발주일자
            email: [],//이메일
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

        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)) {
            this.orderHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this._orderService.getDetail(0, 20, 'poLineNo', 'asc', this.orderHeaderForm.getRawValue());
        }
        //페이지 라벨
        this._orderDetailPagenator._intl.itemsPerPageLabel = '';

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });

        //그리드 컬럼
        this.orderDetailColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|standard:standard|unit:unit|itemGrade:itemGrade'
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
                name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'poQty', fieldName: 'poQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '발주수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '단가', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'poAmt', fieldName: 'poAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '발주금액', styleName: 'center-cell-text'}
                , numberFormat: '#,##0'
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}
            },
        ];
        //그리드 Provider
        this.orderDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.orderDetailDataProvider,
            'orderDetailGrid',
            this.orderDetailColumns,
            this.orderDetailFields,
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
                    dataCell.dataColumn.fieldName === 'unit'||
                    dataCell.dataColumn.fieldName === 'itemGrade') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            } else {
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit'||
                    dataCell.dataColumn.fieldName === 'itemGrade') {

                    this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }

            if (dataCell.dataColumn.fieldName === 'poAmt' ||
                dataCell.dataColumn.fieldName === 'poReqQty' ||
                dataCell.dataColumn.fieldName === 'invQty') {
                return {editable: false};
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.orderDetailDataProvider, this.orderDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef);

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                // eslint-disable-next-line max-len
                this._orderService.getDetail(this.orderDetailPagenation.page, this.orderDetailPagenation.size, clickData.column, this.orderBy, this.orderHeaderForm.getRawValue());
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        this.setGridData();

        this._orderService.orderDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetailPagenation: OrderDetailPagenation) => {
                // Update the pagination
                this.orderDetailPagenation = orderDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {

        merge(this._orderDetailPagenator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._orderService.getDetail(this._orderDetailPagenator.pageIndex, this._orderDetailPagenator.pageSize, 'poLineNo', this.orderBy, this.orderHeaderForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.orderDetailDataProvider);
    }

    setGridData(): void {
        this.orderDetails$ = this._orderService.orderDetails$;
        this._orderService.orderDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((orderDetail: any) => {
                // Update the counts
                if (orderDetail !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.orderDetailDataProvider, orderDetail);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    // 발주
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    orderConfirm() {
        const poStatus = this.orderHeaderForm.controls['status'].value;
        if (poStatus !== 'S' && poStatus !== 'P') {
            this._functionService.cfn_alert('발주할 수 없는 상태입니다.');
            return false;
        }
        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.orderDetailDataProvider);

        rows = rows.filter((detail: any) => (detail.qty > 0 && detail.flag === 'U'))
            .map((param: any) => param);

        if (rows.length < 1) {
            this._functionService.cfn_alert('발주 수량이 존재하지 않습니다.');
            return false;
        } else {
            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
                message: '발주하시겠습니까?',
                actions: {
                    confirm: {
                        label: '발주'
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
                        this.orderDetailConfirm(rows);
                    }
                });
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /* 발주 (상세)
     *
     * @param sendData
     */
    orderDetailConfirm(sendData: Order[]): void {
        if (sendData) {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < sendData.length; i++) {
                sendData[i].type = this.orderHeaderForm.controls['type'].value;
                sendData[i].poNo = this.orderHeaderForm.controls['poNo'].value;
            }

            this._orderService.orderDetailConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((order: any) => {
                    this.isProgressSpinner = true;
                    this.alertMessage(order);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    orderReport(): void {
        this.isProgressSpinner = true;
        const orderDetailData = [];
        let index = 0;
        const rows = this._realGridsService.gfn_GetRows(this.gridList, this.orderDetailDataProvider);

        rows.forEach((data: any) => {
            index++;
            orderDetailData.push({
                no: index,
                itemNm: data.itemNm,
                standard: data.standard,
                unit: data.unit,
                itemGrade: data.itemGrade,
                qty: data.reqQty,
                unitPrice: data.unitPrice,
                totalAmt: data.poAmt,
                taxAmt: 0,
                remark: data.remarkDetail,
            });
        });
        this.reportHeaderData.no = this.orderHeaderForm.getRawValue().poNo;
        this.reportHeaderData.date = this.orderHeaderForm.getRawValue().poCreDate;
        this.reportHeaderData.remark = this.orderHeaderForm.getRawValue().remarkHeader;
        this.reportHeaderData.custBusinessNumber = this.orderHeaderForm.getRawValue().custBusinessNumber;// 사업자 등록번호
        this.reportHeaderData.custBusinessName = this.orderHeaderForm.getRawValue().custBusinessName;//상호
        this.reportHeaderData.representName = this.orderHeaderForm.getRawValue().representName;//성명
        this.reportHeaderData.address = this.orderHeaderForm.getRawValue().address;//주소
        this.reportHeaderData.businessCondition = this.orderHeaderForm.getRawValue().businessCondition;// 업태
        this.reportHeaderData.businessCategory = this.orderHeaderForm.getRawValue().businessCategory;// 종목
        this.reportHeaderData.phoneNumber = '0' + this.orderHeaderForm.getRawValue().phoneNumber;// 전화번호
        this.reportHeaderData.fax = '0' + this.orderHeaderForm.getRawValue().fax;// 팩스번호
        this.reportHeaderData.toAccountNm = this.orderHeaderForm.getRawValue().toAccountNm;
        this.reportHeaderData.deliveryDate = this.orderHeaderForm.getRawValue().deliveryDate;
        this.reportHeaderData.deliveryAddress = '납품 주소란';

        const popup = this._matDialogPopup.open(CommonReportComponent, {
            data: {
                divisionText: '발주',
                division: 'ORDER',
                header: this.reportHeaderData,
                body: orderDetailData,
                tail: '',
            },
            autoFocus: false,
            maxHeight: '100vh',
            disableClose: true
        });
        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.isProgressSpinner = false;
                this._changeDetectorRef.markForCheck();
            });
    }

    orderSave(): void {
        const status = this.orderHeaderForm.controls['status'].value;

        //신규가 아니면 불가능
        if (status !== 'N') {
            this._functionService.cfn_alert('저장 할 수 없습니다.');
            return;
        }
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.orderHeaderForm.invalid) {
            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.orderDetailDataProvider);

            let detailCheck = false;

            // if(this.orderHeaderForm.untouched){
            //     this._functionService.cfn_alert('수정된 정보가 존재하지 않습니다.');
            //     detailCheck = true;
            // }
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
                        this._orderService.saveOrder(rows)
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

    /* 트랜잭션 전 data Set
     * @param sendData
     */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: Order[]) {
        if(sendData.length === 0){
            sendData.push({
                account: this.orderHeaderForm.controls['account'].value,
                poNo: this.orderHeaderForm.controls['poNo'].value,
                type: this.orderHeaderForm.controls['type'].value,
                status: this.orderHeaderForm.controls['status'].value,
                email: this.orderHeaderForm.controls['email'].value,
                remarkHeader: this.orderHeaderForm.controls['remarkHeader'].value,
                itemCd: '',
                itemGrade: '',
                itemNm: '',
                mId: '',
                poAmt: 0,
                poCreDate: '',
                poDate: '',
                poLineNo: 0,
                poQty: 0,
                qty: 0,
                remarkDetail: '',
                reqQty: 0,
                standard: '',
                unit: '',
                unitPrice: 0,
            });
        }else{
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < sendData.length; i++) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                sendData[i].account = this.orderHeaderForm.controls['account'].value;
                sendData[i].poNo = this.orderHeaderForm.controls['poNo'].value;
                sendData[i].type = this.orderHeaderForm.controls['type'].value;
                sendData[i].status = this.orderHeaderForm.controls['status'].value;
                sendData[i].email = this.orderHeaderForm.controls['email'].value;
                sendData[i].remarkHeader = this.orderHeaderForm.controls['remarkHeader'].value;
            }
        }

        return sendData;
    }

    // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures
    backPage(): void {
        this._router.navigate(['estimate-order/order']);
    }

    //페이징
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        this._orderService.getDetail(this._orderDetailPagenator.pageIndex, this._orderDetailPagenator.pageSize, 'poLineNo', this.orderBy, this.orderHeaderForm.getRawValue());
    }

    alertMessage(param: any): void {
        if (param.status !== 'SUCCESS') {
            this.isProgressSpinner = false;
            this._functionService.cfn_alert(param.msg);
        } else {
            this.backPage();
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '발주 상세목록');
    }

    addRow(): void {

        const values = [
            '', '', '', '', '', '', 0, 0, 0, 0, 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.orderDetailDataProvider, values);
    }

    delRow(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.orderDetailDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.orderDetailDataProvider);
    }
}
