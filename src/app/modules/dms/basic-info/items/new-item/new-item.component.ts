import {
    ChangeDetectorRef,
    Component, ElementRef,
    OnDestroy,
    OnInit, Renderer2, ViewChild,
} from '@angular/core';
import {Observable, Subject, throwError} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseAlertType} from '@teamplat/components/alert';
import {ItemsService} from '../items.service';
import {ItemSearchComponent} from '@teamplat/components/item-search';
import {CommonCode, FuseUtilsService} from '@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {CommonPopupItemsComponent} from "../../../../../../@teamplat/components/common-popup-items";
import {takeUntil} from "rxjs/operators";

@Component({
    selector       : 'dms-new-item',
    templateUrl    : 'new-item.component.html',
    styleUrls      : ['new-item.component.scss']
})
export class NewItemComponent implements OnInit, OnDestroy
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
        public matDialogRef: MatDialogRef<NewItemComponent>,
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
        this.itemGrades = _utilService.commonValueFilter(_codeStore.getValue().data,'ITEM_GRADE', ['ALL']);
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
            supplier: [''], // 공급사
            manufacturer: [''], // 제조사
            buyPrice: [, [Validators.required]], // 매입단가
            salesPrice: [, [Validators.required]], // 매출단가
            entpName: [], // 업체명
            fomlInfo: [], // 모델명
            itemNoFullname: [], // 품목허가번호
            medDevSeq: [], // modelSeq
            udiDiCode: [], // udiDiCode
            active: [false]  // cell상태
        });
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
                        this.selectedItemForm.patchValue({'supplier': result.accountNm});
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
                        this.selectedItemForm.patchValue({'supplier': result.accountNm});
                    }
                });
        }
    }


    openItemSearch(): void
    {
        if(!this.isMobile){
            const popup =this._matDialogPopup.open(ItemSearchComponent, {
                data: {
                    popup : 'P$_ACCOUNT'
                },
                autoFocus: false,
                maxHeight: '90vh',
                disableClose: true
            });

            popup.afterClosed().subscribe((result) => {
                if(result){
                    if(result.modelId === ''){
                        result.modelId = result.medDevSeq;
                    }
                    this.selectedItemForm.patchValue({'itemCd': result.modelId});
                    this.selectedItemForm.patchValue({'itemNm': result.itemName});
                    this.selectedItemForm.patchValue({'itemGrade': result.grade});
                    this.selectedItemForm.patchValue({'entpName': result.entpName});
                    this.selectedItemForm.patchValue({'fomlInfo': result.typeName});
                    this.selectedItemForm.patchValue({'itemNoFullname': result.itemNoFullname});
                    this.selectedItemForm.patchValue({'medDevSeq': result.medDevSeq});
                    this.selectedItemForm.patchValue({'udiDiCode': result.udidiCode});
                    this.selectedItemForm.patchValue({'manufacturer': result.entpName});
                    this.selectedItemForm.patchValue({'udiYn': 'Y'});
                    this.is_edit = true;
                }
            });
        }else{
            const d = this._matDialogPopup.open(ItemSearchComponent, {
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
                    if(result.modelId === ''){
                        result.modelId = result.medDevSeq;
                    }
                    this.selectedItemForm.patchValue({'itemCd': result.modelId});
                    this.selectedItemForm.patchValue({'itemNm': result.itemName});
                    this.selectedItemForm.patchValue({'itemGrade': result.grade});
                    this.selectedItemForm.patchValue({'entpName': result.entpName});
                    this.selectedItemForm.patchValue({'fomlInfo': result.typeName});
                    this.selectedItemForm.patchValue({'itemNoFullname': result.itemNoFullname});
                    this.selectedItemForm.patchValue({'medDevSeq': result.medDevSeq});
                    this.selectedItemForm.patchValue({'udiDiCode': result.udidiCode});
                    this.selectedItemForm.patchValue({'manufacturer': result.entpName});
                    this.selectedItemForm.patchValue({'udiYn': 'Y'});
                    this.is_edit = true;
                }
                smallDialogSubscription.unsubscribe();
            });
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
            this._itemService.getItems(0,40,'addDate','desc','');
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
                message: '품목코드, 품목등급, UDI 대상유무, 품목명, (매입, 매출) 단가를 입력해주세요.'
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
