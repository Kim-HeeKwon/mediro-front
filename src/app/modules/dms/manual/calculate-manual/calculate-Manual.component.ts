import {ChangeDetectionStrategy, Component, ViewEncapsulation} from "@angular/core";
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector: 'calculate-Manual',
    templateUrl: './calculate-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export class calculateManualComponent {
    url: SafeResourceUrl;
    video: boolean = false;
    bill: boolean = false;
    tax: boolean = false;
    deposit: boolean = false;
    withdrawal: boolean = false;
    incomeoutcome: boolean = false;
    isMobile: boolean = false;

    constructor(public sanitizer: DomSanitizer,
                private _deviceService: DeviceDetectorService,) {
        this.isMobile = this._deviceService.isMobile();
    }

    billBtn(): void {
        if (this.bill) {
            this.bill = false;
        } else {
            this.bill = true;
            this.tax = false;
            this.deposit = false;
            this.withdrawal = false;
            this.incomeoutcome = false;
        }
    }

    taxBtn(): void {
        if (this.tax) {
            this.tax = false;
        } else {
            this.tax = true;
            this.bill = false;
            this.deposit = false;
            this.withdrawal = false;
            this.incomeoutcome = false;
        }
    }

    depositBtn(): void {
        if (this.deposit) {
            this.deposit = false;
        } else {
            this.tax = false;
            this.bill = false;
            this.deposit = true;
            this.withdrawal = false;
            this.incomeoutcome = false;
        }
    }

    withdrawalBtn(): void {
        if (this.withdrawal) {
            this.withdrawal = false;
        } else {
            this.tax = false;
            this.bill = false;
            this.deposit = false;
            this.withdrawal = true;
            this.incomeoutcome = false;
        }
    }

    incomeoutcomeBtn(): void {
        if (this.incomeoutcome) {
            this.incomeoutcome = false;
        } else {
            this.tax = false;
            this.bill = false;
            this.deposit = false;
            this.withdrawal = false;
            this.incomeoutcome = true;
        }
    }

    billConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/JKrNTobVdbs');
    }

    billUpdate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/Ryjf-grDDpM');
    }

    taxDelet(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/afubjV8iN4Q');
    }

    depositCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/2su2iQP-TUU');
    }

    depositDelet(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/ZEmOSPuGiJ4');
    }

    depositConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/3t6Rnjuv8Ow');
    }

    withdrawalCreat(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/HWbCbpS0560');
    }

    withdrawalDelet(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/SpWgUrhHWr4');
    }

    withdrawalConfirmed(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/bhBDxAq6jto');
    }

    incomeoutcomeTotalLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/XRLxnYtI5YI');
    }

    incomeoutcomeTotal(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/TWdPUvYCNJU');
    }

}
