import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {DeviceDetectorService} from "ngx-device-detector";
import {merge, Subject} from "rxjs";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {DiscountService} from "./discount.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {DiscountPagenation} from "./discount.types";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../core/common-code/state/code.store";

@Component({
    selector: 'app-admin-discount',
    templateUrl: 'discount.component.html',
    styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    drawerOpened: boolean = false;
    isLoading: boolean = false;
    isMobile: boolean = false;
    pagenation: any | null = null;
    searchForm: FormGroup;
    columns: Columns[];
    ynFlag: CommonCode[] = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dataProvider: RealGrid.LocalDataProvider;// @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    fields: DataFieldObject[] = [
        {fieldName: 'endFlag', dataType: ValueType.TEXT},
        {fieldName: 'discount', dataType: ValueType.TEXT},
        {fieldName: 'discountTitle', dataType: ValueType.TEXT},
        {fieldName: 'discountComment', dataType: ValueType.TEXT},
        {fieldName: 'discountRate', dataType: ValueType.NUMBER},
        {fieldName: 'remark', dataType: ValueType.TEXT},
    ];

    constructor(private _realGridsService: FuseRealGridService,
                private _formBuilder: FormBuilder,
                private _functionService: FunctionService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _codeStore: CodeStore,
                private _utilService: FuseUtilsService,
                private _deviceService: DeviceDetectorService,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _discountService: DiscountService) {
        this.isMobile = this._deviceService.isMobile();
        this.ynFlag = _utilService.commonValue(_codeStore.getValue().data, 'YN_FLAG');
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._discountService.getDiscount(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', 'desc', this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.dataProvider);
    }

    ngOnInit(): void {
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            discountTitle: ['']
        });

        const valuesFlag = [];
        const lablesFlag = [];

        this.ynFlag.forEach((param: any) => {
            valuesFlag.push(param.id);
            lablesFlag.push(param.name);
        });

        this.columns = [
            // {
            //     name: 'endFlag', fieldName: 'endFlag', type: 'data', width: '110', styleName: 'left-cell-text'
            //     , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     },
            //     values: valuesFlag,
            //     labels: lablesFlag,
            //     lookupDisplay: true,
            //     editor: this._realGridsService.gfn_ComboBox(this.ynFlag),
            // },
            // {
            //     name: 'discount',
            //     fieldName: 'discount',
            //     type: 'data',
            //     width: '100',
            //     styleName: 'left-cell-text'
            //     ,
            //     header: {text: '??????', styleName: 'center-cell-text'},
            //     renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'discountTitle',
                fieldName: 'discountTitle',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????', styleName: 'center-cell-text red-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'discountComment',
                fieldName: 'discountComment',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '??????', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'discountRate',
                fieldName: 'discountRate',
                type: 'data',
                width: '120',
                styleName: 'right-cell-text',
                header: {text: '?????????', styleName: 'center-cell-text red-font-color'},
                numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'remark', fieldName: 'remark', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //????????? ??????
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        // this.dataProvider.setOptions({
        //     softDeleting: false,
        //     deleteCreated: false
        // });

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'discount',
            this.columns,
            this.fields,
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
        const validationList = ['discountTitle', 'discountRate'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);

        //??????
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.dataProvider)) {
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
                    const rtn = this._discountService.getDiscount(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            };
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

        //this.select();
        this._changeDetectorRef.markForCheck();

    }

    select(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._discountService.getDiscount(0, 100, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, ex.discount);
            this._discountService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((discountPagenation: DiscountPagenation) => {
                    // Update the pagination
                    this.pagenation = discountPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if(ex.discount.length < 1){
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, false);
        });
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    //?????? ????????????
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '?????????');
    }

    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._discountService.getDiscount(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    // @ts-ignore
    addRow(): boolean {

        const values = [
            '','','',''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);
    }

    delRow(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.dataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ??????????????????.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.dataProvider);
    }

    saveDiscount(): void {

        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.dataProvider);

        let detailCheck = false;

        if (rows.length === 0) {
            this._functionService.cfn_alert('????????? ?????? ???????????? ????????????.');
            detailCheck = true;
        }

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
                    this._discountService.saveDiscount(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((discount: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(discount);
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('??????????????? ?????????????????????.');
            this.select();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }
}
