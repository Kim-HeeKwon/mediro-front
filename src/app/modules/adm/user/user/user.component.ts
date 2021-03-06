import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {merge, Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {FormBuilder, FormGroup} from "@angular/forms";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {FunctionService} from "../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {UserService} from "./user.service";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {UserPagenation} from "./user.types";
import {TeamPlatConfirmationService} from "../../../../../@teamplat/services/confirmation";
import {UserBreakComponent} from "./user-break/user-break.component";

@Component({
    selector: 'app-admin-user',
    templateUrl: 'user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    pagenation: any | null = null;
    isMobile: boolean = false;
    isLoading: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    orderBy: any = 'asc';
    yearUser: CommonCode[] = null;
    payGrade: CommonCode[] = null;
    channel: CommonCode[] = null;
    area: CommonCode[] = null;
    talkYn: CommonCode[] = null;
    promotion: CommonCode[] = null;
    yn: CommonCode[] = null;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userColumns: Columns[];

    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    userFields: DataFieldObject[] = [
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'businessNumber', dataType: ValueType.TEXT},
        {fieldName: 'businessName', dataType: ValueType.TEXT},
        {fieldName: 'userId', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
        {fieldName: 'subscriptionFeeYn', dataType: ValueType.TEXT},
        {fieldName: 'freeDate', dataType: ValueType.TEXT},
        {fieldName: 'payDate', dataType: ValueType.TEXT},
        {fieldName: 'payAmt', dataType: ValueType.NUMBER},
        {fieldName: 'commissionWindow', dataType: ValueType.TEXT},
        {fieldName: 'commissionRate', dataType: ValueType.NUMBER},
        {fieldName: 'commissionAmt', dataType: ValueType.NUMBER},
        {fieldName: 'phoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'representName', dataType: ValueType.TEXT},
        {fieldName: 'payGrade', dataType: ValueType.TEXT},
        {fieldName: 'yearUser', dataType: ValueType.TEXT},
        {fieldName: 'midGrade', dataType: ValueType.TEXT},
        {fieldName: 'address', dataType: ValueType.TEXT},
        {fieldName: 'channel', dataType: ValueType.TEXT},
        {fieldName: 'area', dataType: ValueType.TEXT},
        {fieldName: 'talkYn', dataType: ValueType.TEXT},
        {fieldName: 'userCnt', dataType: ValueType.NUMBER},
        {fieldName: 'visitCnt', dataType: ValueType.NUMBER},
        {fieldName: 'surveyResponses', dataType: ValueType.TEXT},
        {fieldName: 'promotion', dataType: ValueType.TEXT},
        {fieldName: 'promotionAmt', dataType: ValueType.NUMBER},
        {fieldName: 'employeesCnt', dataType: ValueType.NUMBER},
        {fieldName: 'scale', dataType: ValueType.TEXT},
        {fieldName: 'currentUse', dataType: ValueType.TEXT},
        {fieldName: 'remark', dataType: ValueType.TEXT},
        {fieldName: 'addDate', dataType: ValueType.TEXT},
        {fieldName: 'delFlag', dataType: ValueType.TEXT},
    ];
    constructor(private _realGridsService: FuseRealGridService,
                private _formBuilder: FormBuilder,
                private _codeStore: CodeStore,
                private _teamPlatConfirmationService: TeamPlatConfirmationService,
                private _router: Router,
                private _matDialog: MatDialog,
                public _matDialogPopup: MatDialog,
                private _utilService: FuseUtilsService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _functionService: FunctionService,
                private _deviceService: DeviceDetectorService,
                private _userService: UserService,
                private readonly breakpointObserver: BreakpointObserver)
    {
        this.yearUser = _utilService.commonValue(_codeStore.getValue().data, 'YEAR_USER');
        this.payGrade = _utilService.commonValue(_codeStore.getValue().data, 'PAY_GRADE');
        this.channel = _utilService.commonValue(_codeStore.getValue().data, 'CHANNEL');
        this.area = _utilService.commonValue(_codeStore.getValue().data, 'AREA');
        this.talkYn = _utilService.commonValue(_codeStore.getValue().data, 'TALK_YN');
        this.promotion = _utilService.commonValue(_codeStore.getValue().data, 'PROMOTION');
        this.yn = _utilService.commonValue(_codeStore.getValue().data, 'YN');
        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._userService.getUser(this._paginator.pageIndex, this._paginator.pageSize, 'businessName', 'asc', this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.userDataProvider);
    }

    ngOnInit(): void {
        // ?????? Form ??????
        this.searchForm = this._formBuilder.group({
            businessName: [''],
        });

        const valuesYearUser = [];
        const lablesYearUser = [];

        const valuesPayGrade = [];
        const lablesPayGrade = [];

        const valuesChannel = [];
        const lablesChannel = [];

        const valuesArea = [];
        const lablesArea = [];

        const valuesTalkYn = [];
        const lablesTalkYn = [];

        const valuesPromotion = [];
        const lablesPromotion = [];

        const valuesYn = [];
        const lablesYn = [];

        this.yearUser.forEach((param: any) => {
            valuesYearUser.push(param.id);
            lablesYearUser.push(param.name);
        });

        this.payGrade.forEach((param: any) => {
            valuesPayGrade.push(param.id);
            lablesPayGrade.push(param.name);
        });

        this.channel.forEach((param: any) => {
            valuesChannel.push(param.id);
            lablesChannel.push(param.name);
        });
        this.area.forEach((param: any) => {
            valuesArea.push(param.id);
            lablesArea.push(param.name);
        });
        this.talkYn.forEach((param: any) => {
            valuesTalkYn.push(param.id);
            lablesTalkYn.push(param.name);
        });
        this.promotion.forEach((param: any) => {
            valuesPromotion.push(param.id);
            lablesPromotion.push(param.name);
        });
        this.yn.forEach((param: any) => {
            valuesYn.push(param.id);
            lablesYn.push(param.name);
        });


        const columnLayout = [
            'businessNumber',
            'userId',
            'addDate',
            'businessName',
            'representName',
            {
                name: 'x',
                direction: 'horizontal',
                items: [
                    'payGrade',
                    'yearUser'
                ],
                header: {
                    text: '??????',
                }
            },
            'subscriptionFeeYn',
            // 'freeDate',
            'payDate',
            'payAmt',
            'midGrade',
            'channel',
            'commissionWindow',
            'commissionRate',
            'commissionAmt',
            'promotion',
            'promotionAmt',
            'area',
            'address',
            'phoneNumber',
            'talkYn',
            'email',
            'visitCnt',
            'surveyResponses',
            'userCnt',
            'employeesCnt',
            'scale',
            'currentUse',
            'remark',
        ];

        //????????? ??????
        this.userColumns = [
            {
                name: 'businessNumber', fieldName: 'businessNumber', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '???????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'userId', fieldName: 'userId', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????? ID', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'businessName', fieldName: 'businessName', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '????????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'representName', fieldName: 'representName', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'payGrade', fieldName: 'payGrade', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????? ??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesPayGrade,
                labels: lablesPayGrade,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.payGrade)
            },
            {
                name: 'yearUser', fieldName: 'yearUser', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '???/???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                },
                values: valuesYearUser,
                labels: lablesYearUser,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.yearUser)
            },
            {
                name: 'subscriptionFeeYn', fieldName: 'subscriptionFeeYn', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '?????????(????????????)', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                },
                values: valuesYn,
                labels: lablesYn,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.yn)
            },
            // {
            //     name: 'freeDate', fieldName: 'freeDate', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '???????????????(??????)', styleName: 'center-cell-text blue-font-color'}, renderer: {
            //         showTooltip: true
            //     }
            //     , datetimeFormat: 'yyyy-MM-dd'
            //     , mask: {editMask: '9999-99-99', includeFormat: false, allowEmpty: true}
            //     , editor: {
            //         type: 'date',
            //         datetimeFormat: 'yyyy-MM-dd',
            //         textReadOnly: true,
            //     }
            // },
            {
                name: 'payDate', fieldName: 'payDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
                , datetimeFormat: 'yyyy-MM-dd'
                , mask: {editMask: '9999-99-99', includeFormat: false, allowEmpty: true}
                , editor: {
                    type: 'date',
                    datetimeFormat: 'yyyy-MM-dd',
                    textReadOnly: true,
                }
            },
            {
                name: 'payAmt', fieldName: 'payAmt', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????(??????)', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'addDate', fieldName: 'addDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '?????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'midGrade', fieldName: 'midGrade', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'channel', fieldName: 'channel', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                },
                values: valuesChannel,
                labels: lablesChannel,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.channel)
            },
            {
                name: 'commissionWindow', fieldName: 'commissionWindow', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????? ??????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'commissionRate', fieldName: 'commissionRate', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '????????? ???(%)', styleName: 'center-cell-text blue-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'commissionAmt', fieldName: 'commissionAmt', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '????????? ?????????', styleName: 'center-cell-text'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'promotion', fieldName: 'promotion', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                },
                values: valuesPromotion,
                labels: lablesPromotion,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.promotion)
            },
            {
                name: 'promotionAmt', fieldName: 'promotionAmt', type: 'data', width: '120', styleName: 'right-cell-text'
                , header: {text: '????????????(??????)', styleName: 'center-cell-text blue-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'area', fieldName: 'area', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                },
                values: valuesArea,
                labels: lablesArea,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.area)
            },
            {
                name: 'address', fieldName: 'address', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'phoneNumber', fieldName: 'phoneNumber', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '?????????(C.p)', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'talkYn', fieldName: 'talkYn', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '????????? ????????????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                },
                values: valuesTalkYn,
                labels: lablesTalkYn,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.talkYn)
            },
            {
                name: 'email', fieldName: 'email', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: 'E-mail', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'visitCnt', fieldName: 'visitCnt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '????????????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'surveyResponses', fieldName: 'surveyResponses', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '??????????????????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'userCnt', fieldName: 'userCnt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '?????? ???', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'employeesCnt', fieldName: 'employeesCnt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '?????? ???', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'scale', fieldName: 'scale', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '??????(?????? or ??????)', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'currentUse', fieldName: 'currentUse', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '?????? IT ??????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'remark', fieldName: 'remark', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '??????', styleName: 'center-cell-text blue-font-color'}, renderer: {
                    showTooltip: true
                }
            },
        ];

        //????????? Provider
        this.userDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        //????????? ??????
        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        //????????? ??????
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.userDataProvider,
            'user',
            this.userColumns,
            this.userFields,
            gridListOption,
            columnLayout);

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

        // ??? edit control
        this.gridList.setCellStyleCallback((grid, dataCell) => {

            //?????????
            if (
                dataCell.dataColumn.fieldName === 'subscriptionFeeYn' ||
                // dataCell.dataColumn.fieldName === 'freeDate' ||
                dataCell.dataColumn.fieldName === 'payDate' ||
                dataCell.dataColumn.fieldName === 'commissionWindow' ||
                dataCell.dataColumn.fieldName === 'commissionRate' ||
                dataCell.dataColumn.fieldName === 'promotionAmt' ||
                dataCell.dataColumn.fieldName === 'channel' ||
                dataCell.dataColumn.fieldName === 'area' ||
                dataCell.dataColumn.fieldName === 'talkYn' ||
                dataCell.dataColumn.fieldName === 'visitCnt' ||
                dataCell.dataColumn.fieldName === 'surveyResponses' ||
                dataCell.dataColumn.fieldName === 'promotion' ||
                dataCell.dataColumn.fieldName === 'employeesCnt' ||
                dataCell.dataColumn.fieldName === 'scale' ||
                dataCell.dataColumn.fieldName === 'currentUse' ||
                dataCell.dataColumn.fieldName === 'remark') {
                return {editable: true};
            } else {
                return {editable: false};
            }
        });
        //??????
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                if(this._realGridsService.gfn_GridDataCnt(this.gridList, this.userDataProvider)) {
                    this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userDataProvider, true);
                    const rtn = this._userService.getUser(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                    this.selectCallBack(rtn);
                }
            }
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        //????????? ??????
        this._paginator._intl.itemsPerPageLabel = '';

        //this.selectUser();
        this._changeDetectorRef.markForCheck();
    }

    selectUser(): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userDataProvider, true);
        const rtn = this._userService.getUser(0, 100, 'addDate', 'desc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    //?????????
    pageEvent($event: PageEvent): void {
        this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userDataProvider, true);
        const rtn = this._userService.getUser(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            ex.user.forEach((data) => {
                if(data.phoneNumber === '0'){
                    data.phoneNumber = '';
                }else if(data.phoneNumber === ''){
                    data.phoneNumber = '';
                }else{
                    data.phoneNumber = '0' + data.phoneNumber;
                }
            });

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.userDataProvider, ex.user);
            this._userService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((userPagenation: UserPagenation) => {
                    // Update the pagination
                    this.pagenation = userPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.user.length < 1) {
                this._functionService.cfn_alert('????????? ????????? ????????????.');
            }
            this._realGridsService.gfn_GridLoadingBar(this.gridList, this.userDataProvider, false);
        });
    }

    //?????? ????????????
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, 'SaaS ????????? ??????');
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectUser();
        }
    }

    userInfoBreak() {
        let rows = this._realGridsService.gfn_GetCheckRows(this.gridList, this.userDataProvider);

        let check = false;
        if (rows.length === 0) {
            this._functionService.cfn_alert('????????? ?????? ???????????? ????????????.');
            check = true;
        }

        if (check) {
            return;
        }
        if (!this.isMobile) {
            const d = this._matDialog.open(UserBreakComponent, {
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true,
                data: {select: rows}
            });

            d.afterClosed().subscribe(() => {
                this.selectUser();
            });
        } else {
            const d = this._matDialog.open(UserBreakComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true,
                data: {select: rows}
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                this.selectUser();
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    userInfoSave() {
        let rows = this._realGridsService.gfn_GetEditRows(this.gridList, this.userDataProvider);
        let check = false;
        if (rows.length === 0) {
            this._functionService.cfn_alert('????????? ?????? ???????????? ????????????.');
            check = true;
        }
        if (check) {
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
                    this._userService.saveUserInfo(rows)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((user: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(user);
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
            this.selectUser();
        } else {
            this._functionService.cfn_alert(param.msg);
            this.selectUser();
        }
    }
}
