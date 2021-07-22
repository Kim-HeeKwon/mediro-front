import {NgModule} from '@angular/core';
import {FunctionService} from './function.service';
import {MatDialogModule} from '@angular/material/dialog';

@NgModule({
    providers: [
        FunctionService
    ],
    imports: [
        MatDialogModule
    ]
})
export class FunctionModule
{
    /**
     * Constructor
     */
    constructor(private _functionService: FunctionService)
    {
    }
}
