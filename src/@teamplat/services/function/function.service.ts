import {ChangeDetectorRef, Injectable, OnDestroy, OnInit, Optional} from '@angular/core';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ErrorAlertComponent} from '../../components/common-alert/error-alert';
import {takeUntil} from 'rxjs/operators';
import {Observable, Subject} from 'rxjs';
import {TeamPlatConfirmationService} from '../confirmation';
import {FormBuilder, FormGroup} from '@angular/forms';
import {TableConfig} from '../../components/common-table/common-table.types';

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
        )
    {
    }

    // 로딩바 닫아주는 함수
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_loadingBarClear(): void{
        this._matDialogRef = this._matDialog.getDialogById('loadingBar'); // 로딩바 ID 찾기
        if(this._matDialogRef !== undefined){ // 팝업창(ID) null 체크
            this._matDialogRef.close(); // 팝업창 ID null 아닐 때 닫기
        }
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
        return 'font-weight: bold;'; // css font bold 처리
    }
    /*
     * 공통 alert
     * @param message
     */
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    cfn_alert(message?: string, iconValue?: string){
        let icon;
        if(iconValue === undefined){ // iconValue null 이면 정보 아이콘
            icon = 'information-circle';
        }else{ // null이 아니라면 iconValue 아이콘
            icon = iconValue;
        }
        // Setup config form
        this.configForm = this._formBuilder.group({
            title      : '',
            message    : message, // 메시지 전달
            icon       : this._formBuilder.group({
                show : true,
                name : 'heroicons_outline:' + icon, // 아이콘 전달
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
        // 정보값 전달 받고 얼럿창 띄우는 함수
        const confirmation = this._teamPlatConfirmationService.open(this.configForm.value);
    }

    // 추가, 삭제, 수정, 확정 처리 얼럿 창
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_alertCheckMessage(param: any, redirectUrl?: string): void
    {
        if(param.status === 'SUCCESS'){ // 전달 받은 param.status가 SUCCESS 면 정상 얼럿창
            this.cfn_alert('정상적으로 처리되었습니다.','check-circle');
        }else if(param.status === 'CANCEL'){

        }else{ // SUCCESS가 아닐때 전달 받은 메시지 출력

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
            // 실제 전달 받은 정보 띄우는 얼럿 함수
            const confirmation = this._teamPlatConfirmationService.open(this.configForm.value);
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

    // admin version 1
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    cfn_cellDisable(column: TableConfig, dataFiled: string[], form?: FormGroup){

        dataFiled.forEach((array: any) => {
            if(column.dataField === array){
                column.disabled = true;
            }
        });
    }

    // admin version 1
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type,@typescript-eslint/naming-convention
    cfn_cellEnable(column: TableConfig,dataFiled: string[], form?: any){
        dataFiled.forEach((array: any) => {
            if(column.dataField === array){
                column.disabled = false;
            }
        });
    }

    // admin version 1
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

    // 검색조건 멀티 콤보 조회
    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_multipleComboValueGet(arr): string{
        if(typeof arr === 'object'){ // 데이터 타입이 함수, 배열 등 객체일 때
            if(arr !== (null || undefined)){ // 전달 받은 데이더 null, undefined 체크
                let str = '';
                if(arr.length !== 0){ // 전달 받은 데이터 값이 0개가 아닐때
                    if(arr.length === 1){ // 전달 받은 데이터 값이 1개 일때
                        if(arr[0] === 'ALL'){ // 전체 조회 시
                            str = arr[0] + ''; // str String으로 변환
                        }else{ // arr[0] 이 ALL이 아닐때
                            str = '\'' + arr[0] + '\'';
                        }
                    }else{ // 전달 받은 데이터 값이 1개 이상일때
                        let idx = 1;
                        str += '\'';
                        arr.forEach((param) => {
                            str += param;
                            if(arr.length !== idx){ // forEach문 돌리면서 arr 값 개수 idx 값 비교
                                str += '\',\''; // str 문자열로 변환
                            }else{
                                str += '\''; // 마지막 str 문자열로 변환
                            }
                            idx++;
                        });
                    }
                }else{ // 전달 받은 데이터 없을떄
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
