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
    EstimateDetailPagenation
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
    qtAmts: any = null;
    filterList: string[];
    minDate: string;
    minqtAtm: number;
    estimateHeaderForm: FormGroup;
    estimateDetailPagenation: EstimateDetailPagenation | null = null;
    estimateDetails$ = new Observable<EstimateDetail[]>();
    orderBy: any = 'asc';
    price: any = '';
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
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'refItemNm', dataType: ValueType.TEXT},
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
        // this.qtAmts = _utilService.commonValueFilter()
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // Form ??????
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            qtNo: [{value: '', disabled: true}],   // ????????????
            account: [{value: '', disabled: true}, [Validators.required]], // ????????? ??????
            accountNm: [{value: '', disabled: true}],   // ????????? ???
            type: [{value: '', disabled: true}, [Validators.required]],   // ??????
            status: [{value: '', disabled: true}, [Validators.required]],   // ??????
            qtAmt: [{value: '', disabled: true},],    // ????????????
            soNo: [{value: '', disabled: true}],   // ????????????
            qtCreDate: [{value: '', disabled: true}],//?????? ????????????
            qtDate: [{value: '', disabled: false}, [Validators.required]], //????????????
            effectiveDate: [{value: ''}, [Validators.required]], //????????? ????????????
            deliveryDate: [{value: ''}],
            email: [''],//?????????
            cellPhoneNumber: [''],//????????????
            remarkHeader: [''], //??????
            toAccountNm: [''],
            custBusinessNumber: [''],// ????????? ????????????
            custBusinessName: [''],//??????
            representName: [''],//??????
            address: [''],//??????
            businessCondition: [''],// ??????
            businessCategory: [''],// ??????
            phoneNumber: [''],// ????????????
            fax: [''],// ????????????
            active: [false]  // cell
        });
        const now = new Date();
        this.minDate = formatDate(new Date(now.setDate(now.getDate() + 1)), 'yyyy-MM-dd', 'en');
        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)) {
            this.estimateHeaderForm.patchValue(
                this._activatedRoute.snapshot.paramMap['params']
            );

            this.estimateHeaderForm.patchValue({
                'qtAmt':
                    this.priceToString(this._activatedRoute.snapshot.paramMap['params'].qtAmt)
            });

            this._estimateService.getDetail(0, 100, 'qtLineNo', 'asc', this.estimateHeaderForm.getRawValue());
        }

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });
        //????????? ??????
        this._estimateDetailPagenator._intl.itemsPerPageLabel = '';
        //????????? ??????
        this.estimateDetailColumns = [
            {
                name: 'effectiveDate',
                fieldName: 'effectiveDate',
                type: 'date',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '????????? ????????????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
                ,
                datetimeFormat: 'yyyy-MM-dd'
                ,
                mask: {editMask: '9999-99-99', includeFormat: false, allowEmpty: true}
                ,
                editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM-dd',
                    textReadOnly: true,
                    minDate: this.minDate
                }
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text red-font-color'}
                , renderer: 'itemGrdPopup'
                , popUpObject:
                    {
                        popUpId: 'P$_ALL_ITEM',
                        popUpHeaderText: '?????? ??????',
                        popUpDataSet: 'itemCd:itemCd|itemNm:itemNm|fomlInfo:fomlInfo|refItemNm:refItemNm|standard:standard|unit:unit|itemGrade:itemGrade',
                        where: [{
                            key: 'account',
                            replace: 'account:=:#{account}'
                        }]
                    }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'refItemNm', fieldName: 'refItemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????? ?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard', fieldName: 'standard', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesItemGrades,
                labels: lablesItemGrades,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.itemGrades),
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text red-font-color'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'qtPrice', fieldName: 'qtPrice', type: 'data', width: '150', styleName: 'right-cell-text'
                , header: {text: '??????(VAT??????)', styleName: 'center-cell-text red-font-color'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'qtAmt', fieldName: 'qtAmt', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'remarkDetail', fieldName: 'remarkDetail', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //????????? Provider
        this.estimateDetailDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //????????? ??????
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.estimateDetailDataProvider,
            'estimateDetailGrid',
            this.estimateDetailColumns,
            this.estimateDetailFields,
            gridListOption);

        //????????? ??????
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

        // ??? edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            //?????????
            if (dataCell.item.rowState === 'created') {
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'fomlInfo' ||
                    dataCell.dataColumn.fieldName === 'refItemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade' ||
                    dataCell.dataColumn.fieldName === 'qtAmt') {
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            } else {
                if (dataCell.dataColumn.fieldName === 'itemCd' ||
                    dataCell.dataColumn.fieldName === 'itemNm' ||
                    dataCell.dataColumn.fieldName === 'fomlInfo' ||
                    dataCell.dataColumn.fieldName === 'refItemNm' ||
                    dataCell.dataColumn.fieldName === 'standard' ||
                    dataCell.dataColumn.fieldName === 'unit' ||
                    dataCell.dataColumn.fieldName === 'itemGrade' ||
                    dataCell.dataColumn.fieldName === 'qtAmt') {

                    this._realGridsService.gfn_PopUpBtnHide('itemGrdPopup');
                    return {editable: false};
                } else {
                    return {editable: true};
                }
            }

            if (dataCell.dataColumn.fieldName === 'qtAmt' ||
                dataCell.dataColumn.fieldName === 'fomlInfo' ||
                dataCell.dataColumn.fieldName === 'refItemNm') {
                return {editable: false};
            }
        });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellEdited = ((grid, itemIndex, row, field) => {
            if (this.estimateDetailDataProvider.getOrgFieldName(field) === 'qty' ||
                this.estimateDetailDataProvider.getOrgFieldName(field) === 'qtPrice') {
                const that = this;
                setTimeout(() => {
                    const qty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.estimateDetailDataProvider,
                        itemIndex, 'qty');
                    const qtPrice = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList,
                        this.estimateDetailDataProvider,
                        itemIndex, 'qtPrice');
                    that._realGridsService.gfn_CellDataSetRow(that.gridList,
                        that.estimateDetailDataProvider,
                        itemIndex,
                        'qtAmt',
                        qty * qtPrice);
                }, 100);
            }
        });
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_PopUp(this.isMobile, this.isExtraSmall, this.gridList, this.estimateDetailDataProvider, this.estimateDetailColumns, this._matDialogPopup, this._unsubscribeAll, this._changeDetectorRef, this.estimateHeaderForm);

        //??????
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                this._realGridsService.gfn_GridLoadingBar(this.gridList, this.estimateDetailDataProvider, true);
                // eslint-disable-next-line max-len
                const rtn = this._estimateService.getDetail(this.estimateDetailPagenation.page, this.estimateDetailPagenation.size, clickData.column, this.orderBy, this.estimateHeaderForm.getRawValue());
                this.loadingEnd(rtn);
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

    loadingEnd(rtn: any): void {
        rtn.then(() => {
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.estimateDetailDataProvider, false);
        });
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
        this.reportHeaderData.date = this.estimateHeaderForm.getRawValue().qtDate;
        this.reportHeaderData.remark = this.estimateHeaderForm.getRawValue().remarkHeader;
        this.reportHeaderData.custBusinessNumber = this.estimateHeaderForm.getRawValue().custBusinessNumber;// ????????? ????????????
        this.reportHeaderData.custBusinessName = this.estimateHeaderForm.getRawValue().custBusinessName;//??????
        this.reportHeaderData.representName = this.estimateHeaderForm.getRawValue().representName;//??????
        this.reportHeaderData.address = this.estimateHeaderForm.getRawValue().address;//??????
        this.reportHeaderData.businessCondition = this.estimateHeaderForm.getRawValue().businessCondition;// ??????
        this.reportHeaderData.businessCategory = this.estimateHeaderForm.getRawValue().businessCategory;// ??????
        this.reportHeaderData.phoneNumber = '0' + this.estimateHeaderForm.getRawValue().phoneNumber;// ????????????
        this.reportHeaderData.fax = '0' + this.estimateHeaderForm.getRawValue().fax;// ????????????
        this.reportHeaderData.toAccountNm = this.estimateHeaderForm.getRawValue().toAccountNm;
        this.reportHeaderData.deliveryDate = this.estimateHeaderForm.getRawValue().deliveryDate;
        this.reportHeaderData.deliveryAddress = '';

        const popup = this._matDialogPopup.open(CommonReportComponent, {
            data: {
                divisionText: '??????',
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

        if (status !== 'N') {
            this._functionService.cfn_alert('?????? ??????????????? ?????? ???????????????.');
            return;
        }

        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        if (!this.estimateHeaderForm.invalid) {
            let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.estimateDetailDataProvider);

            let detailCheck = false;

            // if(this.estimateHeaderForm.untouched){
            //     this._functionService.cfn_alert('????????? ????????? ???????????? ????????????.');
            //     detailCheck = true;
            // }

            if (detailCheck) {
                return;
            }

            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
                message: '?????????????????????????',
                actions: {
                    confirm: {
                        label: '??????'
                    },
                    cancel: {
                        label: '??????'
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
            this._functionService.cfn_alert('???????????? ??????????????????.');
        }
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('??????????????? ?????????????????????.');
            this.reData();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    priceToString(price): string {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /* ???????????? ??? data Set
     * @param sendData
     */

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: Estimate[]) {
        if (sendData.length === 0) {
            let effectiveDate = '';
            if (this.estimateHeaderForm.getRawValue().effectiveDate.value === '' ||
                this.estimateHeaderForm.getRawValue().effectiveDate === undefined ||
                this.estimateHeaderForm.getRawValue().effectiveDate === null ||
                this.estimateHeaderForm.getRawValue().effectiveDate === '') {
            } else {
                effectiveDate = this.estimateHeaderForm.controls['effectiveDate'].value;
            }

            let deliveryDate = '';
            if (
                this.estimateHeaderForm.getRawValue().deliveryDate === null ||
                this.estimateHeaderForm.getRawValue().deliveryDate.value === '' ||
                this.estimateHeaderForm.getRawValue().deliveryDate === undefined ||
                this.estimateHeaderForm.getRawValue().deliveryDate === '') {
            } else {
                deliveryDate = this.estimateHeaderForm.controls['deliveryDate'].value;
            }


            let qtDate = '';
            if (
                this.estimateHeaderForm.getRawValue().qtDate === null ||
                this.estimateHeaderForm.getRawValue().qtDate.value === '' ||
                this.estimateHeaderForm.getRawValue().qtDate === undefined ||
                this.estimateHeaderForm.getRawValue().qtDate === '') {
            } else {
                qtDate = this.estimateHeaderForm.controls['qtDate'].value;
            }

            sendData.push({
                account: this.estimateHeaderForm.controls['account'].value,
                qtNo: this.estimateHeaderForm.controls['qtNo'].value,
                type: this.estimateHeaderForm.controls['type'].value,
                status: this.estimateHeaderForm.controls['status'].value,
                email: this.estimateHeaderForm.controls['email'].value,
                cellPhoneNumber: this.estimateHeaderForm.controls['cellPhoneNumber'].value,
                remarkHeader: this.estimateHeaderForm.controls['remarkHeader'].value,
                effectiveDateH: effectiveDate,
                deliveryDate: deliveryDate,
                itemCd: '',
                itemGrade: '',
                itemNm: '',
                mId: '',
                qtAmt: 0,
                qtCreDate: '',
                qtDate: qtDate,
                qtLineNo: 0,
                qtPrice: 0,
                qty: 0,
                remarkDetail: '',
                soNo: '',
                standard: '',
                unit: '',
            });

        } else {
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < sendData.length; i++) {
                // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
                sendData[i].account = this.estimateHeaderForm.controls['account'].value;
                sendData[i].qtNo = this.estimateHeaderForm.controls['qtNo'].value;
                sendData[i].type = this.estimateHeaderForm.controls['type'].value;
                sendData[i].status = this.estimateHeaderForm.controls['status'].value;
                sendData[i].email = this.estimateHeaderForm.controls['email'].value;
                sendData[i].cellPhoneNumber = this.estimateHeaderForm.controls['cellPhoneNumber'].value;
                sendData[i].remarkHeader = this.estimateHeaderForm.controls['remarkHeader'].value;

                if (this.estimateHeaderForm.getRawValue().effectiveDate.value === '' ||
                    this.estimateHeaderForm.getRawValue().effectiveDate === undefined ||
                    this.estimateHeaderForm.getRawValue().effectiveDate === null ||
                    this.estimateHeaderForm.getRawValue().effectiveDate === '') {
                    sendData[i].effectiveDateH = '';
                } else {
                    sendData[i].effectiveDateH = this.estimateHeaderForm.controls['effectiveDate'].value;
                }

                if (this.estimateHeaderForm.getRawValue().deliveryDate.value === '' ||
                    this.estimateHeaderForm.getRawValue().deliveryDate === undefined ||
                    this.estimateHeaderForm.getRawValue().deliveryDate === null ||
                    this.estimateHeaderForm.getRawValue().deliveryDate === '') {
                    sendData[i].deliveryDate = '';
                } else {
                    sendData[i].deliveryDate = this.estimateHeaderForm.controls['deliveryDate'].value;
                }
                if (this.estimateHeaderForm.getRawValue().qtDate.value === '' ||
                    this.estimateHeaderForm.getRawValue().qtDate === undefined ||
                    this.estimateHeaderForm.getRawValue().qtDate === null ||
                    this.estimateHeaderForm.getRawValue().qtDate === '') {
                    sendData[i].qtDate = '';
                } else {
                    sendData[i].qtDate = this.estimateHeaderForm.controls['qtDate'].value;
                }
            }
        }
        return sendData;
    }

    addRow(): boolean {
        const qtStatus = this.estimateHeaderForm.controls['status'].value;
        if (qtStatus !== 'N') {
            this._functionService.cfn_alert('?????? ???????????? ????????? ??? ????????????.');
            return false;
        }
        let effectiveDate = '';
        if (this.estimateHeaderForm.getRawValue().effectiveDate.value === '' ||
            this.estimateHeaderForm.getRawValue().effectiveDate === undefined ||
            this.estimateHeaderForm.getRawValue().effectiveDate === null ||
            this.estimateHeaderForm.getRawValue().effectiveDate === '') {
            effectiveDate = '';
        } else {
            effectiveDate = this.estimateHeaderForm.getRawValue().effectiveDate;
        }
        const values = [
            effectiveDate, '', '', '', '', '', '', '', '', 0, 0, 0, ''
        ];
        this._realGridsService.gfn_AddRow(this.gridList, this.estimateDetailDataProvider, values);

    }

    delRow(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.estimateDetailDataProvider);

        const qtStatus = this.estimateHeaderForm.controls['status'].value;
        if (qtStatus !== 'N') {
            this._functionService.cfn_alert('?????? ???????????? ????????? ??? ????????????.');
            return false;
        }
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.estimateDetailDataProvider);

    }

    //?????????
    pageEvent($event: PageEvent): void {
        // eslint-disable-next-line max-len
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.estimateDetailDataProvider, true);
        const rtn = this._estimateService.getDetail(this._estimateDetailPagenator.pageIndex, this._estimateDetailPagenator.pageSize, 'qtLineNo', this.orderBy, this.estimateHeaderForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {
            if(ex._value) {
                this._realGridsService.gfn_GridLoadingBar(this.gridList, this.estimateDetailDataProvider, false);
            }
        });
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
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????? ????????????');
    }

    // ????????? ??????
    effectiveDateChange(): void {
        this._changeDetectorRef.markForCheck();

        let effectiveDate = this.estimateHeaderForm.getRawValue().effectiveDate;
        if (this.estimateHeaderForm.getRawValue().effectiveDate.value === '' ||
            this.estimateHeaderForm.getRawValue().effectiveDate === undefined ||
            this.estimateHeaderForm.getRawValue().effectiveDate === null ||
            this.estimateHeaderForm.getRawValue().effectiveDate === '') {
            effectiveDate = '';
        } else {
            effectiveDate = this.estimateHeaderForm.getRawValue().effectiveDate;
        }

        this._realGridsService.gfn_AllDataSetRow(this.gridList, this.estimateDetailDataProvider, 'effectiveDate', effectiveDate);

    }

    //????????? ??? ??????
    reData(): void {

        const searchForm = {
            qtNo: this.estimateHeaderForm.getRawValue().qtNo
        };
        const header = this._estimateService.getHeader(0, 1, '', this.orderBy, searchForm);
        header.then((ex) => {
            if (ex.estimateHeader.length === 1) {
                ex.estimateHeader.forEach((data) => {
                    // @ts-ignore
                    if (data.cellPhoneNumber === 0) {
                        data.cellPhoneNumber = '';
                    } else {
                        data.cellPhoneNumber = '0' + data.cellPhoneNumber;
                    }
                });

                this.estimateHeaderForm.patchValue(
                    ex.estimateHeader[0]
                );
                this._changeDetectorRef.markForCheck();
            }
        }).then((ex) => {
            this._estimateService.getDetail(0, 100, 'qtLineNo', 'asc', this.estimateHeaderForm.getRawValue());

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
