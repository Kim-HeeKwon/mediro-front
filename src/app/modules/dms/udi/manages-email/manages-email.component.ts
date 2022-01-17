import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {ManagesEmailService} from './manages-email.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ManagesEmail, ManagesEmailPagenation} from './manages-email.types';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {merge, Observable, Subject} from 'rxjs';
import {FunctionService} from '../../../../../@teamplat/services/function';
import {ManagesReportComponent} from '../manages/manages-report/manages-report.component';
import {MatDialog} from '@angular/material/dialog';
import {TeamPlatConfirmationService} from '../../../../../@teamplat/services/confirmation';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {ManagesDetailComponent} from '../manages/manages-detail/manages-detail.component';

@Component({
    selector: 'dms-manages-email',
    templateUrl: './manages-email.component.html',
    styleUrls: ['./manages-email.component.scss']
})
export class ManagesEmailComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    isLoading: boolean = false;
    isMobile: boolean = false;
    searchForm: FormGroup;
    managesEmailColumns: Columns[];
    year: CommonCode[] = null;
    month: CommonCode[] = null;
    suplyTypeCode: CommonCode[] = null;
    suplyFlagCode: CommonCode[] = null;
    managesEmail$: Observable<ManagesEmail[]>;
    managesEmailPagenation: ManagesEmailPagenation = {
        length: 0,
        size: 0,
        page: 0,
        lastPage: 0,
        startIndex: 0,
        endIndex: 0
    };
    orderBy: any = 'desc';
    @ViewChild(MatPaginator, {static: true}) _paginator: MatPaginator;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    managesEmailDataProvider: RealGrid.LocalDataProvider;
    managesEmailFields: DataFieldObject[] = [
        {fieldName: 'no', dataType: ValueType.TEXT},
        {fieldName: 'mId', dataType: ValueType.TEXT},
        {fieldName: 'suplyContStdmt', dataType: ValueType.TEXT},
        {fieldName: 'suplyFlagCode', dataType: ValueType.TEXT},
        {fieldName: 'suplyTypeCode', dataType: ValueType.TEXT},
        {fieldName: 'suplyContSeq', dataType: ValueType.TEXT},
        {fieldName: 'meddevItemSeq', dataType: ValueType.TEXT},
        {fieldName: 'stdCode', dataType: ValueType.TEXT},
        {fieldName: 'lotNo', dataType: ValueType.TEXT},
        {fieldName: 'manufYm', dataType: ValueType.TEXT},
        {fieldName: 'useTmlmt', dataType: ValueType.TEXT},
        {fieldName: 'bcncCode', dataType: ValueType.TEXT},
        {fieldName: 'bcncEntpName', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgEntpName', dataType: ValueType.TEXT},
        {fieldName: 'suplyDate', dataType: ValueType.TEXT},
        {fieldName: 'suplyQty', dataType: ValueType.NUMBER},
        {fieldName: 'suplyUntpc', dataType: ValueType.NUMBER},
        {fieldName: 'suplyAmt', dataType: ValueType.NUMBER},
        {fieldName: 'udiDiCode', dataType: ValueType.TEXT},
        {fieldName: 'udiPiCode', dataType: ValueType.TEXT},
        {fieldName: 'entpName', dataType: ValueType.TEXT},
        {fieldName: 'itemName', dataType: ValueType.TEXT},
        {fieldName: 'meaClassNo', dataType: ValueType.TEXT},
        {fieldName: 'permitNo', dataType: ValueType.TEXT},
        {fieldName: 'typeName', dataType: ValueType.TEXT},
        {fieldName: 'itemSeq', dataType: ValueType.TEXT},
        {fieldName: 'remark', dataType: ValueType.TEXT},
        {fieldName: 'bcncCobTypeName', dataType: ValueType.TEXT},
        {fieldName: 'bcncEntpAddr', dataType: ValueType.TEXT},
        {fieldName: 'bcncHptlCode', dataType: ValueType.TEXT},
        {fieldName: 'bcncTaxNo', dataType: ValueType.TEXT},
        {fieldName: 'cobTypeName', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgCobTypeName', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgEntpAddr', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgHptlCode', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgPlaceBcncCode', dataType: ValueType.TEXT},
        {fieldName: 'dvyfgTaxNo', dataType: ValueType.TEXT},
        {fieldName: 'isDiffDvyfg', dataType: ValueType.TEXT},
        {fieldName: 'packQuantity', dataType: ValueType.TEXT},
        {fieldName: 'rtngudFlagCode', dataType: ValueType.TEXT},
        {fieldName: 'seq', dataType: ValueType.TEXT},
        {fieldName: 'totalCnt', dataType: ValueType.TEXT},
        {fieldName: 'udiDiSeq', dataType: ValueType.TEXT},
        {fieldName: 'grade', dataType: ValueType.TEXT},
    ];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _managesEmailService: ManagesEmailService,
        private _realGridsService: FuseRealGridService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _functionService: FunctionService,
        private _matDialog: MatDialog,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private readonly breakpointObserver: BreakpointObserver,
        private _deviceService: DeviceDetectorService,)
    {
        this.isMobile = this._deviceService.isMobile();
        this.month = _utilService.commonValue(_codeStore.getValue().data, 'MONTH');
        this.year = _utilService.commonValue(_codeStore.getValue().data, 'YEAR');
        this.suplyTypeCode = _utilService.commonValue(_codeStore.getValue().data, 'SUPLYTYPECODE');
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data, 'SUPLYFLAGCODE');
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
        this.searchForm = this._formBuilder.group({
            year: [YYYY + ''],
            month: [MM + ''],
            searchText: [''],
            suplyContStdmt: [''],
            bcncName: [''],
            offset: [1],
            limit: [100],
        });

        const valuesSuplyFlagCode = [];
        const lablesSuplyFlagCode = [];
        const valuesSuplyTypeCode = [];
        const lablesSuplyTypeCode = [];


        this.suplyFlagCode.forEach((param: any) => {
            valuesSuplyFlagCode.push(param.id);
            lablesSuplyFlagCode.push(param.name);
        });

        this.suplyTypeCode.forEach((param: any) => {
            valuesSuplyTypeCode.push(param.id);
            lablesSuplyTypeCode.push(param.name);
        });

        //그리드 컬럼
        this.managesEmailColumns = [
            {
                name: 'suplyFlagCode',
                fieldName: 'suplyFlagCode',
                type: 'data',
                width: '100',
                styleName: 'left-cell-text',
                header: {text: '공급구분', styleName: 'center-cell-text'},
                values: valuesSuplyFlagCode,
                labels: lablesSuplyFlagCode,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.suplyFlagCode),
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyTypeCode',
                fieldName: 'suplyTypeCode',
                type: 'data',
                width: '200',
                styleName: 'left-cell-text',
                header: {text: '공급형태', styleName: 'center-cell-text'},
                values: valuesSuplyTypeCode,
                labels: lablesSuplyTypeCode,
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.suplyTypeCode),
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'meddevItemSeq',
                fieldName: 'meddevItemSeq',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '품목일련번호', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'stdCode', fieldName: 'stdCode', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '표준코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'lotNo', fieldName: 'lotNo', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '로트번호', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'manufYm', fieldName: 'manufYm', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '제조연월', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'useTmlmt', fieldName: 'useTmlmt', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '사용기한', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncCode', fieldName: 'bcncCode', type: 'data', width: '200', styleName: 'left-cell-text'
                , header: {text: '공급받은자 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'bcncEntpName', fieldName: 'bcncEntpName', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '공급받은 자(반품한 자)', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'dvyfgEntpName',
                fieldName: 'dvyfgEntpName',
                type: 'data',
                width: '150',
                styleName: 'left-cell-text'
                ,
                header: {text: '납품장소 업체', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyDate', fieldName: 'suplyDate', type: 'data', width: '100', styleName: 'left-cell-text'
                , header: {text: '공급일자', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'suplyQty', fieldName: 'suplyQty', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '공급수량', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'suplyUntpc', fieldName: 'suplyUntpc', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '공급단가', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
            {
                name: 'suplyAmt', fieldName: 'suplyAmt', type: 'number', width: '100', styleName: 'right-cell-text'
                , header: {text: '공급금액', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
                , numberFormat: '#,##0'
            },
        ];

        //그리드 Provider
        this.managesEmailDataProvider = this._realGridsService.gfn_CreateDataProvider();

        //그리드 옵션
        const gridListOption = {
            stateBar: false,
            checkBar: true,
            footers: false,
        };

        //그리드 생성
        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.managesEmailDataProvider,
            'managesEmailGrid',
            this.managesEmailColumns,
            this.managesEmailFields,
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
        this.gridList.setCopyOptions({
            enabled: true,
            singleMode: false
        });

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellDblClicked = (grid, clickData) => {
            if (clickData.cellType !== 'header') {
                if (clickData.cellType !== 'head') {
                    this.selectDoubleClickRow(grid.getValues(clickData.dataRow));
                }
            }
        };

        //페이지 라벨
        this._paginator._intl.itemsPerPageLabel = '';
        this.setGridData();

        this._managesEmailService.managesPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((managesEmailPagenation: ManagesEmailPagenation) => {
                if (managesEmailPagenation !== null) {
                    this.managesEmailPagenation = managesEmailPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

    }

    ngAfterViewInit(): void {
        merge(this._paginator.page).pipe(
            switchMap(() => {
                this.isLoading = true;
                // eslint-disable-next-line max-len
                return this._managesEmailService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.searchForm.getRawValue());
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
        this._realGridsService.gfn_Destory(this.gridList, this.managesEmailDataProvider);
    }

    setGridData(): void {
        this.managesEmail$ = this._managesEmailService.manages$;
        this._managesEmailService.manages$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((managesEmail: any) => {
                if (managesEmail !== null || managesEmail === 'null') {
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.managesEmailDataProvider, managesEmail);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    excelExport(): void {
        this._realGridsService.gfn_ExcelExportGrid(this.gridList, '보고자료 목록');
    }

    //페이징
    pageEvent($event: PageEvent): void {
        this.searchSetValue();
        const rtn = this._managesEmailService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, '', this.orderBy, this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    enter(event): void {
        if (event.keyCode === 13) {
            this.select();
        }
    }

    selectCallBack(rtn: any): void {
        rtn.then((ex) => {

            this._realGridsService.gfn_DataSetGrid(this.gridList, this.managesEmailDataProvider, ex.managesEmail);
            this._managesEmailService.managesPagenation$
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((managesEmailPagenation: ManagesEmailPagenation) => {
                    // Update the pagination
                    this.managesEmailPagenation = managesEmailPagenation;
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
            if (ex.manages.length < 1) {
                this._functionService.cfn_alert('검색된 정보가 없습니다.');
            }
        });
    }

    searchSetValue(): void {

        const day = this.searchForm.getRawValue().year + this.searchForm.getRawValue().month;
        this.searchForm.patchValue({'suplyContStdmt': day});
    }

    select(): void {
        this.searchSetValue();
        const rtn = this._managesEmailService.getHeader(0, 100, '', 'asc', this.searchForm.getRawValue());
        this.selectCallBack(rtn);
    }

    selectDoubleClickRow(row: any): void {
        if (!this.isMobile) {
            this._matDialog.open(ManagesDetailComponent, {
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true,
                data: row,
            });
        } else {
            const d = this._matDialog.open(ManagesDetailComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true,
                data: row
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyReport() {
        const d = this._matDialog.open(ManagesReportComponent, {
            data: {
                headerText: '',
                url: 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                searchList: ['companyName', 'taxNo', 'cobFlagCode'],
                code: 'UDI_BCNC',
                tail: false,
                mediroUrl: 'bcnc/company-info',
                tailKey: '',
            },
            autoFocus: false,
            maxHeight: '80vh',
            disableClose: true
        });

    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    suplyDelete() {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.managesEmailDataProvider);
        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        } else {
            const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
                title: '',
                message: '삭제하시겠습니까?',
                icon: this._formBuilder.group({
                    show: true,
                    name: 'heroicons_outline:exclamation',
                    color: 'warn'
                }),
                actions: this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show: true,
                        label: '삭제',
                        color: 'warn'
                    }),
                    cancel: this._formBuilder.group({
                        show: true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            }).value);

            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this._managesEmailService.deleteSupplyInfo(checkValues)
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((manageEmail: any) => {
                                this._functionService.cfn_loadingBarClear();
                                this._functionService.cfn_alertCheckMessage(manageEmail);
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                                this.select();
                            });
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }


}
