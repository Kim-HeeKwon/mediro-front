import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CommonCode, CommonPopup, FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {PopupStore} from "../../../../../core/common-popup/state/popup.store";
import {FormBuilder, FormGroup} from "@angular/forms";
import {PopupService} from "./popup.service";
import {BehaviorSubject, Observable} from "rxjs";
import {AccountData, AccountPagenation} from "../../../basic-info/account/account.types";
import {PopupPagenation} from "./popup.types";

export interface DisplayedColumn{
    id: string;
}

export interface Column{
    id: string;
    name: string;
}

/*export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
}*/
/*
const ELEMENT_DATA: PeriodicElement[] = [
    {position: 1, name: 'Hydrogen', weight: 100, symbol: 'H'},
    {position: 2, name: 'Helium', weight: 100, symbol: 'He'},
    {position: 3, name: 'Lithiumsssssssss', weight: 100.941, symbol: 'Li'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
    {position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be'},
];
*/

@Component({
    selector: 'app-popup',
    templateUrl: './popup.component.html',
    styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

    isLoading: boolean = false;
    displayedColumns: DisplayedColumn[];
    clickedRows = new Set<any>();
    getList$: Observable<any>;
    searchForm: FormGroup;
    popupInfo: CommonPopup[] = null;
    asPopupCd: string;
    pagenation: PopupPagenation | null = null;

    accountNm1 = '고객사';
    accountNm2 = '고객사 명';

    type: CommonCode[] = [];

    private _dataSet: BehaviorSubject<any> = new BehaviorSubject(null);

    constructor(
        public _matDialogRef: MatDialogRef<PopupComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _popupService: PopupService,
        private _popupStore: PopupStore) {
        this.popupInfo = _utilService.commonPopupValue(_popupStore.getValue().data, data.popup);
        this.asPopupCd = data.popup;
    }

    ngOnInit(): void {

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            searchText: [''],
            type: [''],
            asPopupCd: [''],
            acWhereVal: ['']
        });
        this.getList$ = null;

        const commonValues: Column[] = [];
        const displayCommonValue: DisplayedColumn[] = [];
        this.popupInfo.forEach((param: any) => {
            const commonValue: Column = {
                id: param.extColId,              //컬럼ID;
                name: param.extColNm,            //컬럼명;
            };
            this.type.push({
                id : param.extColId,
                name : param.extColNm,
            });

            if(param.extColCondGbnVal === 'K'){
                this.searchForm.patchValue({'type' : param.extColId});
            }

            displayCommonValue.push(param.extColId);
            commonValues.push(commonValue);

        });

        this.displayedColumns = displayCommonValue;

    }

    selectRow(row: any): void{
        this._matDialogRef.close(row);
    }

    select(): void{
        this.searchForm.patchValue({'asPopupCd': this.asPopupCd});
        this.searchForm.patchValue({'acWhereVal': 'K:LIKE_BOTH:'});
        this._popupService.getDynamicSql(0,10,'account','asc',this.searchForm.getRawValue());

        // getList
        this.getList$ = this._popupService.getList$;
    }
}
