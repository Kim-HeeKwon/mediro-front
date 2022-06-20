import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ElementRef, Inject,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import {FuseAlertType} from "../alert";
import {FormBuilder, FormGroup} from "@angular/forms";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../services/realgrid/realgrid.types";
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {Subject} from "rxjs";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../services/realgrid";
import {CodeStore} from "../../../app/core/common-code/state/code.store";
import {TeamPlatConfirmationService} from "../../services/confirmation";
import {FunctionService} from "../../services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver} from "@angular/cdk/layout";
import {InboundScanService} from "./inbound-scan.service";
import {InboundService} from "../../../app/modules/dms/bound/inbound/inbound.service";
import {takeUntil} from "rxjs/operators";
import {formatDate} from "@angular/common";

@Component({
    selector: 'app-inbound-scan',
    templateUrl: './inbound-scan.component.html',
    styleUrls: ['./inbound-scan.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class InboundScanComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('udiCode') refUdiCode: ElementRef;
    @ViewChild('udiDiCode') refUdiDiCode: ElementRef;
    @ViewChild('udiPiCode') refUdiPiCode: ElementRef;
    @ViewChild('udiDirectCodes') refUdiDirectCode: ElementRef;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    barcodeYn: boolean = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;
    detail: any;
    detailN: any;
    grid2OrgIbQty: any = 1;
    getItemIndex: any;
    grid2OldValue: any;
    isLoading: boolean = false;
    searchForm: FormGroup;
    isMobile: boolean = false;
    // @ts-ignore
    gridList1: RealGrid.GridView;
    // @ts-ignore
    gridList1DataProvider: RealGrid.LocalDataProvider;
    gridList1Columns: Columns[];
    // @ts-ignore
    gridList1Fields: DataFieldObject[] = [
        {fieldName: 'ibNo', dataType: ValueType.TEXT},
        {fieldName: 'ibLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'medDevItemSeq', dataType: ValueType.TEXT},
        {fieldName: 'typeName', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'udiYn', dataType: ValueType.TEXT},
        {fieldName: 'ibExpQty', dataType: ValueType.NUMBER},
        {fieldName: 'ibQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'orgIbQty', dataType: ValueType.NUMBER},
    ];

    // @ts-ignore
    gridList2: RealGrid.GridView;
    // @ts-ignore
    gridList2DataProvider: RealGrid.LocalDataProvider;
    gridList2Columns: Columns[];
    // @ts-ignore
    gridList2Fields: DataFieldObject[] = [
        {fieldName: 'convertedQty', dataType: ValueType.NUMBER},
        {fieldName: 'useTmlmtUse', dataType: ValueType.TEXT},
        {fieldName: 'ibNo', dataType: ValueType.TEXT},
        {fieldName: 'ibLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'meddevItemSeq', dataType: ValueType.TEXT},
        {fieldName: 'seq', dataType: ValueType.TEXT},
        {fieldName: 'udiDiSeq', dataType: ValueType.TEXT},
        {fieldName: 'userSterilizationYn', dataType: ValueType.TEXT},
        {fieldName: 'kitYn', dataType: ValueType.TEXT},
        {fieldName: 'typeName', dataType: ValueType.TEXT},
        {fieldName: 'udiCode', dataType: ValueType.TEXT},
        {fieldName: 'lotNo', dataType: ValueType.TEXT},
        {fieldName: 'manufYm', dataType: ValueType.TEXT},
        {fieldName: 'useTmlmt', dataType: ValueType.TEXT},
        {fieldName: 'itemSeq', dataType: ValueType.TEXT},
        {fieldName: 'ibQty', dataType: ValueType.NUMBER},
    ];
    // eslint-disable-next-line @typescript-eslint/member-ordering
    filterList: string[];
    month: CommonCode[] = null;
    year: CommonCode[] = null;
    itemGrades: CommonCode[] = null;
    udiScan: CommonCode[] = [
        {id: 'ALL', name: '표준코드(UDI)'},
        {id: '0', name: '고유식별자(UDI-DI) + 생산식별자(UDI-PI)'},
        {id: '1', name: '직접 입력'},
    ];
    udiAll: boolean = true;
    udiDiPi: boolean;
    udiDirect: boolean;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<InboundScanComponent>,
        private _realGridsService: FuseRealGridService,
        public _matDialogPopup: MatDialog,
        private _inBoundScanService: InboundScanService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _inboundService: InboundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver) {
        this.filterList = ['ALL'];
        this.month = _utilService.commonValue(_codeStore.getValue().data, 'MONTH');
        this.year = _utilService.commonValue(_codeStore.getValue().data, 'YEAR');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');

        this.isMobile = this._deviceService.isMobile();
        this.detail = data.detail;
        this.detailN = data.detailN;
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList1, this.gridList1DataProvider);
        this._realGridsService.gfn_Destory(this.gridList2, this.gridList2DataProvider);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        const today = new Date();
        const YYYY = today.getFullYear();
        const mm = today.getMonth() + 1; //January is 0!
        let MM;
        if (mm < 10) {
            MM = String('0' + mm);
        } else {
            MM = String(mm);
        }
        // Form 생성
        this.searchForm = this._formBuilder.group({
            udiCode: [''],   // 바코드
            udiDiCode: [''],
            udiPiCode: [''],
            udiCodeBak: [''],   // 바코드
            stdCode: [''],   //
            gtin: [''],   //
            lotNo: [''],   //
            manufYm: [''],   //
            useTmlmt: [''],   //
            itemSeq: [''],   //
            year: [YYYY + ''],
            month: [''],
            suplyContStdmt: [''],
            active: [false],  // cell상태
            udiScan: ['ALL'],
            gtinDirect: [''],   // UDI NO
            manufYmDirect: [''],   // 제조일자
            useTmlmtDirect: [''],   // 유통기한
            lotNoDirect: [''],   // LOT NO
            itemSeqDirect: [''],   // 일련번호
        });

        this.searchForm.controls['year'].disable();
        this.searchForm.controls['month'].disable();

        this.searchForm.patchValue({'year': YYYY + ''});
        this.searchForm.patchValue({'month': MM + ''});
        this.searchForm.patchValue({'suplyContStdmt': this.searchForm.getRawValue().year + this.searchForm.getRawValue().month + ''});

        this.searchForm.controls['stdCode'].disable();
        this.searchForm.controls['gtin'].disable();
        this.searchForm.controls['lotNo'].disable();
        this.searchForm.controls['manufYm'].disable();
        this.searchForm.controls['useTmlmt'].disable();
        this.searchForm.controls['itemSeq'].disable();

        const valuesItemGrades = [];
        const lablesItemGrades = [];
        this.itemGrades.forEach((param: any) => {
            valuesItemGrades.push(param.id);
            lablesItemGrades.push(param.name);
        });
        //그리드 컬럼
        this.gridList1Columns = [
            // {
            //     name: 'ibNo', fieldName: 'ibNo', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '입고번호', styleName: 'center-cell-text'},
            //     renderer:{
            //         showTooltip:true
            //     }
            // },
            // {
            //     name: 'ibLineNo', fieldName: 'ibLineNo', type: 'data', width: '70', styleName: 'left-cell-text'
            //     , header: {text: 'No', styleName: 'center-cell-text'},
            //     renderer:{
            //         showTooltip:true
            //     }
            // },
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목 명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'medDevItemSeq', fieldName: 'medDevItemSeq', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '품목일련번호', styleName: 'center-cell-text'},
            //     renderer:{
            //         showTooltip:true
            //     }
            // },
            {
                name: 'typeName', fieldName: 'typeName', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '규격', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'unit', fieldName: 'unit', type: 'data', width: '80', styleName: 'left-cell-text'
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
                name: 'ibExpQty', fieldName: 'ibExpQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '입고예정수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'ibQty', fieldName: 'ibQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '입고수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '미입고수량', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },

        ];

        this.gridList1DataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption1 = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        const gridListDisplayOption1 = {
            useFocusClass: true,
        };

        this.gridList1DataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList1 = this._realGridsService.gfn_CreateGrid(
            this.gridList1DataProvider,
            'gridList1',
            this.gridList1Columns,
            this.gridList1Fields,
            gridListOption1,
            undefined,
            undefined,
            gridListDisplayOption1,);

        this.gridList1.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            deletable: false,
            checkable: true,
            softDeleting: false,
        });

        this.gridList1.deleteSelection(true);
        this.gridList1.setDisplayOptions({liveScroll: false,});
        this.gridList1.setPasteOptions({enabled: false,});

        //그리드 컬럼
        this.gridList2Columns = [
            {
                name: 'useTmlmtUse', fieldName: 'useTmlmtUse', type: 'data', width: '110', styleName: 'center-cell-text'
                , header: {text: '유효기간', styleName: 'center-cell-text',
                    template: '${headerText}<span class="material-icons text-13s text-bold-600 tooltip-hover-scan">\n' +
                        'help_outline\n' +
                        '<span class="tooltip-text-scan tooltip-scan">' +
                        '* 유통기한이 6개월 미만일 경우 위험으로 표시 *' +
                        '</span>',
                    values: { 'headerText':'유효기간' }},
                renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'ibNo', fieldName: 'ibNo', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '입고번호', styleName: 'center-cell-text'},
            //     renderer:{
            //         showTooltip:true
            //     }
            // },
            // {
            //     name: 'ibLineNo', fieldName: 'ibLineNo', type: 'data', width: '70', styleName: 'left-cell-text'
            //     , header: {text: 'No', styleName: 'center-cell-text'},
            //     renderer:{
            //         showTooltip:true
            //     }
            // },

            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목 명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'meddevItemSeq', fieldName: 'meddevItemSeq', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '품목일련번호', styleName: 'center-cell-text'},
            //     renderer:{
            //         showTooltip:true
            //     }
            // },
            {
                name: 'typeName', fieldName: 'typeName', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udiCode', fieldName: 'udiCode', type: 'data', width: '240', styleName: 'left-cell-text'
                , header: {text: '바코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'lotNo', fieldName: 'lotNo', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: 'Lot No.', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            //
            // {
            //     name: 'manufYm', fieldName: 'manufYm', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '제조일자', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            //
            // {
            //     name: 'useTmlmt', fieldName: 'useTmlmt', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '유통기한', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            //
            // {
            //     name: 'itemSeq', fieldName: 'itemSeq', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '일련번호', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'ibQty', fieldName: 'ibQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '입고수량', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },

        ];

        this.gridList2DataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption2 = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.gridList2 = this._realGridsService.gfn_CreateGrid(
            this.gridList2DataProvider,
            'gridList2',
            this.gridList2Columns,
            this.gridList2Fields,
            gridListOption2,);

        this.gridList2.setEditOptions({
            readOnly: false,
            insertable: false,
            appendable: false,
            editable: true,
            updatable: true,
            deletable: true,
            checkable: true,
            softDeleting: true,
        });

        this.gridList2.deleteSelection(true);
        this.gridList2.setDisplayOptions({liveScroll: false,});
        this.gridList2.setCopyOptions({
            enabled: true,
            singleMode: false
        });
        this.gridList2.setPasteOptions({
            enabled: true,
            commitEdit: true,
            checkReadOnly: true
        });
        this.gridList2.editOptions.commitByCell = true;
        this.gridList2.editOptions.validateOnEdited = true;
        this._realGridsService.gfn_EditGrid(this.gridList2);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList2.onCellEdited = ((grid, itemIndex, row, field) => {

            if (this.gridList2DataProvider.getOrgFieldName(field) === 'ibQty') {

                const that = this;

                //row 2 : 전체 meddevItemSeq, typename <비교> 입력한 meddevItemSeq, typeName
                const medDevItemSeq = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList2,
                    this.gridList2DataProvider,
                    itemIndex, 'meddevItemSeq');
                const typeName = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList2,
                    this.gridList2DataProvider,
                    itemIndex, 'typeName');

                const dataRow = this.gridList1DataProvider.searchDataRow({
                    fields: ['medDevItemSeq', 'typeName']
                    , values: [medDevItemSeq, typeName]
                });

                let chk = this._realGridsService.gfn_GetRows(this.gridList2, this.gridList2DataProvider);

                chk = chk.filter((detail: any) =>
                    (detail.meddevItemSeq === medDevItemSeq))
                    .map((param: any) => param);
                chk = chk.filter((detail: any) =>
                    (detail.typeName === typeName))
                    .map((param: any) => param);

                let ibQty = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow, 'ibQty');

                let qty = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow, 'qty');

                let inputOrgQty = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList2,
                    this.gridList2DataProvider,
                    itemIndex, 'ibQty');

                let row2SumIbQty = 0;

                if (chk.length > 0) {
                    chk.forEach((ex) => {
                        row2SumIbQty += ex.ibQty * ex.convertedQty;
                    });
                }

                // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
                this.gridList2.onEditCommit = ((grid, index, oldValue, newValue) => {
                    this.grid2OldValue = oldValue;
                });

                setTimeout(() => {

                    //row 1 : 입고 중 수량
                    const orgIbQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList1,
                        this.gridList1DataProvider,
                        dataRow, 'orgIbQty');

                    //row 1 : 입고 예정 수량
                    const ibExpQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList1,
                        this.gridList1DataProvider,
                        dataRow, 'ibExpQty');

                    row2SumIbQty = row2SumIbQty + orgIbQty;
                    //미입고 수량 row1

                    that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                        that.gridList1DataProvider,
                        dataRow,
                        'qty',
                        ibExpQty - row2SumIbQty);

                    //입고 수량 row1
                    that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                        that.gridList1DataProvider,
                        dataRow,
                        'ibQty',
                        row2SumIbQty);

                    const inputQty = that._realGridsService.gfn_CellDataGetRow(that.gridList1,
                        that.gridList1DataProvider,
                        dataRow,
                        'qty');

                    if(inputQty >= 0) {
                        this.grid2OrgIbQty = inputOrgQty;
                        this.getItemIndex = itemIndex;
                    }

                    if (inputQty < 0) {
                        that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                            that.gridList1DataProvider,
                            dataRow,
                            'ibQty',
                            ibQty);

                        that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                            that.gridList1DataProvider,
                            dataRow,
                            'qty',
                            qty);

                        if(this.getItemIndex === itemIndex) {
                            that._realGridsService.gfn_CellDataSetRow(that.gridList2,
                                that.gridList2DataProvider,
                                itemIndex,
                                'ibQty',
                                this.grid2OrgIbQty);
                        } else {
                            that._realGridsService.gfn_CellDataSetRow(that.gridList2,
                                that.gridList2DataProvider,
                                itemIndex,
                                'ibQty',
                                this.grid2OldValue);
                        }

                        this.qtyFailAlert();
                        this._changeDetectorRef.markForCheck();
                    }
                }, 100);


                //row2SumIbQty -> row1 입고수량
                //예정수량 - row2SumIbQty -> row1 미입고수량

                // const medDevItemSeq = that._realGridsService.gfn_CellDataGetRow(
                //     this.gridList2,
                //     this.gridList2DataProvider,
                //     itemIndex,'meddevItemSeq');
                // const typeName = that._realGridsService.gfn_CellDataGetRow(
                //     this.gridList2,
                //     this.gridList2DataProvider,
                //     itemIndex,'typeName');
                //
                // const dataRow = this.gridList1DataProvider.searchDataRow({fields:['medDevItemSeq', 'typeName']
                //     , values: [medDevItemSeq, typeName]});
                // const ibQty = that._realGridsService.gfn_CellDataGetRow(
                //     this.gridList1,
                //     this.gridList1DataProvider,
                //     dataRow, 'ibQty');
                // const qty = that._realGridsService.gfn_CellDataGetRow(
                //     this.gridList1,
                //     this.gridList1DataProvider,
                //     dataRow, 'qty');
                // const inputOrgQty = that._realGridsService.gfn_CellDataGetRow(
                //     this.gridList2,
                //     this.gridList2DataProvider,
                //     itemIndex, 'ibQty');
                // const grid1OrgIbQty = ibQty;
                // const grid1OrgQty = qty;
                //
                // setTimeout(() => {
                //     let finalQty = 0;
                //
                //     const orgIbQty = that._realGridsService.gfn_CellDataGetRow(
                //         this.gridList1,
                //         this.gridList1DataProvider,
                //         dataRow,'orgIbQty');
                //
                //     let chk = this._realGridsService.gfn_GetRows(this.gridList2, this.gridList2DataProvider);
                //
                //     chk = chk.filter((detail: any) =>
                //         (detail.meddevItemSeq === medDevItemSeq))
                //         .map((param: any) => param);
                //     chk = chk.filter((detail: any) =>
                //         (detail.typeName === typeName))
                //         .map((param: any) => param);
                //
                //     if(chk.length > 0){
                //         chk.forEach((ex) => {
                //             finalQty += ex.ibQty;
                //         });
                //     }
                //
                //     const convertedQty = that._realGridsService.gfn_CellDataGetRow(
                //         this.gridList2,
                //         this.gridList2DataProvider,
                //         itemIndex,'convertedQty');
                //
                //     finalQty = finalQty * convertedQty;
                //
                //     that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                //         that.gridList1DataProvider,
                //         dataRow,
                //         'ibQty',
                //         finalQty);
                //
                //     const ibExpQty = that._realGridsService.gfn_CellDataGetRow(
                //         this.gridList1,
                //         this.gridList1DataProvider,
                //         dataRow,'ibExpQty');
                //     that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                //         that.gridList1DataProvider,
                //         dataRow,
                //         'qty',
                //         ibExpQty - finalQty);
                //
                //     const inputQty = that._realGridsService.gfn_CellDataGetRow(that.gridList1,
                //         that.gridList1DataProvider,
                //         dataRow,
                //         'qty');
                //     if(inputQty >= 0) {
                //         this.ibQty = inputOrgQty;
                //     }
                //     if(inputQty < 0) {
                //         that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                //             that.gridList1DataProvider,
                //             dataRow,
                //             'ibQty',
                //             grid1OrgIbQty);
                //
                //         that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                //             that.gridList1DataProvider,
                //             dataRow,
                //             'qty',
                //             grid1OrgQty);
                //
                //         that._realGridsService.gfn_CellDataSetRow(that.gridList2,
                //             that.gridList2DataProvider,
                //             itemIndex,
                //             'ibQty',
                //             this.ibQty);
                //
                //         this.qtyFailAlert();
                //         this._changeDetectorRef.markForCheck();
                //     }
                //
                // }, 100);
            }
        });

        this.gridList2.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName: '', editable: false};
            //console.log(dataCell.dataColumn.renderer);
            if (dataCell.dataColumn.fieldName === 'ibQty') {
                ret.editable = true;
            }

            const useTmlmtUse = grid.getValue(dataCell.index.itemIndex, 'useTmlmtUse');

            if (useTmlmtUse === '만료') {
                if (dataCell.dataColumn.fieldName === 'useTmlmtUse') {
                    ret.styleName = 'red-color';
                }
            } else if(useTmlmtUse === '위험'){
                if (dataCell.dataColumn.fieldName === 'useTmlmtUse') {
                    ret.styleName = 'orange-color';
                }
            } else if(useTmlmtUse === '유효'){
                if (dataCell.dataColumn.fieldName === 'useTmlmtUse') {
                    ret.styleName = 'green-color';
                }
            }

            return ret;
        });

        setTimeout(() => {
            this.detail.forEach((e) => {
                e.orgIbQty = e.ibQty;
            });
            this._realGridsService.gfn_DataSetGrid(this.gridList1, this.gridList1DataProvider, this.detail);
            this.refUdiCode.nativeElement.focus();
        }, 500);

        this._changeDetectorRef.markForCheck();
    }

    udiDiPiCode($event): void {
        let udiCode = $event.target.value;
        if (udiCode === '') {

        } else {

            let noCode;
            let stdCode;

            if (udiCode.length < 16) {
                this.failAlert();
                return;
            }
            const check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
            if (check_kor.test(udiCode)) {
                setTimeout(() => {
                    this.searchForm.patchValue({'udiCode': ''});
                    this.gridList1.clearSelection();
                }, 100);
                // Set the alert
                this.alert = {
                    type: 'error',
                    message: '한글은 입력할 수 없습니다.'
                };
                // Show the alert
                this.showAlert = true;
                return;
            }



            if (!udiCode.includes('(')) {
                let udiDiCode = udiCode.substring(0, 16);
                udiDiCode = '(' + udiDiCode.substring(0, 2) + ')' + udiDiCode.substring(2, 16);
                udiCode = udiDiCode;
            }

            const list = ['(01)', '(11)', '(17)', '(10)', '(21)'];
            list.forEach((check: any) => {

                const chk = check;
                let result = '';
                const idx = udiCode.indexOf(chk, 0);
                if (idx >= 0) {
                    let lastIndex = udiCode.indexOf('(', idx + 1);
                    if (lastIndex >= 0) {
                        lastIndex = udiCode.indexOf('(', idx + 1);
                    } else {
                        lastIndex = udiCode.length;
                    }
                    result = udiCode.substring(idx, lastIndex)
                        .replace('(' + chk + ')', '');

                    if (chk === '(01)') {
                        stdCode = result;
                    } else if (chk === '(10)' || chk === '(11)' || chk === '(17)' || chk === '(21)') {
                        noCode = result;
                    }
                }
            });

            if(noCode) {
                setTimeout(() => {
                    this.searchForm.patchValue({'udiDiCode': ''});
                    this.searchForm.patchValue({'udiPiCode': ''});
                    this.gridList1.clearSelection();
                }, 100);
                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'UDI DI 코드만 스캔 해주세요.'
                };
                // Show the alert
                this.showAlert = true;
            } else {
                if (stdCode === undefined) {
                    this.failAlert();
                    return;
                } else {
                    const searchForm = {udiDiCode: stdCode.replace('(' + '01' + ')', '')};

                    this._inBoundScanService.getUdiDiCodeInfo(searchForm)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((manages: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(manages);

                            if (manages.data !== null) {
                                const dataRows = this.gridList1DataProvider.searchDataRow({
                                    fields: ['medDevItemSeq', 'typeName']
                                    , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                });
                                let chk = this._realGridsService.gfn_GetRows(this.gridList1, this.gridList1DataProvider);
                                chk = chk.filter((detail: any) =>
                                    (detail.medDevItemSeq === manages.data[0].meddevItemSeq))
                                    .map((param: any) => param);
                                chk = chk.filter((detail: any) =>
                                    (detail.typeName === manages.data[0].typeName))
                                    .map((param: any) => param);
                                if (chk.length > 0) {
                                    this.alert = {
                                        type: 'success',
                                        message: 'UDI DI 바코드 스캔 성공'
                                    };
                                    // Show the alert
                                    this.showAlert = true;
                                    this.refUdiPiCode.nativeElement.focus();
                                } else {
                                    setTimeout(() => {
                                        this.gridList1.clearSelection();
                                    }, 100);
                                    this.alert = {
                                        type: 'error',
                                        message: '해당 바코드로 일치하는 품목 또는 모델이 없습니다.'
                                    };
                                    // Show the alert
                                    this.showAlert = true;
                                }
                            }

                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        }, (err) => {
                        });
                }
            }
        }
    }

    udiDiPiCode2($event): void {
        let udiDiCodes;
        let udiPiCodes = $event.target.value;
        if(!this.searchForm.getRawValue().udiDiCode.includes('(')) {
            udiDiCodes = '(' + this.searchForm.getRawValue().udiDiCode.substring(0, 2) + ')' + this.searchForm.getRawValue().udiDiCode.substring(2, 16);
        } else {
            udiDiCodes = this.searchForm.getRawValue().udiDiCode;
        }
        let udiCode = udiDiCodes + udiPiCodes;
        if (udiCode === '') {

        } else {

            let lotNo;
            let manufYm;
            let useTmlmt;
            let itemSeq;

            if (udiCode.length < 17) {
                this.failAlert();
                return;
            }
            const check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
            if (check_kor.test(udiCode)) {
                setTimeout(() => {
                    this.searchForm.patchValue({'udiCode': ''});
                    this.gridList1.clearSelection();
                }, 100);
                // Set the alert
                this.alert = {
                    type: 'error',
                    message: '한글은 입력할 수 없습니다.'
                };
                // Show the alert
                this.showAlert = true;
                return;
            }

            if (!udiPiCodes.includes('(')) {

                try {
                    let udiPiCode = '';

                    let cutUdiPiCode = udiPiCodes.substring(0, udiCode.length);

                    //값이 없을 때 까지
                    while (cutUdiPiCode !== '') {

                        if (cutUdiPiCode.substring(0, 2) === '11') {

                            manufYm = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 8);
                            cutUdiPiCode = cutUdiPiCode.substring(8, cutUdiPiCode.length);

                        } else if (cutUdiPiCode.substring(0, 2) === '17') {

                            useTmlmt = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 8);
                            cutUdiPiCode = cutUdiPiCode.substring(8, cutUdiPiCode.length);

                        } else if (cutUdiPiCode.substring(0, 2) === '10') {

                            const len = cutUdiPiCode.length;

                            if (len > 22) {
                                lotNo = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 22);
                                cutUdiPiCode = cutUdiPiCode.substring(22, cutUdiPiCode.length);
                            } else {
                                lotNo = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, cutUdiPiCode.length);
                                cutUdiPiCode = '';
                            }

                        } else if (cutUdiPiCode.substring(0, 2) === '21') {

                            const len = cutUdiPiCode.length;

                            if (len > 22) {
                                itemSeq = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 22);
                                cutUdiPiCode = cutUdiPiCode.substring(22, cutUdiPiCode.length);
                            } else {
                                itemSeq = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, cutUdiPiCode.length);
                                cutUdiPiCode = '';
                            }

                        } else {
                            break;
                        }
                    }

                    if (lotNo === undefined) {
                        lotNo = '';
                    }
                    if (itemSeq === undefined) {
                        itemSeq = '';
                    }
                    if (manufYm === undefined) {
                        manufYm = '';
                    }
                    if (useTmlmt === undefined) {
                        useTmlmt = '';
                    }

                    udiPiCode = manufYm + useTmlmt + lotNo + itemSeq;
                    udiCode = udiDiCodes + udiPiCode;

                } catch (e) {
                    this.failAlert();
                    return;
                }
            }

            const list = ['(11)', '(17)', '(10)', '(21)'];
            list.forEach((check: any) => {

                const chk = check;
                let result = '';
                const idx = udiCode.indexOf(chk, 0);
                if (idx >= 0) {
                    let lastIndex = udiCode.indexOf('(', idx + 1);
                    if (lastIndex >= 0) {
                        lastIndex = udiCode.indexOf('(', idx + 1);
                    } else {
                        lastIndex = udiCode.length;
                    }
                    result = udiCode.substring(idx, lastIndex)
                        .replace('(' + chk + ')', '');

                    if (chk === '(10)') {
                        lotNo = result;
                    } else if (chk === '(11)') {
                        manufYm = result;
                    } else if (chk === '(17)') {
                        useTmlmt = result;
                    } else if (chk === '(21)') {
                        itemSeq = result;
                    }
                }
            });

            if (lotNo === undefined) {
                lotNo = '';
            }
            if (itemSeq === undefined) {
                itemSeq = '';
            }
            if (manufYm === undefined) {
                manufYm = '';
            } else if (manufYm === '') {
                manufYm = '';
            } else {
                if (manufYm.replace('(' + '11' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                    return;
                }
            }
            if (useTmlmt === undefined) {
                useTmlmt = '';
            } else if (useTmlmt === '') {
                useTmlmt = '';
            } else {
                if (useTmlmt.replace('(' + '17' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                    return;
                }
            }

            if (udiDiCodes === undefined) {
                this.failAlert();
                return;
            } else {

                const searchForm = {udiDiCode: udiDiCodes.replace('(' + '01' + ')', '')};

                this._inBoundScanService.getUdiDiCodeInfo(searchForm)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((manages: any) => {
                        this._functionService.cfn_loadingBarClear();
                        this.alertMessage(manages);

                        if (manages.data !== null) {

                            const dataRows = this.gridList1DataProvider.searchDataRow({
                                fields: ['medDevItemSeq', 'typeName']
                                , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                            });
                            let chk = this._realGridsService.gfn_GetRows(this.gridList1, this.gridList1DataProvider);
                            chk = chk.filter((detail: any) =>
                                (detail.medDevItemSeq === manages.data[0].meddevItemSeq))
                                .map((param: any) => param);
                            chk = chk.filter((detail: any) =>
                                (detail.typeName === manages.data[0].typeName))
                                .map((param: any) => param);

                            if (chk.length > 0) {
                                const obExpQty = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList1,
                                    this.gridList1DataProvider,
                                    dataRows, 'ibExpQty');
                                let obQty = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList1,
                                    this.gridList1DataProvider,
                                    dataRows, 'ibQty');
                                obQty += manages.data[0].convertedQty;
                                if (obExpQty >= obQty) {
                                    this.searchForm.patchValue({'stdCode': udiCode});
                                    this.searchForm.patchValue({'gtin': udiDiCodes.replace('(' + '01' + ')', '')});
                                    this.searchForm.patchValue({'lotNo': lotNo.replace('(' + '10' + ')', '')});
                                    this.searchForm.patchValue({'itemSeq': itemSeq.replace('(' + '21' + ')', '')});
                                    this.searchForm.patchValue({'manufYm': manufYm.replace('(' + '11' + ')', '')});
                                    this.searchForm.patchValue({'useTmlmt': useTmlmt.replace('(' + '17' + ')', '')});

                                    let useTmlmtUse = '-';
                                    if (useTmlmt !== undefined) {
                                        if (useTmlmt !== null) {

                                            if (useTmlmt !== '') {
                                                const now = new Date();
                                                const nowDate = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');
                                                const nD = new Date(nowDate);
                                                const nDDate = formatDate(new Date(nD.setDate(nD.getDate())), 'yyyy-MM-dd', 'en');
                                                const useTmletCustom = useTmlmt.replace('(' + '17' + ')', '');
                                                let yy;
                                                if (useTmletCustom.substring(0, 2) === '00') {
                                                    yy = '0000';
                                                } else {
                                                    yy = '20' + useTmletCustom.substring(0, 2);
                                                }
                                                const mm = useTmletCustom.substring(2, 4);
                                                const dd = useTmletCustom.substring(4, 6);
                                                let sD;
                                                if (yy === '0000' && mm === '00' && dd === '00') {
                                                    useTmlmtUse = '-';
                                                } else if (yy === '0000') {
                                                    useTmlmtUse = '만료';
                                                } else if (mm === '00') {
                                                    if (dd !== '00') {
                                                        sD = new Date(yy + '-' + '12' + '-' + dd);
                                                        if (nD > sD) {
                                                            useTmlmtUse = '만료';
                                                        } else {
                                                            const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                            if (diff < 180) {
                                                                useTmlmtUse = '위험';
                                                            } else {
                                                                useTmlmtUse = '유효';
                                                            }
                                                        }
                                                    } else {
                                                        let lastDay = new Date(yy, 12, 0);
                                                        sD = new Date(yy + '-' + 12 + '-' + lastDay.getDate().valueOf());
                                                        if (nD > sD) {
                                                            useTmlmtUse = '만료';
                                                        } else {
                                                            const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                            if (diff < 180) {
                                                                useTmlmtUse = '위험';
                                                            } else {
                                                                useTmlmtUse = '유효';
                                                            }
                                                        }
                                                    }
                                                } else if (dd === '00') {
                                                    let lastDay = new Date(yy, mm, 0);
                                                    sD = new Date(yy + '-' + mm + '-' + lastDay.getDate().valueOf());
                                                    if (nD > sD) {
                                                        useTmlmtUse = '만료';
                                                    } else {
                                                        const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                        if (diff < 180) {
                                                            useTmlmtUse = '위험';
                                                        } else {
                                                            useTmlmtUse = '유효';
                                                        }
                                                    }
                                                } else {
                                                    sD = new Date(yy + '-' + mm + '-' + dd);
                                                    if (nD > sD) {
                                                        useTmlmtUse = '만료';
                                                    } else {
                                                        const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                        if (diff < 180) {
                                                            useTmlmtUse = '위험';
                                                        } else {
                                                            useTmlmtUse = '유효';
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        useTmlmtUse = '-';
                                    }
                                    const values = [
                                        manages.data[0].convertedQty,
                                        useTmlmtUse,
                                        chk[0].ibNo, chk[0].ibLineNo, chk[0].itemCd, chk[0].itemNm, manages.data[0].meddevItemSeq,
                                        manages.data[0].seq,
                                        manages.data[0].udiDiSeq,
                                        manages.data[0].userSterilizationYn,
                                        manages.data[0].kitYn,
                                        chk[0].typeName, udiCode,
                                        lotNo.replace('(' + '10' + ')', ''), manufYm.replace('(' + '11' + ')', ''), useTmlmt.replace('(' + '17' + ')', ''), itemSeq.replace('(' + '21' + ')', ''), 1
                                    ];

                                    let rows = this._realGridsService.gfn_GetRows(this.gridList2, this.gridList2DataProvider);

                                    rows = rows.filter((detail: any) =>
                                        (detail.udiCode === this.searchForm.getRawValue().stdCode))
                                        .map((param: any) => param);

                                    if (rows.length > 0) {
                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });

                                        let sumQty = manages.data[0].convertedQty;
                                        const qty = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList1,
                                            this.gridList1DataProvider,
                                            dataRow, 'ibQty');
                                        sumQty = sumQty + qty;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'ibQty',
                                                sumQty);

                                            const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow, 'ibExpQty');
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'qty',
                                                ibExpQty - sumQty);
                                        }, 100);

                                        const dataRow2 = this.gridList2DataProvider.searchDataRow({
                                            fields: ['udiCode'],
                                            values: [udiCode]
                                        });
                                        let sumQty2 = 1;
                                        let qty2 = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList2,
                                            this.gridList2DataProvider,
                                            dataRow2, 'ibQty');
                                        if (qty2 === undefined) {
                                            qty2 = 0;
                                        }
                                        sumQty2 = sumQty2 + qty2;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList2,
                                                this.gridList2DataProvider,
                                                dataRow2,
                                                'ibQty',
                                                sumQty2);
                                        }, 100);

                                    } else {
                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });
                                        let sumQty = manages.data[0].convertedQty;
                                        const qty = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList1,
                                            this.gridList1DataProvider,
                                            dataRow, 'ibQty');
                                        sumQty = sumQty + qty;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'ibQty',
                                                sumQty);

                                            const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow, 'ibExpQty');
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'qty',
                                                ibExpQty - sumQty);
                                        }, 100);

                                        this._realGridsService.gfn_AddRow(this.gridList2, this.gridList2DataProvider, values);
                                    }
                                    setTimeout(() => {
                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });
                                        this.gridList1.setSelection({
                                            style: 'rows',
                                            startRow: dataRow,
                                            endRow: dataRow
                                        });
                                        this.searchForm.patchValue({'udiDiCode': ''});
                                        this.searchForm.patchValue({'udiPiCode': ''});
                                    }, 100);

                                    if (!this.barcodeYn) {
                                        setTimeout(() => {
                                            this.refUdiDiCode.nativeElement.focus();
                                            this._changeDetectorRef.markForCheck();
                                        }, 100);
                                    } else {
                                        const dataRow = this.gridList2DataProvider.searchDataRow({
                                            fields: ['udiCode'],
                                            values: [udiCode]
                                        });
                                        //셀이동
                                        //this.gridList2.setSelection({ style : 'rows', startRow : dataRow, endRow : dataRow });
                                        setTimeout(() => {
                                            this.refUdiDiCode.nativeElement.blur();
                                            this._changeDetectorRef.markForCheck();
                                        }, 100);
                                        const focusCell = this.gridList2.getCurrent();
                                        focusCell.dataRow = dataRow;
                                        focusCell.column = 'ibQty';
                                        focusCell.fieldName = 'ibQty';
                                        //포커스된 셀 변경
                                        this.gridList2.setCurrent(focusCell);
                                        const curr = this.gridList2.getCurrent();
                                        this.gridList2.beginUpdateRow(curr.itemIndex);
                                        this.gridList2.showEditor();
                                        this.gridList2.setFocus();
                                    }

                                    this.showAlert = false;
                                    this._changeDetectorRef.markForCheck();

                                } else {
                                    this.qtyFailAlert();
                                }
                            } else {
                                setTimeout(() => {
                                    this.gridList1.clearSelection();
                                }, 100);
                                this.alert = {
                                    type: 'error',
                                    message: '해당 바코드로 일치하는 품목 또는 모델이 없습니다.'
                                };
                                // Show the alert
                                this.showAlert = true;
                            }
                        }

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }, (err) => {
                    });
            }
        }
    }

    udiDiCode($event): void {
        let udiCode = $event.target.value;
        if (udiCode === '') {

            // this.searchForm.patchValue({'lotNo': ''});
            // this.searchForm.patchValue({'itemSeq': ''});
            // this.searchForm.patchValue({'manufYm': ''});
            // this.searchForm.patchValue({'useTmlmt': ''});
            // this.searchForm.patchValue({'stdCode': ''});
            // this.searchForm.patchValue({'gtin': ''});
            // this.searchForm.patchValue({'udiCodeBak': ''});

        } else {

            let lotNo;
            let manufYm;
            let useTmlmt;
            let itemSeq;
            let stdCode;

            if (udiCode.length < 16) {
                this.failAlert();
                return;
            }
            const check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
            if (check_kor.test(udiCode)) {
                setTimeout(() => {
                    this.searchForm.patchValue({'udiCode': ''});
                    this.gridList1.clearSelection();
                }, 100);
                // Set the alert
                this.alert = {
                    type: 'error',
                    message: '한글은 입력할 수 없습니다.'
                };
                // Show the alert
                this.showAlert = true;
                return;
            }

            if (!udiCode.includes('(') || udiCode.includes(',')) {

                try {
                    let udiDiCode = udiCode.substring(0, 16);
                    let udiPiCode = '';
                    udiDiCode = '(' + udiDiCode.substring(0, 2) + ')' + udiDiCode.substring(2, 16);

                    let cutUdiPiCode = udiCode.substring(16, udiCode.length);

                    //값이 없을 때 까지
                    while (cutUdiPiCode !== '') {

                        if (cutUdiPiCode.substring(0, 2) === '11') {

                            manufYm = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 8);
                            cutUdiPiCode = cutUdiPiCode.substring(8, cutUdiPiCode.length);

                        } else if (cutUdiPiCode.substring(0, 2) === '17') {

                            useTmlmt = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 8);
                            cutUdiPiCode = cutUdiPiCode.substring(8, cutUdiPiCode.length);

                        } else if (cutUdiPiCode.substring(0, 2) === '10') {

                            const len = cutUdiPiCode.length;

                            if (len > 22) {
                                lotNo = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 22);
                                cutUdiPiCode = cutUdiPiCode.substring(22, cutUdiPiCode.length);
                                if (lotNo.includes(',')) {
                                    let a = lotNo.split(',');
                                    lotNo = a[0];
                                    let b = a[1];
                                    if (b.substring(0, 2) === '21') {
                                        itemSeq = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '11') {
                                        manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '17') {
                                        useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    }
                                }
                            } else {
                                lotNo = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, cutUdiPiCode.length);
                                cutUdiPiCode = '';
                                if (lotNo.includes(',')) {
                                    let a = lotNo.split(',');
                                    lotNo = a[0];
                                    let b = a[1];
                                    if (b.substring(0, 2) === '21') {
                                        itemSeq = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '11') {
                                        manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '17') {
                                        useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    }
                                }
                            }

                        } else if (cutUdiPiCode.substring(0, 2) === '21') {

                            const len = cutUdiPiCode.length;

                            if (len > 22) {
                                itemSeq = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 22);
                                cutUdiPiCode = cutUdiPiCode.substring(22, cutUdiPiCode.length);
                                if (itemSeq.includes(',')) {
                                    let a = itemSeq.split(',');
                                    itemSeq = a[0];
                                    let b = a[1];
                                    if (b.substring(0, 2) === '10') {
                                        lotNo = '(' +  b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '11') {
                                        manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '17') {
                                        useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    }
                                }
                            } else {
                                itemSeq = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, cutUdiPiCode.length);
                                cutUdiPiCode = '';
                                if (itemSeq.includes(',')) {
                                    let a = itemSeq.split(',');
                                    itemSeq = a[0];
                                    let b = a[1];
                                    if (b.substring(0, 2) === '10') {
                                        lotNo = '(' +  b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '11') {
                                        manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '17') {
                                        useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    }
                                }
                            }

                        } else if(cutUdiPiCode.substring(0, 1) === ',') {
                            // 11, 17, 10, 21
                            if (cutUdiPiCode.substring(1, 3) === '11') {
                                manufYm = '(' + cutUdiPiCode.substring(1, 3) + ')' + cutUdiPiCode.substring(3, 9);
                                cutUdiPiCode = cutUdiPiCode.substring(9, cutUdiPiCode.length);
                            } else if (cutUdiPiCode.substring(1, 3) === '17') {
                                useTmlmt = '(' + cutUdiPiCode.substring(1, 3) + ')' + cutUdiPiCode.substring(3, 9);
                                cutUdiPiCode = cutUdiPiCode.substring(9, cutUdiPiCode.length);
                            } else if (cutUdiPiCode.substring(1, 3) === '10') {
                                const len = cutUdiPiCode.length;
                                if (len > 22) {
                                    lotNo = '(' + cutUdiPiCode.substring(1, 3) + ')' + cutUdiPiCode.substring(3, 23);
                                    cutUdiPiCode = cutUdiPiCode.substring(23, cutUdiPiCode.length);
                                    if (lotNo.includes(',')) {
                                        let a = lotNo.split(',');
                                        lotNo = a[0];
                                        let b = a[1];
                                        if (b.substring(0, 2) === '21') {
                                            itemSeq = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '11') {
                                            manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '17') {
                                            useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        }
                                    }
                                } else {
                                    lotNo = '(' + cutUdiPiCode.substring(1, 3) + ')' + cutUdiPiCode.substring(3, cutUdiPiCode.length);
                                    cutUdiPiCode = '';
                                    if (lotNo.includes(',')) {
                                        let a = lotNo.split(',');
                                        lotNo = a[0];
                                        let b = a[1];
                                        if (b.substring(0, 2) === '21') {
                                            itemSeq = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '11') {
                                            manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '17') {
                                            useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        }
                                    }
                                }
                            } else if (cutUdiPiCode.substring(1, 3) === '21') {
                                const len = cutUdiPiCode.length;
                                if (len > 22) {
                                    itemSeq = '(' + cutUdiPiCode.substring(1, 3) + ')' + cutUdiPiCode.substring(3, 23);
                                    cutUdiPiCode = cutUdiPiCode.substring(23, cutUdiPiCode.length);
                                    if (itemSeq.includes(',')) {
                                        let a = itemSeq.split(',');
                                        itemSeq = a[0];
                                        let b = a[1];
                                        if (b.substring(0, 2) === '10') {
                                            lotNo = '(' +  b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '11') {
                                            manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '17') {
                                            useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        }
                                    }
                                } else {
                                    itemSeq = '(' + cutUdiPiCode.substring(1, 3) + ')' + cutUdiPiCode.substring(3, cutUdiPiCode.length);
                                    cutUdiPiCode = '';
                                    if (itemSeq.includes(',')) {
                                        let a = itemSeq.split(',');
                                        itemSeq = a[0];
                                        let b = a[1];
                                        if (b.substring(0, 2) === '10') {
                                            lotNo = '(' +  b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '11') {
                                            manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '17') {
                                            useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        }
                                    }
                                }
                            }
                        } else{
                            break;
                        }
                    }

                    if (lotNo === undefined) {
                        lotNo = '';
                    }
                    if (itemSeq === undefined) {
                        itemSeq = '';
                    }

                    if (manufYm === undefined) {
                        manufYm = '';
                    } else {
                        if (manufYm.replace('(' + '11' + ')', '').length !== 6) {
                            this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                            return;
                        }
                    }

                    if (useTmlmt === undefined) {
                        useTmlmt = '';
                    } else {
                        if (useTmlmt.replace('(' + '17' + ')', '').length !== 6) {
                            this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                            return;
                        }
                    }

                    udiPiCode = manufYm + useTmlmt + lotNo + itemSeq;
                    udiCode = udiDiCode + udiPiCode;

                } catch (e) {
                    this.failAlert();
                    return;
                }
            }

            const list = ['(01)', '(11)', '(17)', '(10)', '(21)'];
            list.forEach((check: any) => {

                const chk = check;
                let result = '';
                const idx = udiCode.indexOf(chk, 0);
                if (idx >= 0) {
                    let lastIndex = udiCode.indexOf('(', idx + 1);
                    if (lastIndex >= 0) {
                        lastIndex = udiCode.indexOf('(', idx + 1);
                    } else {
                        lastIndex = udiCode.length;
                    }
                    result = udiCode.substring(idx, lastIndex)
                        .replace('(' + chk + ')', '');

                    if (chk === '(01)') {
                        stdCode = result;
                    } else if (chk === '(10)') {
                        lotNo = result;
                    } else if (chk === '(11)') {
                        manufYm = result;
                    } else if (chk === '(17)') {
                        useTmlmt = result;
                    } else if (chk === '(21)') {
                        itemSeq = result;
                    }
                }
            });

            if (lotNo === undefined) {
                lotNo = '';
            }
            if (itemSeq === undefined) {
                itemSeq = '';
            }
            if (manufYm === undefined) {
                manufYm = '';
            } else if (manufYm === '') {
                manufYm = '';
            } else {
                if (manufYm.replace('(' + '11' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                    return;
                }
            }
            if (useTmlmt === undefined) {
                useTmlmt = '';
            } else if (useTmlmt === '') {
                useTmlmt = '';
            } else {
                if (useTmlmt.replace('(' + '17' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                    return;
                }
            }

            if (stdCode === undefined) {
                this.failAlert();
                return;
            } else {

                const searchForm = {udiDiCode: stdCode.replace('(' + '01' + ')', '')};

                this._inBoundScanService.getUdiDiCodeInfo(searchForm)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((manages: any) => {
                        this._functionService.cfn_loadingBarClear();
                        this.alertMessage(manages);

                        if (manages.data !== null) {

                            const dataRows = this.gridList1DataProvider.searchDataRow({
                                fields: ['medDevItemSeq', 'typeName']
                                , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                            });
                            let chk = this._realGridsService.gfn_GetRows(this.gridList1, this.gridList1DataProvider);
                            chk = chk.filter((detail: any) =>
                                (detail.medDevItemSeq === manages.data[0].meddevItemSeq))
                                .map((param: any) => param);
                            chk = chk.filter((detail: any) =>
                                (detail.typeName === manages.data[0].typeName))
                                .map((param: any) => param);
                            if (chk.length > 0) {
                                const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList1,
                                    this.gridList1DataProvider,
                                    dataRows, 'ibExpQty');
                                let ibQty = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList1,
                                    this.gridList1DataProvider,
                                    dataRows, 'ibQty');
                                ibQty += manages.data[0].convertedQty;
                                if (ibExpQty >= ibQty) {
                                    this.searchForm.patchValue({'stdCode': udiCode});
                                    this.searchForm.patchValue({'gtin': stdCode.replace('(' + '01' + ')', '')});
                                    this.searchForm.patchValue({'lotNo': lotNo.replace('(' + '10' + ')', '')});
                                    this.searchForm.patchValue({'itemSeq': itemSeq.replace('(' + '21' + ')', '')});
                                    this.searchForm.patchValue({'manufYm': manufYm.replace('(' + '11' + ')', '')});
                                    this.searchForm.patchValue({'useTmlmt': useTmlmt.replace('(' + '17' + ')', '')});

                                    let useTmlmtUse = '-';
                                    if (useTmlmt !== undefined) {
                                        if (useTmlmt !== null) {

                                            if (useTmlmt !== '') {
                                                const now = new Date();
                                                const nowDate = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');
                                                const nD = new Date(nowDate);
                                                const nDDate = formatDate(new Date(nD.setDate(nD.getDate())), 'yyyy-MM-dd', 'en');
                                                const useTmletCustom = useTmlmt.replace('(' + '17' + ')', '');
                                                let yy;
                                                if(useTmletCustom.substring(0, 2) === '00') {
                                                    yy = '0000';
                                                } else {
                                                    yy = '20' + useTmletCustom.substring(0, 2);
                                                }
                                                const mm = useTmletCustom.substring(2, 4);
                                                const dd = useTmletCustom.substring(4, 6);
                                                //console.log(nD);
                                                let sD;
                                                if(yy === '0000' && mm === '00' && dd === '00') {
                                                    useTmlmtUse = '-';
                                                } else if(yy === '0000') {
                                                    useTmlmtUse = '만료';
                                                } else if(mm === '00') {
                                                    if(dd !== '00') {
                                                        sD = new Date(yy + '-' + '12' + '-' + dd);
                                                        if(nD > sD){
                                                            useTmlmtUse = '만료';
                                                        }else{
                                                            const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                            if(diff < 180){
                                                                useTmlmtUse = '위험';
                                                            }else{
                                                                useTmlmtUse = '유효';
                                                            }
                                                        }
                                                    } else {
                                                        let lastDay = new Date(yy, 12, 0);
                                                        sD = new Date(yy + '-' + 12 + '-' + lastDay.getDate().valueOf());
                                                        if(nD > sD){
                                                            useTmlmtUse = '만료';
                                                        }else{
                                                            const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                            if(diff < 180){
                                                                useTmlmtUse = '위험';
                                                            }else{
                                                                useTmlmtUse = '유효';
                                                            }
                                                        }
                                                    }
                                                } else if(dd === '00') {
                                                    let lastDay = new Date(yy, mm, 0);
                                                    sD = new Date(yy + '-' + mm + '-' + lastDay.getDate().valueOf());
                                                    if(nD > sD){
                                                        useTmlmtUse = '만료';
                                                    }else{
                                                        const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                        if(diff < 180){
                                                            useTmlmtUse = '위험';
                                                        }else{
                                                            useTmlmtUse = '유효';
                                                        }
                                                    }
                                                } else {
                                                    sD = new Date(yy + '-' + mm + '-' + dd);
                                                    if(nD > sD){
                                                        useTmlmtUse = '만료';
                                                    }else{
                                                        const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                        if(diff < 180){
                                                            useTmlmtUse = '위험';
                                                        }else{
                                                            useTmlmtUse = '유효';
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        useTmlmtUse = '-';
                                    }
                                    const values = [
                                        manages.data[0].convertedQty,
                                        useTmlmtUse,
                                        chk[0].ibNo, chk[0].ibLineNo, chk[0].itemCd, chk[0].itemNm, manages.data[0].meddevItemSeq,
                                        manages.data[0].seq,
                                        manages.data[0].udiDiSeq,
                                        manages.data[0].userSterilizationYn,
                                        manages.data[0].kitYn,
                                        chk[0].typeName, udiCode,
                                        lotNo.replace('(' + '10' + ')', ''), manufYm.replace('(' + '11' + ')', ''), useTmlmt.replace('(' + '17' + ')', ''), itemSeq.replace('(' + '21' + ')', ''), 1
                                    ];

                                    let rows = this._realGridsService.gfn_GetRows(this.gridList2, this.gridList2DataProvider);

                                    rows = rows.filter((detail: any) =>
                                        (detail.udiCode === this.searchForm.getRawValue().stdCode))
                                        .map((param: any) => param);
                                    if (rows.length > 0) {

                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });

                                        let sumQty = manages.data[0].convertedQty;
                                        const qty = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList1,
                                            this.gridList1DataProvider,
                                            dataRow, 'ibQty');
                                        sumQty = sumQty + qty;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'ibQty',
                                                sumQty);

                                            const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow, 'ibExpQty');
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'qty',
                                                ibExpQty - sumQty);
                                        }, 100);

                                        const dataRow2 = this.gridList2DataProvider.searchDataRow({
                                            fields: ['udiCode'],
                                            values: [udiCode]
                                        });
                                        let sumQty2 = 1;
                                        let qty2 = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList2,
                                            this.gridList2DataProvider,
                                            dataRow2, 'ibQty');
                                        if (qty2 === undefined) {
                                            qty2 = 0;
                                        }
                                        sumQty2 = sumQty2 + qty2;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList2,
                                                this.gridList2DataProvider,
                                                dataRow2,
                                                'ibQty',
                                                sumQty2);
                                        }, 100);

                                    } else {
                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });
                                        let sumQty = manages.data[0].convertedQty;
                                        const qty = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList1,
                                            this.gridList1DataProvider,
                                            dataRow, 'ibQty');
                                        sumQty = sumQty + qty;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'ibQty',
                                                sumQty);

                                            const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow, 'ibExpQty');
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'qty',
                                                ibExpQty - sumQty);
                                        }, 100);

                                        this._realGridsService.gfn_AddRow(this.gridList2, this.gridList2DataProvider, values);
                                    }
                                    setTimeout(() => {
                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });
                                        this.gridList1.setSelection({
                                            style: 'rows',
                                            startRow: dataRow,
                                            endRow: dataRow
                                        });
                                        this.searchForm.patchValue({'udiCode': ''});
                                    }, 100);

                                    if (!this.barcodeYn) {
                                        setTimeout(() => {
                                            this.refUdiCode.nativeElement.focus();
                                            this._changeDetectorRef.markForCheck();
                                        }, 100);
                                    } else {
                                        const dataRow = this.gridList2DataProvider.searchDataRow({
                                            fields: ['udiCode'],
                                            values: [udiCode]
                                        });
                                        //셀이동
                                        //this.gridList2.setSelection({ style : 'rows', startRow : dataRow, endRow : dataRow });
                                        setTimeout(() => {
                                            this.refUdiCode.nativeElement.blur();
                                            this._changeDetectorRef.markForCheck();
                                        }, 100);
                                        const focusCell = this.gridList2.getCurrent();
                                        focusCell.dataRow = dataRow;
                                        focusCell.column = 'ibQty';
                                        focusCell.fieldName = 'ibQty';
                                        //포커스된 셀 변경
                                        this.gridList2.setCurrent(focusCell);
                                        const curr = this.gridList2.getCurrent();
                                        this.gridList2.beginUpdateRow(curr.itemIndex);
                                        this.gridList2.showEditor();
                                        this.gridList2.setFocus();
                                    }

                                    this.showAlert = false;
                                    this._changeDetectorRef.markForCheck();

                                } else {
                                    this.qtyFailAlert();
                                }
                            } else {
                                setTimeout(() => {
                                    this.gridList1.clearSelection();
                                }, 100);
                                this.alert = {
                                    type: 'error',
                                    message: '해당 바코드로 일치하는 품목 또는 모델이 없습니다.'
                                };
                                // Show the alert
                                this.showAlert = true;
                            }
                        }

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }, (err) => {
                    });
            }

        }

    }

    udiDirectCode(): void {

        let manufYm;
        let useTmlmt;
        let lotNo;
        let itemSeq;
        let stdCode;
        let udiCode = this.searchForm.getRawValue().gtinDirect +
            this.searchForm.getRawValue().manufYmDirect +
            this.searchForm.getRawValue().useTmlmtDirect +
            this.searchForm.getRawValue().lotNoDirect +
            this.searchForm.getRawValue().itemSeqDirect;
        let udi;

        if (!this.searchForm.getRawValue().gtinDirect) {
            setTimeout(() => {
                this.searchForm.patchValue({'gtinDirect': ''});
                this.searchForm.patchValue({'manufYmDirect': ''});
                this.searchForm.patchValue({'useTmlmtDirect': ''});
                this.searchForm.patchValue({'lotNoDirect': ''});
                this.searchForm.patchValue({'itemSeqDirect': ''});
                this.gridList1.clearSelection();
            }, 100);
            this.alert = {
                type: 'error',
                message: 'GTIN은 필수값 입니다.'
            };
            // Show the alert
            this.showAlert = true;
        } else {
            if (this.searchForm.getRawValue().gtinDirect.length < 14) {
                this.failAlert();
                return;
            }

            const check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
            if (check_kor.test(udiCode)) {
                setTimeout(() => {
                    this.searchForm.patchValue({'gtinDirect': ''});
                    this.searchForm.patchValue({'manufYmDirect': ''});
                    this.searchForm.patchValue({'useTmlmtDirect': ''});
                    this.searchForm.patchValue({'lotNoDirect': ''});
                    this.searchForm.patchValue({'itemSeqDirect': ''});
                    this.gridList1.clearSelection();
                }, 100);
                // Set the alert
                this.alert = {
                    type: 'error',
                    message: '한글은 입력할 수 없습니다.'
                };
                // Show the alert
                this.showAlert = true;
                return;
            }

            if(!this.searchForm.getRawValue().gtinDirect) {
                stdCode = '';
            } else {
                stdCode = '(01)' + this.searchForm.getRawValue().gtinDirect;
            }
            if(!this.searchForm.getRawValue().manufYmDirect) {
                manufYm = '';
            } else {
                manufYm = '(11)' + this.searchForm.getRawValue().manufYmDirect;
                if (manufYm.replace('(' + '11' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                    return;
                }
            }

            if(!this.searchForm.getRawValue().useTmlmtDirect) {
                useTmlmt = '';
            } else {
                useTmlmt = '(17)' + this.searchForm.getRawValue().useTmlmtDirect;
                if (useTmlmt.replace('(' + '17' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                    return;
                }
            }

            if(!this.searchForm.getRawValue().lotNoDirect) {
                lotNo = '';
            } else {
                lotNo = '(10)' + this.searchForm.getRawValue().lotNoDirect;
            }

            if(!this.searchForm.getRawValue().itemSeqDirect) {
                itemSeq = '';
            } else {
                itemSeq = '(21)' + this.searchForm.getRawValue().itemSeqDirect;
            }

            udi = stdCode + manufYm + useTmlmt + lotNo + itemSeq;
            if (stdCode === undefined) {
                this.failAlert();
                return;
            } else {
                const searchForm = {udiDiCode: stdCode.replace('(' + '01' + ')', '')};
                this._inBoundScanService.getUdiDiCodeInfo(searchForm)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((manages: any) => {
                        this._functionService.cfn_loadingBarClear();
                        this.alertMessage(manages);

                        if (manages.data !== null) {

                            const dataRows = this.gridList1DataProvider.searchDataRow({
                                fields: ['medDevItemSeq', 'typeName']
                                , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                            });
                            let chk = this._realGridsService.gfn_GetRows(this.gridList1, this.gridList1DataProvider);
                            chk = chk.filter((detail: any) =>
                                (detail.medDevItemSeq === manages.data[0].meddevItemSeq))
                                .map((param: any) => param);
                            chk = chk.filter((detail: any) =>
                                (detail.typeName === manages.data[0].typeName))
                                .map((param: any) => param);

                            if (chk.length > 0) {
                                const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList1,
                                    this.gridList1DataProvider,
                                    dataRows, 'ibExpQty');
                                let ibQty = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList1,
                                    this.gridList1DataProvider,
                                    dataRows, 'ibQty');
                                ibQty += manages.data[0].convertedQty;
                                if (ibExpQty >= ibQty) {
                                    this.searchForm.patchValue({'stdCode': udi});
                                    this.searchForm.patchValue({'gtin': stdCode.replace('(' + '01' + ')', '')});
                                    this.searchForm.patchValue({'lotNo': lotNo.replace('(' + '10' + ')', '')});
                                    this.searchForm.patchValue({'itemSeq': itemSeq.replace('(' + '21' + ')', '')});
                                    this.searchForm.patchValue({'manufYm': manufYm.replace('(' + '11' + ')', '')});
                                    this.searchForm.patchValue({'useTmlmt': useTmlmt.replace('(' + '17' + ')', '')});

                                    let useTmlmtUse = '-';
                                    if (useTmlmt !== undefined) {
                                        if (useTmlmt !== null) {

                                            if (useTmlmt !== '') {
                                                const now = new Date();
                                                const nowDate = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');
                                                const nD = new Date(nowDate);
                                                const nDDate = formatDate(new Date(nD.setDate(nD.getDate())), 'yyyy-MM-dd', 'en');
                                                const useTmletCustom = useTmlmt.replace('(' + '17' + ')', '');
                                                let yy;
                                                if (useTmletCustom.substring(0, 2) === '00') {
                                                    yy = '0000';
                                                } else {
                                                    yy = '20' + useTmletCustom.substring(0, 2);
                                                }
                                                const mm = useTmletCustom.substring(2, 4);
                                                const dd = useTmletCustom.substring(4, 6);
                                                let sD;
                                                if (yy === '0000' && mm === '00' && dd === '00') {
                                                    useTmlmtUse = '-';
                                                } else if (yy === '0000') {
                                                    useTmlmtUse = '만료';
                                                } else if (mm === '00') {
                                                    if (dd !== '00') {
                                                        sD = new Date(yy + '-' + '12' + '-' + dd);
                                                        if (nD > sD) {
                                                            useTmlmtUse = '만료';
                                                        } else {
                                                            const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                            if (diff < 180) {
                                                                useTmlmtUse = '위험';
                                                            } else {
                                                                useTmlmtUse = '유효';
                                                            }
                                                        }
                                                    } else {
                                                        let lastDay = new Date(yy, 12, 0);
                                                        sD = new Date(yy + '-' + 12 + '-' + lastDay.getDate().valueOf());
                                                        if (nD > sD) {
                                                            useTmlmtUse = '만료';
                                                        } else {
                                                            const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                            if (diff < 180) {
                                                                useTmlmtUse = '위험';
                                                            } else {
                                                                useTmlmtUse = '유효';
                                                            }
                                                        }
                                                    }
                                                } else if (dd === '00') {
                                                    let lastDay = new Date(yy, mm, 0);
                                                    sD = new Date(yy + '-' + mm + '-' + lastDay.getDate().valueOf());
                                                    if (nD > sD) {
                                                        useTmlmtUse = '만료';
                                                    } else {
                                                        const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                        if (diff < 180) {
                                                            useTmlmtUse = '위험';
                                                        } else {
                                                            useTmlmtUse = '유효';
                                                        }
                                                    }
                                                } else {
                                                    sD = new Date(yy + '-' + mm + '-' + dd);
                                                    if (nD > sD) {
                                                        useTmlmtUse = '만료';
                                                    } else {
                                                        const diff = Math.abs((nD.getTime() - sD.getTime()) / (1000 * 3600 * 24));

                                                        if (diff < 180) {
                                                            useTmlmtUse = '위험';
                                                        } else {
                                                            useTmlmtUse = '유효';
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        useTmlmtUse = '-';
                                    }

                                    const values = [
                                        manages.data[0].convertedQty,
                                        useTmlmtUse,
                                        chk[0].ibNo, chk[0].ibLineNo, chk[0].itemCd, chk[0].itemNm, manages.data[0].meddevItemSeq,
                                        manages.data[0].seq,
                                        manages.data[0].udiDiSeq,
                                        manages.data[0].userSterilizationYn,
                                        manages.data[0].kitYn,
                                        chk[0].typeName, udi,
                                        lotNo.replace('(' + '10' + ')', ''), manufYm.replace('(' + '11' + ')', ''), useTmlmt.replace('(' + '17' + ')', ''), itemSeq.replace('(' + '21' + ')', ''), 1
                                    ];

                                    let rows = this._realGridsService.gfn_GetRows(this.gridList2, this.gridList2DataProvider);

                                    rows = rows.filter((detail: any) =>
                                        (detail.udiCode === this.searchForm.getRawValue().stdCode))
                                        .map((param: any) => param);

                                    if (rows.length > 0) {
                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });

                                        let sumQty = manages.data[0].convertedQty;
                                        const qty = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList1,
                                            this.gridList1DataProvider,
                                            dataRow, 'ibQty');
                                        sumQty = sumQty + qty;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'ibQty',
                                                sumQty);

                                            const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow, 'ibExpQty');
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'qty',
                                                ibExpQty - sumQty);
                                        }, 100);

                                        const dataRow2 = this.gridList2DataProvider.searchDataRow({
                                            fields: ['udiCode'],
                                            values: [udi]
                                        });
                                        let sumQty2 = 1;
                                        let qty2 = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList2,
                                            this.gridList2DataProvider,
                                            dataRow2, 'ibQty');
                                        if (qty2 === undefined) {
                                            qty2 = 0;
                                        }
                                        sumQty2 = sumQty2 + qty2;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList2,
                                                this.gridList2DataProvider,
                                                dataRow2,
                                                'ibQty',
                                                sumQty2);
                                        }, 100);

                                    } else {
                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });
                                        let sumQty = manages.data[0].convertedQty;
                                        const qty = this._realGridsService.gfn_CellDataGetRow(
                                            this.gridList1,
                                            this.gridList1DataProvider,
                                            dataRow, 'ibQty');
                                        sumQty = sumQty + qty;
                                        setTimeout(() => {
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'ibQty',
                                                sumQty);

                                            const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow, 'ibExpQty');
                                            this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,
                                                'qty',
                                                ibExpQty - sumQty);
                                        }, 100);

                                        this._realGridsService.gfn_AddRow(this.gridList2, this.gridList2DataProvider, values);
                                    }
                                    setTimeout(() => {
                                        const dataRow = this.gridList1DataProvider.searchDataRow({
                                            fields: ['medDevItemSeq', 'typeName']
                                            , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]
                                        });
                                        this.gridList1.setSelection({
                                            style: 'rows',
                                            startRow: dataRow,
                                            endRow: dataRow
                                        });
                                        this.searchForm.patchValue({'gtinDirect': ''});
                                        this.searchForm.patchValue({'manufYmDirect': ''});
                                        this.searchForm.patchValue({'useTmlmtDirect': ''});
                                        this.searchForm.patchValue({'lotNoDirect': ''});
                                        this.searchForm.patchValue({'itemSeqDirect': ''});
                                    }, 100);

                                    if (!this.barcodeYn) {
                                        setTimeout(() => {
                                            this.refUdiDirectCode.nativeElement.focus();
                                            this._changeDetectorRef.markForCheck();
                                        }, 100);
                                    } else {
                                        const dataRow = this.gridList2DataProvider.searchDataRow({
                                            fields: ['udiCode'],
                                            values: [udi]
                                        });
                                        //셀이동
                                        //this.gridList2.setSelection({ style : 'rows', startRow : dataRow, endRow : dataRow });
                                        setTimeout(() => {
                                            this.refUdiDirectCode.nativeElement.blur();
                                            this._changeDetectorRef.markForCheck();
                                        }, 100);
                                        const focusCell = this.gridList2.getCurrent();
                                        focusCell.dataRow = dataRow;
                                        focusCell.column = 'ibQty';
                                        focusCell.fieldName = 'ibQty';
                                        //포커스된 셀 변경
                                        this.gridList2.setCurrent(focusCell);
                                        const curr = this.gridList2.getCurrent();
                                        this.gridList2.beginUpdateRow(curr.itemIndex);
                                        this.gridList2.showEditor();
                                        this.gridList2.setFocus();
                                    }

                                    this.showAlert = false;
                                    this._changeDetectorRef.markForCheck();

                                } else {
                                    this.qtyFailAlert();
                                }
                            } else {
                                setTimeout(() => {
                                    this.gridList1.clearSelection();
                                }, 100);
                                this.alert = {
                                    type: 'error',
                                    message: '해당 바코드로 일치하는 품목 또는 모델이 없습니다.'
                                };
                                // Show the alert
                                this.showAlert = true;
                            }
                        }

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }, (err) => {
                    });
            }
        }
    }

    alertMessage(param: any): void {
        if (param.status !== 'SUCCESS') {
            this.alert = {
                type: 'error',
                message: param.msg
            };
            // Show the alert
            this.showAlert = true;
        } else {
            this.alert = {
                type: 'success',
                message: '스캔 성공.'
            };
            // Show the alert
            this.showAlert = false;
        }
    }

    alertMessageScan(param: any): void {
        if (param.status === 'SUCCESS') {
            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
                message: '입고 처리되었습니다.',
                actions: {
                    confirm: {
                        show: true,
                        label: '확인'
                    },
                    cancel: {
                        show: false,
                        label: '닫기'
                    }
                }
            });
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        // Show the alert
                        this.matDialogRef.close();
                    }
                });
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    failAlert(): void {

        setTimeout(() => {
            this.searchForm.patchValue({'udiCode': ''});
            this.searchForm.patchValue({'udiDiCode': ''});
            this.searchForm.patchValue({'udiPiCode': ''});
            this.searchForm.patchValue({'gtinDirect': ''});
            this.searchForm.patchValue({'manufYmDirect': ''});
            this.searchForm.patchValue({'useTmlmtDirect': ''});
            this.searchForm.patchValue({'lotNoDirect': ''});
            this.searchForm.patchValue({'itemSeqDirect': ''});
            this.gridList1.clearSelection();
        }, 100);
        // Set the alert
        this.alert = {
            type: 'error',
            message: '코드를 다시 입력해주세요. 올바른 형식이 아닙니다.'
        };
        // Show the alert
        this.showAlert = true;
    }

    focusSetting(): void {
        if (this.barcodeYn) {
            this.barcodeYn = false;
            setTimeout(() => {
                if(this.searchForm.getRawValue().udiScan === 'ALL') {
                    if(this.udiAll) {
                        this.refUdiCode.nativeElement.focus();
                        this._changeDetectorRef.markForCheck();
                    }
                } else if(this.searchForm.getRawValue().udiScan === '0') {
                    if(this.udiDiPi) {
                        this.refUdiDiCode.nativeElement.focus();
                        this._changeDetectorRef.markForCheck();
                    }
                } else if (this.searchForm.getRawValue().udiScan === '1') {
                    if (this.udiDirect) {
                        this.refUdiDirectCode.nativeElement.focus();
                        this._changeDetectorRef.markForCheck();
                    }
                }
            }, 100);
        } else {
            setTimeout(() => {
                if(this.searchForm.getRawValue().udiScan === 'ALL') {
                    if(!this.udiAll) {
                        this.refUdiCode.nativeElement.blur();
                        this._changeDetectorRef.markForCheck();
                    }
                } else if(this.searchForm.getRawValue().udiScan === '0') {
                    if(!this.udiDiPi) {
                        this.refUdiDiCode.nativeElement.blur();
                        this._changeDetectorRef.markForCheck();
                    }
                } else if (this.searchForm.getRawValue().udiScan === '1') {
                    if (this.udiDirect) {
                        this.refUdiDirectCode.nativeElement.blur();
                        this._changeDetectorRef.markForCheck();
                    }
                }
            }, 100);
            this.barcodeYn = true;
        }

        this._changeDetectorRef.markForCheck();
    }

    //입고 처리
    inBound(): void {

        const confirmation = this._teamPlatConfirmationService.open({
            title: '입고',
            message: '입고 처리 하시겠습니까?',
            actions: {
                confirm: {
                    label: '입고'
                },
                cancel: {
                    label: '닫기'
                }
            }
        });

        const rowYs = this._realGridsService.gfn_GetRows(this.gridList2, this.gridList2DataProvider);
        const rowNs = this.detailN;
        const rows = [];

        rowYs.forEach((e) => {
            rows.push(e);
        });
        rowNs.forEach((e) => {
            rows.push(e);
        });

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result) {
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for (let i = 0; i < rows.length; i++) {
                        rows[i].suplyContStdmt = this.searchForm.getRawValue().suplyContStdmt;
                    }

                    this._inboundService.inBoundBarcodeY(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((inBound: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessageScan(inBound);
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });
    }

    qtyFailAlert(): void {
        // setTimeout(() => {
            // const snd =
            //     // eslint-disable-next-line max-len
            //     new Audio('data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
            // snd.play();
        // }, 100);
        // Set the alert
        this.alert = {
            type: 'error',
            message: '입고 수량이 초과됬습니다. 수량을 확인해주세요.'
        };
        // Show the alert
        this.showAlert = true;
    }

    udiDiCodeScanDelete(): void {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList2, this.gridList2DataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        checkValues.forEach((ex) => {
            const deleteQty = ex.ibQty * ex.convertedQty;

            const dataRow = this.gridList1DataProvider.searchDataRow({
                fields: ['medDevItemSeq', 'typeName']
                , values: [ex.meddevItemSeq, ex.typeName]
            });

            setTimeout(() => {

                const ibExpQty = this._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow, 'ibExpQty');
                const ibQty = this._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow, 'ibQty');

                this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                    this.gridList1DataProvider,
                    dataRow,
                    'ibQty',
                    ibQty - deleteQty);

                this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                    this.gridList1DataProvider,
                    dataRow,
                    'qty',
                    ibExpQty - (ibQty - deleteQty));
            }, 100);
        });
        this._realGridsService.gfn_DelRows(this.gridList2, this.gridList2DataProvider);

    }

    selectUdiScan(val: any): void {
        if (val.value === 'ALL') {
            this.searchForm.patchValue({'udiCode': ''});
            this.searchForm.patchValue({'udiDiCode': ''});
            this.searchForm.patchValue({'udiPiCode': ''});
            this.searchForm.patchValue({'gtinDirect': ''});
            this.searchForm.patchValue({'manufYmDirect': ''});
            this.searchForm.patchValue({'useTmlmtDirect': ''});
            this.searchForm.patchValue({'lotNoDirect': ''});
            this.searchForm.patchValue({'itemSeqDirect': ''});
            this.udiAll = true;
            this.udiDiPi = false;
            this.udiDirect = false;
            if(this.udiAll) {
                setTimeout(() => {
                    this.refUdiCode.nativeElement.focus();
                }, 200);
            } else {
                setTimeout(() => {
                    this.refUdiCode.nativeElement.blur();
                }, 200);
            }
        } else if (val.value === '0') {
            this.searchForm.patchValue({'udiCode': ''});
            this.searchForm.patchValue({'udiDiCode': ''});
            this.searchForm.patchValue({'udiPiCode': ''});
            this.searchForm.patchValue({'gtinDirect': ''});
            this.searchForm.patchValue({'manufYmDirect': ''});
            this.searchForm.patchValue({'useTmlmtDirect': ''});
            this.searchForm.patchValue({'lotNoDirect': ''});
            this.searchForm.patchValue({'itemSeqDirect': ''});
            this.udiDiPi = true;
            this.udiAll = false;
            this.udiDirect = false;
            if(this.udiDiPi) {
                setTimeout(() => {
                    this.refUdiDiCode.nativeElement.focus();
                }, 200);
            } else {
                setTimeout(() => {
                    this.refUdiDiCode.nativeElement.blur();
                }, 200);
            }
        } else if(val.value === '1') {
            this.searchForm.patchValue({'udiCode': ''});
            this.searchForm.patchValue({'udiDiCode': ''});
            this.searchForm.patchValue({'udiPiCode': ''});
            this.searchForm.patchValue({'gtinDirect': ''});
            this.searchForm.patchValue({'manufYmDirect': ''});
            this.searchForm.patchValue({'useTmlmtDirect': ''});
            this.searchForm.patchValue({'lotNoDirect': ''});
            this.searchForm.patchValue({'itemSeqDirect': ''});
            this.udiDiPi = false;
            this.udiAll = false;
            this.udiDirect = true;
            if(this.udiDirect) {
                setTimeout(() => {
                    this.refUdiDirectCode.nativeElement.focus();
                }, 200);
            } else {
                setTimeout(() => {
                    this.refUdiDirectCode.nativeElement.blur();
                }, 200);
            }
        }
    }
}
