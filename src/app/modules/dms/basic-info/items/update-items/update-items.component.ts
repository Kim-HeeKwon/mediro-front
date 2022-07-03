import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {ItemsService} from "../items.service";
import {FormBuilder} from "@angular/forms";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {DeviceDetectorService} from "ngx-device-detector";
import {takeUntil} from "rxjs/operators";

@Component({
    selector: 'dms-update-items',
    templateUrl: 'update-items.component.html',
    styleUrls: ['update-items.component.scss'],
})
export class UpdateItemsComponent implements OnInit, OnDestroy, AfterViewInit {
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
        {fieldName: 'fomlInfo', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'message', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<UpdateItemsComponent>,
        private _realGridsService: FuseRealGridService,
        public _matDialogPopup: MatDialog,
        private _itemService: ItemsService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
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
                name: 'fomlInfo', fieldName: 'fomlInfo', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '모델명(품목명)', styleName: 'center-cell-text red-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '품목명', styleName: 'center-cell-text red-font-color'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'standard',
                fieldName: 'standard',
                type: 'data',
                width: '120',
                styleName: 'left-cell-text',
                header: {text: '규격', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'unit',
                fieldName: 'unit',
                type: 'data',
                width: '120',
                styleName: 'left-cell-text',
                header: {text: '단위', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'message', fieldName: 'message', type: 'data', width: '280', styleName: 'left-cell-text'
                , header: {text: '업로드 메세지', styleName: 'center-cell-text'},
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
            'updateItem',
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
            const ret = {styleName : '', editable: false};
            if (dataCell.item.rowState === 'updated') {

                const message = grid.getValue(dataCell.index.itemIndex, 'message');
                if(message !== ''){
                    if (dataCell.dataColumn.fieldName === 'message') {
                        ret.styleName = 'left-cell-text red-cell-color';
                    }
                }
            }

            //추가시
            if (dataCell.dataColumn.fieldName === 'message') {
                ret.editable = false;
                return ret;
            } else {
                ret.editable = true;
                return ret;
            }
        });


        setTimeout(() => {
            const values = [
                '', '', '', ''
            ];

            this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);

            const focusCell = this.gridList.getCurrent();
            focusCell.dataRow = 0;
            focusCell.column = 'fomlInfo';
            focusCell.fieldName = 'fomlInfo';
            //포커스된 셀 변경
            this.gridList.setCurrent(focusCell);
            const curr = this.gridList.getCurrent();
            this.gridList.beginUpdateRow(curr.itemIndex);
            this.gridList.setFocus();
        },200);

        this._changeDetectorRef.markForCheck();
    }

    updateItem() {
        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.dataProvider);
        if(rows.length < 1){
            this._functionService.cfn_alert('업로드 할 데이터가 없습니다. 확인해주세요.');
            return;
        }

        const confirmation = this._teamPlatConfirmationService.open({
            title: '',
            message: '일괄 변경 하시겠습니까?',
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
                    this._itemService.uploadUpdateItem(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((item: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(item);
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

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '품목 일괄 변경');
    }

    updateInsertItem() {
        const values = [
            '', '', '', '', '',
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);
    }

    updateDeleteItem() {

        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.dataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.dataProvider);

    }

}
