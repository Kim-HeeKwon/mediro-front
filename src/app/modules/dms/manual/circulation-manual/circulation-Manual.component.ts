import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

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

    constructor(public sanitizer: DomSanitizer) {
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
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/158a97fb-6421-437e-951d-ac71579bda07/%E1%84%80%E1%85%A7%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%A8_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072114Z&X-Amz-Expires=86400&X-Amz-Signature=52debf3d9dff579d28134309208eefcbcba028e673be83df842b6a92a85966a9&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A7%25E1%2586%25AB%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25A8%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    estimateCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/c1c25a43-963a-40e3-9f6c-d1a1b39acf18/%E1%84%80%E1%85%A7%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%A8_%E1%84%8C%E1%85%A1%E1%86%A8%E1%84%89%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072150Z&X-Amz-Expires=86400&X-Amz-Signature=755ec521e7d4a23cf442f5d111917968dabb2c9a579dddcdeaad2eac52c90ba4&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A7%25E1%2586%25AB%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25A8%2520%25E1%2584%258C%25E1%2585%25A1%25E1%2586%25A8%25E1%2584%2589%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    estimateUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/88f11a16-722e-4069-a387-6fae461cbd14/%E1%84%80%E1%85%A7%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%A8_%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072221Z&X-Amz-Expires=86400&X-Amz-Signature=bb98b8303e38ec059bd3b1f60c087210bd61e5d6f586a6626f3218402db528ad&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A7%25E1%2586%25AB%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25A8%2520%25E1%2584%2589%25E1%2585%25AE%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    estimateDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/c90aa1a8-053f-41c1-9806-72c2dfb285b2/%E1%84%80%E1%85%A7%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%A8_%E1%84%8E%E1%85%B1%E1%84%89%E1%85%A9.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072256Z&X-Amz-Expires=86400&X-Amz-Signature=58e0370b3c0672f8e0ff6d60f38a66c9c3bb930e9c24f7b0d8a9475d0ee3a1ba&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A7%25E1%2586%25AB%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25A8%2520%25E1%2584%258E%25E1%2585%25B1%25E1%2584%2589%25E1%2585%25A9.mp4%22&x-id=GetObject');
    }

    estimateSend(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/ba3abd0b-9d2d-43c4-bf04-b99d47836ae9/%E1%84%80%E1%85%A7%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%A8%E1%84%89%E1%85%A5_%E1%84%87%E1%85%A1%E1%86%AF%E1%84%89%E1%85%A9%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072433Z&X-Amz-Expires=86400&X-Amz-Signature=5c5e6fd6bb282ae4175a6111a5ef9648acec0fbe18a570632b6191370ecf18cc&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A7%25E1%2586%25AB%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25A8%25E1%2584%2589%25E1%2585%25A5%2520%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%2589%25E1%2585%25A9%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    estimateConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/5008d87b-3e3b-4062-b1f8-0729cbb5c47e/%E1%84%80%E1%85%A7%E1%86%AB%E1%84%8C%E1%85%A5%E1%86%A8_%E1%84%92%E1%85%AA%E1%86%A8%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072536Z&X-Amz-Expires=86400&X-Amz-Signature=20960f152cef864cc5ab8938f923d01bce7ae2d52975113f37dd5439840f8e44&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A7%25E1%2586%25AB%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25A8%2520%25E1%2584%2592%25E1%2585%25AA%25E1%2586%25A8%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    orderLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/0e89f8cb-3446-4c92-80fa-9581b4e40268/%E1%84%87%E1%85%A1%E1%86%AF%E1%84%8C%E1%85%AE_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072754Z&X-Amz-Expires=86400&X-Amz-Signature=30aece58a81edab8df097a704ce3d38d99e78ff66cc1128ffff7019a1cd4377b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%258C%25E1%2585%25AE%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    orderCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e84084d9-8544-4de0-bfd8-e3791ed3a330/%E1%84%87%E1%85%A1%E1%86%AF%E1%84%8C%E1%85%AE_%E1%84%8C%E1%85%A1%E1%86%A8%E1%84%89%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072818Z&X-Amz-Expires=86400&X-Amz-Signature=10dfb39b07c94b053abe9b06b0196d6099bda4dc20cb04c51792412e5403ff03&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%258C%25E1%2585%25AE%2520%25E1%2584%258C%25E1%2585%25A1%25E1%2586%25A8%25E1%2584%2589%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    orderUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/5d0e9137-52c1-46c5-9fbf-b023ce45bcc8/%E1%84%87%E1%85%A1%E1%86%AF%E1%84%8C%E1%85%AE_%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072847Z&X-Amz-Expires=86400&X-Amz-Signature=f864c5a3452c6275d289b1ff0cc05744de5bb1a265db072ce9698becee915a36&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%258C%25E1%2585%25AE%2520%25E1%2584%2589%25E1%2585%25AE%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    orderDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/ae95ce04-69ce-4c00-a5b3-5278d9b3b69b/%E1%84%87%E1%85%A1%E1%86%AF%E1%84%8C%E1%85%AE_%E1%84%8E%E1%85%B1%E1%84%89%E1%85%A9.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T072922Z&X-Amz-Expires=86400&X-Amz-Signature=c5c1f89a7460e8a61aec39cf6f994e87b610ac07cc378cee852fab098cb2ce9b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%258C%25E1%2585%25AE%2520%25E1%2584%258E%25E1%2585%25B1%25E1%2584%2589%25E1%2585%25A9.mp4%22&x-id=GetObject');
    }

    orderSend(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/05551595-5e0e-4ab4-94c6-e8f99a2f20ca/%E1%84%87%E1%85%A1%E1%86%AF%E1%84%8C%E1%85%AE%E1%84%89%E1%85%A5_%E1%84%87%E1%85%A1%E1%86%AF%E1%84%89%E1%85%A9%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T073002Z&X-Amz-Expires=86400&X-Amz-Signature=4e1d108e323d04d58f197d2b679ffe06802eb7a2eb74f3138b34a99448945460&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%258C%25E1%2585%25AE%25E1%2584%2589%25E1%2585%25A5%2520%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%2589%25E1%2585%25A9%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    orderConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/2a05c09a-b7c4-4b05-a172-47eefc7c8565/%E1%84%87%E1%85%A1%E1%86%AF%E1%84%8C%E1%85%AE%E1%84%89%E1%85%A5_%E1%84%87%E1%85%A1%E1%86%AF%E1%84%8C%E1%85%AE.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T073028Z&X-Amz-Expires=86400&X-Amz-Signature=ecfc0170b80f3b1b4389f968b1d8422b3714093b161ba3333c0f052ba1f1573b&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%258C%25E1%2585%25AE%25E1%2584%2589%25E1%2585%25A5%2520%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AF%25E1%2584%258C%25E1%2585%25AE.mp4%22&x-id=GetObject');
    }

    salesorderLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/a806c098-a8f0-49f3-add0-6ac31d596af6/%E1%84%8C%E1%85%AE%E1%84%86%E1%85%AE%E1%86%AB_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T073235Z&X-Amz-Expires=86400&X-Amz-Signature=6a178e4fc1d62a2ce1abc1d624eac7828f3c5728c6187f225bb2c00b75e40e23&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25AE%25E1%2584%2586%25E1%2585%25AE%25E1%2586%25AB%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    salesorderCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/4cc94c1c-6f88-46c5-a6f9-f5cdedbf7e37/%E1%84%8C%E1%85%AE%E1%84%86%E1%85%AE%E1%86%AB_%E1%84%8C%E1%85%A1%E1%86%A8%E1%84%89%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T073304Z&X-Amz-Expires=86400&X-Amz-Signature=4c504c00f80934cc58ed0877c52470e56bdcb644b370781bc78327b86911eaa0&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25AE%25E1%2584%2586%25E1%2585%25AE%25E1%2586%25AB%2520%25E1%2584%258C%25E1%2585%25A1%25E1%2586%25A8%25E1%2584%2589%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    salesorderUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/56d8ca46-bee0-4124-a6dc-d11986a0fff3/%E1%84%8C%E1%85%AE%E1%84%86%E1%85%AE%E1%86%AB_%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T073333Z&X-Amz-Expires=86400&X-Amz-Signature=f79e54367d6589fb362884cb3714eecda175356fb75a8d0596b836250b3ba02a&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25AE%25E1%2584%2586%25E1%2585%25AE%25E1%2586%25AB%2520%25E1%2584%2589%25E1%2585%25AE%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    salesorderDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/073f77fb-d053-443b-8f1f-406f1afa9d4d/%E1%84%8C%E1%85%AE%E1%84%86%E1%85%AE%E1%86%AB_%E1%84%8E%E1%85%B1%E1%84%89%E1%85%A9.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T073358Z&X-Amz-Expires=86400&X-Amz-Signature=a93f383ed436a5f5fecacd099af29f5f8a04c2ad1f6ab90bc3668af0427a9fd3&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25AE%25E1%2584%2586%25E1%2585%25AE%25E1%2586%25AB%2520%25E1%2584%258E%25E1%2585%25B1%25E1%2584%2589%25E1%2585%25A9.mp4%22&x-id=GetObject');
    }

    salesorderRefund(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/57e2620f-496b-420f-84f3-070ac63ec0a6/%E1%84%8C%E1%85%AE%E1%84%86%E1%85%AE%E1%86%AB_%E1%84%87%E1%85%A1%E1%86%AB%E1%84%91%E1%85%AE%E1%86%B7.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T073506Z&X-Amz-Expires=86400&X-Amz-Signature=4bc54fbefedfca89fc205987c1223e8067a9b790c1a4874332ff490487ea4c1f&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25AE%25E1%2584%2586%25E1%2585%25AE%25E1%2586%25AB%2520%25E1%2584%2587%25E1%2585%25A1%25E1%2586%25AB%25E1%2584%2591%25E1%2585%25AE%25E1%2586%25B7.mp4%22&x-id=GetObject');
    }

    salesorderConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/1a403d3a-d243-47c8-8e98-1d0cfa48c254/%E1%84%8C%E1%85%AE%E1%84%86%E1%85%AE%E1%86%AB_%E1%84%92%E1%85%AA%E1%86%A8%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T073439Z&X-Amz-Expires=86400&X-Amz-Signature=aa5738d7d2267a5d985121c75fc2858588a09a243796fa60ba87bf3c3d85d1a1&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25AE%25E1%2584%2586%25E1%2585%25AE%25E1%2586%25AB%2520%25E1%2584%2592%25E1%2585%25AA%25E1%2586%25A8%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    inboundLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/84e88df7-47b4-40d3-a5d7-694a64d75737/%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%A9_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T074536Z&X-Amz-Expires=86400&X-Amz-Signature=2a913ae5349b26ec3f875a5ba7a4ec6dd22a5c8c970e7d9ab73457b1c752a9f7&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258B%25E1%2585%25B5%25E1%2586%25B8%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    inboundCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/cf47586b-8736-4e23-8fb7-ad0fd58c3d40/%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%A9_%E1%84%89%E1%85%B5%E1%86%AB%E1%84%80%E1%85%B2_%E1%84%83%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A9%E1%86%A8.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T074606Z&X-Amz-Expires=86400&X-Amz-Signature=e1ca43f27fc5b4af7a2ce9ab31a898c2fa232adc65d45cb9943f93bb7bbf3839&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258B%25E1%2585%25B5%25E1%2586%25B8%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%2589%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2580%25E1%2585%25B2%2520%25E1%2584%2583%25E1%2585%25B3%25E1%2586%25BC%25E1%2584%2585%25E1%2585%25A9%25E1%2586%25A8.mp4%22&x-id=GetObject');
    }

    inboundUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/4536f470-f8ec-4ac8-a41e-c31db05c57d2/%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%A9_%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T074642Z&X-Amz-Expires=86400&X-Amz-Signature=f12d8969bc62538d24ef1e284611ac6d0a40a531f12183f34f1d7a97306622e0&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258B%25E1%2585%25B5%25E1%2586%25B8%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%2589%25E1%2585%25AE%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    inboundDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/12e827fa-693b-4bfb-9c60-da8e2ecbe6f3/%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%A9_%E1%84%8E%E1%85%B1%E1%84%89%E1%85%A9.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T074705Z&X-Amz-Expires=86400&X-Amz-Signature=069b82d84a981d702b6af723c733bd26d86fce4bb7563060526af28d39daf580&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258B%25E1%2585%25B5%25E1%2586%25B8%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%258E%25E1%2585%25B1%25E1%2584%2589%25E1%2585%25A9.mp4%22&x-id=GetObject');
    }

    inboundStore(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/af3fd9e6-ee25-487b-b679-89ebdbc068de/%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%A9_%E1%84%87%E1%85%AE%E1%84%87%E1%85%AE%E1%86%AB%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%A9%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%A9.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T074738Z&X-Amz-Expires=86400&X-Amz-Signature=f90cf489ec5edda03d50bb893d52f33df1fed4a066e823cc4ae0b3eee0167dd4&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258B%25E1%2585%25B5%25E1%2586%25B8%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%2587%25E1%2585%25AE%25E1%2584%2587%25E1%2585%25AE%25E1%2586%25AB%25E1%2584%258B%25E1%2585%25B5%25E1%2586%25B8%25E1%2584%2580%25E1%2585%25A9%253A%25E1%2584%258B%25E1%2585%25B5%25E1%2586%25B8%25E1%2584%2580%25E1%2585%25A9.mp4%22&x-id=GetObject');
    }

    inboundEnd(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f732e065-b955-4e4f-9598-e4612c92d933/%E1%84%8B%E1%85%B5%E1%86%B8%E1%84%80%E1%85%A9_%E1%84%86%E1%85%A1%E1%84%80%E1%85%A1%E1%86%B7.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T074905Z&X-Amz-Expires=86400&X-Amz-Signature=4ae3e7e980b293b2589f71ccbd7d10a6dcca9f0fa4ca073f23385e78b125e9bd&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258B%25E1%2585%25B5%25E1%2586%25B8%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%2586%25E1%2585%25A1%25E1%2584%2580%25E1%2585%25A1%25E1%2586%25B7.mp4%22&x-id=GetObject');
    }

    outboundLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/7b6f2a8b-c533-45a9-885f-956bc1d9a7b5/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%A9_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075230Z&X-Amz-Expires=86400&X-Amz-Signature=ee0944640bb17d3c20af89d2d8d05a55d5b13f401e409e22da7305c16745d882&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258E%25E1%2585%25AE%25E1%2586%25AF%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    outboundCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/90148fec-027f-4aab-9def-13ef68fc8c01/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%A9_%E1%84%89%E1%85%B5%E1%86%AB%E1%84%80%E1%85%B2_%E1%84%83%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A9%E1%86%A8.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075300Z&X-Amz-Expires=86400&X-Amz-Signature=6b68fb539e44ed909dd55f1576d7bd7e5be86a8563e2e6f624e670e16332325a&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258E%25E1%2585%25AE%25E1%2586%25AF%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%2589%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2580%25E1%2585%25B2%2520%25E1%2584%2583%25E1%2585%25B3%25E1%2586%25BC%25E1%2584%2585%25E1%2585%25A9%25E1%2586%25A8.mp4%22&x-id=GetObject');
    }

    outboundUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/3f0deebf-e40d-4d09-994b-efa78d940f44/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%A9_%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075326Z&X-Amz-Expires=86400&X-Amz-Signature=add9d06c719b822fc7a8b28168c4fe77ed5a9482c6f34f821af4a2aa531d1975&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258E%25E1%2585%25AE%25E1%2586%25AF%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%2589%25E1%2585%25AE%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    outboundDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/6b96b089-f1ad-4ddd-9014-9b778253ea87/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%A9_%E1%84%8E%E1%85%B1%E1%84%89%E1%85%A9.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075424Z&X-Amz-Expires=86400&X-Amz-Signature=04fd054692c989a75ae34133793879dfef29689d5e2d6a2984165fb173821c4a&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258E%25E1%2585%25AE%25E1%2586%25AF%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%258E%25E1%2585%25B1%25E1%2584%2589%25E1%2585%25A9.mp4%22&x-id=GetObject');
    }

    outboundStore(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/3c3469a5-fb40-44d2-b090-36e25ceb111f/%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%A9_%E1%84%87%E1%85%AE%E1%84%87%E1%85%AE%E1%86%AB%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%A9%E1%84%8E%E1%85%AE%E1%86%AF%E1%84%80%E1%85%A9.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075354Z&X-Amz-Expires=86400&X-Amz-Signature=9ed5545cf60ec7ff23c4d008d2ce4bcae9b4726d76765b9440ab40626aa3824e&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258E%25E1%2585%25AE%25E1%2586%25AF%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%2587%25E1%2585%25AE%25E1%2584%2587%25E1%2585%25AE%25E1%2586%25AB%25E1%2584%258E%25E1%2585%25AE%25E1%2586%25AF%25E1%2584%2580%25E1%2585%25A9%253A%25E1%2584%258E%25E1%2585%25AE%25E1%2586%25AF%25E1%2584%2580%25E1%2585%25A9.mp4%22&x-id=GetObject');
    }


    stockLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/d3363f4f-74a6-4676-ac09-6bdf2b8ff643/%E1%84%8C%E1%85%A2%E1%84%80%E1%85%A9_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075617Z&X-Amz-Expires=86400&X-Amz-Signature=0b53fdd5edb889299fe49ed1b49fd55bc705a0b0b34331dc5c04034b39ac77cb&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25A2%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    stockAdjustment(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/547bfe00-ad41-4653-9004-369624df3d86/%E1%84%8C%E1%85%A2%E1%84%80%E1%85%A9_%E1%84%8C%E1%85%A9%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T075637Z&X-Amz-Expires=86400&X-Amz-Signature=f1e59216232ab947053e12833ba50e751f75ab55da2c376510676660faca2392&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%258C%25E1%2585%25A2%25E1%2584%2580%25E1%2585%25A9%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
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
