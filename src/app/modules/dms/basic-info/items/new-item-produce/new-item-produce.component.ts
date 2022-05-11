import {ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";
import {CommonCode, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {ItemsService} from "../items.service";
import {DeviceDetectorService} from "ngx-device-detector";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {takeUntil} from "rxjs/operators";
import {ItemSearchComponent} from "../../../../../../@teamplat/components/item-search";
import {ItemSearchProduceComponent} from "../../../../../../@teamplat/components/item-search-produce";
// import {ItemProduceSearchComponent} from "../../../../../../@teamplat/components/item-produce-search/item-produce-search.component";

@Component({
    selector       : 'dms-new-item-produce',
    templateUrl    : 'new-item-produce.component.html',
    styleUrls      : ['new-item-produce.component.scss']
})
export class NewItemProduceComponent implements OnInit, OnDestroy
{

    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    isMobile: boolean = false;
    selectedItemForm: FormGroup;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;
    is_edit: boolean = false;
    itemGrades: CommonCode[] = [];
    itemUnit: CommonCode[] = [];
    itemStandard: CommonCode[] = [];
    udiYn: CommonCode[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _functionService: FunctionService,
        public matDialogRef: MatDialogRef<NewItemProduceComponent>,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _itemService: ItemsService,
        private _renderer: Renderer2,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.itemGrades = _utilService.commonValueFilter(_codeStore.getValue().data,'ITEM_GRADE', ['ALL','0','-']);
        this.itemUnit = _utilService.commonValue(_codeStore.getValue().data,'ITEM_UNIT');
        this.itemStandard = _utilService.commonValue(_codeStore.getValue().data,'ITEM_UNIT');
        this.udiYn = _utilService.commonValue(_codeStore.getValue().data,'UDI_YN');
        this.isMobile = this._deviceService.isMobile();
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this.selectedItemForm = this._formBuilder.group({
            itemCd: ['', [Validators.required]], // 품목코드
            itemNm: ['', [Validators.required]], // 품목명
            itemGrade: ['', [Validators.required]], // 등급
            udiYn: ['', [Validators.required]], // UDI 신고 대상 유무
            category: [''], // 카테고리
            unit: [], // 단위
            standard: [''], // 규격
            rcperSalaryCode: [''],
            supplier: [''], // 공급사
            supplierNm: [{value:'', disabled: true}], // 공급사 명
            manufacturer: [''], // 제조사
            buyPrice: [0, [Validators.required]], // 매입단가
            salesPrice: [0, [Validators.required]], // 매출단가
            entpName: [], // 업체명
            fomlInfo: [], // 모델명
            modelId: [],

            udiEntpName: [],
            udiItemName: [],
            udiTypeName: [],
            udiBrandName: [],
            udiItemNoFullname: [],
            udiGrade: [],

            itemNoFullname: [], // 품목허가번호
            medDevSeq: [], // modelSeq
            seq: [], // seq
            udiDiCode: [], // udiDiCode
            active: [false]  // cell상태
        });
        this.selectedItemForm.controls.itemCd.disable();
        this.selectedItemForm.controls.supplierNm.disable();
        this.selectedItemForm.controls.fomlInfo.disable();
        this.selectedItemForm.controls.itemNoFullname.disable();
    }

    supplierSearch(): void
    {
        if (!this.isMobile) {

            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '공급처 조회',
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        this.selectedItemForm.patchValue({'supplier': result.accountCd});
                        this.selectedItemForm.patchValue({'supplierNm': result.accountNm});
                        this._changeDetectorRef.markForCheck();
                    }
                });
        } else {
            const popup = this._matDialogPopup.open(CommonPopupItemsComponent, {
                data: {
                    popup: 'P$_ACCOUNT',
                    headerText: '공급처 조회'
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });

            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    popup.updateSize('calc(100vw - 10px)', '');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            popup.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if (result) {
                        smallDialogSubscription.unsubscribe();
                        this.selectedItemForm.patchValue({'supplier': result.accountCd});
                        this.selectedItemForm.patchValue({'supplierNm': result.accountNm});
                    }
                });
        }
    }


    openItemSearch(): void
    {
        if(!this.isMobile){
            const popup =this._matDialogPopup.open(ItemSearchProduceComponent, {
                data: {
                    popup : 'P$_ACCOUNT'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed().subscribe((result) => {
                if(result){
                    console.log(result);
                    if(result.seq === '' || result.seq === null || result.seq === 'null' || result.seq === undefined){
                        result.modelId = result.meddevItemSeq + '_0';
                    }else{
                        result.modelId = result.meddevItemSeq + '_' + result.seq;
                    }
                    this.selectedItemForm.patchValue({'itemCd': result.modelId});
                    this.selectedItemForm.patchValue({'itemNm': result.itemName});
                    this.selectedItemForm.patchValue({'itemGrade': result.grade});
                    this.selectedItemForm.patchValue({'entpName': localStorage.getItem('businessName')});
                    this.selectedItemForm.patchValue({'fomlInfo': result.modelName});
                    this.selectedItemForm.patchValue({'itemNoFullname': result.permitItemNo});
                    this.selectedItemForm.patchValue({'rcperSalaryCode': ''});
                    this.selectedItemForm.patchValue({'medDevSeq': result.meddevItemSeq});
                    this.selectedItemForm.patchValue({'seq': result.seq});
                    this.selectedItemForm.patchValue({'udiDiCode': ''});
                    this.selectedItemForm.patchValue({'manufacturer': localStorage.getItem('businessName')});

                    this.selectedItemForm.patchValue({'udiEntpName': localStorage.getItem('businessName')});
                    this.selectedItemForm.patchValue({'udiItemName': result.itemName});
                    this.selectedItemForm.patchValue({'udiTypeName': result.modelName});
                    this.selectedItemForm.patchValue({'udiBrandName': ''});
                    this.selectedItemForm.patchValue({'udiItemNoFullname': result.permitItemNo});
                    this.selectedItemForm.patchValue({'udiGrade': result.grade});

                    if(result.udidiCount > 0){
                        this.selectedItemForm.patchValue({'udiYn': 'Y'});
                    }else{
                        this.selectedItemForm.patchValue({'udiYn': 'N'});
                    }
                    this.is_edit = true;
                }
            });
        }else{
            const d = this._matDialogPopup.open(ItemSearchProduceComponent, {
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
                    console.log(result);
                    // cobFlagCode: "MNFCTUR"
                    // grade: "2"
                    // isForExport: "false"
                    // itemName: "치과용임플란트상부구조물"
                    // meddevItemSeq: "2013001322"
                    // modelName: "BDM401MHC"
                    // permitDate: "2013-02-21"
                    // permitItemNo: "제인 13-417 호"
                    // seq: ""
                    // udidiCount: 0

                    if(result.seq === '' || result.seq === null || result.seq === 'null' || result.seq === undefined){
                        result.modelId = result.meddevItemSeq + '_0';
                    }else{
                        result.modelId = result.meddevItemSeq + '_' + result.seq;
                    }
                    this.selectedItemForm.patchValue({'itemCd': result.modelId});
                    this.selectedItemForm.patchValue({'itemNm': result.itemName});
                    this.selectedItemForm.patchValue({'itemGrade': result.grade});
                    this.selectedItemForm.patchValue({'entpName': localStorage.getItem('businessName')});
                    this.selectedItemForm.patchValue({'fomlInfo': result.modelName});
                    this.selectedItemForm.patchValue({'itemNoFullname': result.permitItemNo});
                    this.selectedItemForm.patchValue({'rcperSalaryCode': ''});
                    this.selectedItemForm.patchValue({'medDevSeq': result.meddevItemSeq});
                    this.selectedItemForm.patchValue({'seq': result.seq});
                    this.selectedItemForm.patchValue({'udiDiCode': ''});
                    this.selectedItemForm.patchValue({'manufacturer': localStorage.getItem('businessName')});

                    this.selectedItemForm.patchValue({'udiEntpName': localStorage.getItem('businessName')});
                    this.selectedItemForm.patchValue({'udiItemName': result.itemName});
                    this.selectedItemForm.patchValue({'udiTypeName': result.modelName});
                    this.selectedItemForm.patchValue({'udiBrandName': ''});
                    this.selectedItemForm.patchValue({'udiItemNoFullname': result.permitItemNo});
                    this.selectedItemForm.patchValue({'udiGrade': result.grade});

                    if(result.udidiCount > 0){
                        this.selectedItemForm.patchValue({'udiYn': 'Y'});
                    }else{
                        this.selectedItemForm.patchValue({'udiYn': 'N'});
                    }

                    this.is_edit = true;
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }

    alertMessage(param: any): void
    {
        if(param.status === 'SUCCESS'){
            this.alert = {
                type   : 'success',
                message: '등록완료 하였습니다.'
            };
            // Show the alert
            this.showAlert = true;
            this.selectedItemForm.patchValue({
                    itemCd: '', // 품목코드
                    itemNm: '', // 품목명
                    itemGrade: '', // 등급
                    udiYn: '', // UDI 신고 대상 유무
                    category: '', // 카테고리
                    unit: '', // 단위
                    standard: '', // 규격
                    rcperSalaryCode: '',
                    supplier: '', // 공급사
                    supplierNm: '', // 공급사 명
                    manufacturer: '', // 제조사
                    buyPrice: 0, // 매입단가
                    salesPrice: 0, // 매출단가
                    modelId: '',
                    entpName: '', // 업체명
                    fomlInfo: '', // 모델명
                    itemNoFullname: '', // 품목허가번호
                    medDevSeq: '', // modelSeq
                    seq: '', // seq
                    udiDiCode: '', // udiDiCode
                    udiEntpName: '',
                    udiItemName: '',
                    udiTypeName: '',
                    udiBrandName: '',
                    udiItemNoFullname: '',
                    udiGrade: '',
                }
            );
            this._itemService.getItems(0,40,'addDate','desc','');
        }else if(param.status === 'CANCEL'){

        }else{
            this.alert = {
                type   : 'error',
                message: param.msg
            };
            // Show the alert
            this.showAlert = true;
        }
    }


    itemCreate(): void
    {
        if(!this.selectedItemForm.invalid){
            this.showAlert = false;
            this._itemService.createItem(this.selectedItemForm.getRawValue()).subscribe((newItem: any) => {

                this._functionService.cfn_loadingBarClear();

                this.alertMessage(newItem);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '품목코드, 품목등급, UDI 대상유무, 품목명을 입력해주세요.'
            };

            // Show the alert
            this.showAlert = true;
        }
    }

    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }
}
