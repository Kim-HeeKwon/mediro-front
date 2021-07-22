import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardsComponent } from './dashboards.component';
import { Route, RouterModule } from '@angular/router';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {DashboardsResolvers} from './dashboards.resolvers';
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatButtonModule} from "@angular/material/button";

const dashboardsRoutes: Route[] = [
    {
        path     : '',
        component: DashboardsComponent,
        resolve  : {
            data: DashboardsResolvers
        }
    }
];

@NgModule({
  declarations: [
    DashboardsComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(dashboardsRoutes),
        MatButtonToggleModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatProgressBarModule,
        MatButtonModule
    ]
})
export class DashboardsModule { }
