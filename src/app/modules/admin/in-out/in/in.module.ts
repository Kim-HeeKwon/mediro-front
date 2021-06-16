import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InComponent } from './in.component';

const inRoutes: Route[] = [
    {
        path     : '',
        component: InComponent
    }
];

@NgModule({
  declarations: [
    InComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(inRoutes)
  ]
})
export class InModule { }
