import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {SelectionModel} from '@angular/cdk/collections';
import {merge, Observable, Subject} from 'rxjs';
import {TableConfig, TableStyle} from '../../../../../../@teamplat/components/common-table/common-table.types';
import {OutBound, OutBoundDetail, OutBoundDetailPagenation} from '../outbound.types';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CodeStore} from '../../../../../core/common-code/state/code.store';
import {CommonCode, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {OutboundService} from '../outbound.service';
import {SaveAlertComponent} from '../../../../../../@teamplat/components/common-alert/save-alert';
import {CommonPopupComponent} from '../../../../../../@teamplat/components/common-popup';
import {FunctionService} from '../../../../../../@teamplat/services/function';
import {TeamPlatConfirmationService} from '../../../../../../@teamplat/services/confirmation';
import {CommonUdiScanComponent} from '../../../../../../@teamplat/components/common-udi-scan';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
    selector       : 'outbound-detail',
    templateUrl    : './outbound-detail.component.html',
    styleUrls: ['./outbound-detail.component.scss'],
})
export class OutboundDetailComponent implements OnInit, OnDestroy, AfterViewInit
{
    @ViewChild(MatTable,{static:true}) _table: MatTable<any>;
    @ViewChild(MatPaginator) private _outBoundDetailPagenator: MatPaginator;
    @ViewChild(MatSort) private _outBoundDetailSort: MatSort;
    isLoading: boolean = false;
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    selection = new SelectionModel<any>(true, []);
    outboundDetailsCount: number = 0;
    outBoundHeaderForm: FormGroup;
    outBoundDetails$ = new Observable<OutBoundDetail[]>();
    outBoundDetailsTableStyle: TableStyle = new TableStyle();
    outBoundDetailsTable: TableConfig[] = [
        {headerText : '????????????' , dataField : 'obLineNo', display : false},
        {headerText : '????????????' , dataField : 'itemCd', width: 80, display : true, type: 'text',validators: true},
        {headerText : '?????????' , dataField : 'itemNm', width: 100, display : true, disabled : true, type: 'text'},
        {headerText : '??????????????????' , dataField : 'obExpQty', width: 50, display : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right,validators: true},
        {headerText : '??????' , dataField : 'qty', width: 50, display : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
        {headerText : '????????????' , dataField : 'obQty', width: 60, display : true, disabled : true, type: 'number', style: this.outBoundDetailsTableStyle.textAlign.right},
        {headerText : '??????' , dataField : 'remarkDetail', width: 100, display : true, type: 'text'},
    ];
    outBoundDetailsTableColumns: string[] = [
        'select',
        'no',
        'obLineNo',
        'itemCd',
        'itemNm',
        'obExpQty',
        'qty',
        'obQty',
        'remarkDetail',
    ];
    outBoundDetailPagenation: OutBoundDetailPagenation | null = null;
    type: CommonCode[] = null;
    status: CommonCode[] = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _outboundService: OutboundService,
        private _matDialog: MatDialog,
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        public _matDialogPopup: MatDialog,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private _functionService: FunctionService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.type = _utilService.commonValue(_codeStore.getValue().data,'OB_TYPE');
        this.status = _utilService.commonValue(_codeStore.getValue().data,'OB_STATUS');
        this.isMobile = this._deviceService.isMobile();
        this.outBoundDetails$ = this._outboundService.outBoundDetails$;
        this._outboundService.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail: any) => {
                // Update the counts
                if(outBoundDetail !== null){
                    this.outboundDetailsCount = outBoundDetail.length;
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
        this.outBoundHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // ?????????
            obNo: [{value:'',disabled:true}],   // ????????????
            account: [{value:'',disabled:true},[Validators.required]], // ????????? ??????
            accountNm: [{value:'',disabled:true}],   // ????????? ???
            address: [{value:'',disabled:true}, [Validators.required]],   // ????????? ??????
            type: [{value:'',disabled:true}, [Validators.required]],   // ??????
            status: [{value:'',disabled:true}, [Validators.required]],   // ??????
            dlvAccount: [{value:'',disabled:true}],   // ?????????
            dlvAccountNm: [{value:'',disabled:true}],   // ?????????
            dlvAddress: [{value:'',disabled:true}],   // ????????? ??????
            dlvDate: [{value:'',disabled:true}, [Validators.required]],//????????????
            obCreDate: [{value:'',disabled:true}],//?????????
            obDate: [{value:'',disabled:true}], //?????????
            remarkHeader: [''], //??????
            active: [false]  // cell??????
        });

