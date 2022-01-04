import {ChangeDetectorRef, Injectable, OnDestroy, OnInit, Optional} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ErrorAlertComponent} from '../../components/common-alert/error-alert';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {TeamPlatConfirmationService} from '../confirmation';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TableConfig} from "../../components/common-table/common-table.types";
import {CommonLoadingBarComponent} from "../../components/common-loding-bar/common-loading-bar.component";

@Injectable({
    providedIn: 'root'
})
export class FunctionService implements OnInit, OnDestroy{

    configForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
        private _formBuilder: FormBuilder,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        public _matDialog: MatDialog,
        @Optional() public _matDialogRef: MatDialogRef<any>,
        ) {
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_loadingBarClear(): void{
        this._matDialogRef = this._matDialog.getDialogById('loadingBar');
        this._matDialogRef.close();
    }
    // eslint-disable-next-line @angular-eslint/contextual-lifecycle
    ngOnInit(): void {

    }
    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_inputBold(): string{
        return 'font-weight: bold;';
    }
    /*
     * 공통 alert
     * @param message
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    cfn_alert(message?: string, iconValue?: string){
        let icon;
        if(iconValue === undefined){
            icon = 'information-circle';
        }else{
            icon = iconValue;
        }
        // Setup config form
        this.configForm = this._formBuilder.group({
            title      : '',
            message    : message,
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:' + icon,
                color: 'accent'
            }),
            actions    : this._formBuilder.group({
                confirm: this._formBuilder.group({
                    show : false,
                    label: '',
                }),
                cancel : this._formBuilder.group({
                    show : true,
                    label: '닫기'
                })
            }),
            dismissible: true
        });
        const confirmation = this._teamPlatConfirmationService.open(this.configForm.value);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_alertCheckMessage(param: any, redirectUrl?: string): void
    {
        if(param.status !== 'SUCCESS'){

            const icon = 'information-circle';
            // Setup config form
            this.configForm = this._formBuilder.group({
                title      : '',
                message    : param.msg,
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:' + icon,
                    color: 'accent'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : false,
                        label: '',
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            });
            const confirmation = this._teamPlatConfirmationService.open(this.configForm.value);
        }else{
            this.cfn_alert('정상적으로 처리되었습니다.','check-circle');
        }
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_alertSelectMessage(param: any, redirectUrl?: string): void
    {
        if(param.status !== 'SUCCESS'){

            const icon = 'information-circle';
            // Setup config form
            this.configForm = this._formBuilder.group({
                title      : '',
                message    : param.msg,
                icon       : this._formBuilder.group({
                    show : true,
                    name : 'heroicons_outline:' + icon,
                    color: 'accent'
                }),
                actions    : this._formBuilder.group({
                    confirm: this._formBuilder.group({
                        show : false,
                        label: '',
                    }),
                    cancel : this._formBuilder.group({
                        show : true,
                        label: '닫기'
                    })
                }),
                dismissible: true
            });
            const confirmation = this._teamPlatConfirmationService.open(this.configForm.value);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    cfn_cellDisable(column: TableConfig, dataFiled: string[], form?: FormGroup){

        dataFiled.forEach((array: any) => {
            if(column.dataField === array){
                column.disabled = true;
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    cfn_cellEnable(column: TableConfig,dataFiled: string[], form?: any){
        dataFiled.forEach((array: any) => {
            if(column.dataField === array){
                column.disabled = false;
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_validator(text: string, list$: Observable<any>, table: TableConfig[]): boolean{
        let validCheck = false;
        if(text === '') {
            text = '정보';
        }
        list$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {

                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for(let f=0; f<data.length; f++){
                    // eslint-disable-next-line @typescript-eslint/prefer-for-of
                    for(let e=0; e<table.length; e++){
                        if(table[e].validators){
                            if(data[f][table[e].dataField] === undefined || data[f][table[e].dataField] === ''
                                || data[f][table[e].dataField] === null){
                                this.cfn_alert('[' + text + '] ' + table[e].headerText+ ' 는 필수값 입니다.');
                                validCheck = true;
                                return false;
                            }
                        }
                    }
                }
            });
        return validCheck;
    }

    // 검색조건 멀티 콤보
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_multipleComboValueGet(arr): string{
        if(typeof arr === 'object'){
            if(arr !== (null || undefined)){
                let str = '';
                if(arr.length !== 0){
                    if(arr.length === 1){
                        if(arr[0] === 'ALL'){
                            str = arr[0] + '';
                        }else{
                            str = "'" + arr[0] + "'";
                        }
                    }else{
                        let idx = 1;
                        str += "'";
                        arr.forEach((param) => {
                            str += param;
                            if(arr.length !== idx){
                                str += "','";
                            }else{
                                str += "'";
                            }
                            idx++;
                        });
                    }
                }else{
                    str = '';
                }

                return str;
            }else{
                return arr;
            }
        }else{
            return arr;
        }

    }
}
