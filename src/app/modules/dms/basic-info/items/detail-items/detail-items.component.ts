import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef, Inject,
    OnDestroy,
    OnInit, Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FuseAlertType} from '../../../../../../@teamplat/components/alert';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {InventoryItem} from '../items.types';
import {Observable, Subject} from 'rxjs';
import {ItemsService} from '../items.service';
import {takeUntil} from 'rxjs/operators';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";

@Component({
    selector       : 'dms-app-items-detail',
    templateUrl    : 'detail-items.component.html',
    styleUrls      : ['detail-items.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class DetailItemsComponent implements  OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    selectedItem: InventoryItem | null = null;
    showAlert: boolean = false;
    isMobile: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    itemGrades: CommonCode[] = [];
    udiYn: CommonCode[] = [];
    itemUnit: CommonCode[] = [];
    taxGbn: CommonCode[] = [];
    selectedItemsForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        private _functionService: FunctionService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<DetailItemsComponent>,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _changeDetectorRef: ChangeDetectorRef,
        private _itemService: ItemsService,
        private _renderer: Renderer2,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _deviceService: DeviceDetectorService,
        private _utilService: FuseUtilsService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.taxGbn = _utilService.commonValueSearchFilter(_codeStore.getValue().data,'TAX_GBN', ['ALL']);
        this.itemUnit = _utilService.commonValue(_codeStore.getValue().data,'ITEM_UNIT');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.udiYn = _utilService.commonValue(_codeStore.getValue().data,'UDI_YN');
        this.isMobile = this._deviceService.isMobile();

        this.selectedItem = data.selectedItem;
    }
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {

        this.selectedItemsForm = this._formBuilder.group({
            itemCd: [{value:'',disabled:true}], // ????????????
            itemNm: ['', [Validators.required]], // ?????????
            itemGrade: [{value:'',disabled:true}], // ??????
            udiYn: [{value:''}], // UDI ?????? ?????? ??????
            category: [''], // ????????????
            unit: [''], // ??????
            rcperSalaryCode: [''],
            standard: [''], // ??????
            supplier: [{value:''}], // ?????????
            supplierNm: [{value:'',disabled:true}], // ????????? ???
            manufacturer: [''], // ?????????
            fomlInfo: [{value:'',disabled:true}], // ?????????
            itemNoFullname: [{value:'',disabled:true}], // ??????????????????
            taxGbn: [''], // ????????????
            buyPrice: [''], // ????????????
            salesPrice: [''], // ????????????
            active: [false]  // cell??????
        });

        this.selectedItemsForm.controls.supplierNm.disable();

        if(this.selectedItem !== null){
            this.selectedItemsForm.patchValue(
                this.selectedItem
            );
        }
    }
    /**
     * ????????????
     */
    // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures,@typescript-eslint/explicit-function-return-type
    updateItem() {
        const itemData = this.selectedItemsForm.getRawValue();
        this._itemService.updateItem(itemData)
            .subscribe(
                (param: any) => {
                    this._functionService.cfn_loadingBarClear();

                    this.alertMessage(param);

                    // Mark for check
                    this._changeDetectorRef.markForCheck();

                },(response) => {
                });
    }

    alertMessage(param: any): void
    {
        if(param.status === 'SUCCESS'){
            this.matDialogRef.close();
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

    /**
     * ??????
     */
    deleteItem(): void
    {
        const itemData = this.selectedItemsForm.getRawValue();

        const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
            title      : '',
            message    : '?????????????????????????',
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: '??????',
                    color: 'warn'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: '??????'
                })
            }),
            dismissible: true
        }).value);
        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result) {
                    this._itemService.deleteItem(itemData)
                        .subscribe(
                            (param: any) => {
                                this._functionService.cfn_loadingBarClear();

                                this.alertMessage(param);

                                // Mark for check
                                this._changeDetectorRef.markForCheck();

                            },(response) => {
                            });
                }else{
                }
            });
    }

    closeDaumPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
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
                        this.selectedItemsForm.patchValue({'supplier': result.accountCd});
                        this.selectedItemsForm.patchValue({'supplierNm': result.accountNm});
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
                        this.selectedItemsForm.patchValue({'supplier': result.accountCd});
                        this.selectedItemsForm.patchValue({'supplierNm': result.accountNm});
                    }
                });
        }
    }

}
