import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {CommonCode, FuseUtilsService} from '../../services/utils';
import {CodeStore} from '../../../app/core/common-code/state/code.store';


@Component({
    selector: 'app-tooltip',
    templateUrl: 'common-tooltip.component.html',
    styleUrls: ['./common-tooltip.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'appTooltip',
})
export class CommonTooltipComponent implements OnInit{
    toolInfo: CommonCode[] = null;
    toolInfoChg: any;
    private _dataTooltip: string;
    private _dataValue: string;

    constructor(
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore) {
    }

    ngOnInit(): void {
        if (this._dataTooltip !== undefined) {
            this.toolInfo = this._utilService.commonValueFilter(this._codeStore.getValue().data, this._dataTooltip, ['ALL']);
            this.toolInfoChg = this.toolInfo;
            // @ts-ignore
            let a: boolean = true;
            for (let i = 0; i < this.toolInfoChg.length; i++) {
                this.toolInfoChg[i].num = 1;
                if(this.toolInfoChg[i].name === this._dataValue) {
                    a = false;
                    break;
                }
                if(a) {
                    this.toolInfoChg.num = 0;
                }
            }
            // 변수를 불린형으로 선언해서 트루일때는 1로 퍼스일떄는 0으로 선언
        }
    }

    @Input()
    set dataTooltip(value: string)
    {
        // Return if the values are the same
        if ( this._dataTooltip === value )
        {
            return;
        }

        // Store the value
        this._dataTooltip = value;

        // If the time range turned off...
        if ( !value )
        {
        }
    }

    get dataTooltip(): string
    {
        return this.dataTooltip;
    }

    @Input()
    set dataValue(value: string)
    {
        // Return if the values are the same
        if ( this._dataValue === value )
        {
            return;
        }

        // Store the value
        this._dataValue = value;

        // If the time range turned off...
        if ( !value )
        {
        }
    }

    get dataValue(): string
    {
        return this._dataValue;
    }
}


