import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {authSignOutRoutes} from "../../../auth/sign-out/sign-out.routing";
import {MatButtonModule} from "@angular/material/button";
import {FuseCardModule} from "../../../../../@teamplat/components/card";
import {SharedModule} from "../../../../shared/shared.module";
import {SignOutComponent} from "./sign-out.component";
import {signOutRoutes} from "./sign-out.routing";

@NgModule({
    declarations: [
        SignOutComponent
    ],
    imports     : [
        RouterModule.forChild(signOutRoutes),
        MatButtonModule,
        FuseCardModule,
        SharedModule
    ]
})
export class SignOutModule
{
}
