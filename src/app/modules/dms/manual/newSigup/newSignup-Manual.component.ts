import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
    selector: 'newSignup-Manual',
    templateUrl: './newSignup-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class newSignupManualComponent {
    signUp: boolean = false;
    account: boolean = false;
    price: boolean = false;
    orderInbound: boolean = false;
    salOutbound: boolean = false;
    incomeOutcome: boolean = false;
    video: boolean = false;
    url: SafeResourceUrl;
    isMobile: boolean = false;

    constructor(public sanitizer: DomSanitizer,
                private _deviceService: DeviceDetectorService,) {
        this.isMobile = this._deviceService.isMobile();
    }

    signUpBtn(): void {
        if(this.signUp) {
            this.signUp = false;
        } else {
            this.signUp = true;
            this.account = false;
            this.price = false;
            this.salOutbound = false;
            this.incomeOutcome = false;
        }
    }

    accountBtn(): void {
        if(this.account) {
            this.account = false;
        } else {
            this.signUp = false;
            this.account = true;
            this.price = false;
            this.orderInbound = false;
            this.salOutbound = false;
            this.incomeOutcome = false;
        }
    }

    priceBtn(): void {
        if(this.price) {
            this.price = false;
        } else {
            this.signUp = false;
            this.account = false;
            this.orderInbound = false;
            this.price = true;
            this.salOutbound = false;
            this.incomeOutcome = false;
        }
    }

    orderInboundBtn(): void {
        if(this.orderInbound) {
            this.orderInbound = false;
        } else {
            this.signUp = false;
            this.account = false;
            this.price = false;
            this.orderInbound = true;
            this.salOutbound = false;
            this.incomeOutcome = false;
        }
    }

    salOutboundBtn(): void {
        if(this.salOutbound) {
            this.salOutbound = false;
        } else {
            this.signUp = false;
            this.account = false;
            this.price = false;
            this.orderInbound = false;
            this.salOutbound = true;
            this.incomeOutcome = false;
        }
    }

    incomeOutcomeBtn(): void {
        if(this.incomeOutcome) {
            this.incomeOutcome = false;
        } else {
            this.signUp = false;
            this.account = false;
            this.price = false;
            this.orderInbound = false;
            this.salOutbound = false;
            this.incomeOutcome = true;
        }
    }

    signUpManual(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/-wyOdZSd7ZI');
    }

    accountManual(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/jjoqyRbA7kc');
    }

    priceManual(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/j-NxkPRLfKg');
    }

    orderInboundManual(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/HWR1aGH0Ac8');
    }

    salOutboundManual(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/ZLDtaADXRo0');
    }

    incomeOutcomeManual(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/kNnWch6sUes');
    }


}

