import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';

@Component({
    selector: 'udi-Manual',
    templateUrl: './udi-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class udiManualComponent implements OnInit {
    manages: boolean = false;
    status: boolean = false;

    ngOnInit(): void {
    }

}
