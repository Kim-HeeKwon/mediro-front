import { NgModule } from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import {SalesorderComponent} from './salesorder.component';
import {Route, RouteReuseStrategy, RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatRippleModule} from '@angular/material/core';
import {MatSortModule} from '@angular/material/sort';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SharedModule} from '../../../../shared/shared.module';
import {SalesorderResolvers} from './salesorder.resolvers';
import {FuseFindByKeyPipeModule} from '../../../../../@teamplat/pipes/find-by-key';
import {FuseAlertModule} from '../../../../../@teamplat/components/alert';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {SalesorderNewComponent} from './salesorder-new/salesorder-new.component';
import {SalesorderNewResolvers} from './salesorder-new/salesorder-new.resolvers';
import {SalesorderDetailResolvers} from './salesorder-detail/salesorder-detail.resolvers';
import {SalesorderDetailComponent} from './salesorder-detail/salesorder-detail.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FuseDateRangeModule} from '../../../../../@teamplat/components/date-range';
import {FuseUserHelpModule} from '../../../../../@teamplat/components/user-help';
import {SatPopoverModule} from "@ncstate/sat-popover";
import {CommonTooltipModule} from "../../../../../@teamplat/components/common-tooltip/common-tooltip.module";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";

const salesorderRoutes: Route[] = [
    {
        path     : '',
        component: SalesorderComponent,
        resolve  : {
            data: SalesorderResolvers
        }
    },
    {
        path     : 'salesorder-detail',
        data: {key: 'salesorder/salesorder-detail',shouldDetach: true},
        component: SalesorderDetailComponent,
        resolve  : {
            data: SalesorderDetailResolvers
        }
    },
    {
        path     : 'salesorder-new',
        data: {key: 'salesorder/salesorder-new',shouldDetach: true},
        component: SalesorderNewComponent,
        resolve  : {
            data: SalesorderNewResolvers
        }
    },
];

@NgModule({
  declarations: [
      SalesorderComponent,
      SalesorderNewComponent,
      SalesorderDetailComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(salesorderRoutes),
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
        SharedModule,
        FuseFindByKeyPipeModule,
        FuseAlertModule,
        MatTabsModule,
        MatCardModule,
        MatSidenavModule,
        MatDialogModule,
        FuseDateRangeModule,
        FuseUserHelpModule,
        SatPopoverModule,
        CommonTooltipModule,
        CommonLoadingBarModule,
    ],
})
export class SalesorderModule { }
