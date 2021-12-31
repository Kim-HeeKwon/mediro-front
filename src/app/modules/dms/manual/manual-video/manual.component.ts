import {AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {MatDrawer} from "@angular/material/sidenav";

@Component({
    selector: 'app-manual',
    templateUrl: './manual.component.html',
    styleUrls: ['./manual.component.scss']
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class manualComponent implements OnInit, AfterViewInit,OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    url: string;
    basicInfo: boolean = false;
    circulation: boolean = false;
    udi: boolean = false;
    smartPlus: boolean = false;
    etc: boolean = false;
    account: boolean = false;
    item: boolean = false;
    itemPrice: boolean = false;
    estimate: boolean = false;
    order: boolean = false;
    salesorder: boolean = false;
    inbound: boolean = false;
    outbound: boolean = false;
    stock: boolean = false;
    bill: boolean = false;
    tax: boolean = false;

    private _helpCd: string;
    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }

    basicInfoBtn(): void {
        if (this.basicInfo) {
            this.basicInfo = false;
        } else {
            this.basicInfo = true;
        }
        this.circulation = false;
        this.udi = false;
        this.smartPlus = false;
        this.etc = false;
        this.info();
    }

    circulationBtn(): void {
        if (this.circulation) {
            this.circulation = false;
        } else {
            this.circulation = true;
        }
        this.basicInfo = false;
        this.udi = false;
        this.smartPlus = false;
        this.etc = false;
        this.info();
    }

    udiBtn(): void {
        if (this.udi) {
            this.udi = false;
        } else {
            this.udi = true;
        }
        this.basicInfo = false;
        this.circulation = false;
        this.smartPlus = false;
        this.etc = false;
        this.info();
    }

    smartPlusBtn(): void {
        if (this.smartPlus) {
            this.smartPlus = false;
        } else {
            this.smartPlus = true;
        }
        this.basicInfo = false;
        this.circulation = false;
        this.udi = false;
        this.etc = false;
        this.info();
    }

    etcBtn(): void {
        if (this.etc) {
            this.etc = false;
        } else {
            this.etc = true;
        }
        this.smartPlus = false;
        this.basicInfo = false;
        this.circulation = false;
        this.udi = false;
        this.info();
    }

    accountBtn(): void {
        this.account = true;
        this.item = false;
        this.itemPrice = false;
    }

    itemBtn(): void {
        this.item = true;
        this.account = false;
        this.itemPrice = false;
    }

    itemPriceBtn(): void {
        this.itemPrice = true;
        this.account = false;
        this.item = false;
    }

    info(): void {
        this.account = false;
        this.item = false;
        this.itemPrice = false;
        this.estimate = false;
        this.order = false;
        this.salesorder = false;
        this.inbound = false;
        this.outbound = false;
        this.stock = false;
        this.tax = false;
        this.bill = false;
    }

    estimateBtn(): void {
        this.estimate = true;
        this.order = false;
        this.salesorder = false;
        this.inbound = false;
        this.outbound = false;
        this.stock = false;
        this.bill = false;
        this.tax = false;
    }

    orderBtn(): void {
        this.order = true;
        this.estimate = false;
        this.salesorder = false;
        this.inbound = false;
        this.outbound = false;
        this.stock = false;
        this.bill = false;
        this.tax = false;
    }

    salesorderBtn(): void {
        this.salesorder = true;
        this.estimate = false;
        this.order = false;
        this.inbound = false;
        this.outbound = false;
        this.stock = false;
        this.bill = false;
        this.tax = false;
    }

    inboundBtn(): void {
        this.inbound = true;
        this.estimate = false;
        this.order = false;
        this.salesorder = false;
        this.outbound = false;
        this.stock = false;
        this.bill = false;
        this.tax = false;
    }

    outboundBtn(): void {
        this.outbound = true;
        this.estimate = false;
        this.order = false;
        this.salesorder = false;
        this.inbound = false;
        this.stock = false;
        this.bill = false;
        this.tax = false;
    }

    stockBtn(): void {
        this.stock = true;
        this.estimate = false;
        this.order = false;
        this.salesorder = false;
        this.inbound = false;
        this.outbound = false;
        this.bill = false;
        this.tax = false;
    }

    billBtn(): void {
        this.bill = true;
        this.estimate = false;
        this.order = false;
        this.salesorder = false;
        this.inbound = false;
        this.outbound = false;
        this.stock = false;
        this.tax = false;
    }

    taxBtn(): void {
        this.tax = true
        this.bill = false;
        this.estimate = false;
        this.order = false;
        this.salesorder = false;
        this.inbound = false;
        this.outbound = false;
        this.stock = false;
    }

    @Input()
    set helpCd(value: string) {
        // Return if the values are the same
        if (this._helpCd === value) {
            return;
        }

        // Store the value
        this._helpCd = value;

        // If the time range turned off...
        if (!value) {
        }
    }

    get helpCd(): string {
        return this._helpCd;
    }

    accountLookupBook(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/bb84f5f5fde048169958f0695a9edb9f', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }
    accountLookupVideo(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/80b4b9264f2b42ae8de7e004204c2ba6', this._helpCd, 'top=50,left=200,width=1100,height=1100');
    }
    accountCreatBook(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/97579965ca684b928ade26753a79d0b2', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }
    accountCreatVideo(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/f31f3a79320446f9ae0a3f7455d767f5', this._helpCd, 'top=50,left=200,width=1100,height=1100');
    }
    accountUpdateBook(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/ffbad134a790495e86655421bdcaf1fd', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }
    accountUpdateVideo(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/b6298ec20c0b4be2959042d9b4ea8251', this._helpCd, 'top=50,left=200,width=1100,height=1100');
    }
    accountDeleteBook(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/e03ed2f632204f9a929733b79c11cf93', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }
    accountDeleteVideo(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/2734f20e79d54c75b6a74fe91d110af5', this._helpCd, 'top=50,left=200,width=1100,height=1100');
    }
    accountNewUpdateBook(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/97579965ca684b928ade26753a79d0b2', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }
    accountNewUpdateVideo(): void {
        const sendData = {helpCd: this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/5d8f147cf3a1461b8ba8b1d2f23cae88', this._helpCd, 'top=50,left=200,width=1100,height=1100');
    }
}
