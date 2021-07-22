import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Alertmessage} from '../message-alert/message-alert.type';

@Component({
    selector: 'message-alert',
    templateUrl: './message-alert.component.html',
    styleUrls: ['./message-alert.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessageAlertComponent implements OnInit {

    msg: string = 'Message';
    constructor(
        public _matDialogRef: MatDialogRef<MessageAlertComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any,) {
        if(data.msg !== undefined){
            this.msg = data.msg;
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
