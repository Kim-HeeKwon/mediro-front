import {Component, Inject, Injectable, OnInit, Optional, ViewEncapsulation} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";


@Component({
    selector: 'app-loading',
    templateUrl: 'common-loading-bar.component.html',
    styleUrls: ['./common-loading-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'appLoading'
})

@Injectable()
export class CommonLoadingBarComponent implements OnInit{

    constructor(public dialogRef: MatDialogRef<CommonLoadingBarComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any
    )
    {
    }

    // eslint-disable-next-line @angular-eslint/contextual-lifecycle
    ngOnInit(): void {
    }
    close(){
        this.dialogRef.close();
    }

}

