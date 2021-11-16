import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {merge, Observable, Subject} from "rxjs";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Bill, BillPagenation} from "./bill.types";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {MatDialog} from "@angular/material/dialog";
import {BillService} from "./bill.service";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {ActivatedRoute, Router} from "@angular/router";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import * as moment from "moment";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {BillTaxComponent} from "./bill-tax/bill-tax.component";

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
    isProgressSpinner: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    taxGbn: CommonCode[] = null;
    type: CommonCode[] = null;
    billColumns: Columns[];
    bills$: Observable<Bill[]>;
    isSearchForm: boolean = false;
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    billPagenation: BillPagenation | null = null;
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '공급자'
        },
        {
            id: '101',
            name: '공급받는 자'
        }];
    searchCondition2: CommonCode[] = [
        {
            id: 'billing',
            name: '청구 번호'
        }];

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
        {fieldName: 'invoice', dataType: ValueType.TEXT},
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountNm', dataType: ValueType.TEXT},
        {fieldName: 'toAccount', dataType: ValueType.TEXT},
        {fieldName: 'toAccountNm', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
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
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.type = _utilService.commonValue(_codeStore.getValue().data,'BL_TYPE');
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data,'TAX_GBN');
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
            searchCondition: ['100'],
            searchCondition2: ['billing'],
            searchText: [''],
            searchText2: [''],
            range: [{
                start: moment().utc(false).add(-7, 'day').endOf('day').toISOString(),
                end: moment().utc(false).startOf('day').toISOString()
            }],
            start: [],
            end: [],

        });

        const valuesType = [];
        const lablesType = [];

        const valuesTaxGbn = [];
        const lablesTaxGbn = [];

        this.type.forEach((param: any) => {
            valuesType.push(param.id);
            lablesType.push(param.name);
        });

        this.taxGbn.forEach((param: any) => {
            valuesTaxGbn.push(param.id);
            lablesTaxGbn.push(param.name);
        });

        //그리드 컬럼
        this.billColumns = [
            {name: 'billingCreDate', fieldName: 'billingCreDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '생성일자' , styleName: 'left-cell-text'}
            },
            {name: 'billingDate', fieldName: 'billingDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '마감일자' , styleName: 'left-cell-text'}
            },
            {name: 'billing', fieldName: 'billing', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '청구번호', styleName: 'left-cell-text'}},
            {name: 'invoice', fieldName: 'invoice', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '문서번호', styleName: 'left-cell-text'}},
            {name: 'accountNm', fieldName: 'accountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급자' , styleName: 'left-cell-text'}},
            {name: 'toAccountNm', fieldName: 'toAccountNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '공급받는 자' , styleName: 'left-cell-text'}},
            {name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목코드' , styleName: 'left-cell-text'}},
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목명' , styleName: 'left-cell-text'}},
            {name: 'type', fieldName: 'type', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '유형', styleName: 'left-cell-text'},
                values: valuesType,
                labels: lablesType,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.type),
            },
            {name: 'taxGbn', fieldName: 'taxGbn', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '거래유형', styleName: 'left-cell-text'},
                values: valuesTaxGbn,
                labels: lablesTaxGbn,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.taxGbn),
            },
            {name: 'billingQty', fieldName: 'billingQty', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '수량' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'billingAmt', fieldName: 'billingAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '공급가액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'taxAmt', fieldName: 'taxAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '세액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
            {name: 'billingTotalAmt', fieldName: 'billingTotalAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '총 금액' , styleName: 'left-cell-text'}
                , numberFormat : '#,##0'
            },
        ];
        //그리드 Provider
        this.billDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
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
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            deletable: false,
            checkable: true,
            softDeleting: false,
            //hideDeletedRows: false,
        });
        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false});
        //this._realGridsService.gfn_EditGrid(this.gridList);

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if(clickData.cellType === 'header'){
                if(clickData.cellType !== 'head'){
                    this.searchSetValue();
                    // eslint-disable-next-line max-len
                    this._billService.getHeader(this.billPagenation.page,this.billPagenation.size,clickData.column,this.orderBy,this.searchForm.getRawValue());
                }
            }
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };
        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.setGridData();

        // Get the pagenation
        this._billService.billPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((billPagenation: BillPagenation) => {
                // Update the pagination
                this.billPagenation = billPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
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

    searchSetValue(): void{
        if (this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'toAccountNm': ''});
            this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        }else{
            this.searchForm.patchValue({'toAccountNm': this.searchForm.getRawValue().searchText});
            this.searchForm.patchValue({'accountNm': ''});
        }
        if (this.searchForm.getRawValue().searchCondition2 === 'billing') {
            this.searchForm.patchValue({'billing': this.searchForm.getRawValue().searchText2});
        }
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

        this.searchSetValue();
        this._billService.getHeader(0, 20, 'billing', 'desc', this.searchForm.getRawValue());

        this.setGridData();
    }

    searchFormClick(): void {
        if(this.isSearchForm){
            this.isSearchForm = false;
        }else{
            this.isSearchForm = true;
        }
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '정산 및 마감 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {

        this.searchSetValue();
        this._billService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'billing', this.orderBy, this.searchForm.getRawValue());
    }

    enter(event): void {
        if(event.keyCode===13){
            this.selectHeader();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    taxSave() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.billDataProvider);
        if(checkValues.length < 1){
            this._functionService.cfn_alert('대상을 선택해주세요.');
            return;
        }else{
            const typeArr = [];
            const toAccountArr = [];
            const taxTypeArr = [];
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for(let i=0; i<checkValues.length; i++){
                typeArr.push(checkValues[i].type);
                toAccountArr.push(checkValues[i].toAccount);
                taxTypeArr.push(checkValues[i].taxGbn);
                if(checkValues[i].invoice === '' && checkValues[i].invoice === undefined
                    && checkValues[i].invoice === null){
                    this._functionService.cfn_alert('발행할 수 없는 상태입니다. 청구번호 : ' + checkValues[i].billing);
                    return false;

                }
            }

            const typeSet = new Set(typeArr);
            const toAccountSet = new Set(toAccountArr);
            const taxTypeSet = new Set(taxTypeArr);

            if(typeSet.size > 1){
                this._functionService.cfn_alert('매출, 매입은 따로 선택해야 합니다.');
                return false;
            }
            if(toAccountSet.size > 1){
                this._functionService.cfn_alert('다수 업체를 선택할 수 없습니다.');
                return false;
            }
            if(taxTypeSet.size > 1){
                this._functionService.cfn_alert('과세, 영세, 면세는 따로 선택해야 합니다.');
                return false;
            }

            if(!this.isMobile){
                const d = this._matDialog.open(BillTaxComponent, {
                    autoFocus: false,
                    maxHeight: '90vh',
                    disableClose: true,
                    data : {select : checkValues, button : 'save'}
                });

                d.afterClosed().subscribe(() => {
                    this.selectHeader();
                });
            }else{
                const d = this._matDialog.open(BillTaxComponent, {
                    autoFocus: false,
                    width: 'calc(100% - 50px)',
                    maxWidth: '100vw',
                    maxHeight: '80vh',
                    disableClose: true,
                    data : {select : checkValues, button : 'save'}
                });
                const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                    if (size.matches) {
                        d.updateSize('calc(100vw - 10px)','');
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
}
