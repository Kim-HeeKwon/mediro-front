import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {paymentHistoryComponent} from "./payment-history.component";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatIconModule} from "@angular/material/icon";
import {ReactiveFormsModule} from "@angular/forms";
import {FuseDateRangeModule} from "../../../../../@teamplat/components/date-range";
import {MatButtonModule} from "@angular/material/button";
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatInputModule} from "@angular/material/input";
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {MatRippleModule} from "@angular/material/core";
import {MatSortModule} from "@angular/material/sort";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDialogModule} from "@angular/material/dialog";
import {SharedModule} from "../../../../shared/shared.module";
import {FuseFindByKeyPipeModule} from "../../../../../@teamplat/pipes/find-by-key";
import {FuseAlertModule} from "../../../../../@teamplat/components/alert";
import {MatButtonToggleModule} from "@angular/material/button-toggle";

const paymentRoutes: Route[] = [
    {
        path     : '',
        component: paymentHistoryComponent,
    }
];

@NgModule({
    declarations: [
        paymentHistoryComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(paymentRoutes),
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
        FuseUserHelpModule,
        CommonLoadingBarModule,
    ]
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class paymentHistoryModule { }
