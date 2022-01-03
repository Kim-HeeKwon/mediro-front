import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {merge, Observable, Subject} from 'rxjs';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Bill, BillPagenation} from './bill.types';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {MatDialog} from '@angular/material/dialog';
import {BillService} from './bill.service';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, Router} from '@angular/router';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import * as moment from 'moment';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {BillTaxComponent} from './bill-tax/bill-tax.component';
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";

@Component({
    selector: 'dms-bill',
    templateUrl: './bill.component.html',
    styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy, AfterViewInit {

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isLoading: boolean = false;
    isMobile: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    taxGbn: CommonCode[] = null;
    taxGbnFilter: CommonCode[] = null;
    type: CommonCode[] = null;
    itemGrades: CommonCode[] = [];
    billColumns: Columns[];
    bills$: Observable<Bill[]>;
    isAccount: boolean = true;
    isToAccount: boolean = true;
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    billPagenation: BillPagenation | null = null;

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    billDataProvider: RealGrid.LocalDataProvider;
    billFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'billing', dataType: ValueType.TEXT},
        {fieldName: 'billingCreDate', dataType: ValueType.TEXT},
        {fieldName: 'billingDate', dataType: ValueType.TEXT},
        {fieldName: 'lineNo', dataType: ValueType.TEXT},
        {fieldName: 'obNo', dataType: ValueType.TEXT},
        {fieldName: 'obLineNo', dataType: ValueType.TEXT},
        {fieldName: 'invoice', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'bisNo', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'toAccount', dataType: ValueType.TEXT},
        {fieldName: 'toBisNo', dataType: ValueType.TEXT},
        {fieldName: 'toAccountNm', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'type', dataType: ValueType.TEXT},
        {fieldName: 'taxGbn', dataType: ValueType.TEXT},
        {fieldName: 'billingQty', dataType: ValueType.NUMBER},
        {fieldName: 'billingAmt', dataType: ValueType.NUMBER},
        {fieldName: 'taxAmt', dataType: ValueType.NUMBER},
        {fieldName: 'billingTotalAmt', dataType: ValueType.NUMBER},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _billService: BillService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _activatedRoute: ActivatedRoute,
        private _functionService: FunctionService,
        private _router: Router,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.type = _utilService.commonValue(_codeStore.getValue().data, 'BL_TYPE');
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data, 'TAX_GBN');
        this.taxGbnFilter = _utilService.commonValueFilter(_codeStore.getValue().data, 'TAX_GBN',['ALL']);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            taxGbn: ['ALL'],
            type: ['ALL'],
            accountNm: [''],
            toAccountNm: [''],
            billing: [''],
            obNo: [''],
            range: [{
                start: moment().utc(false).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(false).startOf('day').toISOString()
            }],
            start: [],
            end: [],
        });

        if (this._activatedRoute.snapshot.paramMap['params'] !== (null || undefined)
            && Object.keys(this._activatedRoute.snapshot.paramMap['params']).length > 0) {
            this.searchForm = this._formBuilder.group({
                taxGbn: ['ALL'],
                type: ['ALL'],
                accountNm: [''],
                toAccountNm: [''],
                billing: [''],
                obNo: [''],
                range: [{
                    start: moment().utc(false).add(-1, 'month').endOf('day').toISOString(),
                    end: moment().utc(false).startOf('day').toISOString()
                }],
                start: [],
                end: [],
            });
            this.searchForm.patchValue(this._activatedRoute.snapshot.paramMap['params']);
        }

        const valuesType = [];
        const lablesType = [];

        const valuesTaxGbn = [];
        const lablesTaxGbn = [];

        this.type.forEach((param: any) => {
            valuesType.push(param.id);
            lablesType.push(param.name);
        });

        this.taxGbnFilter.forEach((param: any) => {
            valuesTaxGbn.push(param.id);
            lablesTaxGbn.push(param.name);
        });

        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });

        //그리드 컬럼
        this.billColumns = [
            // {
            //     name: 'billing', fieldName: 'billing', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '청구번호', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'obNo', fieldName: 'obNo', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '출고번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'invoice', fieldName: 'invoice', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '문서번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'toAccountNm', fieldName: 'toAccountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급받는 자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
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
                , header: {text: '규격', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '단위', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'center-cell-text'},
                values: values,
                labels: lables,
                lookupDisplay: true, renderer:{
                    showTooltip:true
                }
            },
            {
                name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '유형', styleName: 'center-cell-text'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.type), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'taxGbn', fieldName: 'taxGbn', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '거래유형', styleName: 'center-cell-text'},
                values: valuesTaxGbn,
                labels: lablesTaxGbn,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.taxGbnFilter), renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'billingQty', fieldName: 'billingQty', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'billingAmt', fieldName: 'billingAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '공급가액', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'taxAmt', fieldName: 'taxAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '세액', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'billingTotalAmt',
                fieldName: 'billingTotalAmt',
                type: 'number',
                width: '100',
                styleName: 'right-cell-text'
                ,
                header: {text: '총 금액', styleName: 'center-cell-text'}
                ,
                numberFormat: '#,##0',
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'billingCreDate',
                fieldName: 'billingCreDate',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '생성일자', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'billingDate', fieldName: 'billingDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '마감일자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];
        //그리드 Provider
        this.billDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.billDataProvider,
            'billGrid',
            this.billColumns,
            this.billFields,
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
        this.gridList.setPasteOptions({enabled: false,});
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

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            if (dataCell.dataColumn.fieldName === 'taxGbn') {
                return {editable: true};
            }else{
                return {editable: false};
            }
        });
        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if (clickData.cellType !== 'head') {
                    this.searchSetValue();
                    // eslint-disable-next-line max-len
                    const rtn = this._billService.getHeader(this.billPagenation.page, this.billPagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.selectHeader();
        this._changeDetectorRef.markForCheck();
        // this.setGridData();
        //
        // // Get the pagenation
        // this._billService.billPagenation$
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((billPagenation: BillPagenation) => {
        //         // Update the pagination
        //         this.billPagenation = billPagenation;
        //         // Mark for check
        //         this._changeDetectorRef.markForCheck();
        //     });
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._billService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'billing', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.billDataProvider);
    }

    searchSetValue(): void {

        this.searchForm.patchValue({'start': this.searchForm.get('range').value.start});
        this.searchForm.patchValue({'end': this.searchForm.get('range').value.end});
    }

    setGridData(): void {

        this.bills$ = this._billService.bills$;
        this._billService.bills$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((bills: any) => {
                // Update the counts
                if (bills !== null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.billDataProvider, bills);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    selectHeader(): void {
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._billService.getHeader(0, 20, 'billing', 'desc', this.searchForm.getRawValue());

        //this.setGridData();
        this.selectCallBack(rtn);
    }

    searchFormClick(): void {
        if (this.isSearchForm) {
            this.isSearchForm = false;
        } else {
            this.isSearchForm = true;
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '정산 및 마감 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {

        this.searchSetValue();
        const rtn = this._billService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'billing', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    taxSave() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.billDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('대상을 선택해주세요.');
            return;
        } else {
            const typeArr = [];
            const toAccountArr = [];
            const taxTypeArr = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < checkValues.length; i++) {
                typeArr.push(checkValues[i].type);
                toAccountArr.push(checkValues[i].toAccount);
                taxTypeArr.push(checkValues[i].taxGbn);
                if (checkValues[i].invoice === '' && checkValues[i].invoice === undefined
                    && checkValues[i].invoice === null) {
                    this._functionService.cfn_alert('발행할 수 없는 상태입니다. 청구번호 : ' + checkValues[i].billing);
                    return false;

                }
            }

            const typeSet = new Set(typeArr);
            const toAccountSet = new Set(toAccountArr);
            const taxTypeSet = new Set(taxTypeArr);

            if (typeSet.size > 1) {
                this._functionService.cfn_alert('매출, 매입은 따로 선택해야 합니다.');
                return false;
            }
            if (toAccountSet.size > 1) {
                this._functionService.cfn_alert('다수 업체를 선택할 수 없습니다.');
                return false;
            }
            if (taxTypeSet.size > 1) {
                this._functionService.cfn_alert('과세, 영세, 면세는 따로 선택해야 합니다.');
                return false;
            }

            if (!this.isMobile) {
                const d = this._matDialog.open(BillTaxComponent, {
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true,
                    data: {select: checkValues, button: 'save'}
                });

                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                });
            } else {
                const d = this._matDialog.open(BillTaxComponent, {
                    autoFocus: false,
                    width: 'calc(100% - 50px)',
                    maxWidth: '100vw',
                    maxHeight: '80vh',
                    disableClose: true,
                    data: {select: checkValues, button: 'save'}
                });
                const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                    if (size.matches) {
                        d.updateSize('calc(100vw - 10px)', '');
                    } else {
                        // d.updateSize('calc(100% - 50px)', '');
                    }
                });
                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                    smallDialogSubscription.unsubscribe();
                });
            }
        }
        this._changeDetectorRef.markForCheck();
        this.selectHeader();
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.billDataProvider, ex.bill);
            this._billService.billPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((billPagenation: BillPagenation) => {
                    // Update the pagination
                    this.billPagenation = billPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.bill.length < 1){
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    selectTypeHeader(type: CommonCode[]): void {
        if(this.searchForm.getRawValue().type === 'B'){
            this.isAccount = true;
            this.isToAccount = false;
        }else if(this.searchForm.getRawValue().type === 'S'){
            this.isAccount = false;
            this.isToAccount = true;
        }else{
            this.isAccount = true;
            this.isToAccount = true;
        }
        this.isSearchForm = true;
        this.searchSetValue();
        const rtn = this._billService.getHeader(0, 20, 'billing', 'desc', this.searchForm.getRawValue());

        //this.setGridData();
        this.selectCallBack(rtn);
    }

    saveTaxGbn(): void {

        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.billDataProvider);
        if(rows.length < 1){
            this._functionService.cfn_alert('수정된 정보가 존재하지 않습니다.');
            return;
        }
        let detailCheck = false;

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < rows.length; i++) {
            console.log(rows[i].invoice);
            if (rows[i].invoice !== '' && rows[i].invoice !== null && rows[i].invoice !== undefined) {
                this._functionService.cfn_alert('마감 정보는 수정할 수 없습니다.');
                detailCheck = true;
                return;
            }
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
                    this._billService.saveTaxGbn(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((bill: any) => {
                            this.alertMessage(bill);
                        });
                }
            });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    alertMessage(param: any): void {
        if (param.status !== 'SUCCESS') {
            this._functionService.cfn_alert(param.msg);
        }else{
            this._functionService.cfn_alert('정상적으로 처리되었습니다.','check-circle');
        }
        this.selectHeader();
    }
}
