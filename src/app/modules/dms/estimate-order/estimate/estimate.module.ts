import {Route, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {CommonModule, CurrencyPipe} from "@angular/common";
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
import {MatCardModule} from "@angular/material/card";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatDialogModule} from "@angular/material/dialog";
import {FuseDateRangeModule} from "../../../../../@teamplat/components/date-range";
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {SatPopoverModule} from "@ncstate/sat-popover";
import {CommonTooltipModule} from "../../../../../@teamplat/components/common-tooltip/common-tooltip.module";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";
import {EstimateResolvers} from "./estimate.resolvers";
import {EstimateComponent} from "./estimate.component";
import {EstimateNewComponent} from "./estimate-new/estimate-new.component";
import {EstimateNewResolvers} from "./estimate-new/estimate-new.resolvers";
import {EstimateDetailComponent} from "./estimate-detail/estimate-detail.component";
import {EstimateDetailResolvers} from "./estimate-detail/estimate-detail.resolvers";
import {AngularSplitModule} from "angular-split";

const estimateRoutes: Route[] = [
    {
        path     : '',
        component: EstimateComponent,
        resolve  : {
            data: EstimateResolvers
        }
    },
    {
        path     : 'estimate-detail',
        data: {key: 'estimate/estimate-detail',shouldDetach: true},
        component: EstimateDetailComponent,
        resolve  : {
            data: EstimateDetailResolvers
        }
    },
    {
        path     : 'estimate-new',
        data: {key: 'estimate/estimate-new', shouldDetach: true},
        component: EstimateNewComponent,
        resolve  : {
            data: EstimateNewResolvers
        }
    }
];

@NgModule({
    declarations: [
        EstimateComponent,
        EstimateDetailComponent,
        EstimateNewComponent
    ],
    providers :[CurrencyPipe],
    imports: [
        CommonModule,
        RouterModule.forChild(estimateRoutes),
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
        MatCardModule,
        MatTabsModule,
        MatSidenavModule,
        MatDialogModule,
        FuseDateRangeModule,
        FuseUserHelpModule,
        SatPopoverModule,
        CommonTooltipModule,
        CommonLoadingBarModule,
        AngularSplitModule,
    ],
})
export class EstimateModule { }
