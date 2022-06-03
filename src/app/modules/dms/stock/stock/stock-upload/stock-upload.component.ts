import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {takeUntil} from "rxjs/operators";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {DeviceDetectorService} from "ngx-device-detector";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {StockService} from "../stock.service";

@Component({
    selector: 'dms-app-stock-upload',
    templateUrl: 'stock-upload.component.html',
    styleUrls: ['stock-upload.component.scss']
})
export class StockUploadComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isLoading: boolean = false;
    isMobile: boolean = false;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    dataProvider: RealGrid.LocalDataProvider;
    columns: Columns[];
    // @ts-ignore
    fields: DataFieldObject[] = [
        {fieldName: 'errMsg', dataType: ValueType.TEXT}, // 에러 메시지
        {fieldName: 'c001', dataType: ValueType.TEXT}, // 품목 코드
        {fieldName: 'c002', dataType: ValueType.TEXT}, // 수량
        {fieldName: 'c003', dataType: ValueType.TEXT}, // 유효기간
        {fieldName: 'c004', dataType: ValueType.TEXT}, // 재조사 lot
        {fieldName: 'c005', dataType: ValueType.TEXT}, // 사유
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(public matDialogRef: MatDialogRef<StockUploadComponent>,
                private _realGridsService: FuseRealGridService,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _functionService: FunctionService,
                private _stockService: StockService,
                private _deviceService: DeviceDetectorService,
                private readonly breakpointObserver: BreakpointObserver) {
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.dataProvider);
    }

    ngOnInit(): void {
        this.columns = [
            {
                name: 'errMsg', fieldName: 'errMsg', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '에러 메시지', styleName: 'center-cell-text black-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'c001', fieldName: 'c001', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'center-cell-text red-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'c002', fieldName: 'c002', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '수량', styleName: 'center-cell-text red-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'c003', fieldName: 'c003', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '유효기간', styleName: 'center-cell-text black-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'c004', fieldName: 'c004', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '제조사 lot', styleName: 'center-cell-text black-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'c005', fieldName: 'c005', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '사유', styleName: 'center-cell-text black-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
        ];

        this.dataProvider = this._realGridsService.gfn_CreateDataProvider(false);

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: true,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'uploadStock',
            this.columns,
            this.fields,
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
            checkReadOnly: true,
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.validateOnEdited = true;

        // 셀 edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName: '', editable: false};
            if (dataCell.item.rowState === 'updated') {

                const errMsg = grid.getValue(dataCell.index.itemIndex, 'errMsg');
                if (errMsg !== '') {
                    if (dataCell.dataColumn.fieldName === 'errMsg') {
                        ret.styleName = 'left-cell-text red-cell-color';
                    }
                }
            }

            //추가시
            if (dataCell.dataColumn.fieldName === 'errMsg') {
                ret.editable = false;
                return ret;
            } else {
                ret.editable = true;
                return ret;
            }
        });

        setTimeout(() => {
            const values = [
                '', '', 0, '', '', ''
            ];

            this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);

            const focusCell = this.gridList.getCurrent();
            focusCell.dataRow = 0;
            focusCell.column = 'c001';
            focusCell.fieldName = 'c001';
            //포커스된 셀 변경
            this.gridList.setCurrent(focusCell);
            const curr = this.gridList.getCurrent();
            this.gridList.beginUpdateRow(curr.itemIndex);
            this.gridList.setFocus();
        },200);

        this._changeDetectorRef.markForCheck();
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '기초재고 업로드');
    }

    uploadStock(): void {
        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.dataProvider);
        if(rows.length < 1){
            this._functionService.cfn_alert('업로드 할 데이터가 없습니다. 확인해주세요.');
            return;
        }
        if(rows.length > 300){
            this._functionService.cfn_alert('기초 재고 등록은 300개 까지 가능합니다.');
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '업로드 하시겠습니까?',
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
                    this._stockService.uploadStock(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((stock: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(stock);
                            this._changeDetectorRef.markForCheck();
                        });
                }
            });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            if(param.data.length > 0){
                this._realGridsService.gfn_DataSetGrid(this.gridList, this.dataProvider, param.data);


                setTimeout(() => {

                    for(let i=0; i<param.data.length; i++){
                        this.dataProvider.setRowState(i, 'updated', false);
                    }

                },200);


                this._changeDetectorRef.markForCheck();
            }else{
                const confirmation = this._teamPlatConfirmationService.open({
                    title: '',
                    message: '정상적으로 처리되었습니다.',
                    actions: {
                        confirm: {
                            label: '확인'
                        },
                        cancel: {
                            label: '취소',
                            show: false,
                        },
                    }
                });

                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result){
                            this.matDialogRef.close();
                        }
                    });
            }
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }

    uploadInsertStock(): void {
        const values = ['', '', 0, '', '', ''];

        this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);
    }

    uploadDeleteStock(): void {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.dataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.dataProvider);

    }

}
