import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import {IsActiveMatchOptions, NavigationEnd, Router} from '@angular/router';
import { Subject } from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import { FuseHorizontalNavigationComponent } from '@teamplat/components/navigation/horizontal/horizontal.component';
import { FuseNavigationService } from '@teamplat/components/navigation/navigation.service';
import { FuseNavigationItem } from '@teamplat/components/navigation/navigation.types';
import { FuseUtilsService } from '@teamplat/services/utils/utils.service';
import {ShortcutsService} from "../../../../../../app/layout/common/shortcuts/shortcuts.service";
import {Shortcut} from "../../../../../../app/layout/common/shortcuts/shortcuts.types";

@Component({
    selector       : 'fuse-horizontal-navigation-basic-item',
    templateUrl    : './basic.component.html',
    styles         : [],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuseHorizontalNavigationBasicItemComponent implements OnInit, OnDestroy
{
    @Input() item: FuseNavigationItem;
    @Input() name: string;

    shortCut: Shortcut = null;

    isActiveMatchOptions: IsActiveMatchOptions;
    private _fuseHorizontalNavigationComponent: FuseHorizontalNavigationComponent;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseUtilsService: FuseUtilsService,
        private _shortcutService: ShortcutsService,
        private _route: Router,
    )
    {
        // Set the equivalent of {exact: false} as default for active match options.
        // We are not assigning the item.isActiveMatchOptions directly to the
        // [routerLinkActiveOptions] because if it's "undefined" initially, the router
        // will throw an error and stop working.
        this.isActiveMatchOptions = this._fuseUtilsService.subsetMatchOptions;
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
        this._fuseHorizontalNavigationComponent = this._fuseNavigationService.getComponent(this.name);

        // Mark for check
        this._changeDetectorRef.markForCheck();

        // Subscribe to onRefreshed on the navigation component
        this._fuseHorizontalNavigationComponent.onRefreshed.pipe(
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
        this._route.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe((event: NavigationEnd) => {
                this.shortCut = {
                    id: item.id,
                    label: item.title,
                    icon: item.icon,
                    link: item.link,
                    param: event.url,
                    useRouter:true
                };

                // console.log(this.shortCut);
                //this._shortcutService.create(this.shortCut).subscribe();
            });
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
