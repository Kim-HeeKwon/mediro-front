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
    isProgressSpinner: boolean = false;
    isMobile: boolean = false;
    showAlert: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
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
            itemCd: ['', [Validators.required]], // 품목코드
            itemNm: [{value:'', disabled:true}], // 품목명
            account: ['', [Validators.required]], // 거래처
            accountNm: [{value:'', disabled:true}], // 거래처명
            type: ['', [Validators.required]], // 유형
            unitPrice: [0, [Validators.required]], // 단가
            active: [false]  // cell상태
        });
    }

    openItemSearch(): void
    {
        if(!this.isMobile){
        const popup =this._matDialogPopup.open(CommonPopupItemsComponent, {
            data: {
                popup : 'P$_ALL_ITEM',
                headerText : '품목 조회'
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
            this.isProgressSpinner = true;
            this.showAlert = false;
            this._itemPriceService.createItemPrice(this.selectedItemPriceForm.getRawValue()).subscribe((newItemPrice: any) => {

                this.alertMessage(newItemPrice);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '품목, 거래처, 유형, 단가를 입력해주세요.'
            };

            // Show the alert
            this.showAlert = true;
        }
    }

    alertMessage(param: any): void
    {
        if(param.status !== 'SUCCESS'){
            this.isProgressSpinner = false;
            this.alert = {
                type   : 'error',
                message: param.msg
            };
            // Show the alert
            this.showAlert = true;
        }else{
            this.isProgressSpinner = false;
            this.alert = {
                type   : 'success',
                message: '등록완료 하였습니다.'
            };
            // Show the alert
            this.showAlert = true;
            this._itemPriceService.getHeader(0,10,'itemNm','desc','');
        }
    }

    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }

}
