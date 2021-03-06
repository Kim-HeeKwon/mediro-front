import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FuseMediaWatcherService } from '@teamplat/services/media-watcher';
import {ActivatedRoute, ActivatedRouteSnapshot} from "@angular/router";

@Component({
    selector       : 'settings',
    templateUrl    : './settings.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy
{
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'plan-billing';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService
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
        if(this._route.snapshot.paramMap.get('id') !== null){
            this.goToPanel(this._route.snapshot.paramMap.get('id'));
        }
        // Setup available panels
        this.panels = [
            {
                id         : 'account',
                icon       : 'heroicons_outline:user-circle',
                title      : '계정',
                description: '프로필 및 개인 정보 관리'
            },
            {
                id         : 'security',
                icon       : 'heroicons_outline:lock-closed',
                title      : '비밀번호',
                description: '비밀번호 정보 관리'
            },
            // {
            //     id         : 'notifications',
            //     icon       : 'heroicons_outline:bell',
            //     title      : '셋팅',
            //     description: 'Manage when you\'ll be notified on which channels'
            // },
            {
                id         : 'team',
                icon       : 'heroicons_outline:user-group',
                title      : '멤버',
                description: '팀 권한 및 멤버 정보 관리'
            },
            {
                id         : 'tax',
                icon       : 'heroicons_outline:currency-dollar',
                title      : '세금계산서',
                description: '세금계산서 정보 및 인증서 관리'
            },
            {
                id         : 'plan-billing',
                icon       : 'heroicons_outline:credit-card',
                title      : '결제',
                description: '결제 정보 관리'
            },
            {
                id         : 'billing',
                icon       : 'heroicons_outline:credit-card',
                title      : '청구서',
                description: '결제 대시보드'
            },
            {
                id         : 'kakaoNotificationTalk',
                icon       : 'question_answer',
                title      : '알림톡 설정',
                description: '알림톡 설정 관리'
            },
        ];

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Navigate to the panel
     *
     * @param panel
     */
    goToPanel(panel: string): void
    {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }

    /**
     * Get the details of the panel
     *
     * @param id
     */
    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
}
