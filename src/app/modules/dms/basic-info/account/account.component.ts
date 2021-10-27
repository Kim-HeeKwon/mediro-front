import {AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {fuseAnimations} from "../../../../../@teamplat/animations";

@Component({
    selector: 'dms-app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {
    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }

}
