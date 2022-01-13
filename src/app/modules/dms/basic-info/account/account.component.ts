import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {AccountService} from '../account/account.service';
import {merge, Observable, Subject} from 'rxjs';
import {AccountData, AccountPagenation} from '../account/account.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {DeviceDetectorService} from 'ngx-device-detector';
import {MatDialog} from '@angular/material/dialog';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {CommonUdiComponent} from '../../../../../@teamplat/components/common-udi';
import {NewAccountComponent} from '../account/new-account/new-account.component';
import {Router} from '@angular/router';
import {DetailAccountComponent} from '../account/detail-account/detail-account.component';

@Component({
    selector: 'dms-app-account',
    templateUrl: 'account.component.html',
    styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    accounts$: Observable<AccountData[]>;
    pagenation: AccountPagenation | null = null;
    isMobile: boolean = false;
    isLoading: boolean = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    searchForm: FormGroup;
    orderBy: any = 'asc';
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 코드'
        },
        {
            id: '101',
            name: '거래처 명'
        }
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gridList: RealGrid.GridView;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    accountDataProvider: RealGrid.LocalDataProvider;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    accountColumns: Columns[];
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/member-ordering
    accountFields: DataFieldObject[] = [
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'accountType', dataType: ValueType.TEXT},
        {fieldName: 'descr', dataType: ValueType.TEXT},
        {fieldName: 'businessCondition', dataType: ValueType.TEXT},
        {fieldName: 'address', dataType: ValueType.TEXT},
        {fieldName: 'addressDetail', dataType: ValueType.TEXT},
        {fieldName: 'representName', dataType: ValueType.TEXT},
        {fieldName: 'businessCategory', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessName', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessNumber', dataType: ValueType.TEXT},
        {fieldName: 'phoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'fax', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
    ];

    constructor(private _realGridsService: FuseRealGridService,
                private _formBuilder: FormBuilder,
                private _codeStore: CodeStore,
                private _router: Router,
                private _matDialog: MatDialog,
                public _matDialogPopup: MatDialog,
                private _utilService: FuseUtilsService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _functionService: FunctionService,
                private _deviceService: DeviceDetectorService,
                private _accountService: AccountService,
                private readonly breakpointObserver: BreakpointObserver)
    {
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            descr: [''],
            account: [''],
            businessCondition: [''],
            businessCategory: ['']
        });

        //그리드 컬럼
        this.accountColumns = [
            {
                name: 'account', fieldName: 'account', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래처 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'descr', fieldName: 'descr', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래처 명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'businessCondition',
                fieldName: 'businessCondition'
                ,
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '업태', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'address',
                fieldName: 'address',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text',
                header: {text: '주소', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'addressDetail',
                fieldName: 'addressDetail',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '상세주소', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'representName',
                fieldName: 'representName',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '대표자명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'businessCategory',
                fieldName: 'businessCategory',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '종목', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'custBusinessName',
                fieldName: 'custBusinessName',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text'
                ,
                header: {text: '사업자명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            // eslint-disable-next-line max-len
            {
                name: 'custBusinessNumber',
                fieldName: 'custBusinessNumber',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '사업자번호', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'phoneNumber',
                fieldName: 'phoneNumber',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '전화번호', styleName: 'center-cell-text'},
                placeHolder: '',
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'fax',
                fieldName: 'fax',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '팩스', styleName: 'center-cell-text'},
                placeHolder: '',
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'email',
                fieldName: 'email',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '이메일', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
        ];

        //그리드 Provider
        this.accountDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        this.accountDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.accountDataProvider,
            'account',
            this.accountColumns,
            this.accountFields,
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
        });

        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.gridList.onCellClicked = (grid, clickData) => {
            if (clickData.cellType === 'header') {
                const rtn = this._accountService.getAccount(this.pagenation.page, this.pagenation.size, clickData.column, this.orderBy, this.searchForm.getRawValue());
                this.selectCallBack(rtn);
            }
            ;
            if (this.orderBy === 'asc') {
                this.orderBy = 'desc';
            } else {
                this.orderBy = 'asc';
            }
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if (clickData.cellType !== 'header') {
                if (clickData.cellType !== 'head') {

                    if (!this.isMobile) {
                        const d = this._matDialog.open(DetailAccountComponent, {
                            autoFocus: false,
                            disableClose: true,
                            data: {
                                selectedAccount: grid.getValues(clickData.dataRow)
                            },
                        });
                        d.afterClosed().subscribe(() => {
                            this.selectAccount();
                        });

                    } else {
                        const d = this._matDialog.open(DetailAccountComponent, {
                            data: {
                                selectedAccount: grid.getValues(clickData.dataRow)
                            },
                            autoFocus: false,
                            width: 'calc(100% - 50px)',
                            maxWidth: '100vw',
                            maxHeight: '80vh',
                            disableClose: true
                        });
                        const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                            if (size.matches) {
                                d.updateSize('calc(100vw - 10px)', '');
                            } else {
                                // d.updateSize('calc(100% - 50px)', '');
                            }
                        });
                        d.afterClosed().subscribe(() => {
                            smallDialogSubscription.unsubscribe();
                        });
                    }
                }
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this.setGridData();

        // Get the pagenation
        this._accountService.pagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagenation: AccountPagenation) => {
                // Update the pagination
                this.pagenation = pagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngAfterViewInit(): void {
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellButtonClicked = (grid, index, column) => {
            alert(index.itemIndex + column.fieldName + '셀버튼 클릭');
        };
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._accountService.getAccount(this._paginator.pageIndex, this._paginator.pageSize, 'account', 'asc', this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.accountDataProvider);
    }

    selectAccount(): void {
        const rtn = this._accountService.getAccount(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    //페이징
    pageEvent($event: PageEvent): void {
        const rtn = this._accountService.getAccount(this._paginator.pageIndex, this._paginator.pageSize, 'addDate', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    //엑셀 다운로드
    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '거래처 목록');
    }

    createAccount(): void {
        if (!this.isMobile) {
            this._matDialog.open(NewAccountComponent, {
                autoFocus: false,
                disableClose: true,
                data: {
                    note: {}
                },
            });
        } else {
            const d = this._matDialog.open(NewAccountComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                } else {
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.selectHeader();
        }
    }

    selectHeader(): void {
        const rtn = this._accountService.getAccount(0, 40, 'addDate', 'desc', this.searchForm.getRawValue());
        //this.setGridData();
        this.selectCallBack(rtn);
    }

    setGridData(): void {

        this._accountService.accounts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((accounts: any) => {
                if (accounts != null) {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.accountDataProvider, accounts);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    createUdiAccount(): void {
        if (!this.isMobile) {
            const popupUdi = this._matDialogPopup.open(CommonUdiComponent, {
                data: {
                    headerText: '거래처 조회',
                    url: 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                    searchList: ['companyName', 'taxNo', 'cobFlagCode'],
                    code: 'UDI_BCNC',
                    tail: false,
                    mediroUrl: 'bcnc/company-info',
                    tailKey: '',
                    merge: true,
                    mergeData: 'account'
                },
                autoFocus: false,
                maxHeight: '80vh',
                disableClose: true
            });

            popupUdi.afterClosed().subscribe((result) => {
                this.selectAccount();
            });
        } else {
            const d = this._matDialog.open(CommonUdiComponent, {
                data: {
                    headerText: '거래처 조회',
                    url: 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                    searchList: ['companyName', 'taxNo', 'cobFlagCode'],
                    code: 'UDI_BCNC',
                    tail: false,
                    mediroUrl: 'bcnc/company-info',
                    tailKey: '',
                    merge: true,
                    mergeData: 'account'
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe((result) => {
                smallDialogSubscription.unsubscribe();
                this.selectAccount();
            });
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            ex.account.forEach((data) => {
               if(data.phoneNumber === 0){
                   data.phoneNumber = '';
               }else{
                   data.phoneNumber = '0' + data.phoneNumber;
               }
               if(data.fax === 0){
                   data.fax = '';
               }else{
                   data.fax = '0' + data.fax;
               }
            });

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.accountDataProvider, ex.account);
            this._accountService.pagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((accountPagenation: AccountPagenation) => {
                    // Update the pagination
                    this.pagenation = accountPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.account.length < 1) {
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    phoneFomatter(num,type?): string{

        let formatNum = '';
        if(num.length === 11){
            if(type===0){
                formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3');
            }else{
                formatNum = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
            }
        }else if(num.length===8){
            formatNum = num.replace(/(\d{4})(\d{4})/, '$1-$2');
        }else{
            if(num.indexOf('02') === 0){
                if(type === 0){
                    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-****-$3');
                }else{
                    formatNum = num.replace(/(\d{2})(\d{4})(\d{4})/, '$1-$2-$3');
                }
            }else{
                if(type === 0){
                    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-***-$3');
                }else{
                    formatNum = num.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                }
            }
        }
        return formatNum;
    }
}
