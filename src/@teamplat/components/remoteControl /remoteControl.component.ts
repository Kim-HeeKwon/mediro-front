import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
    selector       : 'fuse-remoteControl',
    templateUrl    : 'remoteControl.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs       : 'fuseRemoteControl'
})
export class RemoteControlComponent implements OnInit, OnDestroy
{
    ngOnDestroy(): void {
    }

    ngOnInit(): void {
    }


    customizeAS(): void{
        window.open('https://medirowork.channel.io/lounge');
    }
}
