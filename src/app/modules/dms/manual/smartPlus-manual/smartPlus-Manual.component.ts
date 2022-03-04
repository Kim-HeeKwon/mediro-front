import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from "@angular/platform-browser";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector: 'smartPlus-Manual',
    templateUrl: './smartPlus-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class smartPlusManualComponent {
    url: SafeResourceUrl;
    video: boolean = false;
    safety: boolean = false;
    validity: boolean = false;
    acceptable: boolean = false;
    longterm: boolean = false;
    isMobile: boolean = false;

    constructor(public sanitizer: DomSanitizer,
                private _deviceService: DeviceDetectorService,) {
        this.isMobile = this._deviceService.isMobile();
    }


    safetyBtn(): void {
        if (this.safety) {
            this.safety = false;
        } else {
            this.safety = true;
            this.validity = false;
            this.acceptable = false;
            this.longterm = false;
        }
    }

    validityBtn(): void {
        if (this.validity) {
            this.validity = false;
        } else {
            this.safety = false;
            this.validity = true;
            this.acceptable = false;
            this.longterm = false;
        }
    }

    acceptableBtn(): void {
        if (this.acceptable) {
            this.acceptable = false;
        } else {
            this.safety = false;
            this.validity = false;
            this.acceptable = true;
            this.longterm = false;
        }
    }

    longtermBtn(): void {
        if (this.longterm) {
            this.longterm = false;
        } else {
            this.safety = false;
            this.validity = false;
            this.acceptable = false;
            this.longterm = true;
        }
    }

    safetyLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/YfCo2uSoxCo');
    }

    safetySetting(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/rg6U4U6OdI4');
    }

    safetyOrder(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/1rqJJD1dLxE');
    }

    validityLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/lx9eDMrFZCg');
    }

    validitySetting(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/pNXNopNE9dY');
    }

    longtermLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/d9GoxDmZMV0');
    }

    longtermSetting(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/YkQDtvXaTlU');
    }

    acceptableLookUp(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/0rybkGxF070');
    }

    acceptableSetting(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/0wNHwhKO3BY');
    }
}
