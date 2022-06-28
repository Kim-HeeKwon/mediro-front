import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseVerticalNavigationComponent } from '@teamplat/components/navigation/vertical/vertical.component';
import { FuseNavigationService } from '@teamplat/components/navigation/navigation.service';
import { FuseNavigationItem } from '@teamplat/components/navigation/navigation.types';
import { FuseUtilsService } from '@teamplat/services/utils/utils.service';
import { CookieService } from "ngx-cookie-service";
import { Shortcut } from "../../../../../../app/layout/common/shortcuts/shortcuts.types";
import {ShortcutsService} from "../../../../../../app/layout/common/shortcuts/shortcuts.service";
import {environment} from "../../../../../../environments/environment";


@Component({
    selector       : 'fuse-vertical-navigation-basic-item',
    templateUrl    : './basic.component.html',
    styles         : [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuseVerticalNavigationBasicItemComponent implements OnInit, OnDestroy
{
    @Input() item: FuseNavigationItem;
    @Input() name: string;
    shortCut: Shortcut = null;
    version: any;

    isActiveMatchOptions: IsActiveMatchOptions;
    private _fuseVerticalNavigationComponent: FuseVerticalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseUtilsService: FuseUtilsService,
        private _cookieService: CookieService,
        private _shortcutService: ShortcutsService
    )
    {
        // Set the equivalent of {exact: false} as default for active match options.
        // We are not assigning the item.isActiveMatchOptions directly to the
        // [routerLinkActiveOptions] because if it's "undefined" initially, the router
        // will throw an error and stop working.
        this.isActiveMatchOptions = this._fuseUtilsService.subsetMatchOptions;
        this.version = environment.version;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Set the "isActiveMatchOptions" either from item's
        // "isActiveMatchOptions" or the equivalent form of
        // item's "exactMatch" option
        this.isActiveMatchOptions =
            this.item.isActiveMatchOptions ?? this.item.exactMatch
                ? this._fuseUtilsService.exactMatchOptions
                : this._fuseUtilsService.subsetMatchOptions;

        // Get the parent navigation component
        this._fuseVerticalNavigationComponent = this._fuseNavigationService.getComponent(this.name);

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Subscribe to onRefreshed on the navigation component
        this._fuseVerticalNavigationComponent.onRefreshed.pipe(
            takeUntil(this._unsubscribeAll)
        ).subscribe(() => {

            // Mark for check
            this._changeDetectorRef.markForCheck();
        });
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

    createShortcut(item): void{
        if(item.id === 'manual.manual-book') {
            window.open('https://teamplat.notion.site/V2-767bedf8500c41768b2e7a82ba72d113', '','top=50,left=200,width=1100,height=700');
        }
        this.shortCut = {
            id: item.id,
            label: item.title,
            icon: item.icon,
            link: item.link,
            useRouter:true
        };
        this._shortcutService.create(this.shortCut).subscribe();
    }

    testAlert(item): void{
        this.shortCut = {
            id: item.id,
            label: item.title,
            icon: item.icon,
            link: item.link,
            useRouter:true
        };
        this._shortcutService.create(this.shortCut).subscribe();
    }
}
