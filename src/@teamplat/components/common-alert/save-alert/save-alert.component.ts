import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Alertmessage} from '../save-alert/save-alert.type';

@Component({
    selector: 'save-alert',
    templateUrl: './save-alert.component.html',
    styleUrls: ['./save-alert.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class SaveAlertComponent implements OnInit {

    constructor(
        public _matDialogRef: MatDialogRef<SaveAlertComponent>,
        private _changeDetectorRef: ChangeDetectorRef,
        @Inject(MAT_DIALOG_DATA) public data: any,)
    {
    }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alertOk: Alertmessage = {
        code: 'SUCCESS',
        status: true
    };
    // eslint-disable-next-line @typescript-eslint/member-ordering
    alertCancel: Alertmessage = {
        code: 'CANCEL',
        status: false
    };

    ngOnInit(): void {
    }

    onSave(): void {
        this._matDialogRef.close(this.alertOk);
    }

    onClose(): void {
        this._matDialogRef.close(this.alertCancel);
    }
}
