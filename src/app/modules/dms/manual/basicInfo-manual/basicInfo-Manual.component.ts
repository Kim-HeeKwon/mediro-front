import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
    selector: 'basicInfo-Manual',
    templateUrl: './basicInfo-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class basicInfoManualComponent {
    url: SafeResourceUrl;
    video: boolean = false;
    account: boolean = false;
    item: boolean = false;
    itemPrice: boolean = false;

    constructor(public sanitizer: DomSanitizer) {
    }

    accountBtn(): void {
        if(this.account) {
            this.account = false;
        }else {
            this.item = false;
            this.itemPrice = false;
            this.account = true;
            this.video = false;
        }
    }

    itemBtn(): void {
        if(this.item) {
            this.item = false;
        }else {
            this.item = true;
            this.itemPrice = false;
            this.account = false;
            this.video = false;
        }
    }

    itemPriceBtn(): void {
        if(this.itemPrice) {
            this.itemPrice = false;
        }else {
            this.item = false;
            this.itemPrice = true;
            this.account = false;
            this.video = false;
        }
    }

    accountLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/ae9f547d-d0e5-4887-ba34-b8fcbb805279/%E1%84%80%E1%85%A5%E1%84%85%E1%85%A2%E1%84%8E%E1%85%A5_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T064534Z&X-Amz-Expires=86400&X-Amz-Signature=f557228b02ccbdfa7b556a7fd60fa6201f47dd42103e09b503c3f027cffb545d&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A5%25E1%2584%2585%25E1%2585%25A2%25E1%2584%258E%25E1%2585%25A5%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    accountCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/3b115542-ef45-47ae-92f4-ded2f84a210e/1.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T064929Z&X-Amz-Expires=86400&X-Amz-Signature=4bf2c9abfbe7ddca4f961957d94c3aa673c2b219d31d735c06195cb1442e3892&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%221.mp4%22&x-id=GetObject');
    }

    accountUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/c577d081-f7d4-4948-8c33-ef51f1baad5f/%E1%84%80%E1%85%A5%E1%84%85%E1%85%A2%E1%84%8E%E1%85%A5_%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T065445Z&X-Amz-Expires=86400&X-Amz-Signature=47ad611050fc7befe2f0156982e869c767f34c614401c3bdc89a2ac36ec9bdf3&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A5%25E1%2584%2585%25E1%2585%25A2%25E1%2584%258E%25E1%2585%25A5%2520%25E1%2584%2589%25E1%2585%25AE%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    accountDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/a7e63023-4515-41b6-ad1a-fe2518090c1c/%E1%84%80%E1%85%A5%E1%84%85%E1%85%A2%E1%84%8E%E1%85%A5_%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T065537Z&X-Amz-Expires=86400&X-Amz-Signature=0d8fd9439e5a8c866118517dd9ca98981d617b2a389bf08722a1a4704a1e1c25&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A5%25E1%2584%2585%25E1%2585%25A2%25E1%2584%258E%25E1%2585%25A5%2520%25E1%2584%2589%25E1%2585%25A1%25E1%2586%25A8%25E1%2584%258C%25E1%2585%25A6.mp4%22&x-id=GetObject');
    }

    accountNewUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/c31aa194-fe5a-4b5e-b3a4-1cb36e546a8e/%E1%84%80%E1%85%A5%E1%84%85%E1%85%A2%E1%84%8E%E1%85%A5_%E1%84%90%E1%85%A9%E1%86%BC%E1%84%92%E1%85%A1%E1%86%B8%E1%84%8C%E1%85%A5%E1%86%BC%E1%84%87%E1%85%A9_%E1%84%89%E1%85%B5%E1%84%89%E1%85%B3%E1%84%90%E1%85%A6%E1%86%B7.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T065643Z&X-Amz-Expires=86400&X-Amz-Signature=140bef5bba6cd3c8e0d63c177ede30d53f0e464724d4978e70071830eae90d6d&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2580%25E1%2585%25A5%25E1%2584%2585%25E1%2585%25A2%25E1%2584%258E%25E1%2585%25A5%2520%25E1%2584%2590%25E1%2585%25A9%25E1%2586%25BC%25E1%2584%2592%25E1%2585%25A1%25E1%2586%25B8%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC%25E1%2584%2587%25E1%2585%25A9%2520%25E1%2584%2589%25E1%2585%25B5%25E1%2584%2589%25E1%2585%25B3%25E1%2584%2590%25E1%2585%25A6%25E1%2586%25B7.mp4%22&x-id=GetObject');
    }

    itemLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/3b87521c-f681-41b2-9d16-ba01dfee48c1/%E1%84%91%E1%85%AE%E1%86%B7%E1%84%86%E1%85%A9%E1%86%A8_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T070528Z&X-Amz-Expires=86400&X-Amz-Signature=c67da909008312ed69724e63d405cfcd4c866206c677a53a4c34f101d666b4c7&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2591%25E1%2585%25AE%25E1%2586%25B7%25E1%2584%2586%25E1%2585%25A9%25E1%2586%25A8%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    itemCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f6470f48-d63b-42d6-be54-0c776fbbbedf/%E1%84%91%E1%85%AE%E1%86%B7%E1%84%86%E1%85%A9%E1%86%A8_%E1%84%89%E1%85%B5%E1%86%AB%E1%84%80%E1%85%B2%E1%84%83%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A9%E1%86%A8.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T070558Z&X-Amz-Expires=86400&X-Amz-Signature=04f1febb6cbe6aedd42268d308429b9d968d8b4489fa96402dbadce5760b339e&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2591%25E1%2585%25AE%25E1%2586%25B7%25E1%2584%2586%25E1%2585%25A9%25E1%2586%25A8%2520%25E1%2584%2589%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2580%25E1%2585%25B2%25E1%2584%2583%25E1%2585%25B3%25E1%2586%25BC%25E1%2584%2585%25E1%2585%25A9%25E1%2586%25A8.mp4%22&x-id=GetObject');
    }

    itemUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/73f698c2-b8cf-4653-8141-c2349b35a95c/%E1%84%91%E1%85%AE%E1%86%B7%E1%84%86%E1%85%A9%E1%86%A8_%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T070624Z&X-Amz-Expires=86400&X-Amz-Signature=186b1c4871af269b6458e09f88fc112fa387252990b6788f09559f6229d263db&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2591%25E1%2585%25AE%25E1%2586%25B7%25E1%2584%2586%25E1%2585%25A9%25E1%2586%25A8%2520%25E1%2584%2589%25E1%2585%25AE%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    itemDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/f3be716d-6830-429c-939c-8e521e116da4/%E1%84%91%E1%85%AE%E1%86%B7%E1%84%86%E1%85%A9%E1%86%A8_%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T070654Z&X-Amz-Expires=86400&X-Amz-Signature=a38f389985b56de115f205f4abf4484e900a9e22b49bd6b450e967d9870ec986&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2591%25E1%2585%25AE%25E1%2586%25B7%25E1%2584%2586%25E1%2585%25A9%25E1%2586%25A8%2520%25E1%2584%2589%25E1%2585%25A1%25E1%2586%25A8%25E1%2584%258C%25E1%2585%25A6.mp4%22&x-id=GetObject');
    }

    itemPriceLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/210e0dfd-149a-4ba3-8867-a39674f28a54/%E1%84%83%E1%85%A1%E1%86%AB%E1%84%80%E1%85%A1_%E1%84%8C%E1%85%A9%E1%84%92%E1%85%AC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T071451Z&X-Amz-Expires=86400&X-Amz-Signature=6fe8c12ae53bbab2e13ac10bcbbc2006fa5a2203bb38a299ab9d7b127b8efc30&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2583%25E1%2585%25A1%25E1%2586%25AB%25E1%2584%2580%25E1%2585%25A1%2520%25E1%2584%258C%25E1%2585%25A9%25E1%2584%2592%25E1%2585%25AC.mp4%22&x-id=GetObject');
    }

    itemPriceCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/872f035f-4efc-4f37-9c91-4e9b8664d2b6/%E1%84%83%E1%85%A1%E1%86%AB%E1%84%80%E1%85%A1_%E1%84%89%E1%85%B5%E1%86%AB%E1%84%80%E1%85%B2%E1%84%83%E1%85%B3%E1%86%BC%E1%84%85%E1%85%A9%E1%86%A8.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T071518Z&X-Amz-Expires=86400&X-Amz-Signature=388675cb5ef44607e330312943b75c269f46d28543b229d904a1d29c9b1637f1&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2583%25E1%2585%25A1%25E1%2586%25AB%25E1%2584%2580%25E1%2585%25A1%2520%25E1%2584%2589%25E1%2585%25B5%25E1%2586%25AB%25E1%2584%2580%25E1%2585%25B2%25E1%2584%2583%25E1%2585%25B3%25E1%2586%25BC%25E1%2584%2585%25E1%2585%25A9%25E1%2586%25A8.mp4%22&x-id=GetObject');
    }

    itemPriceUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/e3ae38cf-b4d6-4778-a2a2-022f59af3a39/%E1%84%83%E1%85%A1%E1%86%AB%E1%84%80%E1%85%A1_%E1%84%89%E1%85%AE%E1%84%8C%E1%85%A5%E1%86%BC.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T071538Z&X-Amz-Expires=86400&X-Amz-Signature=86e4e0bdc151f573c68b3cf829233c9db925bbf1fe0407c996b5568aa5cd87bb&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2583%25E1%2585%25A1%25E1%2586%25AB%25E1%2584%2580%25E1%2585%25A1%2520%25E1%2584%2589%25E1%2585%25AE%25E1%2584%258C%25E1%2585%25A5%25E1%2586%25BC.mp4%22&x-id=GetObject');
    }

    itemPriceDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://s3.us-west-2.amazonaws.com/secure.notion-static.com/ad7a5101-2471-457a-9406-51af3fdb2efc/%E1%84%83%E1%85%A1%E1%86%AB%E1%84%80%E1%85%A1_%E1%84%89%E1%85%A1%E1%86%A8%E1%84%8C%E1%85%A6.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220103%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220103T071607Z&X-Amz-Expires=86400&X-Amz-Signature=798c79eaaf679da72aabb5fd4f318497da7327cc7e5649e178eb3cdf827212b4&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22%25E1%2584%2583%25E1%2585%25A1%25E1%2586%25AB%25E1%2584%2580%25E1%2585%25A1%2520%25E1%2584%2589%25E1%2585%25A1%25E1%2586%25A8%25E1%2584%258C%25E1%2585%25A6.mp4%22&x-id=GetObject');
    }
}
