import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {Route, RouterModule} from "@angular/router";
import {RealgridComponent} from "./realgrid.component";
import {RealgridResolvers} from "./realgrid.resolvers";
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
import {RealgridNewComponent} from "./realgrid-new/realgrid-new.component";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";
import {RealgridDetailComponent} from "./realgrid-detail/realgrid-detail.component";
import {DetailComponent} from "../header-detail/detail/detail.component";
import {DetailResolvers} from "../header-detail/detail/detail.resolvers";

const realGridRoutes: Route[] = [
    {
        path: '',
        component: RealgridComponent,
        resolve  : {
            data: RealgridResolvers
        }
    },
];

@NgModule({
    declarations: [
        RealgridComponent,
        RealgridNewComponent,
        RealgridDetailComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(realGridRoutes),
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
        CommonLoadingBarModule
    ]
})
export class RealgridModule {
}
