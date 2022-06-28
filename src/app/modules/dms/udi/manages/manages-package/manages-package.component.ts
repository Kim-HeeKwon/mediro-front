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
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _realGridsService: FuseRealGridService,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        public _matDialogPopup: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        public matDialogRef: MatDialogRef<ManagesPackageComponent>,
        private _formBuilder: FormBuilder,)
    {
        this.isMobile = this._deviceService.isMobile();
        this.suplyFlagCode = _utilService.commonValue(_codeStore.getValue().data,'SUPLYFLAGCODE');
        this.suplyTypeCode = _utilService.commonValueFilter(_codeStore.getValue().data,'SUPLYTYPECODE',['ALL']);
        this.month = _utilService.commonValue(_codeStore.getValue().data,'MONTH');
        this.year = _utilService.commonValueFilter(_codeStore.getValue().data,'YEAR',['2019','2020']);
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
            suplyDate : [''],
            bcncCobTypeName : [''],
            bcncCode : [{value: ''}],
            bcncEntpAddr : [{value: '',disabled:true}],
            bcncEntpName : [{value: '',disabled:true}],
            bcncHptlCode : [''],
            bcncTaxNo : [{value: '',disabled:true}],
            cobTypeName : [{value: '',disabled:true}],
            dvyfgCobTypeName : [{value: '',disabled:true}],
            dvyfgEntpAddr : [{value: '',disabled:true}],
            dvyfgEntpName : [{value: '',disabled:true}],
            dvyfgHptlCode : [''],
            dvyfgPlaceBcncCode : [{value: '',disabled:true}],
            dvyfgTaxNo : [{value: '',disabled:true}],
            isDiffDvyfg : [false],
            meddevItemSeq : [''],
            no : [''],
            packQuantity : [{value: '',disabled:true}],
            rtngudFlagCode : [''],
            seq : [''],
            suplyContSeq : [''],
            totalCnt : [''],
            udiDiSeq : [''],
            grade : [{value: '',disabled:true}],
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
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목 코드', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '120', styleName: 'left-cell-text'
                , header: {text: '품목 명', styleName: 'center-cell-text'},
                renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'typeName', fieldName: 'typeName', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '모델명', styleName: 'center-cell-text'}, renderer: {
                    showTooltip: true
                }
            },
            {
                name: 'udiCode', fieldName: 'udiCode', type: 'data', width: '240', styleName: 'left-cell-text'
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
            'gridList',
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

        this._changeDetectorRef.markForCheck();
    }

    changeDate(): void{
        const year = this.selectedForm.getRawValue().year;
        const month = this.selectedForm.getRawValue().month;

        this.minDate = year + '-' + month + '-' + '01';
        this.maxDate = year + '-' + month + '-' + new Date(year, month, 0).getDate();
    }

    changeSuplyFlagCode(): void{
        //거래처, 공급형태 필수
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        const suplyFlagCode = this.selectedForm.getRawValue().suplyFlagCode;
        if(suplyFlagCode === '1'){
            this.changeIsDiffDvyfgHidden = true;
        }else{
            this.selectedForm.patchValue({'isDiffDvyfg': false});
            this.changeIsDiffDvyfgHidden = false;
        }
        if(suplyFlagCode === '1'){
            this.changeText = '출고';
            this.changeAccountText = '공급받은 자(거래처)';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = true;
            this.hidden = false;
        }else if(suplyFlagCode === '2'){
            this.changeText = '반품';
            this.changeAccountText = '반품한 자(거래처)';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = false;
            this.hidden = true;
        }else if(suplyFlagCode === '3'){
            this.changeText = '폐기';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        }else if(suplyFlagCode === '4'){
            this.changeText = '임대';
            this.changeAccountText = '임대한 자(거래처)';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = true;
            this.hidden = true;
        }else if(suplyFlagCode === '5'){
            this.changeText = '회수';
            this.changeAccountText = '회수한 자(거래처)';
            this.changeAccountHidden = true;
            this.suplyTypeCodeHidden = false;
            this.hidden = true;
        }else{
            this.changeText = '';
            this.changeAccountHidden = false;
            this.suplyTypeCodeHidden = true;
            this.hidden = false;
        }
    }

    accountSearch(): void {
        if(!this.isMobile){
            const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_UDI_ACCOUNT',
                    headerText : '거래처 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.selectedForm.patchValue({'bcncCode': result.udiAccount});
                        this.selectedForm.patchValue({'bcncEntpAddr': result.address});
                        this.selectedForm.patchValue({'bcncEntpName': result.custBusinessName});
                        this.selectedForm.patchValue({'bcncTaxNo': result.custBusinessNumber});
                        this.selectedForm.patchValue({'cobTypeName': result.businessCondition});
                    }
                });
        }else{
            const d = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_UDI_ACCOUNT',
                    headerText : '거래처 조회'
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
            d.afterClosed().subscribe((result) => {
                if(result){
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

        if(isDiffDvyfg){
            this.changeDlvAccountHidden = true;
        }else{
            this.changeDlvAccountHidden = false;
        }
    }

    dlvAccountSearch(): void {
        if(!this.isMobile){
            const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_UDI_ACCOUNT',
                    headerText : '납품장소 조회'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.selectedForm.patchValue({'dvyfgPlaceBcncCode': result.udiAccount});
                        this.selectedForm.patchValue({'dvyfgEntpAddr': result.address});
                        this.selectedForm.patchValue({'dvyfgEntpName': result.custBusinessName});
                        this.selectedForm.patchValue({'dvyfgTaxNo': result.custBusinessNumber});
                        this.selectedForm.patchValue({'dvyfgCobTypeName': result.businessCondition});
                    }
                });
        }else{
            const d = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup : 'P$_UDI_ACCOUNT',
                    headerText : '납품장소 조회'
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
            d.afterClosed().subscribe((result) => {
                if(result){
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

    udiDiCode($event): void {

    }

    udiDiPiCode($event): void {

    }
    udiDiPiCode2($event): void {

    }
    udiDirectCode(): void {

    }

    udiDiCodeScanDelete(): void {

    }
}
