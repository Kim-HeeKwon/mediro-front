import {
    ChangeDetectionStrategy,
    Component,
    OnInit,
    ViewEncapsulation
} from '@angular/core';

@Component({
    selector: 'etc-Manual',
    templateUrl: './etc-Manual.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class etcManualComponent implements OnInit {
    ngOnInit(): void {
    }
}
