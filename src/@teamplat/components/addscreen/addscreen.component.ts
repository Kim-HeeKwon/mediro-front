import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Input, OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {environment} from 'environments/environment';
import {Subject} from "rxjs";
import {Router} from "@angular/router";
import {UserService} from "../../../app/core/user/user.service";

@Component({
    selector       : 'fuse-addscreen',
    templateUrl    : './addscreen.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'fuseAddscreen'
})
export class FuseAddscreenComponent implements OnInit, OnDestroy
{

    @Input() showAvatar: boolean = true;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _router: Router,
        private _userService: UserService
    )
    {
    }
    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    newPage(): void
    {
        window.open(environment.pageUrl, '','top=50,left=50,width=2000,height=1000');
    }

    tabPage(): void
    {
        window.open(environment.pageUrl, '_blank');
    }

}