        this._outboundService.outBoundHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBound: any) => {
                // Update the pagination
                if(outBound !== null){
                    this.outBoundHeaderForm.patchValue(outBound);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        this.tableEditingEvent();

        this._outboundService.outBoundDetailPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetailPagenation: OutBoundDetailPagenation) => {
                // Update the pagination
                if(outBoundDetailPagenation !== null){
                    this.outBoundDetailPagenation = outBoundDetailPagenation;
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
        let outBoundHeader = null;

        this._outboundService.outBoundHeader$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBound: any) => {
                // Update the pagination
                if(outBound !== null){
                    outBoundHeader = outBound;
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        if(outBoundHeader === null){
            outBoundHeader = {};
        }

        if(this._outBoundDetailSort !== undefined){
            // Get products if sort or page changes
            merge(this._outBoundDetailSort.sortChange, this._outBoundDetailPagenator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._outboundService.getDetail(this._outBoundDetailPagenator.pageIndex, this._outBoundDetailPagenator.pageSize, this._outBoundDetailSort.active, this._outBoundDetailSort.direction, outBoundHeader);
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
    trackByFn(index: number, outBoundDetail: any): any {
        return outBoundDetail.id || index;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    saveOut() {

        const status = this.outBoundHeaderForm.controls['status'].value;

        //????????? ????????? ?????????
        if(status !== 'N'){
            this._functionService.cfn_alert('?????? ??? ??? ????????????.');
            return;
        }

        if(!this.outBoundHeaderForm.invalid){

            let detailCheck = false;
            this.outBoundDetails$.pipe(takeUntil(this._unsubscribeAll))
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
                this.outBoundDetails$,
                this.outBoundDetailsTable);

            if(validCheck){
                return;
            }

            const saveConfirm =this._matDialog.open(SaveAlertComponent, {
                data: {
                }
            });
            saveConfirm.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                    let createList;
                    let updateList;
                    let deleteList;
                    if (result.status) {
                        createList = [];
                        updateList = [];
                        deleteList = [];
                        this.outBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBoundDetail) => {
                                outBoundDetail.forEach((sendData: any) => {
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
                        let outBoundHeader = null;

                        this._outboundService.outBoundHeader$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBound: any) => {
                                // Update the pagination
                                if(outBound !== null){
                                    outBoundHeader = outBound;
                                }
                                // Mark for check
                                this._changeDetectorRef.markForCheck();
                            });

                        if(outBoundHeader === null){
                            outBoundHeader = {};
                        }
                        if (createList.length > 0) {
                            this.createOut(createList,outBoundHeader);
                        }
                        if(!this.outBoundHeaderForm.untouched){
                            if (updateList.length > 0) {
                                this.updateOut(updateList);
                            }else{
                                this.updateOut([],this.outBoundHeaderForm);
                            }
                        }else{
                            if (updateList.length > 0) {
                                this.updateOut(updateList);
                            }
                        }
                        if (deleteList.length > 0) {
                            this.deleteOut(deleteList,outBoundHeader);
                        }
                    }
                });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    headerDataSet(sendData: OutBound[],outBoundHeader?: any) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i=0; i<sendData.length; i++) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            /*sendData[i].account = outBoundHeader['account'];
            sendData[i].address = outBoundHeader['address'];
            sendData[i].obNo = outBoundHeader['obNo'];
            sendData[i].type = outBoundHeader['type'];
            sendData[i].status = outBoundHeader['status'];
            sendData[i].dlvAccount = outBoundHeader['dlvAccount'];
            sendData[i].dlvAddress = outBoundHeader['dlvAddress'];
            sendData[i].dlvDate = outBoundHeader['dlvDate'];
            sendData[i].remarkHeader = outBoundHeader['remarkHeader'];*/
            sendData[i].account = this.outBoundHeaderForm.controls['account'].value;
            sendData[i].address = this.outBoundHeaderForm.controls['address'].value;
            sendData[i].obNo = this.outBoundHeaderForm.controls['obNo'].value;
            sendData[i].type = this.outBoundHeaderForm.controls['type'].value;
            sendData[i].status = this.outBoundHeaderForm.controls['status'].value;
            sendData[i].dlvAccount = this.outBoundHeaderForm.controls['dlvAccount'].value;
            sendData[i].dlvAddress = this.outBoundHeaderForm.controls['dlvAddress'].value;
            sendData[i].dlvDate = this.outBoundHeaderForm.controls['dlvDate'].value;
            sendData[i].remarkHeader = this.outBoundHeaderForm.controls['remarkHeader'].value;

        }
        return sendData;
    }

    /* ??????
     *
     * @param sendData
     */
    createOut(sendData: OutBound[],outBoundHeader: any): void{
        if(sendData){
            sendData = this.headerDataSet(sendData,outBoundHeader);
            this._outboundService.createOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                });
        }
    }
    /* ??????
     *
     * @param sendData
     */
    updateOut(sendData: OutBound[], headerForm?: FormGroup): void{
        if(headerForm !== undefined){

            sendData.push(headerForm.getRawValue());

            this._outboundService.updateOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                });

        }else{
            if(sendData){
                sendData = this.headerDataSet(sendData);

                this._outboundService.updateOut(sendData)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((outBound: any) => {
                    });
            }
        }

    }

    /* ??????
     * @param sendData
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    deleteOut(sendData: OutBound[],outBoundHeader: any) {
        if(sendData){
            sendData = this.headerDataSet(sendData,outBoundHeader);

            this._outboundService.deleteOut(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(
                    (outBound: any) => {
                    },(response) => {});
        }

    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    cellClick(element, column: TableConfig, i) {
        const disableList = [
            'itemCd',
            'itemNm',
            'obExpQty',
            'qty',
            'obQty',
            'remarkDetail',
        ];
        const enableList = [
            'obExpQty',
            'remarkDetail',
        ];

        const enableListOutBound = [
            'qty',
        ];
        const status = this.outBoundHeaderForm.controls['status'].value;
        this._functionService.cfn_cellDisable(column,disableList);

        //????????? ??????
        if(status === 'N'){
            this._functionService.cfn_cellEnable(column,enableList);
        }

        //??????, ???????????? ??????
        if(status === 'N' || status === 'P'){
            this._functionService.cfn_cellEnable(column,enableListOutBound);
        }
        if(element.flag !== undefined && element.flag === 'C') {
            if(column.dataField === 'itemCd') {
                if (!this.isMobile) {
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
                                this.tableClear();
                                this.isLoading = false;
                                this._changeDetectorRef.markForCheck();
                            }
                        });
                } else{
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
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    transactionRow(action, row) {
        const status = this.outBoundHeaderForm.controls['status'].value;

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
        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) => {
                // @ts-ignore
                outBoundDetail.push({
                    no: outBoundDetail.length + 1,
                    flag: 'C',
                    obLineNo: 0,
                    itemCd: '',
                    itemNm: '',
                    obExpQty: 0,
                    qty: 0,
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
                        this.outBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBoundDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions,@typescript-eslint/prefer-for-of
                                for(let e=0; e<outBoundDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === outBoundDetail[e].no){
                                        if(outBoundDetail[e].flag === 'D'){
                                            outBoundDetail[e].flag = '';
                                        }else{
                                            outBoundDetail[e].flag = 'D';
                                        }
                                    }
                                }
                            });
                    }else{
                        this.outBoundDetails$
                            .pipe(takeUntil(this._unsubscribeAll))
                            .subscribe((outBoundDetail) => {
                                // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
                                for(let e=0; e<outBoundDetail.length; e++){
                                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                                    if(row.selected[i].no === outBoundDetail[e].no){
                                        outBoundDetail.splice(e,1);
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
        const numRows = this.outboundDetailsCount;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle(): SelectionModel<any> {
        if (this.isAllSelected()) {
            this.selection.clear();
            return;
        }

        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) => {
                this.selection.select(...outBoundDetail);
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
    tableEditingEvent(){
        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((oubBoundDetail) => {
                // @ts-ignore
                if(oubBoundDetail !== null){
                    const obStatus = this.outBoundHeaderForm.controls['status'].value;
                    if(obStatus === 'N' || obStatus === 'P'){
                        oubBoundDetail.forEach((detail: any) => {
                            /*detail.qty = detail.obExpQty - detail.obQty;*/
                        });

                        this.outBoundDetailsTable.forEach((table: any) => {
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
    outBound() {
        const obStatus = this.outBoundHeaderForm.controls['status'].value;
        if(obStatus !== 'N' && obStatus !== 'P'){
            this._functionService.cfn_alert('????????? ??? ?????? ???????????????.');
            return false;
        }

        let outBoundData;
        let outBoundDataFilter;
        let udiCheckData;
        this.outBoundDetails$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((outBoundDetail) => {
                outBoundData = outBoundDetail.filter((detail: any) => (detail.qty > 0 && detail.qty !== '0'))
                    .map((param: any) => param);

                outBoundDataFilter = outBoundData.filter((detail: any) => detail.udiYn !== 'Y')
                    .map((param: any) => param);

                udiCheckData = outBoundData.filter((detail: any) => detail.udiYn === 'Y')
                    .map((param: any) => param);
            });
        if(outBoundData.length < 1) {
            this._functionService.cfn_alert('?????? ????????? ???????????? ????????????.');
            return false;
        }else{

            if(udiCheckData.length > 0){
                //UDI ?????? ????????? ????????? ?????? , outBoundData ??? ?????????
                //?????? ?????? ????????? ????????????
                //UDI ?????? INPUT ??? ??? ??????

                const popup =this._matDialogPopup.open(CommonUdiScanComponent, {
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
                                outBoundDataFilter.push(result[i]);
                            }
                            this.outBoundCall(outBoundDataFilter);
                        }
                    }
                });

            }else{
                this.outBoundCall(outBoundData);
            }
        }

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    outBoundCall(outBoundData: OutBound[]){
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
        outBoundData.forEach((outBound: any) => {
            outBound.qty = outBound.qty;
            outBound.lot4 = outBound.udiCode;
        });
        outBoundData = outBoundData.filter((outBound: any) => outBound.qty > 0 ).map((param: any) => param);

        confirmation.afterClosed()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((result) => {
                if(result){
                    this.outBoundDetailConfirm(outBoundData);
                }
            });
    }

    /* ?????? (??????)
     *
     * @param sendData
     */
    outBoundDetailConfirm(sendData: OutBound[]): void{
        if(sendData){
            this._outboundService.outBoundDetailConfirm(sendData)
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((outBound: any) => {
                    this._functionService.cfn_alertCheckMessage(outBound);
                    // Mark for check
                    this._changeDetectorRef.markForCheck();
                });
        }
    }
}
