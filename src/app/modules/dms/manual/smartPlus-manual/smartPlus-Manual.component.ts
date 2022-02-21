import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {DeviceDetectorService} from "ngx-device-detector";

@Component({
    selector: 'smartPlus-Manual',
    templateUrl: './smartPlus-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class smartPlusManualComponent {
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

}
