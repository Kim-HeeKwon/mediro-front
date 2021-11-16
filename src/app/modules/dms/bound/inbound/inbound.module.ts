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
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {SatPopoverModule} from "@ncstate/sat-popover";
import {CommonTooltipModule} from "../../../../../@teamplat/components/common-tooltip/common-tooltip.module";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";
import {AngularSplitModule} from "angular-split";
import {InboundComponent} from "./inbound.component";
import {InboundResolver} from "./inbound.resolvers";
import {InboundNewComponent} from "./inbound-new/inbound-new.component";
import {InboundNewResolvers} from "./inbound-new/inbound-new.resolvers";
import {InboundDetailComponent} from "./inbound-detail/inbound-detail.component";
import {InboundDetailResolvers} from "./inbound-detail/inbound-detail.resolvers";

const inboundRoutes: Route[] = [
    {
        path     : '',
        component: InboundComponent,
        resolve  : {
            data: InboundResolver
        },
    },
    {
        path     : 'inbound-detail',
        component: InboundDetailComponent,
        resolve  : {
            data: InboundDetailResolvers
        }
    },
    {
        path     : 'inbound-new',
        component: InboundNewComponent,
        resolve  : {
            data: InboundNewResolvers
        }
    },
];
@NgModule({
    declarations: [
        InboundComponent,
        InboundNewComponent,
        InboundDetailComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(inboundRoutes),
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
        FuseUserHelpModule,
        SatPopoverModule,
        CommonTooltipModule,
        CommonLoadingBarModule,
        AngularSplitModule,
    ]
})
export class InboundModule { }
