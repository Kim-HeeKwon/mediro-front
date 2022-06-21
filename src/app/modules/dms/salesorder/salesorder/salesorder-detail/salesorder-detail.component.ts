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
import {SalesOrder} from '../../../../dms/salesorder/salesorder/salesorder.types';
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";

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
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'refItemNm', dataType: ValueType.TEXT},
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
            address: [{value: ''}],   // 거래처 주소
            dlvAccount: [{value: ''}],   // 납품처
            dlvAccountNm: [{value: '', disabled: true}],   // 납품처
            dlvAddress: [{value: ''}],   // 납품처 주소
            dlvDate: [{value: ''}, [Validators.required]],//납품일자
            soAmt: [{value: '', disabled: true}],   // 주문금액
            obNo: [{value: '', disabled: true}],   // 출고번호
            soCreDate: [{value: '', disabled: true}],//주문 생성일자
            soDate: [{value: '', disabled: false}, [Validators.required]], //주문일자
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });

        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)) {
            this.salesorderHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );
            this.salesorderHeaderForm.patchValue({'soAmt' :
                    this.priceToString(this._activatedRoute.snapshot.paramMap['params'].soAmt)});

            this._salesorderService.getDetail(0, 100, 'soLineNo', 'asc', this.salesorderHeaderForm.getRawValue());
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
                , header: {text: '품목코드', styleName: 'center-cell-text red-font-color'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|fomlInfo:fomlInfo|refItemNm:refItemNm|' +
                            'standard:standard|unit:unit|itemGrade:itemGrade|unitPrice:salesPrice|' +
                            'poReqQty:poQty|invQty:availQty',
                        where : [{
                            key: 'account',
                            replace : 'account:=:#{account}'
                        }]
                    }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'refItemNm', fieldName: 'refItemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '고객 품목명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '규격', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesItemGrades,
                labels: lablesItemGrades,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.itemGrades),
            },
            {
                name: 'poReqQty', fieldName: 'poReqQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '기발주량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'invQty', fieldName: 'invQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '보유재고량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'reqQty', fieldName: 'reqQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '요청수량', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unitPrice', fieldName: 'unitPrice', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '매출단가(VAT포함)', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'poAmt', fieldName: 'soAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '주문금액', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
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
                    dataCell.dataColumn.fieldName === 'fomlInfo' ||
                    dataCell.dataColumn.fieldName === 'refItemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade'||
                    dataCell.dataColumn.fieldName === 'poReqQty' ||
                    dataCell.dataColumn.fieldName === 'invQty'||
                    dataCell.dataColumn.fieldName === 'soAmt') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            } else {
                //console.log(dataCell.dataColumn.renderer);
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'fomlInfo' ||
                    dataCell.dataColumn.fieldName === 'refItemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade'||
                    dataCell.dataColumn.fieldName === 'poReqQty' ||
                    dataCell.dataColumn.fieldName === 'invQty'||
                    dataCell.dataColumn.fieldName === 'soAmt') {

                    this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }

            if (dataCell.dataColumn.fieldName === 'soAmt' ||
                dataCell.dataColumn.fieldName === 'fomlInfo' ||
                dataCell.dataColumn.fieldName === 'refItemNm' ||
                dataCell.dataColumn.fieldName === 'poReqQty' ||
                dataCell.dataColumn.fieldName === 'invQty') {
                return {editable: false};
            }
        });
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellEdited = ((grid, itemIndex, row, field) => {
            if(this.salesorderDetailDataProvider.getOrgFieldName(field) === 'reqQty' ||
                this.salesorderDetailDataProvider.getOrgFieldName(field) === 'unitPrice'){
                const that = this;
                setTimeout(() =>{
                    const reqQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.salesorderDetailDataProvider,
                        itemIndex,'reqQty');
                    const unitPrice = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.salesorderDetailDataProvider,
                        itemIndex,'unitPrice');
                    that._realGridsService.gfn_CellDataSetRow(that.gridList,
                        that.salesorderDetailDataProvider,
                        itemIndex,
                        'soAmt',
                        reqQty * unitPrice);
                },100);
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.salesorderDetailDataProvider, this.salesorderDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef, this.salesorderHeaderForm);

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

    addRow(): boolean {
        const soStatus = this.salesorderHeaderForm.controls['status'].value;
        if (soStatus !== 'N') {
            this._functionService.cfn_alert('접수 상태에서 추가할 수 있습니다.');
            return false;
        }
        const values = [
            '', '', '', '', '', '', '', '', 0, 0, 0, 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.salesorderDetailDataProvider, values);
    }

    delRow(): boolean {
        const soStatus = this.salesorderHeaderForm.controls['status'].value;
        if (soStatus !== 'N') {
            this._functionService.cfn_alert('접수 상태에서 삭제할 수 있습니다.');
            return false;
        }
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
            this._functionService.cfn_alert('접수 상태에서만 저장 가능합니다.');
            return;
        }
        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.salesorderHeaderForm.invalid) {
            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.salesorderDetailDataProvider);

            let detailCheck = false;

            // if(this.salesorderHeaderForm.untouched){
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
                        this._salesorderService.saveSalesorder(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((order: any) => {
                                this._functionService.cfn_loadingBarClear();
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
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.salesorderDetailDataProvider, true);
        const rtn = this._salesorderService.getDetail(this._salesorderDetailPagenator.pageIndex, this._salesorderDetailPagenator.pageSize, 'soLineNo', this.orderBy, this.salesorderHeaderForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            if(ex._value) {
                this._realGridsService.gfn_GridLoadingBar(this.gridList, this.salesorderDetailDataProvider, false);
            }
        });
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this.reData();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    /* 트랜잭션 전 data Set
     * @param sendData
     */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: SalesOrder[]) {
        if(sendData.length === 0){

            let soDate = '';
            if(this.salesorderHeaderForm.getRawValue().soDate === null ||
                this.salesorderHeaderForm.getRawValue().soDate.value === '' ||
                this.salesorderHeaderForm.getRawValue().soDate === undefined ||
                this.salesorderHeaderForm.getRawValue().soDate === ''){
            }else{
                soDate = this.salesorderHeaderForm.controls['soDate'].value;
            }

            sendData.push({
                account: this.salesorderHeaderForm.controls['account'].value,
                soNo: this.salesorderHeaderForm.controls['soNo'].value,
                type: this.salesorderHeaderForm.controls['type'].value,
                status: this.salesorderHeaderForm.controls['status'].value,
                remarkHeader: this.salesorderHeaderForm.controls['remarkHeader'].value,
                address: this.salesorderHeaderForm.controls['address'].value,
                dlvAccount: this.salesorderHeaderForm.controls['dlvAccount'].value,
                dlvAddress: this.salesorderHeaderForm.controls['dlvAddress'].value,
                dlvDate: this.salesorderHeaderForm.controls['dlvDate'].value,
                email: '',
                itemCd: '',
                itemGrade: '',
                itemNm: '',
                mId: '',
                obNo: '',
                qty: 0,
                remarkDetail: '',
                reqQty: 0,
                soAmt: 0,
                soCreDate: '',
                soDate: soDate,
                soLineNo: 0,
                standard: '',
                unit: '',
                unitPrice: 0
            });
        }else{
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < sendData.length; i++) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                sendData[i].account = this.salesorderHeaderForm.controls['account'].value;
                sendData[i].soNo = this.salesorderHeaderForm.controls['soNo'].value;
                sendData[i].type = this.salesorderHeaderForm.controls['type'].value;
                sendData[i].status = this.salesorderHeaderForm.controls['status'].value;
                sendData[i].address = this.salesorderHeaderForm.controls['address'].value;
                sendData[i].dlvAccount = this.salesorderHeaderForm.controls['dlvAccount'].value;
                sendData[i].dlvAddress = this.salesorderHeaderForm.controls['dlvAddress'].value;
                sendData[i].dlvDate = this.salesorderHeaderForm.controls['dlvDate'].value;
                sendData[i].remarkHeader = this.salesorderHeaderForm.controls['remarkHeader'].value;
                if(this.salesorderHeaderForm.getRawValue().soDate.value === '' ||
                    this.salesorderHeaderForm.getRawValue().soDate === undefined ||
                    this.salesorderHeaderForm.getRawValue().soDate === null ||
                    this.salesorderHeaderForm.getRawValue().soDate === ''){
                    sendData[i].soDate = '';
                }else{
                    sendData[i].soDate = this.salesorderHeaderForm.controls['soDate'].value;
                }
            }
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
        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result) {
                    const rtn = this._salesorderService.getDetailReport(0, 1000, 'soLineNo', 'asc', this.salesorderHeaderForm.getRawValue());

                    rtn.then((ex) => {
                        if(ex.salesorderDetail){
                            if(ex.salesorderDetail != null){
                                this._router.navigate(['bound/inbound/inbound-new'], {
                                    state: {
                                        'header': this.salesorderHeaderForm.getRawValue(),
                                        'detail': ex.salesorderDetail
                                    }
                                });
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                                return;
                            }
                        }
                    });
                    // this.salesorderDetails$ = this._salesorderService.salesorderDetails$;
                    // this._salesorderService.salesorderDetails$
                    //     .pipe(takeUntil(this._unsubscribeAll))
                    //     .subscribe((salesorderDetail: any) => {
                    //         if (salesorderDetail != null) {
                    //             const row = {header: this.salesorderHeaderForm.getRawValue(), detail: salesorderDetail};
                    //             // eslint-disable-next-line max-len
                    //             this._router.navigate(['bound/inbound/inbound-new'], {
                    //                 state: {
                    //                     'header': this.salesorderHeaderForm.getRawValue(),
                    //                     'detail': salesorderDetail
                    //                 }
                    //             });
                    //         }
                    //         // Mark for check
                    //         this._changeDetectorRef.markForCheck();
                    //     });
                }
            });
    }

    //데이터 재 로딩
    reData(): void {
        const searchForm = {
            soNo:  this.salesorderHeaderForm.getRawValue().soNo
        };
        const header = this._salesorderService.getHeader(0, 1, '', this.orderBy, searchForm);
        header.then((ex) => {
            if(ex.salesorderHeader.length === 1){
                this.salesorderHeaderForm.patchValue(
                    ex.salesorderHeader[0]
                );
                this._changeDetectorRef.markForCheck();
            }
        }).then((ex) => {
            this._salesorderService.getDetail(0, 100, 'soLineNo', 'asc', this.salesorderHeaderForm.getRawValue());

            this.setGridData();

            this._salesorderService.salesorderDetailPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((salesorderDetailPagenation: SalesOrderDetailPagenation) => {
                    // Update the pagination
                    this.salesorderDetailPagenation = salesorderDetailPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });

    }
    openDlvAccountCancel(): void {
        this.salesorderHeaderForm.patchValue({'dlvAccount': ''});
        this.salesorderHeaderForm.patchValue({'dlvAccountNm': ''});
        this.salesorderHeaderForm.patchValue({'dlvAddress': ''});
    }

    openDlvAccountSearch(): void {
        if (!this.isMobile) {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_DLVACCOUNT',
                    headerText: '납품처 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.salesorderHeaderForm.patchValue({'dlvAccount': result.accountCd});
                        this.salesorderHeaderForm.patchValue({'dlvAccountNm': result.accountNm});
                        this.salesorderHeaderForm.patchValue({'dlvAddress': result.address});
                    }
                });
        } else {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '납품처 조회'
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    popup.updateSize('calc(100vw - 10px)', '');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.salesorderHeaderForm.patchValue({'dlvAccount': result.accountCd});
                        this.salesorderHeaderForm.patchValue({'dlvAccountNm': result.accountNm});
                        this.salesorderHeaderForm.patchValue({'dlvAddress': result.address});
                    }
                });
        }
    }

    priceToString(price): string {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}
