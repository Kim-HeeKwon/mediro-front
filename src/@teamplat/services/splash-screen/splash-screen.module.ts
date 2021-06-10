import { NgModule } from '@angular/core';
import { FuseSplashScreenService } from '@teamplat/services/splash-screen/splash-screen.service';

@NgModule({
    providers: [
        FuseSplashScreenService
    ]
})
export class FuseSplashScreenModule
{
    /**
     * Constructor
     */
    constructor(private _fuseSplashScreenService: FuseSplashScreenService)
    {
    }
}
