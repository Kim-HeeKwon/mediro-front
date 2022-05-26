import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup} from "@angular/forms";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {merge, Subject} from "rxjs";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {DeviceDetectorService} from "ngx-device-detector";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {UserDiscountService} from "./user-discount.service";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";

@Component({
    selector: 'app-admin-user-discount',
    templateUrl: 'user-discount.component.html',
    styleUrls: ['./user-discount.component.scss']
})
export class UserDiscountComponent implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    orderBy: any = 'asc';
    drawerOpened: boolean = false;
    isMobile: boolean = false;
    isLoading: boolean = false;
    pagenation: any | null = null;
    searchForm: FormGroup;
    columns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dataProvider: RealGrid.LocalDataProvider;// @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    fields: DataFieldObject[] = [
        {fieldName: 'businessNumber', dataType: ValueType.TEXT},
        {fieldName: 'businessName', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'discountTitle', dataType: ValueType.TEXT},
        {fieldName: 'discountComment', dataType: ValueType.TEXT},
        {fieldName: 'beginDate', dataType: ValueType.TEXT},
        {fieldName: 'endDate', dataType: ValueType.NUMBER},
        {fieldName: 'discountRate', dataType: ValueType.NUMBER},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _realGridsService: FuseRealGridService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                private _functionService: FunctionService,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _userDiscountService: UserDiscountService,
                private _deviceService: DeviceDetectorService,)
    {
        this.isMobile = this._deviceService.isMobile();
    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._userDiscountService.getUserDiscount(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', 'desc', this.searchForm.getRawValue());
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
            businessName: ['']
        });

        this.columns = [
            {
                name: 'businessNumber', fieldName: 'businessNumber', type: 'data', width: '110', styleName: 'left-cell-text'
                , header: {text: '사업자 번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'businessName', fieldName: 'businessName', type: 'data', width: '110', styleName: 'left-cell-text'
                , header: {text: '회원사 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'addDate', fieldName: 'addDate', type: 'data', width: '110', styleName: 'left-cell-text'
                , header: {text: '가입일', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'discountTitle', fieldName: 'discountTitle', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '제목', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'discountComment', fieldName: 'discountComment', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '내용', styleName: 'center-cell-text'}, renderer: {
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
        ];
        this.dataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.dataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.dataProvider,
            'userDiscount',
            this.columns,
            this.fields,
            gridListOption);

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
            commitEdit: true,
            checkReadOnly: true
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.editWhenFocused = true;
        this.gridList.editOptions.validateOnEdited = true;
        this._realGridsService.gfn_EditGrid(this.gridList);

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._userDiscountService.getUserDiscount(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
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

        this._changeDetectorRef.markForCheck();
    }

    select(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, true);
        const rtn = this._userDiscountService.getUserDiscount(0, 100, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.dataProvider, false);
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '회원사 할인율');
    }

    saveUserDiscount(): void {

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
                    this._userDiscountService.saveUserDiscount(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((userDiscount: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(userDiscount);
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

    pageEvent($event: PageEvent): void {
        const rtn = this._userDiscountService.getUserDiscount(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

}
