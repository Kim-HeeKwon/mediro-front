import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
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

@Component({
    selector       : 'item-price-new',
    templateUrl    : './item-price-new.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class ItemPriceNewComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    isMobile: boolean = false;
    selectedItemPriceForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    filterList: string[];
    // eslint-disable-next-line @typescript-eslint/member-ordering
    type: CommonCode[] = null;
    constructor(
        public matDialogRef: MatDialogRef<ItemPriceNewComponent>,
        public _matDialogPopup: MatDialog,
        private _itemPriceService: ItemPriceService,
        private _formBuilder: FormBuilder,
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

    /**
     * On init
     */
    ngOnInit(): void
    {
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
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    itemPriceCreate(): void
    {
        if(!this.selectedItemPriceForm.invalid){
            this.showAlert = false;
            //console.log(this.selectedItemForm.getRawValue());
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
            this.alert = {
                type   : 'error',
                message: param.msg
            };
            // Show the alert
            this.showAlert = true;
        }else{
            this.alert = {
                type   : 'success',
                message: '등록완료 하였습니다.'
            };
            // Show the alert
            this.showAlert = true;
            this._itemPriceService.getHeader(0,10,'itemNm','desc','');
        }
    }
    openAccountSearch(): void
    {
        const popup =this._matDialogPopup.open(CommonPopupComponent, {
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
    }
    openItemSearch(): void
    {
        const popup =this._matDialogPopup.open(CommonPopupComponent, {
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
    }
}
