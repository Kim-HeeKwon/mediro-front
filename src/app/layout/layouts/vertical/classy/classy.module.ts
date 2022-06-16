import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FuseNavigationModule } from '@teamplat/components/navigation';
import { FuseFullscreenModule } from '@teamplat/components/fullscreen/fullscreen.module';
import { LanguageModule } from 'app/layout/common/language/language.module';
import { MessagesModule } from 'app/layout/common/messages/messages.module';
import { NotificationsModule } from 'app/layout/common/notifications/notifications.module';
import { SearchModule } from 'app/layout/common/search/search.module';
import { ShortcutsModule } from 'app/layout/common/shortcuts/shortcuts.module';
import { UserMenuModule } from 'app/layout/common/user-menu/user-menu.module';
import { SharedModule } from 'app/shared/shared.module';
import { ClassyLayoutComponent } from 'app/layout/layouts/vertical/classy/classy.component';
import {LinkModule} from '../../../common/link/link.module';
import {FuseAddscreenModule} from '../../../../../@teamplat/components/addscreen/addscreen.module';
import {FuseAnnouncementModule} from '../../../../../@teamplat/components/announcement/announcement.module';
import {RemoteControlModule} from '../../../../../@teamplat/components/remoteControl /remoteControl.module';
import {DashboardsColorChangeModule} from "../../../../../@teamplat/components/dashboards-color-change/dashboards-color-change.module";

@NgModule({
    declarations: [
        ClassyLayoutComponent
    ],
    imports: [
        HttpClientModule,
        RouterModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        FuseFullscreenModule,
        FuseAddscreenModule,
        FuseNavigationModule,
        LanguageModule,
        MessagesModule,
        NotificationsModule,
        SearchModule,
        ShortcutsModule,
        UserMenuModule,
        SharedModule,
        LinkModule,
        FuseAnnouncementModule,
        RemoteControlModule,
        DashboardsColorChangeModule,
    ],
    exports     : [
        ClassyLayoutComponent
    ]
})
export class ClassyLayoutModule
{
}
