import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManagesComponent } from './manages.component';

const managesRoutes: Route[] = [
    {
        path     : '',
        component: ManagesComponent
    }
];

@NgModule({
  declarations: [
    ManagesComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(managesRoutes)
  ]
})
export class ManagesModule { }
