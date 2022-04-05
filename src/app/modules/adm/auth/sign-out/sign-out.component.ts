import {Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {Subject, timer} from "rxjs";
import {AuthService} from "../../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {finalize, takeUntil, takeWhile, tap} from "rxjs/operators";

@Component({
    selector     : 'adm-auth-sign-out',
    templateUrl  : './sign-out.component.html',
    encapsulation: ViewEncapsulation.None
})
export class SignOutComponent implements OnInit, OnDestroy
{
    countdown: number = 5;
    countdownMapping: any = {
        '=1'   : '# second',
        'other': '# seconds'
    };
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router
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
        // Sign out
        this._authService.signOut();

        // Redirect after the countdown
        timer(1000, 1000)
            .pipe(
                finalize(() => {
                    this._router.navigate(['admin/sign-in']);
                }),
                takeWhile(() => this.countdown > 0),
                takeUntil(this._unsubscribeAll),
                tap(() => this.countdown--)
            )
            .subscribe();
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
}
