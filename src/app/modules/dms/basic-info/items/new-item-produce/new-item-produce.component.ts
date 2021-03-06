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
            itemCd: ['', [Validators.required]], // ????????????
            itemNm: ['', [Validators.required]], // ?????????
            itemGrade: ['', [Validators.required]], // ??????
            udiYn: ['', [Validators.required]], // UDI ?????? ?????? ??????
            category: [''], // ????????????
            unit: [], // ??????
            standard: [''], // ??????
            rcperSalaryCode: [''],
            supplier: [''], // ?????????
            supplierNm: [{value:'', disabled: true}], // ????????? ???
            manufacturer: [''], // ?????????
            buyPrice: [0, [Validators.required]], // ????????????
            salesPrice: [0, [Validators.required]], // ????????????
            entpName: [], // ?????????
            fomlInfo: [], // ?????????
            modelId: [],

            udiEntpName: [],
            udiItemName: [],
            udiTypeName: [],
            udiBrandName: [],
            udiItemNoFullname: [],
            udiGrade: [],

            itemNoFullname: [], // ??????????????????
            medDevSeq: [], // modelSeq
            seq: [], // seq
            udiDiCode: [], // udiDiCode
            active: [false]  // cell??????
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
                    headerText: '????????? ??????',
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
                    headerText: '????????? ??????'
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
                    // itemName: "????????????????????????????????????"
                    // meddevItemSeq: "2013001322"
                    // modelName: "BDM401MHC"
                    // permitDate: "2013-02-21"
                    // permitItemNo: "?????? 13-417 ???"
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
                message: '???????????? ???????????????.'
            };
            // Show the alert
            this.showAlert = true;
            this.selectedItemForm.patchValue({
                    itemCd: '', // ????????????
                    itemNm: '', // ?????????
                    itemGrade: '', // ??????
                    udiYn: '', // UDI ?????? ?????? ??????
                    category: '', // ????????????
                    unit: '', // ??????
                    standard: '', // ??????
                    rcperSalaryCode: '',
                    supplier: '', // ?????????
                    supplierNm: '', // ????????? ???
                    manufacturer: '', // ?????????
                    buyPrice: 0, // ????????????
                    salesPrice: 0, // ????????????
                    modelId: '',
                    entpName: '', // ?????????
                    fomlInfo: '', // ?????????
                    itemNoFullname: '', // ??????????????????
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
                message: '????????????, ????????????, UDI ????????????, ???????????? ??????????????????.'
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
