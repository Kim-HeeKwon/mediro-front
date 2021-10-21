import {NgModule} from "@angular/core";
import {FuseRealGridService} from "./realgrid.service";

@NgModule({
    providers: [
        FuseRealGridService
    ]
})
export class FuseRealGridModule
{
    /**
     * Constructor
     */
    constructor(private _realGridsService: FuseRealGridService)
    {
    }
}
