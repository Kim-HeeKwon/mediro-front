import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";

@Component({
    selector       : 'fuse-announcement',
    templateUrl    : './announcement.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'fuseAnnouncement'
})
export class FuseAnnouncementComponent implements OnInit, OnDestroy
{
    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }

}
