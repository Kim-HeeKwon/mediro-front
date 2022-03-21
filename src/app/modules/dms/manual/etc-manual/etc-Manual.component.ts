import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation
} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
    selector: 'etc-Manual',
    templateUrl: './etc-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class etcManualComponent {
    excel: boolean = false;
    video: boolean = false;
    grid: boolean = false;
    url: SafeResourceUrl;
    isMobile: boolean = false;

    constructor(public sanitizer: DomSanitizer,
                private _deviceService: DeviceDetectorService,) {
        this.isMobile = this._deviceService.isMobile();
    }

    excelBtn(): void {
        if(this.excel) {
            this.excel = false;
        } else {
            this.excel = true;
            this.grid = false;
        }
    }

    gridBtn(): void {
        if(this.grid) {
            this.grid = false;
        } else {
            this.excel = false;
            this.grid = true;
        }
    }

    excelDown(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/w6Uy-La_-rA');
    }

    gridManagement(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/BWJGNlTVwhw');
    }

    gridCopy(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/ehIfioQPTqo');
    }

    gridPaginate(): void {
        this.video = true;
        // eslint-disable-next-line max-len
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/VrGTdEJrXTk');
    }


}

