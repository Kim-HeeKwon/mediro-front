import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {MatDialog} from "@angular/material/dialog";
import {DeviceDetectorService} from "ngx-device-detector";
import {NoticeBoardComponent} from "../notice-board";
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";

@Component({
    selector       : 'fuse-announcement',
    templateUrl    : './announcement.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'fuseAnnouncement'
})
export class FuseAnnouncementComponent implements OnInit, OnDestroy
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;
    constructor(
        private _matDialog: MatDialog,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.isMobile = this._deviceService.isMobile();
    }
    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }

    announcement(): void {
        if(!this.isMobile) {
            const t = this._matDialog.open(NoticeBoardComponent, {
                autoFocus: false,
                disableClose: true,
                data: {
                }
            });
        } else {
            const t = this._matDialog.open(NoticeBoardComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    t.updateSize('calc(100vw - 10px)', '');
                } else {
                }
            });
            t.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }

    }

}
