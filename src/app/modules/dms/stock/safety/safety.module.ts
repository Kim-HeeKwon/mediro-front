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
import {FuseColumnResizeModule} from "../../../../../@teamplat/directives/table/column-resize";
import {FuseDateRangeModule} from "../../../../../@teamplat/components/date-range";
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";
import {SafetyComponent} from "./safety.component";
import {SafetyResolvers} from "./safety.resolvers";

const safetyRoutes: Route[] = [
    {
        path: '',
        component: SafetyComponent,
        resolve: {
            data: SafetyResolvers
        },
    }
];

@NgModule({
    declarations: [
        SafetyComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(safetyRoutes),
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
export class SafetyModule {
}
