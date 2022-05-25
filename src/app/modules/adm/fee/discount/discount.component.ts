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
        {fieldName: 'beginDate', dataType: ValueType.TEXT},
        {fieldName: 'endDate', dataType: ValueType.TEXT},
        {fieldName: 'discountRate', dataType: ValueType.NUMBER},
        {fieldName: 'remark', dataType: ValueType.TEXT},
    ];

    constructor(private _realGridsService: FuseRealGridService,
                private _formBuilder: FormBuilder,
                private _functionService: FunctionService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _deviceService: DeviceDetectorService,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _discountService: DiscountService) {
        this.isMobile = this._deviceService.isMobile();
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
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            discountTitle: ['']
        });

        this.columns = [
            {
                name: 'endFlag', fieldName: 'endFlag', type: 'data', width: '110', styleName: 'left-cell-text'
                , header: {text: '종료여부', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'discount',
                fieldName: 'discount',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '번호', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'discountTitle',
                fieldName: 'discountTitle',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '제목', styleName: 'center-cell-text'},
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
                header: {text: '내용', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'beginDate', fieldName: 'beginDate', type: 'date', width: '120', styleName: 'center-cell-text'
                , header: {text: '기간(시작)', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                datetimeFormat: 'yyyy-MM',
                mask: {editMask: '9999-99', includeFormat: false, allowEmpty: true}
                ,
                editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM',
                    textReadOnly: true,
                }
            },
            {
                name: 'endDate', fieldName: 'endDate', type: 'data', width: '120', styleName: 'center-cell-text'
                , header: {text: '기간(종료)', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                datetimeFormat: 'yyyy-MM',
                mask: {editMask: '9999-99', includeFormat: false, allowEmpty: true}
                ,
                editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM',
                    textReadOnly: true,
                }
            },
            {
                name: 'discountRate', fieldName: 'discountRate', type: 'number', width: '100', styleName: 'left-cell-text'
                , header: {text: '할인율', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'remark', fieldName: 'remark', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '비고', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //그리드 Provider
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        // this.dataProvider.setOptions({
        //     softDeleting: false,
        //     deleteCreated: false
        // });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'discount',
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
            checkReadOnly: true
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.validateOnEdited = true;

        this._realGridsService.gfn_EditGrid(this.gridList);
        const validationList = ['businessNumber', 'businessName', 'addDate', 'startDate', 'endDate', 'discountRate'];
        this._realGridsService.gfn_ValidationOption(this.gridList, validationList);

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._discountService.getDiscount(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            };
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //페이지 라벨
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
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, false);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '할인율');
    }

    pageEvent($event: PageEvent): void {
        const rtn = this._discountService.getDiscount(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    // @ts-ignore
    addRow(): boolean {

        const values = [
            '','','','','',''
        ];

        this._realGridsService.gfn_AddRow(this.gridList, this.dataProvider, values);
    }

    delRow(): boolean {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.dataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRow(this.gridList, this.dataProvider);
    }

    saveDiscount(): void {

        if (this._realGridsService.gfn_ValidationRows(this.gridList, this._functionService)) {
            return;
        }

        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.dataProvider);

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
                    this._discountService.saveDiscount(rows)
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
    }

    alertMessage(param: any): void {
        if (param.status === 'SUCCESS') {
            this._functionService.cfn_alert('정상적으로 처리되었습니다.');
            this.select();
        } else if (param.status === 'CANCEL') {

        } else {
            this._functionService.cfn_alert(param.msg);
        }
    }
}
