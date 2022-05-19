import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector: 'circulation-Manual',
    templateUrl: './circulation-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class circulationManualComponent {
    url: SafeResourceUrl;
    video: boolean = false;
    estimate: boolean = false;
    order: boolean = false;
    salesorder: boolean = false;
    inbound: boolean = false;
    outbound: boolean = false;
    stock: boolean = false;
    isMobile: boolean = false;

    constructor(public sanitizer: DomSanitizer,
    private _deviceService: DeviceDetectorService,) {
        this.isMobile = this._deviceService.isMobile();
    }

    estimateBtn(): void {
        if(this.estimate) {
            this.estimate = false;
        } else {
            this.estimate = true;
            this.order = false;
            this.salesorder = false;
            this.inbound = false;
            this.outbound = false;
            this.stock = false;
        }
    }

    orderBtn(): void {
        if(this.order) {
            this.order = false;
        } else {
            this.estimate = false;
            this.order = true;
            this.salesorder = false;
            this.inbound = false;
            this.outbound = false;
            this.stock = false;
        }
    }

    salesorderBtn(): void {
        if(this.salesorder) {
            this.salesorder = false;
        } else {
            this.estimate = false;
            this.order = false;
            this.salesorder = true;
            this.inbound = false;
            this.outbound = false;
            this.stock = false;
        }
    }

    inboundBtn(): void {
        if(this.inbound) {
            this.inbound = false;
        } else {
            this.estimate = false;
            this.order = false;
            this.salesorder = false;
            this.inbound = true;
            this.outbound = false;
            this.stock = false;
        }
    }

    outboundBtn(): void {
        if(this.outbound) {
            this.outbound = false;
        } else {
            this.estimate = false;
            this.order = false;
            this.salesorder = false;
            this.inbound = false;
            this.outbound = true;
            this.stock = false;
        }
    }

    stockBtn(): void {
        if(this.stock) {
            this.stock = false;
        } else {
            this.estimate = false;
            this.order = false;
            this.salesorder = false;
            this.inbound = false;
            this.outbound = false;
            this.stock = true;
        }
    }

    estimateCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Hl7XvXMq_6M');
    }

    estimateUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/fqNYq1pnFRE');
    }

    estimateDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/h1FtBlErD74');
    }

    estimateSend(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/WfpImnQb-yU');
    }

    estimateConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/KtLU21js-_g');
    }

    orderLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Rk_UPetcCkc');
    }

    orderCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/14zigwNa_uA');
    }

    orderUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/rzeWDcRFAig');
    }

    orderDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/x7h5eG9gFnw');
    }

    orderSend(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/kiZx1AJQhOY');
    }

    orderConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/sCmIOg6u01s');
    }

    salesorderCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/0BqyUj75Ohc');
    }

    salesorderUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/sEv5-yk0P-s');
    }

    salesorderDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/AQclAx1AoPw');
    }

    salesorderRefund(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/AUuIcF5UHjk');
    }

    salesorderConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/q1e5ONep334');
    }

    inboundCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Lqqu0zzv__U');
    }

    inboundUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/IlLdNY9lu2s');
    }

    inboundDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/hJDvy14ayck');
    }

    inboundStore(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/apRbT-4pMv0');
    }

    inboundSell(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/TBfYjzTIBks');
    }

    inboundEnd(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/0c5_5o9UlzI');
    }

    outboundLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/hrRLO3h4EQE');
    }

    outboundCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Ztzf84mZVAQ');
    }

    outboundUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/cPuFFkzsxBI');
    }

    outboundDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/txUE3B6qzRM');
    }

    outboundStore(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/6-HvzFuFGVc');
    }

    outboundUDIStore(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/cvWado3rE_k');
    }

    outboundPayment(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/chO9gJSt998');
    }

    stockAdjustment(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/nmN4Jzcyyxc');
    }

    stockRecordLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/1baUta6r8jA');
    }


}
