import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FuseAlertModule } from '@teamplat/components/alert';
import { SharedModule } from 'app/shared/shared.module';
import { SettingsComponent } from 'app/modules/admin/pages/settings/settings.component';
import { SettingsAccountComponent } from 'app/modules/admin/pages/settings/account/account.component';
import { SettingsSecurityComponent } from 'app/modules/admin/pages/settings/security/security.component';
import { SettingsPlanBillingComponent } from 'app/modules/admin/pages/settings/plan-billing/plan-billing.component';
import { SettingsNotificationsComponent } from 'app/modules/admin/pages/settings/notifications/notifications.component';
import { SettingsTeamComponent } from 'app/modules/admin/pages/settings/team/team.component';
import {SettingsTaxComponent} from "app/modules/admin/pages/settings/tax/tax.component";
import { settingsRoutes } from 'app/modules/admin/pages/settings/settings.routing';
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDialogModule} from "@angular/material/dialog";
import {NewTeamComponent} from "./team/new-team/new-team/new-team.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {CommonModule} from "@angular/common";
import {SettingsUserGuideComponent} from "./userGuide/userGuide.component";
import {MatTabsModule} from "@angular/material/tabs";
import {ApplyContractComponent} from "./plan-billing/apply-contract/apply-contract.component";
import {SettingsBillingComponent} from "./billing/billing.component";
import {MatTreeModule} from "@angular/material/tree";
import {CdkTreeModule} from "@angular/cdk/tree";
import {SettingsKakaoNotificationTalkComponent} from "./kakaoNotificationTalk/kakaoNotificationTalk.component";
import {MatCheckboxModule} from "@angular/material/checkbox";

@NgModule({
    declarations: [
        SettingsComponent,
        SettingsAccountComponent,
        SettingsSecurityComponent,
        SettingsPlanBillingComponent,
        SettingsBillingComponent,
        SettingsNotificationsComponent,
        SettingsKakaoNotificationTalkComponent,
        SettingsTeamComponent,
        SettingsTaxComponent,
        SettingsUserGuideComponent,
        NewTeamComponent,
        ApplyContractComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(settingsRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatRadioModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTooltipModule,
        MatDialogModule,
        FuseAlertModule,
        SharedModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatTreeModule,
        CdkTreeModule,
        MatCheckboxModule
    ]
})
export class SettingsModule
{
}
