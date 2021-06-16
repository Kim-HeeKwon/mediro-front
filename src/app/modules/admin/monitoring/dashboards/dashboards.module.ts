import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardsComponent } from './dashboards.component';
import { Route, RouterModule } from '@angular/router';

const dashboardsRoutes: Route[] = [
    {
        path     : '',
        component: DashboardsComponent
    }
];

@NgModule({
  declarations: [
    DashboardsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(dashboardsRoutes)
  ]
})
export class DashboardsModule { }
