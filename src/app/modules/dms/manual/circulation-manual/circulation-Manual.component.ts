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
    bill: boolean = false;
    tax: boolean = false;
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
            this.bill = false;
            this.tax = false;
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
            this.bill = false;
            this.tax = false;
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
            this.bill = false;
            this.tax = false;
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
            this.bill = false;
            this.tax = false;
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
            this.bill = false;
            this.tax = false;
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
            this.bill = false;
            this.tax = false;
        }
    }

    billBtn(): void {
        if(this.bill) {
            this.bill = false;
        } else {
            this.estimate = false;
            this.order = false;
            this.salesorder = false;
            this.inbound = false;
            this.outbound = false;
            this.stock = false;
            this.bill = true;
            this.tax = false;
        }
    }

    taxBtn(): void {
        if(this.tax) {
            this.tax = false;
        } else {
            this.estimate = false;
            this.order = false;
            this.salesorder = false;
            this.inbound = false;
            this.outbound = false;
            this.stock = false;
            this.bill = false;
            this.tax = true;
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
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/49b2d031-8c9d-4b20-8da0-8c4ab04d6930/%E1%84%8C%E1%85%A2%E1%84%80%E1%85%A9_%E1%84%8B%E1%85%B5%E1%84%85%E1%85%A7%E1%86%A8%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075720Z&X-Amz-Expires=86400&X-Amz-Signature=42053ada055272408119a9ed86cc8c667f2f4ea619dd3a2769ff0203f9a76245&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25A2%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%258B%25E1%2585%25B5%25E1%2584%2585%25E1%2585%25A7%25E1%2586%25A8%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    billLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e088dc3d-0f01-42fd-b167-1945267f7f6f/%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%89%E1%85%A1%E1%86%AB_%E1%84%86%E1%85%B5%E1%86%BE_%E1%84%86%E1%85%A1%E1%84%80%E1%85%A1%E1%86%B7_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075828Z&X-Amz-Expires=86400&X-Amz-Signature=ec87b68cdc9a738bd1baf4963e4c56d0bb6a64c6750cad042b7b38645ef220a7&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC%25E1%2584%2589%25E1%2585%25A1%25E1%2586%25AB%2520%25E1%2584%2586%25E1%2585%25B5%25E1%2586%25BE%2520%25E1%2584%2586%25E1%2585%25A1%25E1%2584%2580%25E1%2585%25A1%25E1%2586%25B7%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }


}
