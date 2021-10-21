import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import RealGrid, {DataFieldObject, FormView, GridView, LocalDataProvider, ValueType} from 'realgrid';
import {FuseRealGridService} from "../../../../../@teamplat/services/realgrid";
import {Columns} from "../../../../../@teamplat/services/realgrid/realgrid.types";
import {AccountService} from "../../basic-info/account/account.service";
import {Observable, Subject} from "rxjs";
import {AccountData} from "../../basic-info/account/account.types";
import {takeUntil} from "rxjs/operators";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
    selector: 'app-realgrid',
    templateUrl: './realgrid.component.html',
    styleUrls: ['./realgrid.component.css']
})

export class RealgridComponent implements OnInit {

    accounts$: Observable<AccountData[]>;

    // @ts-ignore
    realgridColumns: Columns[];

    // @ts-ignore
    grid: RealGrid.GridView;
    // @ts-ignore
    realgridDataProvider: RealGrid.LocalDataProvider;
    realgridFields: DataFieldObject[] = [
        {fieldName: 'account', dataType: ValueType.TEXT},
        {fieldName: 'descr', dataType: ValueType.TEXT},
        {fieldName: 'accountType', dataType: ValueType.TEXT},
        {fieldName: 'address', dataType: ValueType.TEXT},
        {fieldName: 'addressDetail', dataType: ValueType.TEXT},
        {fieldName: 'representName', dataType: ValueType.TEXT},
        {fieldName: 'businessCategory', dataType: ValueType.TEXT},
        {fieldName: 'businessCondition', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessName', dataType: ValueType.TEXT},
        {fieldName: 'custBusinessNumber', dataType: ValueType.TEXT},
        {fieldName: 'phoneNumber', dataType: ValueType.TEXT},
        {fieldName: 'fax', dataType: ValueType.TEXT},
        {fieldName: 'email', dataType: ValueType.TEXT},
    ];
    accountType: CommonCode[] = null;
    searchForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _realGridsService: FuseRealGridService,
                private _formBuilder: FormBuilder,
                private _codeStore: CodeStore,
                private _utilService: FuseUtilsService,
                private _changeDetectorRef: ChangeDetectorRef,
                private _accountService: AccountService)
    {
        this.accountType = _utilService.commonValueFilter(_codeStore.getValue().data,'ACCOUNT_TYPE', ['ALL']);
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            accountType: ['ALL'],
            descr: [''],
            account: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.realgridColumns = [
            {name: 'account', fieldName: 'account', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '거래처'}},
            {name: 'descr', fieldName: 'descr', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '거래처 명'},
                },
            {name: 'accountType', fieldName: 'accountType', type: 'data', width: '100', styles: {textAlignment: 'center'},
                header: {text: '유형'},
                lookupDisplay: true,
                editor: this._realGridsService.gfn_ComboBox(this.accountType),
            },
            {name: 'address', fieldName: 'address', type: 'data', width: '200', styles: {textAlignment: 'left'}, header: {text: '주소'}},
            {name: 'addressDetail', fieldName: 'addressDetail', type: 'data', width: '200', styles: {textAlignment: 'left'}, header: {text: '상세주소'}},
            {name: 'addressDetail', fieldName: 'representName', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '대표자명'}},
            {name: 'businessCategory', fieldName: 'businessCategory', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '종목'}},
            {name: 'businessCondition', fieldName: 'businessCondition', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '업태'}},
            {name: 'custBusinessName', fieldName: 'custBusinessName', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '사업자명'}},
            {name: 'custBusinessNumber', fieldName: 'custBusinessNumber', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '사업자번호'}},
            {name: 'phoneNumber', fieldName: 'phoneNumber', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '전화번호'},
                placeHolder: ''},
            {name: 'fax', fieldName: 'fax', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '팩스'},
                placeHolder: ''},
            {name: 'email', fieldName: 'email', type: 'data', width: '100', styles: {textAlignment: 'left'}, header: {text: '이메일'},
                placeHolder: '이메일을 입력해주세요.'},
        ];

        this.realgridDataProvider = this._realGridsService.gfn_CreateDataProvider();
        this.grid = this._realGridsService.gfn_CreateGrid(
            this.realgridDataProvider,
            'realgrid',
            this.realgridColumns,
            this.realgridFields);

        const filter = [{name: '고객사',
            criteria: "value = 'CUST'"},
            {name: '공급사',
            criteria: "value = 'SUPR'"}];
        this._realGridsService.gfn_FilterGrid(this.grid,'accountType',filter);
        this._realGridsService.gfn_AutoFilterGrid(this.grid,'businessCategory',true);

        this.grid.setEditOptions({
            insertable: true,
            appendable: true,
            deletable: true,
        });
        this.grid.deleteSelection(true);
        //undo, Redo
        this.grid.undoable = true;

        // this.formView = this.grid._view.container.formView;
        // this.formView.visible = false;
        // this.formView.options.modal = true;
        // this.formView.options.modalPadding = '10% 8%';
        // this.formView.options.autoClose = true;
        // this.formView.options.saveLabel = '저장';
        // this.formView.options.cancelLabel = '취소';
        // this.formView.model.load({
        //     item:[{
        //         header: '거래처',
        //         column: 'account'
        //     },{
        //         header: '거래처 명',
        //         column: 'descr'
        //     },{
        //         header: 'accountType',
        //         column: 'accountType'
        //     },{
        //         header: 'address',
        //         column: 'address'
        //     },{
        //         header: 'businessCategory',
        //         column: 'businessCategory'
        //     },{
        //         header: 'businessCondition',
        //         column: 'businessCondition'
        //     },{
        //         header: 'custBusinessName',
        //         column: 'custBusinessName'
        //     },{
        //         header: 'custBusinessNumber',
        //         column: 'custBusinessNumber'
        //     },{
        //         header: 'email',
        //         column: 'email'
        //     },]
        // });
    }


    selectAccount(): void{
        this._accountService.getAccount(0,1000,'account','asc',{});

        this._accountService.accounts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((accounts: any) => {
                if(accounts != null){
                    this._realGridsService.gfn_DataSetGrid(this.grid, this.realgridDataProvider, accounts);
                    console.log(accounts);
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    saveAccount(): void {

    }

    addRow(): void {
        this.grid.beginAppendRow();
        this.grid.showEditor();
        this.grid.setFocus();
    }

    deleteRow(): void {
        const curr = this.grid.getCurrent();
        this.realgridDataProvider.removeRow(curr.dataRow);
    }

    excelExport(): void{
        this._realGridsService.gfn_ExcelExportGrid(this.grid);
    }

    mobile(): void{
        if (this.grid.getCurrent().itemIndex === -1) {
            this.grid.setFocus();
        }
        // this.formView.visible = true;
    }

}



