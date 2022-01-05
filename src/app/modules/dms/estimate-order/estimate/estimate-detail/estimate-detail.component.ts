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
import {
    Estimate,
    EstimateDetail,
    EstimateDetailPagenation, EstimateHeaderPagenation
} from '../estimate.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../../@teamplat/services/realgrid';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {EstimateService} from '../estimate.service';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonReportComponent} from '../../../../../../@teamplat/components/common-report';
import {ReportHeaderData} from '../../../../../../@teamplat/components/common-report/common-report.types';
import {formatDate} from "@angular/common";

@Component({
    selector: 'app-dms-estimate-detail',
    templateUrl: './estimate-detail.component.html',
    styleUrls: ['./estimate-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class EstimateDetailComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) private _estimateDetailPagenator: MatPaginator;
    isLoading: boolean = false;
    isMobile: boolean = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    itemGrades: CommonCode[] = null;
    filterList: string[];
    minDate: string;
    estimateHeaderForm: FormGroup;
    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    orderBy: any = 'asc';
    reportHeaderData: ReportHeaderData = new ReportHeaderData();

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    gridList: RealGrid.GridView;
    estimateDetailColumns: Columns[];
    // @ts-ignore
    estimateDetailDataProvider: RealGrid.LocalDataProvider;
    estimateDetailFields: DataFieldObject[] = [
        {fieldName: 'effectiveDate', dataType: ValueType.TEXT},
        {fieldName: 'qtLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
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
        private readonly breakpointObserver: BreakpointObserver) {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data, 'QT_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data, 'QT_STATUS', this.filterList);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // Form 생성
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            qtNo: [{value: '', disabled: true}],   // 견적번호
            account: [{value: '', disabled: true}, [Validators.required]], // 거래처 코드
            accountNm: [{value: '', disabled: true}],   // 거래처 명
            type: [{value: '', disabled: true}, [Validators.required]],   // 유형
            status: [{value: '', disabled: true}, [Validators.required]],   // 상태
            qtAmt: [{value: '', disabled: true}],   // 견적금액
            soNo: [{value: '', disabled: true}],   // 주문번호
            qtCreDate: [{value: '', disabled: true}],//견적 생성일자
            qtDate: [{value: '', disabled: true}], //견적일자
            effectiveDate: [{value: ''}], //견적가 적용일자
            deliveryDate: [{value: ''}],
            email: [''],//이메일
            remarkHeader: [''], //비고
            toAccountNm: [''],
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
        const now = new Date();
        this.minDate = formatDate(new Date(now.setDate(now.getDate() + 1)), 'yyyy-MM-dd', 'en');

        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)) {
            console.log(this._activatedRoute.snapshot.paramMap['params']);
            this.estimateHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this._estimateService.getDetail(0, 40, 'qtLineNo', 'asc', this.estimateHeaderForm.getRawValue());
        }

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });

        //페이지 라벨
        this._estimateDetailPagenator._intl.itemsPerPageLabel = '';
        //그리드 컬럼
        this.estimateDetailColumns = [
            {
                name: 'effectiveDate', fieldName: 'effectiveDate', type: 'date', width: '150', styleName: 'left-cell-text'
                , header: {text: '견적가 적용일자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , datetimeFormat: 'yyyy-MM-dd'
                , mask: {editMask: '9999-99-99', includeFormat: false, allowEmpty: true}
                , editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM-dd',
                    textReadOnly: true,
                    minDate: this.minDate
                }
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '품목 조회',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|standard:standard|unit:unit|itemGrade:itemGrade',
                        where : [{
                            key: 'account',
                            replace : 'account:=:#{account}'
                        }]
                    }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text'}, renderer: {
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
                name: 'qty', fieldName: 'qty', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '수량', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'qtPrice', fieldName: 'qtPrice', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '단가', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'qtAmt', fieldName: 'qtAmt', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '견적금액', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //그리드 Provider
        this.estimateDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
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
                    dataCell.dataColumn.fieldName === 'itemGrade'||
                    dataCell.dataColumn.fieldName === 'qtAmt' ) {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            } else {
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit'||
                    dataCell.dataColumn.fieldName === 'itemGrade' ||
                    dataCell.dataColumn.fieldName === 'qtAmt') {

                    this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }

            if (dataCell.dataColumn.fieldName === 'qtAmt') {
                return {editable: false};
            }
        });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellEdited = ((grid, itemIndex, row, field) => {
            if(this.estimateDetailDataProvider.getOrgFieldName(field) === 'qty' ||
                this.estimateDetailDataProvider.getOrgFieldName(field) === 'qtPrice'){
                const that = this;
                setTimeout(() =>{
                    const qty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.estimateDetailDataProvider,
                        itemIndex,'qty');
                    const qtPrice = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.estimateDetailDataProvider,
                        itemIndex,'qtPrice');
                    that._realGridsService.gfn_CellDataSetRow(that.gridList,
                        that.estimateDetailDataProvider,
                        itemIndex,
                        'qtAmt',
                        qty * qtPrice);
                },100);
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.estimateDetailDataProvider, this.estimateDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef,this.estimateHeaderForm);

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                // eslint-disable-next-line max-len
                this._estimateService.getDetail(this.estimateDetailPagenation.page, this.estimateDetailPagenation.size, clickData.column, this.orderBy, this.estimateHeaderForm.getRawValue());
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        this.setGridData();

        this._estimateService.estimateDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetailPagenation: EstimateDetailPagenation) => {
                // Update the pagination
                this.estimateDetailPagenation = estimateDetailPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        //this.estimateHeaderForm.patchValue({effectiveDate: ''});
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

    backPage(): void {
        this._router.navigate(['estimate-order/estimate']);
    }

    reportEstimate(): void {
        const estimateDetailData = [];
        let index = 0;
        const rows = this._realGridsService.gfn_GetRows(this.gridList, this.estimateDetailDataProvider);
        rows.forEach((data: any) => {
            index++;
            estimateDetailData.push({
                no: index,
                itemNm: data.itemNm,
                standard: data.standard,
                unit: data.unit,
                itemGrade: data.itemGrade,
                qty: data.qty,
                unitPrice: data.qtPrice,
                totalAmt: data.qtAmt,
                taxAmt: 0,
                remark: data.remarkDetail,
            });
        });
        this.reportHeaderData.no = this.estimateHeaderForm.getRawValue().qtNo;
        this.reportHeaderData.date = this.estimateHeaderForm.getRawValue().qtCreDate;
        this.reportHeaderData.remark = this.estimateHeaderForm.getRawValue().remarkHeader;
        this.reportHeaderData.custBusinessNumber = this.estimateHeaderForm.getRawValue().custBusinessNumber;// 사업자 등록번호
        this.reportHeaderData.custBusinessName = this.estimateHeaderForm.getRawValue().custBusinessName;//상호
        this.reportHeaderData.representName = this.estimateHeaderForm.getRawValue().representName;//성명
        this.reportHeaderData.address = this.estimateHeaderForm.getRawValue().address;//주소
        this.reportHeaderData.businessCondition = this.estimateHeaderForm.getRawValue().businessCondition;// 업태
        this.reportHeaderData.businessCategory = this.estimateHeaderForm.getRawValue().businessCategory;// 종목
        this.reportHeaderData.phoneNumber = '0' + this.estimateHeaderForm.getRawValue().phoneNumber;// 전화번호
        this.reportHeaderData.fax = '0' + this.estimateHeaderForm.getRawValue().fax;// 팩스번호
        this.reportHeaderData.toAccountNm = this.estimateHeaderForm.getRawValue().toAccountNm;
        this.reportHeaderData.deliveryDate = this.estimateHeaderForm.getRawValue().deliveryDate;
        this.reportHeaderData.deliveryAddress = '';

        const popup = this._matDialogPopup.open(CommonReportComponent, {
            data: {
                divisionText: '견적',
                division: 'ESTIMATE',
                header: this.reportHeaderData,
                body: estimateDetailData,
                tail: '',
            },
            autoFocus: false,
            maxHeight: '100vh',
            disableClose: true
        });
        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this._changeDetectorRef.markForCheck();
            });
    }

    saveEstimate(): void {

        const status = this.estimateHeaderForm.controls['status'].value;

        //확정은 불가능
        if (status === 'CF') {
            this._functionService.cfn_alert('저장 할 수 없습니다.');
            return;
        }

        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.estimateHeaderForm.invalid) {
            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.estimateDetailDataProvider);

            let detailCheck = false;

            // if(this.estimateHeaderForm.untouched){
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
                        this._estimateService.saveEstimate(rows)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((estimate: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this.alertMessage(estimate);
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

    alertMessage(param: any): void {
        if (param.status !== 'SUCCESS') {
            this._functionService.cfn_alert(param.msg);
        } else {
            //this.backPage();
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this.reData();
        }
    }

    /* 트랜잭션 전 data Set
     * @param sendData
     */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: Estimate[]) {
        if(sendData.length === 0){
            let effectiveDate = '';
            if(this.estimateHeaderForm.getRawValue().effectiveDate.value === '' ||
                this.estimateHeaderForm.getRawValue().effectiveDate === undefined ||
                this.estimateHeaderForm.getRawValue().effectiveDate === null ||
                this.estimateHeaderForm.getRawValue().effectiveDate === ''){
            }else{
                effectiveDate = this.estimateHeaderForm.controls['effectiveDate'].value;
            }

            let deliveryDate = '';
            if(this.estimateHeaderForm.getRawValue().deliveryDate.value === '' ||
                this.estimateHeaderForm.getRawValue().deliveryDate === undefined ||
                this.estimateHeaderForm.getRawValue().deliveryDate === null ||
                this.estimateHeaderForm.getRawValue().deliveryDate === ''){
            }else{
                deliveryDate = this.estimateHeaderForm.controls['deliveryDate'].value;
            }

            sendData.push({
                account: this.estimateHeaderForm.controls['account'].value,
                qtNo: this.estimateHeaderForm.controls['qtNo'].value,
                type: this.estimateHeaderForm.controls['type'].value,
                status: this.estimateHeaderForm.controls['status'].value,
                email: this.estimateHeaderForm.controls['email'].value,
                remarkHeader: this.estimateHeaderForm.controls['remarkHeader'].value,
                effectiveDateH: effectiveDate,
                deliveryDate: deliveryDate,
                itemCd: '',
                itemGrade: '',
                itemNm: '',
                mId: '',
                qtAmt: 0,
                qtCreDate: '',
                qtDate: '',
                qtLineNo: 0,
                qtPrice: 0,
                qty: 0,
                remarkDetail: '',
                soNo: '',
                standard: '',
                unit: '',
            });

        }else{
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < sendData.length; i++) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                sendData[i].account = this.estimateHeaderForm.controls['account'].value;
                sendData[i].qtNo = this.estimateHeaderForm.controls['qtNo'].value;
                sendData[i].type = this.estimateHeaderForm.controls['type'].value;
                sendData[i].status = this.estimateHeaderForm.controls['status'].value;
                sendData[i].email = this.estimateHeaderForm.controls['email'].value;
                sendData[i].remarkHeader = this.estimateHeaderForm.controls['remarkHeader'].value;

                if(this.estimateHeaderForm.getRawValue().effectiveDate.value === '' ||
                    this.estimateHeaderForm.getRawValue().effectiveDate === undefined ||
                    this.estimateHeaderForm.getRawValue().effectiveDate === null ||
                    this.estimateHeaderForm.getRawValue().effectiveDate === ''){
                    sendData[i].effectiveDateH = '';
                }else{
                    sendData[i].effectiveDateH = this.estimateHeaderForm.controls['effectiveDate'].value;
                }

                if(this.estimateHeaderForm.getRawValue().deliveryDate.value === '' ||
                    this.estimateHeaderForm.getRawValue().deliveryDate === undefined ||
                    this.estimateHeaderForm.getRawValue().deliveryDate === null ||
                    this.estimateHeaderForm.getRawValue().deliveryDate === ''){
                    sendData[i].deliveryDate = '';
                }else{
                    sendData[i].deliveryDate = this.estimateHeaderForm.controls['deliveryDate'].value;
                }
            }
        }
        return sendData;
    }

    addRow(): void {
        let effectiveDate = '';
        if(this.estimateHeaderForm.getRawValue().effectiveDate === undefined ||
            this.estimateHeaderForm.getRawValue().effectiveDate === null ||
            this.estimateHeaderForm.getRawValue().effectiveDate === ''||
            this.estimateHeaderForm.getRawValue().effectiveDate.value === '' ||
            this.estimateHeaderForm.getRawValue().effectiveDate.value === undefined){
            effectiveDate = '';
        }else{
            effectiveDate = this.estimateHeaderForm.getRawValue().effectiveDate;
        }
        const values = [
            effectiveDate, '', '', '', '', '', '', 0, 0, 0, ''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.estimateDetailDataProvider, values);

    }

    delRow(): void {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.estimateDetailDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.estimateDetailDataProvider);

    }

    //페이징
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        this._estimateService.getDetail(this._estimateDetailPagenator.pageIndex, this._estimateDetailPagenator.pageSize, 'qtLineNo', this.orderBy, this.estimateHeaderForm.getRawValue());
    }

    setGridData(): void {
        this.estimateDetails$ = this._estimateService.estimateDetails$;
        this._estimateService.estimateDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estimateDetail: any) => {
                // Update the counts
                if (estimateDetail !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.estimateDetailDataProvider, estimateDetail);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '견적 상세목록');
    }

    // 견적가 변동
    effectiveDateChange(): void {
        this._changeDetectorRef.markForCheck();

        let effectiveDate = this.estimateHeaderForm.getRawValue().effectiveDate;
        if(this.estimateHeaderForm.getRawValue().effectiveDate === undefined ||
            this.estimateHeaderForm.getRawValue().effectiveDate === null ||
            this.estimateHeaderForm.getRawValue().effectiveDate === '' ||
            this.estimateHeaderForm.getRawValue().effectiveDate.value === '' ||
            this.estimateHeaderForm.getRawValue().effectiveDate.value === undefined){
            effectiveDate = '';
        }else{
            effectiveDate = this.estimateHeaderForm.getRawValue().effectiveDate;
        }

        this._realGridsService.gfn_AllDataSetRow(this.gridList, this.estimateDetailDataProvider, 'effectiveDate', effectiveDate);

    }

    //데이터 재 로딩
    reData(): void {

        const searchForm = {
            qtNo:  this.estimateHeaderForm.getRawValue().qtNo
        };
        const header = this._estimateService.getHeader(0, 1, '', this.orderBy, searchForm);
        header.then((ex) => {
            if(ex.estimateHeader.length === 1){
                this.estimateHeaderForm.patchValue(
                    ex.estimateHeader[0]
                );
                this._changeDetectorRef.markForCheck();
            }
        }).then((ex) => {
            this._estimateService.getDetail(0, 40, 'qtLineNo', 'asc', this.estimateHeaderForm.getRawValue());

            this.setGridData();

            this._estimateService.estimateDetailPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((estimateDetailPagenation: EstimateDetailPagenation) => {
                    // Update the pagination
                    this.estimateDetailPagenation = estimateDetailPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        });

    }
}
