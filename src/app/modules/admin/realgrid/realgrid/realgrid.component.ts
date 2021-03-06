import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import RealGrid, {DataFieldObject, FormView, GridView, HandleVisibility, LocalDataProvider, ValueType} from 'realgrid';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {AccountService} from '../../basic-info/account/account.service';
import {merge, Observable, Subject} from 'rxjs';
import {AccountData, AccountPagenation} from '../../basic-info/account/account.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {DeviceDetectorService} from "ngx-device-detector";
import {NewAccountComponent} from "../../basic-info/account/new-account/new-account.component";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {CommonUdiComponent} from "../../../../../@teamplat/components/common-udi";
import {RealgridNewComponent} from "./realgrid-new/realgrid-new.component";
import {Router} from "@angular/router";
import {RealgridDetailComponent} from "./realgrid-detail/realgrid-detail.component";

@Component({
    selector: 'app-realgrid',
    templateUrl: './realgrid.component.html',
    styleUrls: ['./realgrid.component.scss']
})

export class RealgridComponent implements OnInit, OnDestroy, AfterViewInit{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild(MatPaginator, { static: true }) _paginator: MatPaginator;
    accounts$: Observable<AccountData[]>;
    pagenation: AccountPagenation | null = null;
    isLoading: boolean = false;
    isMobile: boolean = false;
    // @ts-ignore
    realgridColumns: Columns[];
    //isMobile = false;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    orderBy: any = 'asc';
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 코드'
        },
        {
            id: '101',
            name: '거래처 명'
        }];


    // @ts-ignore
    grid: RealGrid.GridView;
    // @ts-ignore
    realgridDataProvider: RealGrid.LocalDataProvider;
    realgridFields: DataFieldObject[] = [
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'descr', dataType: ValueType.TEXT},
        {fieldName: 'accountType', dataType: ValueType.TEXT},
        {fieldName: 'address', dataType: ValueType.TEXT},
        {fieldName: 'addressDetail', dataType: ValueType.TEXT},
        {fieldName: 'representName', dataType: ValueType.TEXT},
        {fieldName: 'businessCategory', dataType: ValueType.TEXT},
        {fieldName: 'businessCondition', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessName', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessNumber', dataType: ValueType.TEXT},
        {fieldName: 'phoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'fax', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
    ];
    accountType: CommonCode[] = null;
    searchForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

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
        this.accountType = _utilService.commonValue(_codeStore.getValue().data,'ACCOUNT_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            accountType: ['ALL'],
            descr: [''],
            account: [''],
            searchCondition: ['101'],
            searchText: [''],
        });

        const values = [];
        const lables = [];
        this.accountType.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });

        //그리드 컬럼
        this.realgridColumns = [
            {name: 'account', fieldName: 'account', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '거래처 코드', styleName: 'left-cell-text'}},
            {name: 'descr', fieldName: 'descr', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '거래처 명' , styleName: 'left-cell-text'},},
            {name: 'accountType', fieldName: 'accountType', type: 'data', width: '100', styleName: 'center-cell-text',
                header: {text: '유형'},
                values: values,
                labels: lables,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.accountType),
            },
            {name: 'address', fieldName: 'address', type: 'data', width: '200', styleName: 'left-cell-text', header: {text: '주소' , styleName: 'left-cell-text'},},
            {name: 'addressDetail', fieldName: 'addressDetail', type: 'data', width: '200', styleName: 'left-cell-text', header: {text: '상세주소' , styleName: 'left-cell-text'}},
            {name: 'representName', fieldName: 'representName', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '대표자명' , styleName: 'left-cell-text'}},
            {name: 'businessCategory', fieldName: 'businessCategory', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '종목' , styleName: 'left-cell-text'}},
            {name: 'businessCondition', fieldName: 'businessCondition'
                , type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '업태' , styleName: 'left-cell-text'}},
            {name: 'custBusinessName', fieldName: 'custBusinessName', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '사업자명' , styleName: 'left-cell-text'}},
            // eslint-disable-next-line max-len
            {name: 'custBusinessNumber', fieldName: 'custBusinessNumber', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '사업자번호' , styleName: 'left-cell-text'}},
            {name: 'phoneNumber', fieldName: 'phoneNumber', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '전화번호' , styleName: 'left-cell-text'},
                placeHolder: ''},
            {name: 'fax', fieldName: 'fax', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '팩스' , styleName: 'left-cell-text'},
                placeHolder: ''},
            {name: 'email', fieldName: 'email', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '이메일' , styleName: 'left-cell-text'}},
        ];

        //그리드 Provider
        this.realgridDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };

        this.realgridDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        //그리드 생성
        this.grid = this._realGridsService.gfn_CreateGrid(
            this.realgridDataProvider,
            'realgrid',
            this.realgridColumns,
            this.realgridFields,
            gridListOption);

        //그리드 옵션
        this.grid.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            deletable: false,
            checkable: true,
            softDeleting: false,
            //hideDeletedRows: false,
        });

        this.grid.deleteSelection(true);
        this.grid.setDisplayOptions({liveScroll: false,});
        this.grid.setPasteOptions({enabled: false,});

        //정렬
        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,prefer-arrow/prefer-arrow-functions
        this.grid.onCellClicked = (grid, clickData) => {
            if(clickData.cellType === 'header'){
                this._accountService.getAccount(this.pagenation.page,this.pagenation.size,clickData.column,this.orderBy,this.searchForm.getRawValue());
            };
            // this.grid.columnByName(clickData.column).header.styleName = 'blue-column';
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.grid.onCellDblClicked = (grid, clickData) => {
            if(clickData.cellType !== 'header'){
                if(clickData.cellType !== 'head'){

                    if(!this.isMobile){
                        const d = this._matDialog.open(RealgridDetailComponent, {
                            autoFocus: false,
                            disableClose: true,
                            data     : {
                                selectedAccount : grid.getValues(clickData.dataRow)
                            },
                        });
                        d.afterClosed().subscribe(() => {
                            this.selectAccount();
                        });

                    }else{
                        const d = this._matDialog.open(RealgridDetailComponent, {
                            data     : {
                                selectedAccount : grid.getValues(clickData.dataRow)
                            },
                            autoFocus: false,
                            width: 'calc(100% - 50px)',
                            maxWidth: '100vw',
                            maxHeight: '80vh',
                            disableClose: true
                        });
                        const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                            if (size.matches) {
                                d.updateSize('calc(100vw - 10px)','');
                            } else {
                                // d.updateSize('calc(100% - 50px)', '');
                            }
                        });
                        d.afterClosed().subscribe(() => {
                            smallDialogSubscription.unsubscribe();
                        });
                    }
                    //this._router.navigate(['realgrid/realgrid/realgrid-detail', grid.getValues(clickData.dataRow)]);
                }
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';

        this._accountService.accounts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((accounts: any) => {
                if(accounts != null){
                    this._realGridsService.gfn_DataSetGrid(this.grid, this.realgridDataProvider, accounts);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

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
        this.grid.onCellButtonClicked = (grid, index, column) => {
            alert(index.itemIndex + column.fieldName + '셀버튼 클릭');
        };
        merge(this._paginator.page).pipe(
            switchMap(() => {
                // console.log('change paginator!!');
                // console.log(this._paginator.pageIndex);
                // console.log(this._paginator.pageSize);
                // console.log(this._sort.active);
                // console.log(this._sort);
                // this.closeDetails();
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._accountService.getAccount(this._paginator.pageIndex, this._paginator.pageSize, 'account', 'asc', this.searchForm.getRawValue());
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.grid, this.realgridDataProvider);
    }

    selectAccount(): void{
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': this.searchForm.getRawValue().searchText});
            this.searchForm.patchValue({'descr': ''});
        }else if(this.searchForm.getRawValue().searchCondition === '101'){
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'descr': this.searchForm.getRawValue().searchText});
        }
        this._accountService.getAccount(0,20,'account','asc', this.searchForm.getRawValue());

        this._accountService.accounts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((accounts: any) => {
                if(accounts != null){
                    this._realGridsService.gfn_DataSetGrid(this.grid, this.realgridDataProvider, accounts);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    //페이징
    pageEvent($event: PageEvent): void {
        this._accountService.getAccount(this._paginator.pageIndex, this._paginator.pageSize, 'account', this.orderBy, this.searchForm.getRawValue());
    }

    //엑셀 다운로드
    excelExport(): void{
        this._realGridsService.gfn_ExcelExportGrid(this.grid, '거래처 목록');
    }

    createAccount(): void {
        if(!this.isMobile){
            this._matDialog.open(RealgridNewComponent, {
                autoFocus: false,
                disableClose: true,
                data     : {
                    note: {}
                },
            });
        }else{
            const d = this._matDialog.open(RealgridNewComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    enter(event): void {
        if(event.keyCode===13){
            this.selectAccount();
        }
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
}



