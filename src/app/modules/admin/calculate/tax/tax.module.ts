import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaxComponent } from './tax.component';
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {MatRippleModule} from "@angular/material/core";
import {MatSortModule} from "@angular/material/sort";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {SharedModule} from "../../../../shared/shared.module";
import {FuseFindByKeyPipeModule} from "../../../../../@teamplat/pipes/find-by-key";
import {FuseAlertModule} from "../../../../../@teamplat/components/alert";
import {MatTabsModule} from "@angular/material/tabs";
import {MatCardModule} from "@angular/material/card";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatDialogModule} from "@angular/material/dialog";
import {FuseColumnResizeModule} from "../../../../../@teamplat/directives/table/column-resize";
import {FuseDateRangeModule} from "../../../../../@teamplat/components/date-range";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {StockResolvers} from "../../stock/stock/stock.resolvers";
import {TaxResolvers} from "./tax.resolvers";
import {StockHistoryComponent} from "../../stock/stock/stock-history/stock-history.component";
import {StockHistoryResolvers} from "../../stock/stock/stock-history/stock-history.resolvers";
import {TaxDetailComponent} from "./tax-detail/tax-detail.component";
import {TaxDetailResolvers} from "./tax-detail/tax-detail.resolvers";

const taxRoutes: Route[] = [
    {
        path     : '',
        component: TaxComponent,
        resolve: {
            data: TaxResolvers
        },
        children             : [
            {
                path     : '',
                component: TaxDetailComponent,
                resolve : {
                    data: TaxDetailResolvers
                }
            }
        ]
    }
];

@NgModule({
  declarations: [
    TaxComponent,
    TaxDetailComponent
  ],
  imports: [
      CommonModule,
      RouterModule.forChild(taxRoutes),
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
      FuseUserHelpModule
  ]
})
export class TaxModule { }
