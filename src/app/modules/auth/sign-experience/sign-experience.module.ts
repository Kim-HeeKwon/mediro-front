import {NgModule} from "@angular/core";
import {RouterModule} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {FuseCardModule} from "../../../../@teamplat/components/card";
import {FuseAlertModule} from "../../../../@teamplat/components/alert";
import {SharedModule} from "../../../shared/shared.module";
import {SignExperienceComponent} from "./sign-experience.component";
import {authSignExperienceRoutes} from "./sign-experience.routing";
import {MatSelectModule} from "@angular/material/select";
import {PrivacyComponent} from "./privacy/privacy.component";

@NgModule({
    declarations: [
        SignExperienceComponent,
        PrivacyComponent
    ],
    imports: [
        RouterModule.forChild(authSignExperienceRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        FuseCardModule,
        FuseAlertModule,
        SharedModule,
        MatSelectModule
    ]
})
export class SignExperienceModule
{
}
