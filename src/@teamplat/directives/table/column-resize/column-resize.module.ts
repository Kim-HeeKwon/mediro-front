import {NgModule} from '@angular/core';
import {FuseColumnResizeDirective} from './column-resize.directive';

@NgModule({
    declarations: [
        FuseColumnResizeDirective
    ],
    exports : [
        FuseColumnResizeDirective
    ]
})
export class FuseColumnResizeModule
{
}
