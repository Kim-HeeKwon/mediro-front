import {Component, Injectable, OnInit, ViewEncapsulation} from '@angular/core';


@Component({
    selector: 'app-loading',
    templateUrl: 'common-loading-bar.component.html',
    styleUrls: ['./common-loading-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'appLoading'
})

@Injectable()
export class CommonLoadingBarComponent implements OnInit{

    constructor(
    )
    {
    }

    // eslint-disable-next-line @angular-eslint/contextual-lifecycle
    ngOnInit(): void {
    }
}

