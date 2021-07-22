import {Injectable, OnDestroy, OnInit} from '@angular/core';
import {MessageAlertComponent} from '../../components/common-alert/message-alert';
import {MatDialog} from '@angular/material/dialog';
import {ErrorAlertComponent} from '../../components/common-alert/error-alert';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FunctionService implements OnInit, OnDestroy{

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(
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
    cfn_alert(message?: string){

        this._matDialog.open(MessageAlertComponent, {
            data: {msg: message}});
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    cfn_alertCheckMessage(param: any, redirectUrl?: string): void
    {
        if(param.status !== 'SUCCESS'){
            const errorAlert =this._matDialog.open(ErrorAlertComponent, {
                data: {
                    msg: param.msg
                }
            });
            errorAlert.afterClosed()
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe((result) => {
                });
        }else{
            this.cfn_alert('정상적으로 처리되었습니다.');
        }
    }
}
