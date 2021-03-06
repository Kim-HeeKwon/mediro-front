import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ExtraOptions, PreloadAllModules, RouteReuseStrategy, RouterModule} from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { FuseModule } from '@teamplat';
import { FuseConfigModule } from '@teamplat/services/config';
import { FuseMockApiModule } from '@teamplat/lib/mock-api';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { mockApiServices } from 'app/mock-api';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';
import { environment } from '../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import {TeamPlatReuseStrategy} from '../@teamplat/services/router-util/TeamPlatReuseStrategy';
import {CustomReuseStrategy} from "../@teamplat/services/router-util/CustomReuseStrategy";

const routerConfig: ExtraOptions = {
    scrollPositionRestoration: 'enabled',
    preloadingStrategy       : PreloadAllModules,
    useHash: environment.test,
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports     : [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),

        // Fuse, FuseConfig & FuseMockAPI
        FuseModule,
        FuseConfigModule.forRoot(appConfig),
        FuseMockApiModule.forRoot(mockApiServices),

        // Core module of your application
        CoreModule,

        // Layout module of your application
        LayoutModule,

        // 3rd party modules that require global configuration via forRoot
        MarkdownModule.forRoot({})
    ],
    bootstrap   : [
        AppComponent
    ],
    providers: [
        CookieService,
        //{provide: RouteReuseStrategy, useClass: TeamPlatReuseStrategy}
        //{provide: RouteReuseStrategy, useClass: CustomReuseStrategy}//
    ],
})
export class AppModule
{
}
