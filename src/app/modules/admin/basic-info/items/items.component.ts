import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {InventoryItem} from './items.types';

@Component({
    selector: 'app-items',
    templateUrl: './items.component.html',
    styleUrls: ['./items.component.scss']
})
export class ItemsComponent implements OnInit, AfterViewInit, OnDestroy {

    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    itemsCount: number = 1;
    itemsTableColumns: string[] = ['details', 'itemCd', 'itemNm', 'grade','category','unit','standard','supplier','buyPrice','sellPrice'];
    selectedItemsForm: FormGroup;
    selectedProduct: InventoryItem | null = null;

    formFieldHelpers: string[] = [''];

    items: any = [{'mId': 'test1', 'itemCd': '1', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '2', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '3', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '4', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '5', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '6', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '7', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '8', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '9', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '10', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '11', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},
        {'mId': 'test1', 'itemCd': '12', 'itemNm': '1000', 'grade':'1', 'category':'재료','unit':'pkg','standard':'소','supplier':'메디로','buyPrice':'100','sellPrice':'200'},];

    pagination: any = {
        endIndex: 9,
        lastPage: 3,
        length: 23,
        page: 0,
        size: 10,
        startIndex: 0
    };

    constructor(
        private _formBuilder: FormBuilder,
    ) {
    }

    ngOnInit(): void {
        // 아이템(품목) Form 생성
        this.selectedItemsForm = this._formBuilder.group({
            mId: [''], // 회원아이디
            itemCd: ['', [Validators.required]], // 품목코드
            itemNm: ['', [Validators.required]], // 품목명
            grade: [''], // 등급
            category: [''], // 카테고리
            unit: [''], // 단위
            standard: [''], // 규격
            supplier: [''], // 공급단가
            buyPrice: [''], // 구매단가
            sellPrice: [''], // 판매단가
            active: [false]  // cell상태
        });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {

    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        //this._unsubscribeAll.next();
        //this._unsubscribeAll.complete();
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    rowClick(itemCd: any): void{
        console.log('rowClick');
    }


}
