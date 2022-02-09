import {AfterViewInit, Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";
import {Subject} from "rxjs";

@Component({
    selector: 'app-tax-publish',
    templateUrl: './tax-publish.component.html',
    styleUrls: ['./tax-publish.component.scss']
})
export class TaxPublishComponent implements OnInit, OnDestroy, AfterViewInit {

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        public _matDialogRef: MatDialogRef<TaxPublishComponent>,) {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
    }

    smartBill(): void {
        window.open('https://www.smartbill.co.kr/xMain/mb/mb_login/login.aspx?SourcePage=/xMain/my_page/MyPage.aspx','smartBill', 'top=50,left=200,width=1100,height=700');
    }
    trusBill(): void {
        window.open('https://www.trusbill.or.kr/MainForm.jsp','trusBill', 'top=50,left=200,width=1100,height=700');
    }
    barobill(): void {
        window.open('https://www.barobill.co.kr/join/login.asp','baroBill', 'top=50,left=200,width=1100,height=700');
    }
}
