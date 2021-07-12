import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Alertmessage} from '../delete-alert/delete-alert.type';

@Component({
    selector: 'error-alert',
    templateUrl: './error-alert.component.html',
    styleUrls: ['./error-alert.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorAlertComponent implements OnInit {

    errorMsg: string = 'Erro Message';
    constructor(
        public _matDialogRef: MatDialogRef<ErrorAlertComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any,) {
        console.log(data);
        if(data.msg){
            this.errorMsg = data.msg;
        }
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    alertCancel: Alertmessage = {
        code: 'CANCEL',
        status: false
    };

    ngOnInit(): void {
    }

    onClose(): void {
        this._matDialogRef.close(this.alertCancel);
    }
}
