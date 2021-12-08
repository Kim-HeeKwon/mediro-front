import {
    ChangeDetectionStrategy,
    Component,
    ElementRef, Inject,
    OnDestroy,
    OnInit, Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
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
    isProgressSpinner: boolean = false;
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
        @Inject(MAT_DIALOG_DATA) public data: any,
        public matDialogRef: MatDialogRef<DetailItemsComponent>,
        private _formBuilder: FormBuilder,
        private _itemService: ItemsService,
        private _renderer: Renderer2,
        private _codeStore: CodeStore,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _deviceService: DeviceDetectorService,
        private _utilService: FuseUtilsService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.taxGbn = _utilService.commonValue(_codeStore.getValue().data,'TAX_GBN');
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
            itemCd: [{value:'',disabled:true}], // 품목코드
            itemNm: ['', [Validators.required]], // 품목명
            itemGrade: [{value:'',disabled:true}], // 등급
            udiYn: [{value:''}], // UDI 신고 대상 유무
            category: [''], // 카테고리
            unit: [''], // 단위
            standard: [''], // 규격
            supplier: [{value:'',disabled:true}], // 공급사
            taxGbn: [''], // 거래유형
            buyPrice: [''], // 구매단가
            salesPrice: [''], // 판매단가
            active: [false]  // cell상태
        });


        if(this.selectedItem !== null){
            this.selectedItemsForm.patchValue(
                this.selectedItem
            );
        }
    }
    /**
     * 업데이트
     */
    // eslint-disable-next-line @typescript-eslint/adjacent-overload-signatures,@typescript-eslint/explicit-function-return-type
    updateItem() {
        const itemData = this.selectedItemsForm.getRawValue();
        this._itemService.updateItem(itemData)
            .subscribe(
                (param: any) => {
                    if(param.status === 'SUCCESS'){
                        this.matDialogRef.close();
                    }

                },(response) => {
                });
    }

    /**
     * 삭제
     */
    deleteItem(): void
    {
        const itemData = this.selectedItemsForm.getRawValue();

        const confirmation = this._teamPlatConfirmationService.open(this._formBuilder.group({
            title      : '',
            message    : '삭제하시겠습니까?',
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:exclamation',
                color: 'warn'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : true,
                    label: '삭제',
                    color: 'warn'
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: '닫기'
                })
            }),
            dismissible: true
        }).value);
        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if (result) {
                    this.isProgressSpinner = true;
                    this._itemService.deleteItem(itemData)
                        .subscribe(
                            (param: any) => {
                                if(param.status === 'SUCCESS'){
                                    this.matDialogRef.close();
                                }

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

}
