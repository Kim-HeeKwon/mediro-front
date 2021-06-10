import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { FuseMediaWatcherModule } from '@teamplat/services/media-watcher/media-watcher.module';
import { FuseSplashScreenModule } from '@teamplat/services/splash-screen/splash-screen.module';
import { FuseTailwindConfigModule } from '@teamplat/services/tailwind/tailwind.module';
import { FuseUtilsModule } from '@teamplat/services/utils/utils.module';
import { Api } from './providers/api/api';
import { Common } from './providers/common/common';
import { Crypto } from './providers/common/crypto';

@NgModule({
    imports  : [
        FuseMediaWatcherModule,
        FuseSplashScreenModule,
        FuseTailwindConfigModule,
        FuseUtilsModule
    ],
    providers: [
        {
            // Use the 'fill' appearance on Angular Material form fields by default
            provide : MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'fill'
            }
        },
        Api,
        Common,
        Crypto
    ]
})
export class FuseModule
{
    /**
     * Constructor
     */
    constructor(@Optional() @SkipSelf() parentModule?: FuseModule)
    {
        if ( parentModule )
        {
            throw new Error('FuseModule has already been loaded. Import this module in the AppModule only!');
        }
    }
}
