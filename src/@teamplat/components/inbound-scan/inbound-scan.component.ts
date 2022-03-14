import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {fuseAnimations} from "../../animations";

@Component({
    selector: 'app-inbound-scan',
    templateUrl: './inbound-scan.component.html',
    styleUrls: ['./inbound-scan.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class InboundScanComponent implements OnInit, OnDestroy, AfterViewInit {
    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }

}
