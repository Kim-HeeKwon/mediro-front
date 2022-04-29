import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {DeviceDetectorService} from 'ngx-device-detector';

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
    isMobile: boolean = false;

    constructor(public sanitizer: DomSanitizer,
                private _deviceService: DeviceDetectorService,) {
        this.isMobile = this._deviceService.isMobile();
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

    accountCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/TghFH0ApbwE');
    }

    accountUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/C0ELuBapAtQ');
    }

    accountDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/tPTEbHecYrU');
    }

    accountNewUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/MOmxR4ZcmX8');
    }

    itemCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/KnezVWnq4Zg');
    }

    itemUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/VdiulflW2E0');
    }

    itemDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/EqX6yzjy8I0');
    }

    itemPriceCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Xz3BnlsA6Lc');
    }

    itemPriceUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/ipGPJwII2uA');
    }

    itemPriceDelete(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/5Cw77X0G2o4');
    }
}
