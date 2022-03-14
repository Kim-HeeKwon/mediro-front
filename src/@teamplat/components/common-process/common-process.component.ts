import {Component, Input, OnInit, ViewEncapsulation} from "@angular/core";
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {CodeStore} from "../../../app/core/common-code/state/code.store";


@Component({
    selector: 'app-process',
    templateUrl: 'common-process.component.html',
    styleUrls: ['common-process.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'appProcess'
})

export class CommonProcessComponent implements OnInit {
    processInfo: CommonCode[] = null;
    process: any;
    private _dataProcess: string;
    private _filterValue: string;
    private _dataValue: string;
    constructor(
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore) {
    }

    ngOnInit(): void {
        if (this._dataProcess !== undefined) {
            this.processInfo = this._utilService.commonValueSearchFilter(this._codeStore.getValue().data, this._dataProcess, ['ALL', this._filterValue]);
            this.process = this.processInfo;
            // @ts-ignore
            let a: boolean = true;
            // eslint-disable-next-line @typescript-eslint/prefer-for-of
            for (let i = 0; i < this.process.length; i++) {
                if (a) {
                    this.process[i].num = 1;
                }
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
        if ( this._dataProcess === value )
        {
            return;
        }

        // Store the value
        this._dataProcess = value;

        // If the time range turned off...
        if ( !value )
        {
        }
    }

    get dataTooltip(): string
    {
        return this.dataTooltip;
    }
}
