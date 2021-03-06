import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit, ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {InboundService} from '../inbound.service';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {MatTable} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import {merge, Observable, Subject} from 'rxjs';
import {InBound, InBoundDetail, InBoundDetailPagenation} from '../inbound.types';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {CommonUdiRtnScanComponent} from '../../../../../../@teamplat/components/common-udi-rtn-scan';
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector       : 'inbound-detail',
    templateUrl    : './inbound-detail.component.html',
    styleUrls: ['./inbound-detail.component.scss'],
})
export class InboundDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _inBoundDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _inBoundDetailSort: MatSort;
    isLoading: boolean = false;
    selection = new SelectionModel<any>(true, []);
    inboundDetailsCount: number = 0;
    inBoundHeaderForm: FormGroup;
    inBoundDetails$ = new Observable<InBoundDetail[]>();
    inBoundDetailsTableStyle: TableStyle = new TableStyle();
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    inBoundDetailsTable: TableConfig[] = [
        {headerText : '????????????' , dataField : 'ibLineNo', display : false},
        {headerText : '????????????' , dataField : 'itemCd', width: 70, display : true, type: 'text',validators: true},
        {headerText : '?????????' , dataField : 'itemNm', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '????????????' , dataField : 'itemGrade', width: 60, display : true, disabled : true, type: 'text',combo : true},
        {headerText : '??????' , dataField : 'standard', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'unit', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '??????????????????' , dataField : 'ibExpQty', width: 100, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '??????' , dataField : 'qty', width: 60, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '????????????' , dataField : 'ibQty', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'unitPrice', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'totalAmt', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '????????????' , dataField : 'lot1', width: 60, display : false, disabled : true, type: 'date'},
        {headerText : '????????????' , dataField : 'lot2', width: 100, display : true, type: 'date'},
        {headerText : '????????? lot' , dataField : 'lot3', width: 100, display : true, type: 'text'},
        {headerText : 'UDI No.' , dataField : 'lot4', width: 100, display : true, type: 'text'},
        {headerText : 'lot5' , dataField : 'lot5', width: 100, display : false, type: 'text'},
        {headerText : 'lot6' , dataField : 'lot6', width: 100, display : false, type: 'text'},
        {headerText : 'lot7' , dataField : 'lot7', width: 100, display : false, type: 'text'},
        {headerText : 'lot8' , dataField : 'lot8', width: 100, display : false, type: 'text'},
        {headerText : 'lot9' , dataField : 'lot9', width: 100, display : false, type: 'text'},
        {headerText : 'lot10' , dataField : 'lot10', width: 100, display : false, type: 'text'},
        {headerText : '??????' , dataField : 'remarkDetail', width: 100, display : false, type: 'text'},
        /*{headerText : '????????????' , dataField : 'ibLineNo', display : false},
        {headerText : '????????????' , dataField : 'itemCd', width: 60, display : true, type: 'text'},
        {headerText : '?????????' , dataField : 'itemNm', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '????????????' , dataField : 'itemGrade', width: 60, display : true, disabled : true, type: 'text',combo : true},
        {headerText : '??????' , dataField : 'standard', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '??????' , dataField : 'unit', width: 60, display : true, disabled : true, type: 'text'},
        {headerText : '??????????????????' , dataField : 'ibExpQty', width: 100, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'qty', width: 60, display : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '????????????' , dataField : 'ibQty', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'unitPrice', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'totalAmt', width: 60, display : true, disabled : true, type: 'number', style: this.inBoundDetailsTableStyle.textAlign.right},
        {headerText : '????????????' , dataField : 'lot1', width: 60, display : false, disabled : true, type: 'date'},
        {headerText : '????????????' , dataField : 'lot2', width: 100, display : true, type: 'date'},
        {headerText : '????????? lot' , dataField : 'lot3', width: 100, display : true, type: 'text'},
        {headerText : 'UDI No.' , dataField : 'lot4', width: 100, display : true, type: 'text'},
        {headerText : 'lot5' , dataField : 'lot5', width: 100, display : false, type: 'text'},
        {headerText : 'lot6' , dataField : 'lot6', width: 100, display : false, type: 'text'},
        {headerText : 'lot7' , dataField : 'lot7', width: 100, display : false, type: 'text'},
        {headerText : 'lot8' , dataField : 'lot8', width: 100, display : false, type: 'text'},
        {headerText : 'lot9' , dataField : 'lot9', width: 100, display : false, type: 'text'},
        {headerText : 'lot10' , dataField : 'lot10', width: 100, display : false, type: 'text'},
        {headerText : '??????' , dataField : 'remarkDetail', width: 100, display : false, type: 'text'},*/
    ];
    inBoundDetailsTableColumns: string[] = [
        'select',
        'no',
        'ibLineNo',
        'itemCd',
        'itemNm',
        'itemGrade',
        'standard',
        'unit',
        'ibExpQty',
        'qty',
        'ibQty',
        'unitPrice',
        'totalAmt',
        'lot1',
        'lot2',
        'lot3',
        'lot4',
        'lot5',
        'lot6',
        'lot7',
        'lot8',
        'lot9',
        'lot10',
        'remarkDetail',
    ];
    itemGrades: CommonCode[] = null;
    type: CommonCode[] = null;
    status: CommonCode[] = null;

    inBoundDetailPagenation: InBoundDetailPagenation | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // @ts-ignore
    /**
     * Constructor
     */
    constructor(
        private _inboundService: InboundService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _codeStore: CodeStore,
        private _functionService: FunctionService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.isMobile = this._deviceService.isMobile();
        this.type = _utilService.commonValue(_codeStore.getValue().data,'IB_TYPE');
        this.status = _utilService.commonValue(_codeStore.getValue().data,'IB_STATUS');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.inBoundDetails$ = this._inboundService.inBoundDetails$;
        this._inboundService.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail: any) => {
                // Update the counts
                if(inBoundDetail !== null){
                    this.inboundDetailsCount = inBoundDetail.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // Form ??????
        this.inBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            ibNo: [{value:'',disabled:true}],   // ????????????
            account: [{value:'',disabled:true},[Validators.required]], // ????????? ??????
            accountNm: [{value:'',disabled:true}],   // ????????? ???
            type: [{value:'',disabled:true}, [Validators.required]],   // ??????
            status: [{value:'',disabled:true}, [Validators.required]],   // ??????
            supplier: [{value:'',disabled:true}],   // ?????????
            supplierNm: [{value:'',disabled:true}],   // ????????? ???
            ibCreDate: [{value:'',disabled:true}],//?????????
            ibDate: [{value:'',disabled:true}], //?????????
            remarkHeader: [''], //??????
            poNo: [{value:'',disabled:true}],   // ????????????
            active: [false]  // cell??????
        });
        this._inboundService.inBoundHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBound: any) => {
                // Update the pagination
                if(inBound !== null){
                    this.inBoundHeaderForm.patchValue(inBound);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.tableEditingEvent();

        this._inboundService.inBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetailPagenation: InBoundDetailPagenation) => {
                // Update the pagination
                if(inBoundDetailPagenation !== null){
                    this.inBoundDetailPagenation = inBoundDetailPagenation;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        let inBoundHeader = null;

        this._inboundService.inBoundHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBound: any) => {
                // Update the pagination
                if(inBound !== null){
                    inBoundHeader = inBound;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if(inBoundHeader === null){
            inBoundHeader = {};
        }

        if(this._inBoundDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._inBoundDetailSort.sortChange, this._inBoundDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._inboundService.getDetail(this._inBoundDetailPagenator.pageIndex, this._inBoundDetailPagenator.pageSize, this._inBoundDetailSort.active, this._inBoundDetailSort.direction, inBoundHeader);
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).pipe(takeUntil(this._unsubscribeAll)).subscribe();
        }
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, inBoundDetail: any): any {
        return inBoundDetail.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveIn() {
        const status = this.inBoundHeaderForm.controls['status'].value;

        //????????? ????????? ?????????
        if(status !== 'N'){
            this._functionService.cfn_alert('?????? ??? ??? ????????????.');
            return;
        }

        if(this.inBoundHeaderForm.controls['status'].value !== 'N'){
            this._functionService.cfn_alert('?????? ??????????????? ????????? ???????????????.');
            return;
        }

        if(!this.inBoundHeaderForm.invalid){

            let detailCheck = false;
            this.inBoundDetails$.pipe(takeUntil(this._unsubscribeAll))
                .subscribe((data) => {

                    if(data.length === 0){
                        this._functionService.cfn_alert('??????????????? ?????? ????????????.');
                        detailCheck = true;
                    }
                });

            if(detailCheck){
                return;
            }

            const validCheck = this._functionService.cfn_validator('????????????',
                this.inBoundDetails$,
                this.inBoundDetailsTable);

            if(validCheck){
                return;
            }

            const confirmation = this._teamPlatConfirmationService.open({
                title : '',
                message: '?????????????????????????',
                actions: {
                    confirm: {
                        label: '??????'
                    },
                    cancel: {
                        label: '??????'
                    }
                }
            });
            confirmation.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    let createList;
                    let updateList;
                    let deleteList;
                    if(result){
                        createList = [];
                        updateList = [];
                        deleteList = [];
                        this.inBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBoundDetail) => {
                                inBoundDetail.forEach((sendData: any) => {
                                    if (sendData.flag) {
                                        if (sendData.flag === 'C') {
                                            createList.push(sendData);
                                        } else if (sendData.flag === 'U') {
                                            updateList.push(sendData);
                                        } else if (sendData.flag === 'D') {
                                            deleteList.push(sendData);
                                        }
                                    }
                                });
                            });
                        let inBoundHeader = null;

                        this._inboundService.inBoundHeader$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBound: any) => {
                                // Update the pagination
                                if(inBound !== null){
                                    inBoundHeader = inBound;
                                }
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });

                        if(inBoundHeader === null){
                            inBoundHeader = {};
                        }
                        if (createList.length > 0) {
                            this.createIn(createList,inBoundHeader);
                        }
                        if(!this.inBoundHeaderForm.untouched){
                            if (updateList.length > 0) {
                                this.updateIn(updateList);
                            }else{
                                this.updateIn([],this.inBoundHeaderForm);
                            }
                        }else{
                            if (updateList.length > 0) {
                                this.updateIn(updateList);
                            }
                        }
                        if (deleteList.length > 0) {
                            this.deleteIn(deleteList,inBoundHeader);
                        }
                    };
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: InBound[],inBoundHeader?: any) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            /*sendData[i].account = inBoundHeader['account'];
            sendData[i].ibNo = inBoundHeader['ibNo'];
            sendData[i].type = inBoundHeader['type'];
            sendData[i].status = inBoundHeader['status'];
            sendData[i].supplier = inBoundHeader['supplier'];
            sendData[i].remarkHeader = inBoundHeader['remarkHeader'];*/
            sendData[i].account = this.inBoundHeaderForm.controls['account'].value;
            sendData[i].ibNo = this.inBoundHeaderForm.controls['ibNo'].value;
            sendData[i].type = this.inBoundHeaderForm.controls['type'].value;
            sendData[i].status = this.inBoundHeaderForm.controls['status'].value;
            sendData[i].supplier = this.inBoundHeaderForm.controls['supplier'].value;
            sendData[i].remarkHeader = this.inBoundHeaderForm.controls['remarkHeader'].value;
        }
        return sendData;
    }

    /* ??????
     *
     * @param sendData
     */
    createIn(sendData: InBound[],inBoundHeader: any): void{
        if(sendData){
            sendData = this.headerDataSet(sendData,inBoundHeader);
            this._inboundService.createIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                });
        }
    }
    /* ??????
     *
     * @param sendData
     */
    updateIn(sendData: InBound[], headerForm?: FormGroup): void{
        if(headerForm !== undefined){

            sendData.push(headerForm.getRawValue());

            this._inboundService.updateIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                });

        }else{
            if(sendData){
                sendData = this.headerDataSet(sendData);

                this._inboundService.updateIn(sendData)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((inBound: any) => {
                    });
            }
        }

    }

    /* ??????
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteIn(sendData: InBound[],inBoundHeader: any) {
        if(sendData){
            sendData = this.headerDataSet(sendData,inBoundHeader);

            this._inboundService.deleteIn(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (inBound: any) => {
                    },(response) => {});
        }

    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {
        const disableList = [
            'itemCd',
            'itemNm',
            'itemGrade',
            'standard',
            'unit',
            'ibExpQty',
            'qty',
            'ibQty',
            // 'unitPrice',
            'totalAmt',
            'lot1',
            'lot2',
            'lot3',
            'lot4',
            'lot5',
            'lot6',
            'lot7',
            'lot8',
            'lot9',
            'lot10',
            'remarkDetail'
        ];
        const enableList = [
            'ibExpQty',
        ];

        const enableListInBound = [
            'qty','unitPrice'
        ];
        const status = this.inBoundHeaderForm.controls['status'].value;
        this._functionService.cfn_cellDisable(column,disableList);

        //????????? ??????
        if(status === 'N'){
            this._functionService.cfn_cellEnable(column,enableList);
        }

        //??????, ???????????? ??????
        if(status === 'N' || status === 'P'){
            this._functionService.cfn_cellEnable(column,enableListInBound);
        }

        if(element.flag !== undefined && element.flag === 'C'){
            if(column.dataField === 'itemCd') {
                if(!this.isMobile) {
                    const popup = this._matDialogPopup.open(CommonPopupComponent, {
                        data: {
                            popup: 'P$_ALL_ITEM',
                            headerText: '?????? ??????',
                        },
                        autoFocus: false,
                        maxHeight: '90vh',
                        disableClose: true
                    });

                    popup.afterClosed()
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((result) => {
                            if (result) {
                                this.isLoading = true;
                                element.itemCd = result.itemCd;
                                element.itemNm = result.itemNm;
                                element.itemGrade = result.itemGrade;
                                element.standard = result.standard;
                                element.unit = result.unit;
                                this.tableClear();
                                this.isLoading = false;
                                this._changeDetectorRef.markForCheck();
                            }
                        });
                } else {
                    const popup = this._matDialogPopup.open(CommonPopupComponent, {
                        data: {
                            popup: 'P$_ALL_ITEM',
                            headerText: '?????? ??????',
                        },
                        autoFocus: false,
                        width: 'calc(100% - 50px)',
                        maxWidth: '100vw',
                        maxHeight: '80vh',
                        disableClose: true
                    });
                    const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                        if (size.matches) {
                            popup.updateSize('calc(100vw - 10px)','');
                        } else {
                            // d.updateSize('calc(100% - 50px)', '');
                        }
                    });
                    popup.afterClosed()
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((result) => {
                            if (result) {
                                smallDialogSubscription.unsubscribe();
                                this.isLoading = true;
                                element.itemCd = result.itemCd;
                                element.itemNm = result.itemNm;
                                element.itemGrade = result.itemGrade;
                                element.standard = result.standard;
                                element.unit = result.unit;
                                this.tableClear();
                                this.isLoading = false;
                                this._changeDetectorRef.markForCheck();
                            }
                        });
                }
            }
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    updateRowData(element, column: TableConfig, i) {
        if(element.flag !== 'C' || !element.flag){
            element.flag = 'U';
        }

        const ibStatus = this.inBoundHeaderForm.controls['status'].value;
        if(element.flag === 'U'){

        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action, row) {
        const status = this.inBoundHeaderForm.controls['status'].value;

        //????????? ????????? ?????????
        if(status !== 'N'){
            this._functionService.cfn_alert('????????? ????????? ??????????????????.');
            return false;
        }
        if(action === 'ADD'){

            this.addRowData(row);

        }else if(action === 'DELETE'){

            this.deleteRowData(row);

        }
        this.tableClear();
        this._changeDetectorRef.markForCheck();
    }

    /* ????????? ??????
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
    addRowData(row: any){
        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                // @ts-ignore
                inBoundDetail.push({
                    no: inBoundDetail.length + 1,
                    flag: 'C',
                    ibLineNo: 0,
                    itemCd: '',
                    itemNm: '',
                    itemGrade: '',
                    standard: '',
                    unit: '',
                    ibExpQty: 0,
                    qty: 0,
                    unitPrice: 0,
                    totalAmt: 0,
                    lot1: '',
                    lot2: '',
                    lot3: '',
                    lot4: '',
                    lot5: '',
                    lot6: '',
                    lot7: '',
                    lot8: '',
                    lot9: '',
                    lot10: '',
                    remarkDetail: ''});
            });
    }

    /* ????????? ??????
     * @param row
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteRowData(row: any) {

        if(this.selection.hasValue()){
            if(row.selected.length > 0){
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for(let i=0; i<row.selected.length; i++){
                    if(row.selected[i].length){
                        this.inBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBoundDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<inBoundDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === inBoundDetail[e].no){
                                        if(inBoundDetail[e].flag === 'D'){
                                            inBoundDetail[e].flag = '';
                                        }else{
                                            inBoundDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.inBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((inBoundDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<inBoundDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === inBoundDetail[e].no){
                                        inBoundDetail.splice(e,1);
                                    }
                                }
                            });
                    }
                }
            }
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected(): any {
        const numSelected = this.selection.selected.length;
        const numRows = this.inboundDetailsCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                this.selection.select(...inBoundDetail);
            });
    }

    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: any): string {
        if (!row) {
            return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
        }
        return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableClear(){
        this._table.renderRows();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    getComboData(column: TableConfig) {
        let combo;
        if(column.dataField === 'itemGrade'){
            combo = this.itemGrades;
        }
        return combo;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    tableEditingEvent(){
        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                // @ts-ignore
                if(inBoundDetail !== null){
                    const ibStatus = this.inBoundHeaderForm.controls['status'].value;
                    if(ibStatus === 'N' || ibStatus === 'P'){
                        inBoundDetail.forEach((detail: any) => {
                            detail.qty = detail.ibExpQty - detail.ibQty;
                        });

                        this.inBoundDetailsTable.forEach((table: any) => {
                            if(table.dataField === 'itemCd'){
                                table.disabled = true;
                            }
                        });
                    }
                }
                this._changeDetectorRef.markForCheck();
            });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    inBound() {
        const ibStatus = this.inBoundHeaderForm.controls['status'].value;
        const ibType = this.inBoundHeaderForm.controls['type'].value;
        if(ibStatus !== 'N' && ibStatus !== 'P'){
            this._functionService.cfn_alert('????????? ??? ?????? ???????????????.');
            return false;
        }
        let inBoundData;
        let inBoundDataFilter;
        let udiCheckData;
        this.inBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((inBoundDetail) => {
                inBoundData = inBoundDetail.filter((detail: any) => detail.qty > 0)
                    .map((param: any) => {
                        return param;
                });

                inBoundDataFilter = inBoundData.filter((detail: any) => detail.udiYn !== 'Y')
                    .map((param: any) => {
                        return param;
                    });

                udiCheckData = inBoundData.filter((detail: any) => detail.udiYn === 'Y')
                    .map((param: any) => {
                        return param;
                    });
            });

        if(inBoundData.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ???????????? ????????????.');
            return false;
        }else{

            //????????? ??????
            if(ibType === '2'){
                if(udiCheckData.length > 0){
                    //UDI ?????? ????????? ????????? ?????? , outBoundData ??? ?????????
                    //?????? ?????? ????????? ????????????
                    //UDI ?????? INPUT ??? ??? ??????
                    const popup =this._matDialogPopup.open(CommonUdiRtnScanComponent, {
                        data: {
                            detail : udiCheckData
                        },
                        autoFocus: false,
                        maxHeight: '90vh',
                        disableClose: true
                    });

                    popup.afterClosed().subscribe((result) => {
                        if(result){
                            if(result !== undefined){
                                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                for(let i=0; i<result.length; i++){
                                    inBoundDataFilter.push(result[i]);
                                }

                                const conf = this._teamPlatConfirmationService.open({
                                    title  : '??????',
                                    message: '?????????????????????????',
                                    actions: {
                                        confirm: {
                                            label: '??????'
                                        },
                                        cancel: {
                                            label: '??????'
                                        }
                                    }
                                });
                                //lot ??????
                                inBoundDataFilter.forEach((inBound: any) => {
                                    inBound.qty = inBound.qty;
                                    inBound.lot4 = inBound.udiCode;
                                });
                                inBoundDataFilter = inBoundDataFilter.filter((inBound: any) => inBound.qty > 0 ).map((param: any) => {
                                    return param;
                                });
                                conf.afterClosed()
                                    .pipe(takeUntil(this._unsubscribeAll))
                                    .subscribe((rtn) => {
                                        if(rtn){
                                            this.inBoundDetailConfirm(inBoundDataFilter);
                                        }
                                    });
                            }
                        }
                    });
                }else{
                    this.inBoundDetailConfirm(inBoundData);
                }
            }else{
                const confirmation = this._teamPlatConfirmationService.open({
                    title  : '??????',
                    message: '?????????????????????????',
                    actions: {
                        confirm: {
                            label: '??????'
                        },
                        cancel: {
                            label: '??????'
                        }
                    }
                });
                confirmation.afterClosed()
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((result) => {
                        if(result){
                            this.inBoundDetailConfirm(inBoundData);
                        }
                    });
            }
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
    /* ?????? (??????)
     *
     * @param sendData
     */

    inBoundDetailConfirm(sendData: InBound[]): void{
        if(sendData){
            const rows = this.headerDataSet(sendData);
            this._inboundService.inBoundDetailConfirm(rows)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((inBound: any) => {
                    this._functionService.cfn_alertCheckMessage(inBound);
                    this.reloadDetail();
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    reloadDetail() {

    }
}
