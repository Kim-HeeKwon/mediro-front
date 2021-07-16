import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {Observable, Subject, throwError} from 'rxjs';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseAlertType} from '@teamplat/components/alert';
import {fuseAnimations} from '@teamplat/animations';
import {ItemsService} from '../items.service';
import {ItemSearchComponent} from '@teamplat/components/item-search';
import {CommonCode, FuseUtilsService} from '@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {DeviceDetectorService} from "ngx-device-detector";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";

@Component({
    selector       : 'new-item',
    templateUrl    : './new-item.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class NewItemComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );

    isMobile: boolean = false;
    selectedItemForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;
    itemGrades: any[] = [
        {
            id: '1',
            name: '1 등급'
        },
        {
            id: '2',
            name: '2 등급'
        },
        {
            id: '3',
            name: '3 등급'
        },
        {
            id: '4',
            name: '4 등급'
        }];
    is_edit:boolean = false;
    itemUnit: CommonCode[] = [];
    itemStandard: CommonCode[] = [];

    constructor(
        public matDialogRef: MatDialogRef<NewItemComponent>,
        public _matDialogPopup: MatDialog,
        private _itemService: ItemsService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver,
    ) {
        this.itemUnit = _utilService.commonValue(_codeStore.getValue().data,'ITEM_UNIT');
        this.itemStandard = _utilService.commonValue(_codeStore.getValue().data,'ITEM_UNIT');
        this.isMobile = this._deviceService.isMobile();
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.selectedItemForm = this._formBuilder.group({
            itemCd: ['', [Validators.required]], // 품목코드
            itemNm: ['', [Validators.required]], // 품목명
            itemGrade: [3], // 등급
            category: [''], // 카테고리
            unit: ['PKG'], // 단위
            standard: ['PKG'], // 규격
            supplier: [''], // 공급사
            buyPrice: [], // 구매단가
            salesPrice: [], // 판매단가
            entpName: [], // 업체명
            typeName: [], // 모델명
            itemNoFullname: [], // 품목허가번호
            medDevSeq: [], // modelSeq
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

    itemCreate(): void
    {
        if(!this.selectedItemForm.invalid){
            this.showAlert = false;
            //console.log(this.selectedItemForm.getRawValue());
            this._itemService.createItem(this.selectedItemForm.getRawValue()).subscribe((newItem: any) => {

                this.alertMessage(newItem);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        }else{
            // Set the alert
            this.alert = {
                type   : 'error',
                message: '품목코드와 품목명을 입력해주세요.'
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
            this._itemService.getItems(0,10,'itemCd','asc','');
        }
    }

    supplierSearch(): void
    {
        console.log('clisk');
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
                    this.selectedItemForm.patchValue({'itemCd': result.modelId});
                    this.selectedItemForm.patchValue({'itemNm': result.itemName});
                    this.selectedItemForm.patchValue({'itemGrade': result.grade});
                    this.selectedItemForm.patchValue({'entpName': result.entpName});
                    this.selectedItemForm.patchValue({'typeName': result.typeName});
                    this.selectedItemForm.patchValue({'itemNoFullname': result.itemNoFullname});
                    this.selectedItemForm.patchValue({'medDevSeq': result.medDevSeq});
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
                    this.selectedItemForm.patchValue({'itemCd': result.modelId});
                    this.selectedItemForm.patchValue({'itemNm': result.itemName});
                    this.selectedItemForm.patchValue({'itemGrade': result.grade});
                    this.selectedItemForm.patchValue({'entpName': result.entpName});
                    this.selectedItemForm.patchValue({'typeName': result.typeName});
                    this.selectedItemForm.patchValue({'itemNoFullname': result.itemNoFullname});
                    this.selectedItemForm.patchValue({'medDevSeq': result.medDevSeq});
                    this.is_edit = true;
                }
                smallDialogSubscription.unsubscribe();
            });
        }
    }
}
