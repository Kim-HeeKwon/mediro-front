import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ErrorAlertComponent} from '../../components/common-alert/error-alert';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {TeamPlatConfirmationService} from '../confirmation';
import {FormBuilder, FormGroup} from '@angular/forms';

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
        private _matDialog: MatDialog) {
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
}
