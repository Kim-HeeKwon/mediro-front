import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';

@Component({
    selector: 'smartPlus-Manual',
    templateUrl: './smartPlus-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class smartPlusManualComponent implements OnInit {
    safety: boolean = false;
    validity: boolean = false;
    acceptable: boolean = false;

    ngOnInit(): void {
    }

    safetyBtn(): void {
        if (this.safety) {
            this.safety = false;
        } else {
            this.safety = true;
            this.validity = false;
            this.acceptable = false;
        }
    }

    validityBtn(): void {
        if (this.validity) {
            this.validity = false;
        } else {
            this.safety = false;
            this.validity = true;
            this.acceptable = false;
        }
    }

    acceptableBtn(): void {
        if (this.acceptable) {
            this.acceptable = false;
        } else {
            this.safety = false;
            this.validity = false;
            this.acceptable = true;
        }
    }

}
