import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnInit,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";

@Component({
    selector       : 'settings-userGuide',
    templateUrl    : './userGuide.compent.html',
    styleUrls      : ['./userGuide.compent.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export  class SettingsUserGuideComponent implements  OnInit
{
    accountBtn: boolean = false;
    itemBtn: boolean = false;
    itemPriceBtn: boolean = false;
    estimateBtn: boolean = false;
    orderBtn: boolean = false;
    salesorderBtn: boolean = false;
    inboundBtn: boolean = false;
    outboundBtn: boolean = false;
    stockBtn: boolean = false;
    billBtn: boolean = false;
    taxBtn: boolean = false;

    private _helpCd: string;
    ngOnInit(): void {
    }

    account(): void {
        this.accountBtn = true;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = false;
    }
    accountCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/faa88aedc4ab4a508335e1678a830076', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }

    item(): void {
        this.accountBtn = false;
        this.itemBtn = true;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = false;
    }
    itemCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/4d42d674d1514d63a63fc1f32085e83c', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }

    itemPrice(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = true;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = false;
    }
    itemPriceCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/55a0f28f5d1e4f8abfcc14c228a4261a', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }

    estimate(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = true;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = false;
    }

    estimateCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/d3ba01162bb4437a9a21f4cf1f5b5fc9', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }
    order(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = true;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = false;
    }

    orderCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/ebee6dc7e8c240fda745694bda6ca067', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }

    salesorder(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = true;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = false;
    }

    salesorderCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/9e21c31e24e44b1196e026054fe9aa42', this._helpCd, 'top=50,left=200,width=1100,height=700');}

    inbound(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = true;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = false;
    }

    inboundCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/d7276ce22bd24b2ea303adc09aafeb07', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }

    outbound(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = true;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = false;
    }

    outboundCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/eabad2ba22ae438c855c45b0a933ba1e', this._helpCd, 'top=50,left=200,width=1100,height=700');}

    stock(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = true;
        this.billBtn = false;
    }

    stockCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/560b502fcad44793ad74ca9f9a007f2b', this._helpCd, 'top=50,left=200,width=1100,height=700');}

    bill(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = true;
        this.taxBtn = false;
    }

    billCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/9a2a361ac4314431973e1df636653c0a', this._helpCd, 'top=50,left=200,width=1100,height=700');
    }

    tax(): void {
        this.accountBtn = false;
        this.itemBtn = false;
        this.itemPriceBtn = false;
        this.estimateBtn = false;
        this.orderBtn = false;
        this.salesorderBtn = false;
        this.inboundBtn = false;
        this.outboundBtn = false;
        this.stockBtn = false;
        this.billBtn = false;
        this.taxBtn = true;
    }

    taxCreated(): void {
        const sendData = {helpCd : this._helpCd};
        window.open('https://canyon-tourmaline-630.notion.site/80aa167121d847e59a74f0fa456c3643', this._helpCd, 'top=50,left=200,width=1100,height=700');}

}
