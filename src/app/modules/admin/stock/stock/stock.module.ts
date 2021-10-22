import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {StockComponent} from './stock.component';
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
import {SharedModule} from 'app/shared/shared.module';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FuseFindByKeyPipeModule} from '../../../../../@teamplat/pipes/find-by-key';
import {FuseAlertModule} from '../../../../../@teamplat/components/alert';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {StockResolvers} from './stock.resolvers';
import {FuseColumnResizeModule} from '../../../../../@teamplat/directives/table/column-resize';
import {FuseDateRangeModule} from '../../../../../@teamplat/components/date-range';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {StockHistoryResolvers} from './stock-history/stock-history.resolvers';
import {StockHistoryComponent} from './stock-history/stock-history.component';
import {FuseUserHelpModule} from '../../../../../@teamplat/components/user-help';
import {StockDetailComponent} from "./stock-detail/stock-detail.component";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";

const stockRoutes: Route[] = [
    {
        path: '',
        component: StockComponent,
        resolve: {
            data: StockResolvers
        },
        children             : [
            {
                path     : '',
                component: StockHistoryComponent,
                resolve : {
                    data: StockHistoryResolvers
                }
            }
        ]
    }
];

@NgModule({
    declarations: [
        StockComponent,
        StockHistoryComponent,
        StockDetailComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(stockRoutes),
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
        FuseColumnResizeModule,
        FuseDateRangeModule,
        MatButtonToggleModule,
        FuseUserHelpModule,
        CommonLoadingBarModule
    ]
})
export class StockModule {
}
