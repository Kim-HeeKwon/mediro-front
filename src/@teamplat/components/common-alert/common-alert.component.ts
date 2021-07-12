import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CommonAlertConfig} from './common-alert-config';

@Component({
    selector: 'app-common-alert-dialog',
    templateUrl: './common-alert.component.html'
})
export class CommonAlertComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public config: CommonAlertConfig) { }

    // TODO(Chan4077): Rename this function
    /**
     * Returns the value of a variable or its default equivalant
     * @returns The value of the variable/its default equivalant if it is untruthy
     */
    getValOrDefaultVal(val: any, defaultVal: any): any {
        return val ? val : defaultVal;
    }

    /**
     * Checks if the dialog message is HTML
     */
    get isDialogMsgHtml(): boolean {
        console.log(typeof this.config.dialogMsg);
        return typeof this.config.dialogMsg === 'object';
    }

}
