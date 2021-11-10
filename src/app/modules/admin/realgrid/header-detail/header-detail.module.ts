import {Route, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
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
import {FuseDateRangeModule} from "../../../../../@teamplat/components/date-range";
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {HeaderDetailComponent} from "./header-detail.component";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";
import {HeaderDetailResolvers} from "./header-detail.resolvers";
import {EstimateDetailComponent} from "../../estimate-order/estimate/estimate-detail/estimate-detail.component";
import {EstimateDetailResolvers} from "../../estimate-order/estimate/estimate-detail/estimate-detail.resolvers";
import {DetailComponent} from "./detail/detail.component";
import {DetailResolvers} from "./detail/detail.resolvers";
import {EstimateNewComponent} from "../../estimate-order/estimate/estimate-new/estimate-new.component";
import {EstimateNewResolvers} from "../../estimate-order/estimate/estimate-new/estimate-new.resolvers";
import {NewComponent} from "./new/new.component";
import {NewResolvers} from "./new/new.resolvers";
import {AngularSplitModule} from "angular-split";

const estimateRoutes: Route[] = [
    {
        path: '',
        component: HeaderDetailComponent,
        resolve  : {
            data: HeaderDetailResolvers
        }
    },
    {
        path     : 'detail',
        component: DetailComponent,
        resolve  : {
            data: DetailResolvers
        }
    },
    {
        path     : 'new',
        component: NewComponent,
        resolve  : {
            data: NewResolvers
        }
    }
];

@NgModule({
    declarations: [
        HeaderDetailComponent,
        DetailComponent,
        NewComponent
    ],
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
        MatTabsModule,
        MatCardModule,
        MatSidenavModule,
        MatDialogModule,
        FuseDateRangeModule,
        FuseUserHelpModule,
        CommonLoadingBarModule,
        AngularSplitModule
    ]
})
export class HeaderDetailModule {
}
