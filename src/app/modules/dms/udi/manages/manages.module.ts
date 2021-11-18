import {Route, RouterModule} from "@angular/router";
import {ManagesComponent} from "./manages.component";
import {ManagesResolvers} from "./manages.resolvers";
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
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatDialogModule} from "@angular/material/dialog";
import {SharedModule} from "../../../../shared/shared.module";
import {FuseAlertModule} from "../../../../../@teamplat/components/alert";
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";
import {ManagesReportComponent} from "./manages-report/manages-report.component";
import {ManagesDetailComponent} from "./manages-detail/manages-detail.component";

const managesRoutes: Route[] = [
    {
        path: '',
        component: ManagesComponent,
        resolve  : {
            data: ManagesResolvers
        },
    }
];

@NgModule({
    declarations: [
        ManagesComponent,
        ManagesReportComponent,
        ManagesDetailComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(managesRoutes),
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
        MatSidenavModule,
        MatDialogModule,
        SharedModule,
        FuseAlertModule,
        FuseUserHelpModule,
        CommonLoadingBarModule
    ]
})
export class ManagesModule {
}
