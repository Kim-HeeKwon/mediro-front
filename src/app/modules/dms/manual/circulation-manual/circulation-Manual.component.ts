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

    estimateLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/A_5FoURCoEo');
    }

    estimateCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/NMvS7hxaAQ8');
    }

    estimateUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/QOoD_nyUvXs');
    }

    estimateDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/TkkGfbgAe7s');
    }

    estimateSend(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/kVEDl-Hx78U');
    }

    estimateConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/cUl7XpwFioU');
    }

    orderLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Rk_UPetcCkc');
    }

    orderCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Rf0ocaW-OXA');
    }

    orderUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/6s3sA3VWj_k');
    }

    orderDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/yvfoZwe-HN8');
    }

    orderSend(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/FPeCjUY-g28');
    }

    orderConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/f1PkWYsLZrc');
    }

    salesorderLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/niu-pTopEK8');
    }

    salesorderCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/-gXVOAldjBM');
    }

    salesorderUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/0adABotdj40');
    }

    salesorderDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Xc2n0qEjZiM');
    }

    salesorderRefund(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/yGNwz6GT-HQ');
    }

    salesorderConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/oqVLdqbQk3Y');
    }

    inboundLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/HXt-ptlYlGQ');
    }

    inboundCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/xufS2n-qj50');
    }

    inboundUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Khy1Wl3SoXM');
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
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/wGZ66cgKKlw');
    }

    outboundUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/cPuFFkzsxBI');
    }

    outboundDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/xTWt-Mjksqs');
    }

    outboundStore(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Eo1zhuJUzU8');
    }


    stockLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/2y7I3hg4l-Q');
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
