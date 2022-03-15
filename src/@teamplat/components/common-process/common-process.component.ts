import {Component, Input, OnInit, ViewEncapsulation} from "@angular/core";
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {CodeStore} from "../../../app/core/common-code/state/code.store";
import {EstimateService} from "../../../app/modules/dms/estimate-order/estimate/estimate.service";
import {FormGroup} from "@angular/forms";


@Component({
    selector: 'app-process',
    templateUrl: 'common-process.component.html',
    styleUrls: ['common-process.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'appProcess'
})

export class CommonProcessComponent implements OnInit {
    searchForm: FormGroup;
    processInfo: CommonCode[] = null;
    process: any;
    private _dataColor: string;
    private _data: string;
    private _dataProcess: string;
    private _filterValue: string;

    constructor(
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,) {
    }

    ngOnInit(): void {
        if (this._dataProcess !== undefined) {
            this.processInfo = this._utilService.commonValueSearchFilter(this._codeStore.getValue().data, this._dataProcess, ['ALL', this._filterValue]);
            this.process = this.processInfo;
        }

    }

    clickDate(id: any): void {
        // console.log(id);
        // this.status = id;
    }

    @Input()
    set status(value)
    {
        if(!value)
        {
            return;
        }
    }

    get status(): any
    {
        return this.status;
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
    set data(value: string)
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

    get data(): string
    {
        return this._data;
    }

    @Input()
    set dataColor(value: string)
    {
        // Return if the values are the same
        if ( this._dataColor === value )
        {
            return;
        }

        // Store the value
        this._dataColor = value;

        // If the time range turned off...
        if ( !value )
        {
        }
    }

    get dataColor(): string
    {
        return this.data;
    }
}
