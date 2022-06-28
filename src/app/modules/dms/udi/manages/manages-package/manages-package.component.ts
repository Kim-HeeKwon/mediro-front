import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../../../../../@teamplat/animations";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {Observable, Subject} from "rxjs";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {takeUntil} from "rxjs/operators";
import RealGrid, {DataFieldObject, ValueType} from "realgrid";
import {Columns} from "../../../../../../@teamplat/services/realgrid/realgrid.types";
import {FuseRealGridService} from "../../../../../../@teamplat/services/realgrid";
import {formatDate} from "@angular/common";
import {ManagesPackageService} from "./manages-package.service";

@Component({
    selector       : 'dms-manages-package',
    templateUrl    : './manages-package.component.html',
    styleUrls: ['./manages-package.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class ManagesPackageComponent implements OnInit, OnDestroy {
    @ViewChild('udiCode') refUdiCode: ElementRef;
    @ViewChild('udiDiCode') refUdiDiCode: ElementRef;
    @ViewChild('udiPiCode') refUdiPiCode: ElementRef;
    @ViewChild('udiDirectCodes') refUdiDirectCode: ElementRef;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    selectedForm: FormGroup;
    searchForm: FormGroup;
    showAlert: boolean = false;
    isMobile: boolean = false;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    is_edit: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    month: CommonCode[] = null;
    year: CommonCode[] = null;
    suplyTypeCode: CommonCode[] = null;
    suplyFlagCode: CommonCode[] = null;
    minDate: string;
    maxDate: string;

    changeText: string = '';
    changeAccountText: string = '거래처';
    udiScan: CommonCode[] = [
        {id: 'ALL', name: '표준코드(UDI)'},
        {id: '0', name: '고유식별자(UDI-DI) + 생산식별자(UDI-PI)'},
        {id: '1', name: '직접 입력'},
    ];
    changeAccountHidden: boolean = false;
    changeIsDiffDvyfgHidden: boolean = false;
    changeDlvAccountHidden: boolean = false;
    suplyTypeCodeHidden: boolean = true;
    barcodeYn: boolean = false;
    udiAll: boolean = true;
    udiDiPi: boolean;
    udiDirect: boolean;
    hidden: boolean = false;
    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    gridListDataProvider: RealGrid.LocalDataProvider;
    gridListColumns: Columns[];
    // @ts-ignore
    gridListFields: DataFieldObject[] = [
        {fieldName: 'convertedQty', dataType: ValueType.NUMBER},
        {fieldName: 'useTmlmtUse', dataType: ValueType.TEXT},
        // {fieldName: 'itemCd', dataType: ValueType.TEXT},
        // {fieldName: 'itemNm', dataType: ValueType.TEXT},
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
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _realGridsService: FuseRealGridService,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _managesPackageService: ManagesPackageService,
        public _matDialogPopup: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        public matDialogRef: MatDialogRef<ManagesPackageComponent>,
        private _formBuilder: FormBuilder,) {
        this.isMobile = this._deviceService.isMobile();
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data, 'SUPLYFLAGCODE');
        this.suplyTypeCode = _utilService.commonValueFilter(_codeStore.getValue().data, 'SUPLYTYPECODE', ['ALL']);
        this.month = _utilService.commonValue(_codeStore.getValue().data, 'MONTH');
        this.year = _utilService.commonValueFilter(_codeStore.getValue().data, 'YEAR', ['2019', '2020']);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.gridListDataProvider);
    }

    ngOnInit(): void {
        this.selectedForm = this._formBuilder.group({
            year: [{value: ''}, [Validators.required]],
            month: [{value: ''}, [Validators.required]],
            suplyContStdmt: [{value: ''}],
            suplyFlagCode: [{value: ''}, [Validators.required]], // 공급구분
            suplyTypeCode: [{value: ''}], // 공급형태
            suplyDate: [''],
            bcncCobTypeName: [''],
            bcncCode: [{value: ''}],
            bcncEntpAddr: [{value: '', disabled: true}],
            bcncEntpName: [{value: '', disabled: true}],
            bcncHptlCode: [''],
            bcncTaxNo: [{value: '', disabled: true}],
            cobTypeName: [{value: '', disabled: true}],
            dvyfgCobTypeName: [{value: '', disabled: true}],
            dvyfgEntpAddr: [{value: '', disabled: true}],
            dvyfgEntpName: [{value: '', disabled: true}],
            dvyfgHptlCode: [''],
            dvyfgPlaceBcncCode: [{value: '', disabled: true}],
            dvyfgTaxNo: [{value: '', disabled: true}],
            isDiffDvyfg: [false],
            meddevItemSeq: [''],
            no: [''],
            packQuantity: [{value: '', disabled: true}],
            rtngudFlagCode: [''],
            seq: [''],
            suplyContSeq: [''],
            totalCnt: [''],
            udiDiSeq: [''],
            grade: [{value: '', disabled: true}],
            active: [false]  // cell상태
        });

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
            suplyTypeCode: [''],
            suplyContStdmt: [''],
            active: [false],  // cell상태
            udiScan: ['ALL'],
            gtinDirect: [''],   // UDI NO
            manufYmDirect: [''],   // 제조일자
            useTmlmtDirect: [''],   // 유통기한
            lotNoDirect: [''],   // LOT NO
            itemSeqDirect: [''],   // 일련번호
        });
        this.searchForm.patchValue({'suplyContStdmt': this.searchForm.getRawValue().year + this.searchForm.getRawValue().month + ''});

        this.searchForm.controls['stdCode'].disable();
        this.searchForm.controls['gtin'].disable();
        this.searchForm.controls['lotNo'].disable();
        this.searchForm.controls['manufYm'].disable();
        this.searchForm.controls['useTmlmt'].disable();
        this.searchForm.controls['itemSeq'].disable();
        //그리드 컬럼
        this.gridListColumns = [
            {
                name: 'useTmlmtUse', fieldName: 'useTmlmtUse', type: 'data', width: '110', styleName: 'center-cell-text'
                , header: {
                    text: '유효기간', styleName: 'center-cell-text',
                    template: '${headerText}<span class="material-icons text-13s text-bold-600 tooltip-hover-scan">\n' +
                        'help_outline\n' +
                        '<span class="tooltip-text-scan tooltip-scan">' +
                        '* 유통기한이 6개월 미만일 경우 위험으로 표시 *' +
                        '</span>',
                    values: {'headerText': '유효기간'}
                },
                renderer: {
                    showTooltip: true
                }
            },
            // {
            //     name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '품목 코드', styleName: 'center-cell-text'}, renderer: {
            //         showTooltip: true
            //     }
            // },
            // {
            //     name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
            //     , header: {text: '품목 명', styleName: 'center-cell-text'},
            //     renderer: {
            //         showTooltip: true
            //     }
            // },
            {
                name: 'typeName', fieldName: 'typeName', type: 'data', width: '185', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udiCode', fieldName: 'udiCode', type: 'data', width: '300', styleName: 'left-cell-text'
                , header: {text: '바코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'obQty', fieldName: 'obQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '출고수량', styleName: 'center-cell-text red-font-color'}
                , numberFormat: '#,##0', renderer: {
                    showTooltip: true
                }
            },

        ];

        this.gridListDataProvider = this._realGridsService.gfn_CreateDataProvider(true);

        const gridListOption = {
            stateBar: true,
            checkBar: true,
            footers: false,
        };

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.gridListDataProvider,
            'package',
            this.gridListColumns,
            this.gridListFields,
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
            startEdit: false,
            commitEdit: true,
            checkReadOnly: true
        });
        this.gridList.editOptions.commitByCell = true;
        this.gridList.editOptions.validateOnEdited = true;
        this.gridList.displayOptions.hscrollBar = false;
        this.gridList.displayOptions.vscrollBar = false;
        this._realGridsService.gfn_EditGrid(this.gridList);


        this.gridList.setCellStyleCallback((grid, dataCell) => {
            const ret = {styleName: '', editable: false};
            if (dataCell.dataColumn.fieldName === 'obQty') {
                ret.editable = true;
            }

            const useTmlmtUse = grid.getValue(dataCell.index.itemIndex, 'useTmlmtUse');

            if (useTmlmtUse === '만료') {
                if (dataCell.dataColumn.fieldName === 'useTmlmtUse') {
                    ret.styleName = 'red-color';
                }
            } else if (useTmlmtUse === '위험') {
                if (dataCell.dataColumn.fieldName === 'useTmlmtUse') {
                    ret.styleName = 'orange-color';
                }
            } else if (useTmlmtUse === '유효') {
                if (dataCell.dataColumn.fieldName === 'useTmlmtUse') {
                    ret.styleName = 'green-color';
                }
            }

            return ret;
        });

        setTimeout(() => {
            this.refUdiCode.nativeElement.focus();
        }, 300);

        this._changeDetectorRef.markForCheck();
    }

    changeDate(): void {
        const year = this.selectedForm.getRawValue().year;
        const month = this.selectedForm.getRawValue().month;

        this.minDate = year + '-' + month + '-' + '01';
        this.maxDate = year + '-' + month + '-' + new Date(year, month, 0).getDate();
    }

    changeSuplyFlagCode(): void {
        //거래처, 공급형태 필수
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        const suplyFlagCode = this.selectedForm.getRawValue().suplyFlagCode;
        if (suplyFlagCode === '1') {
            this.changeIsDiffDvyfgHidden = true;
        } else {
            this.selectedForm.patchValue({'isDiffDvyfg': false});
            this.changeIsDiffDvyfgHidden = false;
        }
        if (suplyFlagCode === '1') {
            this.changeText = '출고';
            this.changeAccountText = '공급받은 자(거래처)';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = true;
            this.hidden = false;
        } else if (suplyFlagCode === '2') {
            this.changeText = '반품';
            this.changeAccountText = '반품한 자(거래처)';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = false;
            this.hidden = true;
        } else if (suplyFlagCode === '3') {
            this.changeText = '폐기';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        } else if (suplyFlagCode === '4') {
            this.changeText = '임대';
            this.changeAccountText = '임대한 자(거래처)';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        } else if (suplyFlagCode === '5') {
            this.changeText = '회수';
            this.changeAccountText = '회수한 자(거래처)';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = false;
            this.hidden = true;
        } else {
            this.changeText = '';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = true;
            this.hidden = false;
        }
    }

    accountSearch(): void {
        if (!this.isMobile) {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_UDI_ACCOUNT',
                    headerText: '거래처 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.selectedForm.patchValue({'bcncCode': result.udiAccount});
                        this.selectedForm.patchValue({'bcncEntpAddr': result.address});
                        this.selectedForm.patchValue({'bcncEntpName': result.custBusinessName});
                        this.selectedForm.patchValue({'bcncTaxNo': result.custBusinessNumber});
                        this.selectedForm.patchValue({'cobTypeName': result.businessCondition});
                    }
                });
        } else {
            const d = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_UDI_ACCOUNT',
                    headerText: '거래처 조회'
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
                if (result) {
                    this.selectedForm.patchValue({'bcncCode': result.udiAccount});
                    this.selectedForm.patchValue({'bcncEntpAddr': result.address});
                    this.selectedForm.patchValue({'bcncEntpName': result.custBusinessName});
                    this.selectedForm.patchValue({'bcncTaxNo': result.custBusinessNumber});
                    this.selectedForm.patchValue({'cobTypeName': result.businessCondition});
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    updateIsDiffDvyfg(): void {

        const isDiffDvyfg = this.selectedForm.getRawValue().isDiffDvyfg;

        if (isDiffDvyfg) {
            this.changeDlvAccountHidden = true;
        } else {
            this.changeDlvAccountHidden = false;
        }
    }

    dlvAccountSearch(): void {
        if (!this.isMobile) {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_UDI_ACCOUNT',
                    headerText: '납품장소 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.selectedForm.patchValue({'dvyfgPlaceBcncCode': result.udiAccount});
                        this.selectedForm.patchValue({'dvyfgEntpAddr': result.address});
                        this.selectedForm.patchValue({'dvyfgEntpName': result.custBusinessName});
                        this.selectedForm.patchValue({'dvyfgTaxNo': result.custBusinessNumber});
                        this.selectedForm.patchValue({'dvyfgCobTypeName': result.businessCondition});
                    }
                });
        } else {
            const d = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_UDI_ACCOUNT',
                    headerText: '납품장소 조회'
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
                if (result) {
                    this.selectedForm.patchValue({'dvyfgPlaceBcncCode': result.udiAccount});
                    this.selectedForm.patchValue({'dvyfgEntpAddr': result.address});
                    this.selectedForm.patchValue({'dvyfgEntpName': result.custBusinessName});
                    this.selectedForm.patchValue({'dvyfgTaxNo': result.custBusinessNumber});
                    this.selectedForm.patchValue({'dvyfgCobTypeName': result.businessCondition});
                }
                smallDialogSubscription.unsubscribe();
            });
        }
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
            if (this.udiAll) {
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
            if (this.udiDiPi) {
                setTimeout(() => {
                    this.refUdiDiCode.nativeElement.focus();
                }, 200);
            } else {
                setTimeout(() => {
                    this.refUdiDiCode.nativeElement.blur();
                }, 200);
            }
        } else if (val.value === '1') {
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
            if (this.udiDirect) {
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
            this.gridList.clearSelection();
        }, 100);
        // Set the alert
        this.alert = {
            type: 'error',
            message: '코드를 다시 입력해주세요. 올바른 형식이 아닙니다.'
        };
        // Show the alert
        this.showAlert = true;
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

    udiDiCode($event): void {
        let udiCode = $event.target.value;

        if (udiCode === '') {

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
                    this.gridList.clearSelection();
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
                                        lotNo = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
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
                                        lotNo = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '11') {
                                        manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    } else if (b.substring(0, 2) === '17') {
                                        useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                    }
                                }
                            }

                        } else if (cutUdiPiCode.substring(0, 1) === ',') {
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
                                            lotNo = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
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
                                            lotNo = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '11') {
                                            manufYm = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        } else if (b.substring(0, 2) === '17') {
                                            useTmlmt = '(' + b.substring(0, 2) + ')' + b.substring(2, b.length);
                                        }
                                    }
                                }
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

                this._managesPackageService.getUdiDiCodeInfo(searchForm)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((manages: any) => {
                        this._functionService.cfn_loadingBarClear();
                        this.alertMessage(manages);

                        if (manages.data !== null) {
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
                                // manages.data[0].itemCd,
                                // manages.data[0].itemName,
                                manages.data[0].meddevItemSeq,
                                manages.data[0].seq,
                                manages.data[0].udiDiSeq,
                                manages.data[0].userSterilizationYn,
                                manages.data[0].kitYn,
                                manages.data[0].typeName, udiCode,
                                lotNo.replace('(' + '10' + ')', ''), manufYm.replace('(' + '11' + ')', ''), useTmlmt.replace('(' + '17' + ')', ''), itemSeq.replace('(' + '21' + ')', ''), 1
                            ];

                            let rows = this._realGridsService.gfn_GetRows(this.gridList, this.gridListDataProvider);

                            rows = rows.filter((detail: any) =>
                                (detail.udiCode === this.searchForm.getRawValue().stdCode))
                                .map((param: any) => param);

                            if (rows.length > 0) {
                                const dataRow2 = this.gridListDataProvider.searchDataRow({
                                    fields: ['udiCode'],
                                    values: [udiCode]
                                });
                                let sumQty2 = 1;
                                let qty2 = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList,
                                    this.gridListDataProvider,
                                    dataRow2, 'obQty');
                                if (qty2 === undefined) {
                                    qty2 = 0;
                                }
                                sumQty2 = sumQty2 + qty2;
                                setTimeout(() => {
                                    this._realGridsService.gfn_CellDataSetRow(this.gridList,
                                        this.gridListDataProvider,
                                        dataRow2,
                                        'obQty',
                                        sumQty2);
                                }, 100);

                            } else {
                                this._realGridsService.gfn_AddRow(this.gridList, this.gridListDataProvider, values);
                            }
                            setTimeout(() => {
                                this.searchForm.patchValue({'udiCode': ''});
                            }, 100);

                            if (!this.barcodeYn) {
                                setTimeout(() => {
                                    this.refUdiCode.nativeElement.focus();
                                    this._changeDetectorRef.markForCheck();
                                }, 100);
                            } else {
                                const dataRow = this.gridListDataProvider.searchDataRow({
                                    fields: ['udiCode'],
                                    values: [udiCode]
                                });
                                //셀이동
                                //this.gridList2.setSelection({ style : 'rows', startRow : dataRow, endRow : dataRow });
                                setTimeout(() => {
                                    this.refUdiCode.nativeElement.blur();
                                    this._changeDetectorRef.markForCheck();
                                }, 100);
                                const focusCell = this.gridList.getCurrent();
                                focusCell.dataRow = dataRow;
                                focusCell.column = 'obQty';
                                focusCell.fieldName = 'obQty';
                                //포커스된 셀 변경
                                this.gridList.setCurrent(focusCell);
                                const curr = this.gridList.getCurrent();
                                this.gridList.beginUpdateRow(curr.itemIndex);
                                this.gridList.showEditor();
                                this.gridList.setFocus();
                            }

                            this.showAlert = false;
                            this._changeDetectorRef.markForCheck();
                        } else {
                            this.failAlert();
                        }

                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }, (err) => {
                    });
            }
        }
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
                    this.searchForm.patchValue({'udiDiCode': ''});
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

            if (noCode) {
                setTimeout(() => {
                    this.searchForm.patchValue({'udiDiCode': ''});
                    this.searchForm.patchValue({'udiPiCode': ''});
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

                    this._managesPackageService.getUdiDiCodeInfo(searchForm)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((manages: any) => {
                            this._functionService.cfn_loadingBarClear();
                            this.alertMessage(manages);
                            if (manages.status === 'SUCCESS') {
                                this.alert = {
                                    type: 'success',
                                    message: 'UDI DI 바코드 스캔 성공'
                                };
                                // Show the alert
                                this.showAlert = true;
                                this.refUdiPiCode.nativeElement.focus();
                            } else {
                                this.alert = {
                                    type: 'error',
                                    message: '해당 바코드로 일치하는 품목 또는 모델이 없습니다.'
                                };
                                // Show the alert
                                this.showAlert = true;
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
        if (!this.searchForm.getRawValue().udiDiCode.includes('(')) {
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
                    this.searchForm.patchValue({'udiPiCode': ''});
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

                this._managesPackageService.getUdiDiCodeInfo(searchForm)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((manages: any) => {
                        this._functionService.cfn_loadingBarClear();
                        this.alertMessage(manages);

                        if (manages.data !== null) {
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
                                // manages.data[0].itemCd,
                                // manages.data[0].itemName,
                                manages.data[0].meddevItemSeq,
                                manages.data[0].seq,
                                manages.data[0].udiDiSeq,
                                manages.data[0].userSterilizationYn,
                                manages.data[0].kitYn,
                                manages.data[0].typeName, udiCode,
                                lotNo.replace('(' + '10' + ')', ''), manufYm.replace('(' + '11' + ')', ''), useTmlmt.replace('(' + '17' + ')', ''), itemSeq.replace('(' + '21' + ')', ''), 1
                            ];

                            let rows = this._realGridsService.gfn_GetRows(this.gridList, this.gridListDataProvider);

                            rows = rows.filter((detail: any) =>
                                (detail.udiCode === this.searchForm.getRawValue().stdCode))
                                .map((param: any) => param);

                            if (rows.length > 0) {

                                const dataRow2 = this.gridListDataProvider.searchDataRow({
                                    fields: ['udiCode'],
                                    values: [udiCode]
                                });
                                let sumQty2 = 1;
                                let qty2 = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList,
                                    this.gridListDataProvider,
                                    dataRow2, 'obQty');
                                if (qty2 === undefined) {
                                    qty2 = 0;
                                }
                                sumQty2 = sumQty2 + qty2;
                                setTimeout(() => {
                                    this._realGridsService.gfn_CellDataSetRow(this.gridList,
                                        this.gridListDataProvider,
                                        dataRow2,
                                        'obQty',
                                        sumQty2);
                                }, 100);
                            } else {
                                this._realGridsService.gfn_AddRow(this.gridList, this.gridListDataProvider, values);
                            }
                            setTimeout(() => {
                                this.searchForm.patchValue({'udiDiCode': ''});
                                this.searchForm.patchValue({'udiPiCode': ''});
                            }, 100);

                            if (!this.barcodeYn) {
                                setTimeout(() => {
                                    this.refUdiDiCode.nativeElement.focus();
                                    this._changeDetectorRef.markForCheck();
                                }, 100);
                            } else {
                                const dataRow = this.gridListDataProvider.searchDataRow({
                                    fields: ['udiCode'],
                                    values: [udiCode]
                                });
                                //셀이동
                                //this.gridList2.setSelection({ style : 'rows', startRow : dataRow, endRow : dataRow });
                                setTimeout(() => {
                                    this.refUdiDiCode.nativeElement.blur();
                                    this._changeDetectorRef.markForCheck();
                                }, 100);
                                const focusCell = this.gridList.getCurrent();
                                focusCell.dataRow = dataRow;
                                focusCell.column = 'obQty';
                                focusCell.fieldName = 'obQty';
                                //포커스된 셀 변경
                                this.gridList.setCurrent(focusCell);
                                const curr = this.gridList.getCurrent();
                                this.gridList.beginUpdateRow(curr.itemIndex);
                                this.gridList.showEditor();
                                this.gridList.setFocus();
                            }
                            this.showAlert = false;
                            this._changeDetectorRef.markForCheck();
                        } else {
                            this.failAlert();
                        }
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
            } else if(this.searchForm.getRawValue().gtinDirect.includes('(01)')) {
                stdCode = this.searchForm.getRawValue().gtinDirect;
            } else {
                stdCode = '(01)' + this.searchForm.getRawValue().gtinDirect;
            }
            if(!this.searchForm.getRawValue().manufYmDirect) {
                manufYm = '';
            } else if(this.searchForm.getRawValue().manufYmDirect.includes('(11)')) {
                manufYm = this.searchForm.getRawValue().manufYmDirect;
                if (manufYm.replace('(' + '11' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                    return;
                }
            } else {
                manufYm = '(11)' + this.searchForm.getRawValue().manufYmDirect;
                if (manufYm.replace('(' + '11' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('제조연월이 잘못되었습니다. <br> 제조연월 형식은 (11)YYMMDD 입니다.');
                    return;
                }
            }

            if(!this.searchForm.getRawValue().useTmlmtDirect) {
                useTmlmt = '';
            } else if(this.searchForm.getRawValue().useTmlmtDirect.includes('(17)')) {
                useTmlmt = this.searchForm.getRawValue().useTmlmtDirect;
                if (useTmlmt.replace('(' + '17' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                    return;
                }
            } else {
                useTmlmt = '(17)' + this.searchForm.getRawValue().useTmlmtDirect;
                if (useTmlmt.replace('(' + '17' + ')', '').length !== 6) {
                    this._functionService.cfn_alert('유통기한이 잘못되었습니다. <br> 유통기한 형식은 (17)YYMMDD 입니다.');
                    return;
                }
            }

            if(!this.searchForm.getRawValue().lotNoDirect) {
                lotNo = '';
            } else if(this.searchForm.getRawValue().lotNoDirect.includes('(10)')) {
                lotNo = this.searchForm.getRawValue().lotNoDirect;
            } else {
                lotNo = '(10)' + this.searchForm.getRawValue().lotNoDirect;
            }

            if(!this.searchForm.getRawValue().itemSeqDirect) {
                itemSeq = '';
            } else if(this.searchForm.getRawValue().itemSeqDirect.includes('(21)')) {
                itemSeq = this.searchForm.getRawValue().itemSeqDirect;
            } else {
                itemSeq = '(21)' + this.searchForm.getRawValue().itemSeqDirect;
            }

            udi = stdCode + manufYm + useTmlmt + lotNo + itemSeq;
            if (stdCode === undefined) {
                this.failAlert();
                return;
            } else {
                const searchForm = {udiDiCode: stdCode.replace('(' + '01' + ')', '')};
                this._managesPackageService.getUdiDiCodeInfo(searchForm)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((manages: any) => {
                        this._functionService.cfn_loadingBarClear();
                        this.alertMessage(manages);

                        if (manages.data !== null) {
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
                                // manages.data[0].itemCd,
                                // manages.data[0].itemName,
                                manages.data[0].meddevItemSeq,
                                manages.data[0].seq,
                                manages.data[0].udiDiSeq,
                                manages.data[0].userSterilizationYn,
                                manages.data[0].kitYn,
                                manages.data[0].typeName, udiCode,
                                lotNo.replace('(' + '10' + ')', ''), manufYm.replace('(' + '11' + ')', ''), useTmlmt.replace('(' + '17' + ')', ''), itemSeq.replace('(' + '21' + ')', ''), 1
                            ];

                            let rows = this._realGridsService.gfn_GetRows(this.gridList, this.gridListDataProvider);

                            rows = rows.filter((detail: any) =>
                                (detail.udiCode === this.searchForm.getRawValue().stdCode))
                                .map((param: any) => param);

                            if (rows.length > 0) {

                                const dataRow2 = this.gridListDataProvider.searchDataRow({
                                    fields: ['udiCode'],
                                    values: [udi]
                                });
                                let sumQty2 = 1;
                                let qty2 = this._realGridsService.gfn_CellDataGetRow(
                                    this.gridList,
                                    this.gridListDataProvider,
                                    dataRow2, 'obQty');
                                if (qty2 === undefined) {
                                    qty2 = 0;
                                }
                                sumQty2 = sumQty2 + qty2;
                                setTimeout(() => {
                                    this._realGridsService.gfn_CellDataSetRow(this.gridList,
                                        this.gridListDataProvider,
                                        dataRow2,
                                        'obQty',
                                        sumQty2);
                                }, 100);

                            } else {
                                this._realGridsService.gfn_AddRow(this.gridList, this.gridListDataProvider, values);
                            }
                            setTimeout(() => {
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
                                const dataRow = this.gridListDataProvider.searchDataRow({
                                    fields: ['udiCode'],
                                    values: [udi]
                                });
                                //셀이동
                                //this.gridList2.setSelection({ style : 'rows', startRow : dataRow, endRow : dataRow });
                                setTimeout(() => {
                                    this.refUdiDirectCode.nativeElement.blur();
                                    this._changeDetectorRef.markForCheck();
                                }, 100);
                                const focusCell = this.gridList.getCurrent();
                                focusCell.dataRow = dataRow;
                                focusCell.column = 'obQty';
                                focusCell.fieldName = 'obQty';
                                //포커스된 셀 변경
                                this.gridList.setCurrent(focusCell);
                                const curr = this.gridList.getCurrent();
                                this.gridList.beginUpdateRow(curr.itemIndex);
                                this.gridList.showEditor();
                                this.gridList.setFocus();
                            }

                            this.showAlert = false;
                            this._changeDetectorRef.markForCheck();
                        } else {
                            this.failAlert();
                        }
                        // Mark for check
                        this._changeDetectorRef.markForCheck();
                    }, (err) => {
                    });
            }
        }

    }

    udiDiCodeScanDelete(): void {
        const checkValues = this._realGridsService.gfn_GetCheckRows(this.gridList, this.gridListDataProvider);

        if (checkValues.length < 1) {
            this._functionService.cfn_alert('삭제 대상을 선택해주세요.');
            return;
        }

        this._realGridsService.gfn_DelRows(this.gridList, this.gridListDataProvider);
    }
}
