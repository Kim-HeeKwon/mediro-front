import { NgModule } from '@angular/core';
import { FuseTailwindService } from '@teamplat/services/tailwind/tailwind.service';

@NgModule({
    providers: [
        FuseTailwindService
    ]
})
export class FuseTailwindConfigModule
{
    /**
     * Constructor
     */
    constructor(private _fuseTailwindConfigService: FuseTailwindService)
    {
    }
}
