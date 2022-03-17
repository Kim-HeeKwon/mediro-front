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
    private _processColor: string;
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


    clickProcess(id: any): void {
        this.searchProcess.emit(id);
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
    searchProcess = new EventEmitter<string>();

    @Input()
    set processFilter(value: string) {
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

    get processFilter(): string {
        return this.processFilter;
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
    set processColor(value: string) {
        // Return if the values are the same
        if (this._processColor === value) {
            return;
        }

        // Store the value
        this._processColor = value;

        // If the time range turned off...
        if (!value) {
        }
    }

    get processColor(): string {
        return this.processColor;
    }
}
