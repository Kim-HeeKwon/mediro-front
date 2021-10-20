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
    private _filterValue: string;
    private _datashow: boolean = true;

    constructor(
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore) {
    }

    ngOnInit(): void {
        if (this._dataValue === '취소') {
            this._datashow = false;
        }
        if(this._datashow) {
            if (this._dataTooltip !== undefined) {
                this.toolInfo = this._utilService.commonValueSearchFilter(this._codeStore.getValue().data, this._dataTooltip, ['ALL', this._filterValue]);
                this.toolInfoChg = this.toolInfo;
                // @ts-ignore
                let a: boolean = true;
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let i = 0; i < this.toolInfoChg.length; i++) {
                    if (a) {
                        this.toolInfoChg[i].num = 1;
                    }
                    if (this.toolInfoChg[i].name === this._dataValue) {
                        a = false;
                        break;
                    }
                }
                console.log(this.toolInfoChg);
            }
        }
    }

    @Input()
    set dataFilter(value: string)
    {
        // Return if the values are the same
        if ( this._filterValue === value )
        {
            return;
        }

        // Store the value
        this._filterValue = value;

        // If the time range turned off...
        if ( !value )
        {
        }
    }

    get dataFilter(): string
    {
        return this.dataFilter;
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


