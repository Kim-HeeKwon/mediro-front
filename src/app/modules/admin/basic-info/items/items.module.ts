import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsComponent } from './items.component';
import { Route, RouterModule } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'app/shared/shared.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ItemsResolver } from './items.resolvers';
import { NewItemComponent } from './new-item/new-item.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FuseFindByKeyPipeModule } from '@teamplat/pipes/find-by-key';
import {FuseAlertModule} from '@teamplat/components/alert';
import {MatSidenavModule} from "@angular/material/sidenav";
import {FuseDateRangeModule} from "../../../../../@teamplat/components/date-range";
import {MatButtonToggleModule} from "@angular/material/button-toggle";

const itemsRoutes: Route[] = [
    {
        path     : '',
        component: ItemsComponent,
        resolve  : {
            data: ItemsResolver
        }
    }
];

@NgModule({
  declarations: [
    ItemsComponent,
    NewItemComponent,
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(itemsRoutes),
        MatSidenavModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTooltipModule,
        MatDialogModule,
        SharedModule,
        FuseFindByKeyPipeModule,
        FuseAlertModule,
        FuseDateRangeModule,
        MatButtonToggleModule,
    ]
})
export class ItemsModule { }
