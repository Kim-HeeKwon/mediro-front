import {
    ChangeDetectorRef,
    Component, ElementRef,
    OnDestroy,
    OnInit, Renderer2, ViewChild,
} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {ItemPriceService} from '../item-price.service';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {takeUntil} from 'rxjs/operators';
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {formatDate} from "@angular/common";
import {FunctionService} from "../../../../../../@teamplat/services/function";

@Component({
    selector       : 'dms-item-price-new',
    templateUrl    : 'item-price-new.component.html',
    styleUrls      : ['item-price-new.component.scss']
})
export class ItemPriceNewComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    selectedItemPriceForm: FormGroup;
    type: CommonCode[] = null;
    filterList: string[];
    isMobile: boolean = false;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    minDate: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _functionService: FunctionService,
        public matDialogRef: MatDialogRef<ItemPriceNewComponent>,
        public _matDialogPopup: MatDialog,
        private _itemPriceService: ItemPriceService,
        private _formBuilder: FormBuilder,
        private _renderer: Renderer2,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
    ) {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'BL_TYPE',this.filterList);
        this.isMobile = this._deviceService.isMobile();
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this.selectedItemPriceForm = this._formBuilder.group({
            itemCd: [{value: '', disabled: true}, [Validators.required]], // ????????????
            itemNm: [{value:'', disabled:true}], // ?????????
            fomlInfo: [{value:'', disabled:true}], // ?????????
            refItemNm: [''], // ?????????
            account: [{value: '', disabled: true}, [Validators.required]], // ?????????
            accountNm: [{value:'', disabled:true}], // ????????????
            type: ['', [Validators.required]], // ??????
            unitPrice: [0, [Validators.required]], // ??????
            effectiveDate: ['', [Validators.required]], // ????????????
            active: [false]  // cell??????
        });

        this.minDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
    }

    openItemSearch(): void
    {
        if(!this.isMobile){
        const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
            data: {
                popup : 'P$_ALL_ITEM',
                headerText : '?????? ??????'
            },
            autoFocus: false,
            maxHeight: '90vh',
            disableClose: true
        });

        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this.selectedItemPriceForm.patchValue({'itemCd': result.itemCd});
                    this.selectedItemPriceForm.patchValue({'itemNm': result.itemNm});
                    this.selectedItemPriceForm.patchValue({'fomlInfo': result.fomlInfo});
                }
            });
    } else {
            const d =this._matDialogPopup.open(CommonPopupItemsComponent, {
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
            d.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.selectedItemPriceForm.patchValue({'itemCd': result.itemCd});
                        this.selectedItemPriceForm.patchValue({'itemNm': result.itemNm});
                        this.selectedItemPriceForm.patchValue({'fomlInfo': result.fomlInfo});
                    }
                    smallDialogSubscription.unsubscribe();
                });
        }
    }
    openAccountSearch(): void
    {
        if(!this.isMobile){
        const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
            data: {
                popup : 'P$_ACCOUNT',
                headerText : '????????? ??????'
            },
            autoFocus: false,
            maxHeight: '90vh',
            disableClose: true
        });

        popup.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this.selectedItemPriceForm.patchValue({'account': result.accountCd});
                    this.selectedItemPriceForm.patchValue({'accountNm': result.accountNm});
                }
            });
    } else {
            const d =this._matDialogPopup.open(CommonPopupItemsComponent, {
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
            d.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    if(result){
                        this.selectedItemPriceForm.patchValue({'account': result.accountCd});
                        this.selectedItemPriceForm.patchValue({'accountNm': result.accountNm});
                    }
                });
            smallDialogSubscription.unsubscribe();
        }
    }

    itemPriceCreate(): void
    {
        if(!this.selectedItemPriceForm.invalid){
            this.showAlert = false;
            this._itemPriceService.createItemPrice(this.selectedItemPriceForm.getRawValue()).subscribe((newItemPrice: any) => {

                this._functionService.cfn_loadingBarClear();

                this.alertMessage(newItemPrice);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '??????, ?????????, ??????, ??????, ??????????????? ??????????????????.'
            };

            // Show the alert
            this.showAlert = true;
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
            this._itemPriceService.getHeader(0,40,'addDate','desc','');
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

    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }

}
