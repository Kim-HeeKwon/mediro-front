import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input, OnDestroy,
    OnInit,
    Output,
    ViewEncapsulation
} from '@angular/core';
import {CommonCodeProcess, FuseUtilsService} from '../../services/utils';
import {CodeStore} from '../../../app/core/common-code/state/code.store';
import {FormGroup} from '@angular/forms';
import {Subject} from "rxjs";


@Component({
    selector: 'app-process',
    templateUrl: 'common-process.component.html',
    styleUrls: ['common-process.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs: 'appProcess'
})

export class CommonProcessComponent implements OnInit, OnDestroy {
    searchForm: FormGroup;
    processInfo: CommonCodeProcess[] = null;
    process: any;
    count: number;
    private _dataColor: string;
    private _data: string;
    private _dataProcess: string;
    private _filterValue: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _utilService: FuseUtilsService,
        private _codeStore: CodeStore,) {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        if (this._dataProcess !== undefined) {
            this.processInfo = this._utilService.commonValueSearchFilter(this._codeStore.getValue().data, this._dataProcess, ['ALL', this._filterValue]);
            for (let i = 0; i < this.processInfo.length; i++) {
                this.processInfo[i].count = i + 1;
                this.processInfo[i].color = false;
            }
            this.process = this.processInfo;
        }

    }


    clickDate(id: any): void {
        this.searchData.emit(id);
        const name = document.getElementById(id);
        for (let i = 0; i < this.processInfo.length; i++) {
            if (Number(name.innerHTML) >= this.process[i].count) {
                this.process[i].color = true;
            }
            if (this.process[i].color) {
                if (Number(name.innerHTML) < this.process[i].count) {
                    this.process[i].color = false;
                }
            }
        }
    }

    @Output()
    searchData = new EventEmitter<string>();


    get status(): any {
        return this.status;
    }

    @Input()
    set dataFilter(value: string) {
        // Return if the values are the same
        if (this._filterValue === value) {
            return;
        }

        // Store the value
        this._filterValue = value;

        // If the time range turned off...
        if (!value) {
        }
    }

    get dataFilter(): string {
        return this.dataFilter;
    }

    @Input()
    set data(value: string) {
        // Return if the values are the same
        if (this._dataProcess === value) {
            return;
        }

        // Store the value
        this._dataProcess = value;

        // If the time range turned off...
        if (!value) {
        }
    }

    get data(): string {
        return this._data;
    }

    @Input()
    set dataColor(value: string) {
        // Return if the values are the same
        if (this._dataColor === value) {
            return;
        }

        // Store the value
        this._dataColor = value;

        // If the time range turned off...
        if (!value) {
        }
    }

    get dataColor(): string {
        return this.data;
    }
}
