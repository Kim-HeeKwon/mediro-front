import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {Subject} from 'rxjs';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {FuseAlertType} from '@teamplat/components/alert';
import {fuseAnimations} from '@teamplat/animations';


@Component({
    selector       : 'new-item',
    templateUrl    : './new-item.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class NewItemComponent implements OnInit, OnDestroy
{

    selectedItemForm: FormGroup;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    showAlert: boolean = false;

    // eslint-disable-next-line @typescript-eslint/member-ordering
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
        }];

    constructor(
        public matDialogRef: MatDialogRef<NewItemComponent>,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
    ) {
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
            standard: ['KG'], // 규격
            supplier: [''], // 공급사
            buyPrice: [], // 구매단가
            salesPrice: [], // 판매단가
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
            console.log(this.selectedItemForm.getRawValue());
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

    supplierSearch(): void
    {
        console.log('clisk');
    }
}
