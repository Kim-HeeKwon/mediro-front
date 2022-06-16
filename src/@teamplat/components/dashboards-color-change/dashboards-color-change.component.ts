import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import { Output, EventEmitter } from '@angular/core';
import {DashboardsColorChangeService} from "./dashboards-color-change.service";

@Component({
    selector       : 'fuse-dashboards-color-change',
    templateUrl    : 'dashboards-color-change.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'fuseRemoteControl'
})

export class DashboardsColorChangeComponent implements OnInit, OnDestroy {
    constructor(private dashboardsColorChangeService: DashboardsColorChangeService) {
    }

    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }

    dashBoardsColorChange(value: any): void {
        this.dashboardsColorChangeService.broadcastDate(value);
    }
}
