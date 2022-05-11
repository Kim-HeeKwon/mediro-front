import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component, ElementRef,
    Inject,
    OnDestroy,
    OnInit, ViewChild,
    ViewChildren,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../services/realgrid/realgrid.types";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../services/realgrid";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CodeStore} from "../../../app/core/common-code/state/code.store";
import {TeamPlatConfirmationService} from "../../services/confirmation";
import {FunctionService} from "../../services/function";
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver} from "@angular/cdk/layout";
import {OutboundScanService} from "./outbound-scan.service";
import {Subject} from "rxjs";
import {FuseAlertType} from "../alert";
import {takeUntil} from "rxjs/operators";
import {forEach} from "lodash-es";
import {OutboundService} from "../../../app/modules/dms/bound/outbound/outbound.service";
import {formatDate} from "@angular/common";

@Component({
    selector: 'app-outbound-scan',
    templateUrl: './outbound-scan.component.html',
    styleUrls: ['./outbound-scan.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class OutboundScanComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('udiCode') refUdiCode: ElementRef;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    barcodeYn: boolean = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;
    detail: any;
    detailN: any;
    obQty: any = 1;
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
        {fieldName: 'obNo', dataType: ValueType.TEXT},
        {fieldName: 'obLineNo', dataType: ValueType.TEXT},
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'medDevItemSeq', dataType: ValueType.TEXT},
        {fieldName: 'typeName', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'udiYn', dataType: ValueType.TEXT},
        {fieldName: 'obExpQty', dataType: ValueType.NUMBER},
        {fieldName: 'obQty', dataType: ValueType.NUMBER},
        {fieldName: 'qty', dataType: ValueType.NUMBER},
        {fieldName: 'orgObQty', dataType: ValueType.NUMBER},
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
        {fieldName: 'obNo', dataType: ValueType.TEXT},
        {fieldName: 'obLineNo', dataType: ValueType.TEXT},
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
        {fieldName: 'obQty', dataType: ValueType.NUMBER},
    ];
    suplyTypeCode: CommonCode[] = null;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    filterList: string[];
    month: CommonCode[] = null;
    year: CommonCode[] = null;
    itemGrades: CommonCode[] = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<OutboundScanComponent>,
        private _realGridsService: FuseRealGridService,
        public _matDialogPopup: MatDialog,
        private _outBoundScanService: OutboundScanService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _outboundService: OutboundService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.filterList = ['ALL'];
        this.month = _utilService.commonValue(_codeStore.getValue().data,'MONTH');
        this.year = _utilService.commonValue(_codeStore.getValue().data,'YEAR');
        this.suplyTypeCode = _utilService.commonValueFilter(_codeStore.getValue().data,'SUPLYTYPECODE',this.filterList);
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data, 'ITEM_GRADE');

        this.isMobile = this._deviceService.isMobile();
        this.detail = data.detail;
        this.detailN = data.detailN;
    }
    ngAfterViewInit(): void {
        //this._changeDetectorRef.markForCheck();
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
        const mm = today.getMonth()+1; //January is 0!
        let MM;
        if(mm<10) {
            MM = String('0'+mm);
        }else{
            MM = String(mm);
        }
        // Form 생성
        this.searchForm = this._formBuilder.group({
            udiCode: [''],   // 바코드
            udiCodeBak: [''],   // 바코드
            stdCode: [''],   //
            gtin: [''],   //
            lotNo: [''],   //
            manufYm: [''],   //
            useTmlmt: [''],   //
            itemSeq: [''],   //
            year: [YYYY + ''],
            month: [''],
            suplyTypeCode: [''],
            suplyContStdmt: [''],
            active: [false]  // cell상태
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
            //     name: 'obNo', fieldName: 'obNo', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '출고번호', styleName: 'center-cell-text'},
            //     renderer:{
            //         showTooltip:true
            //     }
            // },
            // {
            //     name: 'obLineNo', fieldName: 'obLineNo', type: 'data', width: '70', styleName: 'left-cell-text'
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
                renderer:{
                    showTooltip:true
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
                name: 'obExpQty', fieldName: 'obExpQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '출고대상수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'obQty', fieldName: 'obQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '출고수량', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'qty', fieldName: 'qty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '미출고수량', styleName: 'center-cell-text red-font-color'}
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
                name: 'useTmlmtUse', fieldName: 'useTmlmtUse', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '유효기간', styleName: 'center-cell-text'},
                renderer:{
                    showTooltip:true
                }
            },
            // {
            //     name: 'obNo', fieldName: 'obNo', type: 'data', width: '100', styleName: 'left-cell-text'
            //     , header: {text: '출고번호', styleName: 'center-cell-text'},
            //     renderer:{
            //         showTooltip:true
            //     }
            // },
            // {
            //     name: 'obLineNo', fieldName: 'obLineNo', type: 'data', width: '70', styleName: 'left-cell-text'
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
                renderer:{
                    showTooltip:true
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
                name: 'udiCode', fieldName: 'udiCode', type: 'data', width: '250', styleName: 'left-cell-text'
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
                name: 'obQty', fieldName: 'obQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '출고수량', styleName: 'center-cell-text red-font-color'}
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
            startEdit: false,
            commitEdit: true,
            checkReadOnly: true
        });
        this.gridList2.editOptions.commitByCell = true;
        this.gridList2.editOptions.validateOnEdited = true;
        this._realGridsService.gfn_EditGrid(this.gridList2);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList2.onCellEdited = ((grid, itemIndex, row, field) => {

            if (this.gridList2DataProvider.getOrgFieldName(field) === 'obQty') {

                const that = this;

                //row 2 : 전체 meddevItemSeq, typename <비교> 입력한 meddevItemSeq, typeName
                const medDevItemSeq = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList2,
                    this.gridList2DataProvider,
                    itemIndex,'meddevItemSeq');
                const typeName = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList2,
                    this.gridList2DataProvider,
                    itemIndex,'typeName');

                const dataRow = this.gridList1DataProvider.searchDataRow({fields:['medDevItemSeq', 'typeName']
                    , values: [medDevItemSeq, typeName]});

                let chk = this._realGridsService.gfn_GetRows(this.gridList2, this.gridList2DataProvider);

                chk = chk.filter((detail: any) =>
                    (detail.meddevItemSeq === medDevItemSeq))
                    .map((param: any) => param);
                chk = chk.filter((detail: any) =>
                    (detail.typeName === typeName))
                    .map((param: any) => param)

                const obQty = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow, 'obQty');

                const obQty2 = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow, 'obQty');

                const inputOrgQty = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList2,
                    this.gridList2DataProvider,
                    itemIndex, 'obQty');

                const qty = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    itemIndex, 'qty');

                const qty2 = that._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow, 'qty');

                const grid1OrgObQty = obQty2;
                const grid1OrgQty = qty2;

                let row2SumObQty = 0;
                if(chk.length > 0) {
                    chk.forEach((ex) => {
                        row2SumObQty += ex.obQty * ex.convertedQty;
                    });
                }

                setTimeout(() => {

                    // row 1 : 입고 중 수량
                    const orgObQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList1,
                        this.gridList1DataProvider,
                        dataRow,'orgObQty');

                    // row : 입고 예정 수량
                   const obExpQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList1,
                        this.gridList1DataProvider,
                        dataRow,'obExpQty');

                    const convertedQty = that._realGridsService.gfn_CellDataGetRow(
                        this.gridList2,
                        this.gridList2DataProvider,
                        itemIndex,'convertedQty');

                    row2SumObQty = row2SumObQty + orgObQty;

                    // 미입고 수랑 row1
                    that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                        that.gridList1DataProvider,
                        dataRow,
                        'qty',
                        obExpQty - row2SumObQty);

                    // 입고 수량 row1
                    that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                        that.gridList1DataProvider,
                        dataRow,
                        'obQty',
                        row2SumObQty);

                    const inputQty = that._realGridsService.gfn_CellDataGetRow(that.gridList1,
                        that.gridList1DataProvider,
                        dataRow,
                        'qty');

                    if(inputQty >= 0) {
                        this.obQty = inputOrgQty;
                    }
                    if(inputQty < 0) {
                        that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                            that.gridList1DataProvider,
                            dataRow,
                            'obQty',
                            grid1OrgObQty);

                        that._realGridsService.gfn_CellDataSetRow(that.gridList1,
                            that.gridList1DataProvider,
                            dataRow,
                            'qty',
                            grid1OrgQty);

                        that._realGridsService.gfn_CellDataSetRow(that.gridList2,
                            that.gridList2DataProvider,
                            itemIndex,
                            'obQty',
                            this.obQty);

                        this.qtyFailAlert();
                        this._changeDetectorRef.markForCheck();
                    }

                }, 100);
            }
        });

        this.gridList2.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName : '', editable: false};
            //console.log(dataCell.dataColumn.renderer);
            if (dataCell.dataColumn.fieldName === 'obQty') {
                ret.editable= true;
            }

            const useTmlmtUse = grid.getValue(dataCell.index.itemIndex, 'useTmlmtUse');

            if(useTmlmtUse === '만료'){
                if (dataCell.dataColumn.fieldName === 'useTmlmtUse') {
                    ret.styleName= 'red-color';
                }
            }else{
                if (dataCell.dataColumn.fieldName === 'useTmlmtUse') {
                    ret.styleName= 'green-color';
                }
            }

            return ret;
        });

        setTimeout(() =>{
            this.detail.forEach((e) => {
                e.orgObQty = e.obQty;
            })
            this._realGridsService.gfn_DataSetGrid(this.gridList1, this.gridList1DataProvider, this.detail);
            this.refUdiCode.nativeElement.focus();
        },500);

        this._changeDetectorRef.markForCheck();
    }

    udiDiCode($event) {
        let udiCode = $event.target.value;
        if(udiCode === ''){

            // this.searchForm.patchValue({'lotNo': ''});
            // this.searchForm.patchValue({'itemSeq': ''});
            // this.searchForm.patchValue({'manufYm': ''});
            // this.searchForm.patchValue({'useTmlmt': ''});
            // this.searchForm.patchValue({'stdCode': ''});
            // this.searchForm.patchValue({'gtin': ''});
            // this.searchForm.patchValue({'udiCodeBak': ''});

        }else{

            let lotNo;
            let manufYm;
            let useTmlmt;
            let itemSeq;
            let stdCode;

            if(udiCode.length < 17){
                this.failAlert();
                return;
            }
            const check_kor = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
            if(check_kor.test(udiCode)){
                setTimeout(() =>{
                    this.searchForm.patchValue({'udiCode': ''});
                    this.gridList1.clearSelection();
                },100);
                // Set the alert
                this.alert = {
                    type   : 'error',
                    message: '한글은 입력할 수 없습니다.'
                };
                // Show the alert
                this.showAlert = true;
                return;
            }

            if(!udiCode.includes('(')){

                try{
                    let udiDiCode = udiCode.substring(0, 16);
                    let udiPiCode = '';
                    udiDiCode = '(' + udiDiCode.substring(0, 2) + ')' + udiDiCode.substring(2, 16);

                    let cutUdiPiCode = udiCode.substring(16, udiCode.length);

                    //값이 없을 때 까지
                    while(cutUdiPiCode !== ''){

                        if(cutUdiPiCode.substring(0, 2) === '11'){

                            manufYm = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 8);
                            cutUdiPiCode = cutUdiPiCode.substring(8, cutUdiPiCode.length);

                        }else if(cutUdiPiCode.substring(0, 2) === '17'){

                            useTmlmt = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 8);
                            cutUdiPiCode = cutUdiPiCode.substring(8, cutUdiPiCode.length);

                        }else if(cutUdiPiCode.substring(0, 2) === '10'){

                            const len = cutUdiPiCode.length;

                            if(len > 22){
                                lotNo = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 22);
                                cutUdiPiCode = cutUdiPiCode.substring(22, cutUdiPiCode.length);
                            }else{
                                lotNo = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, cutUdiPiCode.length);
                                cutUdiPiCode = '';
                            }

                        }else if(cutUdiPiCode.substring(0, 2) === '21'){

                            const len = cutUdiPiCode.length;

                            if(len > 22){
                                itemSeq = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, 22);
                                cutUdiPiCode = cutUdiPiCode.substring(22, cutUdiPiCode.length);
                            }else{
                                itemSeq = '(' + cutUdiPiCode.substring(0, 2) + ')' + cutUdiPiCode.substring(2, cutUdiPiCode.length);
                                cutUdiPiCode = '';
                            }

                        }else{
                            break;
                        }
                    }

                    if(lotNo === undefined){
                        lotNo = '';
                    }
                    if(itemSeq === undefined){
                        itemSeq = '';
                    }
                    if(manufYm === undefined){
                        manufYm = '';
                    }
                    if(useTmlmt === undefined){
                        useTmlmt = '';
                    }

                    udiPiCode = manufYm + useTmlmt + lotNo + itemSeq;
                    udiCode = udiDiCode + udiPiCode;

                }catch (e){
                    this.failAlert();
                    return;
                }
            }
            //console.log(udiCode);

            const list = ['(01)', '(11)', '(17)', '(10)', '(21)'];
            list.forEach((check: any) => {

                const chk = check;
                let result = '';
                const idx = udiCode.indexOf(chk, 0);
                if(idx >= 0){
                    let lastIndex = udiCode.indexOf('(', idx + 1);
                    if(lastIndex >= 0){
                        lastIndex = udiCode.indexOf('(', idx + 1);
                    }else{
                        lastIndex = udiCode.length;
                    }
                    result = udiCode.substring(idx, lastIndex)
                        .replace('(' + chk + ')','');

                    if(chk === '(01)'){
                        stdCode = result;
                    }else if(chk === '(10)'){
                        lotNo = result;
                    }else if(chk === '(11)'){
                        manufYm = result;
                    }else if(chk === '(17)'){
                        useTmlmt = result;
                    }else if(chk === '(21)'){
                        itemSeq = result;
                    }
                }
            });

            if(lotNo === undefined){
                lotNo = '';
            }
            if(itemSeq === undefined){
                itemSeq = '';
            }
            if(manufYm === undefined){
                manufYm = '';
            }else if(manufYm === ''){
                manufYm = '';
            }else{
                if(manufYm.replace('(' + '11' + ')','').length !== 6){
                    this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                    return;
                }
            }
            if(useTmlmt === undefined){
                useTmlmt = '';
            }else if(useTmlmt === ''){
                useTmlmt = '';
            }else{
                if(useTmlmt.replace('(' + '17' + ')','').length !== 6){
                    this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                    return;
                }
            }

            if(stdCode === undefined){
                this.failAlert();
                return;
            }else{

                const searchForm = {udiDiCode: stdCode.replace('(' + '01' + ')','')};

                this._outBoundScanService.getUdiDiCodeInfo(searchForm)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((manages: any) => {
                        this._functionService.cfn_loadingBarClear();
                        this.alertMessage(manages);

                        if(manages.data !== null){

                            const dataRows = this.gridList1DataProvider.searchDataRow({fields:['medDevItemSeq', 'typeName']
                                , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]});
                                let chk = this._realGridsService.gfn_GetRows(this.gridList1, this.gridList1DataProvider);
                                chk = chk.filter((detail: any) =>
                                    (detail.medDevItemSeq === manages.data[0].meddevItemSeq))
                                    .map((param: any) => param);
                                chk = chk.filter((detail: any) =>
                                    (detail.typeName === manages.data[0].typeName))
                                    .map((param: any) => param);

                                if(chk.length > 0){
                                    const obExpQty = this._realGridsService.gfn_CellDataGetRow(
                                        this.gridList1,
                                        this.gridList1DataProvider,
                                        dataRows,'obExpQty');
                                    let obQty = this._realGridsService.gfn_CellDataGetRow(
                                        this.gridList1,
                                        this.gridList1DataProvider,
                                        dataRows,'obQty');
                                    obQty += manages.data[0].convertedQty;
                                    if(obExpQty >= obQty) {
                                        this.searchForm.patchValue({'stdCode': udiCode});
                                        this.searchForm.patchValue({'gtin': stdCode.replace('(' + '01' + ')','')});
                                        this.searchForm.patchValue({'lotNo': lotNo.replace('(' + '10' + ')','')});
                                        this.searchForm.patchValue({'itemSeq': itemSeq.replace('(' + '21' + ')','')});
                                        this.searchForm.patchValue({'manufYm': manufYm.replace('(' + '11' + ')','')});
                                        this.searchForm.patchValue({'useTmlmt': useTmlmt.replace('(' + '17' + ')','')});

                                        let useTmlmtUse = '-';
                                        if(useTmlmt !== undefined){
                                            if(useTmlmt !== null){

                                                if(useTmlmt !== ''){
                                                    const now = new Date();
                                                    const nowDate = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');
                                                    const nD = new Date(nowDate);
                                                    const nDDate = formatDate(new Date(nD.setDate(nD.getDate())), 'yyyy-MM-dd', 'en');
                                                    const useTmletCustom = useTmlmt.replace('(' + '17' + ')','');
                                                    const yy = '20' + useTmletCustom.substring(0, 2);
                                                    const mm = useTmletCustom.substring(2, 4);
                                                    const dd = useTmletCustom.substring(4, 6);
                                                    //console.log(nD);
                                                    const sD = new Date(yy + '-' + mm + '-' + dd);
                                                    const sDDate = formatDate(new Date(sD.setDate(sD.getDate())), 'yyyy-MM-dd', 'en');
                                                    //console.log(sD);

                                                    if(nD > sD){
                                                        useTmlmtUse = '만료';
                                                    }else{
                                                        useTmlmtUse = '유효';
                                                    }
                                                }
                                            }
                                        }else{
                                            useTmlmtUse = '-';
                                        }
                                        const values = [
                                            manages.data[0].convertedQty,
                                            useTmlmtUse,
                                            chk[0].obNo, chk[0].obLineNo, chk[0].itemCd, chk[0].itemNm, manages.data[0].meddevItemSeq,
                                            manages.data[0].seq,
                                            manages.data[0].udiDiSeq,
                                            manages.data[0].userSterilizationYn,
                                            manages.data[0].kitYn,
                                            chk[0].typeName, udiCode,
                                            lotNo.replace('(' + '10' + ')',''),manufYm.replace('(' + '11' + ')',''),useTmlmt.replace('(' + '17' + ')',''),itemSeq.replace('(' + '21' + ')',''),1
                                        ];

                                        let rows = this._realGridsService.gfn_GetRows(this.gridList2, this.gridList2DataProvider);

                                        rows = rows.filter((detail: any) =>
                                            (detail.udiCode === this.searchForm.getRawValue().stdCode))
                                            .map((param: any) => param);

                                        if(rows.length > 0){
                                            const dataRow = this.gridList1DataProvider.searchDataRow({fields:['medDevItemSeq', 'typeName']
                                                , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]});

                                            let sumQty = manages.data[0].convertedQty;
                                            const qty = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,'obQty');
                                            sumQty = sumQty + qty;
                                            setTimeout(() =>{
                                                this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                    this.gridList1DataProvider,
                                                    dataRow,
                                                    'obQty',
                                                    sumQty);

                                                const obExpQty = this._realGridsService.gfn_CellDataGetRow(
                                                    this.gridList1,
                                                    this.gridList1DataProvider,
                                                    dataRow,'obExpQty');
                                                this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                    this.gridList1DataProvider,
                                                    dataRow,
                                                    'qty',
                                                    obExpQty - sumQty);
                                            },100);

                                            const dataRow2 = this.gridList2DataProvider.searchDataRow({fields:['udiCode'], values: [udiCode]});
                                            let sumQty2 = 1;
                                            let qty2 = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList2,
                                                this.gridList2DataProvider,
                                                dataRow2,'obQty');
                                            if(qty2 === undefined){
                                                qty2 = 0;
                                            }
                                            sumQty2 = sumQty2 + qty2;
                                            setTimeout(() =>{
                                                this._realGridsService.gfn_CellDataSetRow(this.gridList2,
                                                    this.gridList2DataProvider,
                                                    dataRow2,
                                                    'obQty',
                                                    sumQty2);
                                            },100);

                                        }else{
                                            const dataRow = this.gridList1DataProvider.searchDataRow({fields:['medDevItemSeq', 'typeName']
                                                , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]});
                                            let sumQty = manages.data[0].convertedQty;
                                            const qty = this._realGridsService.gfn_CellDataGetRow(
                                                this.gridList1,
                                                this.gridList1DataProvider,
                                                dataRow,'obQty');
                                            sumQty = sumQty + qty;
                                            setTimeout(() =>{
                                                this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                    this.gridList1DataProvider,
                                                    dataRow,
                                                    'obQty',
                                                    sumQty);

                                                const obExpQty = this._realGridsService.gfn_CellDataGetRow(
                                                    this.gridList1,
                                                    this.gridList1DataProvider,
                                                    dataRow,'obExpQty');
                                                this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                                                    this.gridList1DataProvider,
                                                    dataRow,
                                                    'qty',
                                                    obExpQty - sumQty);
                                            },100);

                                            this._realGridsService.gfn_AddRow(this.gridList2, this.gridList2DataProvider, values);
                                        }
                                        setTimeout(() =>{
                                            const dataRow = this.gridList1DataProvider.searchDataRow({fields:['medDevItemSeq', 'typeName']
                                                , values: [manages.data[0].meddevItemSeq, manages.data[0].typeName]});
                                            this.gridList1.setSelection({ style : 'rows', startRow : dataRow, endRow : dataRow });
                                            this.searchForm.patchValue({'udiCode': ''});
                                        },100);

                                        if(!this.barcodeYn){
                                            setTimeout(() =>{
                                                this.refUdiCode.nativeElement.focus();
                                                this._changeDetectorRef.markForCheck();
                                            },100);
                                        }else{
                                            const dataRow = this.gridList2DataProvider.searchDataRow({fields:['udiCode'], values: [udiCode]});
                                            //셀이동
                                            //this.gridList2.setSelection({ style : 'rows', startRow : dataRow, endRow : dataRow });
                                            setTimeout(() =>{
                                                this.refUdiCode.nativeElement.blur();
                                                this._changeDetectorRef.markForCheck();
                                            },100);
                                            const focusCell = this.gridList2.getCurrent();
                                            focusCell.dataRow = dataRow;
                                            focusCell.column = 'obQty';
                                            focusCell.fieldName = 'obQty';
                                            //포커스된 셀 변경
                                            this.gridList2.setCurrent(focusCell);
                                            const curr = this.gridList2.getCurrent();
                                            this.gridList2.beginUpdateRow(curr.itemIndex);
                                            this.gridList2.showEditor();
                                            this.gridList2.setFocus();
                                        }

                                        this.showAlert = false;
                                        this._changeDetectorRef.markForCheck();

                                    }else{
                                        this.qtyFailAlert();
                                    }
                            } else {
                                setTimeout(() =>{
                                    this.gridList1.clearSelection();
                                },100);
                                this.alert = {
                                    type   : 'error',
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

    alertMessage(param: any): void
    {
        if(param.status !== 'SUCCESS'){
            this.alert = {
                type   : 'error',
                message: param.msg
            };
            // Show the alert
            this.showAlert = true;
        }else{
            this.alert = {
                type   : 'success',
                message: '스캔 성공.'
            };
            // Show the alert
            this.showAlert = false;
        }
    }

    alertMessageScan(param: any): void
    {
        if(param.status === 'SUCCESS'){
            const confirmation = this._teamPlatConfirmationService.open({
                title: '',
                message: '출고 처리되었습니다.',
                actions: {
                    confirm: {
                        show : true,
                        label: '확인'
                    },
                    cancel : {
                        show : false,
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
        }else if(param.status === 'CANCEL'){

        }else{
            this._functionService.cfn_alert(param.msg);
        }
    }

    failAlert(){

        setTimeout(() =>{
            this.searchForm.patchValue({'udiCode': ''});
            this.gridList1.clearSelection();
        },100);
        // Set the alert
        this.alert = {
            type   : 'error',
            message: '코드를 다시 입력해주세요. 올바른 형식이 아닙니다.'
        };
        // Show the alert
        this.showAlert = true;
    }

    qtyFailAlert(){

        setTimeout(() =>{
            // const snd =
            //     // eslint-disable-next-line max-len
            //     new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=');
            // snd.play();
        },100);
        // Set the alert
        this.alert = {
            type   : 'error',
            message: '출고 수량이 초과됬습니다. 수량을 확인해주세요.'
        };
        // Show the alert
        this.showAlert = true;
    }

    focusSetting() {
        if(this.barcodeYn){
            this.barcodeYn = false;
            setTimeout(() =>{
                this.refUdiCode.nativeElement.focus();
                this._changeDetectorRef.markForCheck();
            },100);
        }else{
            setTimeout(() =>{
                this.refUdiCode.nativeElement.blur();
                this._changeDetectorRef.markForCheck();
            },100);
            this.barcodeYn = true;
        }

        this._changeDetectorRef.markForCheck();
    }

    //출고 처리
    outBound(){
        if(this.searchForm.getRawValue().suplyTypeCode === ''){
            this._functionService.cfn_alert('공급형태는 필수값 입니다.');
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title: '출고',
            message: '출고 처리 하시겠습니까?',
            actions: {
                confirm: {
                    label: '출고'
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
                    for(let i=0; i<rows.length; i++){

                        rows[i].suplyContStdmt = this.searchForm.getRawValue().suplyContStdmt;
                        rows[i].suplyTypeCode = this.searchForm.getRawValue().suplyTypeCode;
                    }

                    this._outboundService.outBoundBarcodeY(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((outBound: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessageScan(outBound);
                            // Mark for check
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });
    }

    udiDiCodeScanDelete() {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList2, this.gridList2DataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        checkValues.forEach((ex) => {
            const deleteQty = ex.obQty * ex.convertedQty;

            const dataRow = this.gridList1DataProvider.searchDataRow({fields:['medDevItemSeq', 'typeName']
                , values: [ex.meddevItemSeq, ex.typeName]});

            setTimeout(() =>{

                const obExpQty = this._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow,'obExpQty');
                const obQty = this._realGridsService.gfn_CellDataGetRow(
                    this.gridList1,
                    this.gridList1DataProvider,
                    dataRow,'obQty');

                this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                    this.gridList1DataProvider,
                    dataRow,
                    'obQty',
                    obQty - deleteQty);

                this._realGridsService.gfn_CellDataSetRow(this.gridList1,
                    this.gridList1DataProvider,
                    dataRow,
                    'qty',
                    obExpQty - (obQty - deleteQty));
            },100);
        });
        this._realGridsService.gfn_DelRows(this.gridList2, this.gridList2DataProvider);
    }
}
