import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {InBoundDetailPagenations, InBoundDetails} from './common-udi-rtn-scan.types';

@Injectable({
    providedIn: 'root'
})
export class CommonUdiRtnScanService{
    private _inBoundDetails: BehaviorSubject<InBoundDetails[]> = new BehaviorSubject(null);
    private _inBoundDetailPagenation: BehaviorSubject<InBoundDetailPagenations | null> = new BehaviorSubject(null);
    /**
     * Getter for details
     */
    get inBoundDetails$(): Observable<InBoundDetails[]>
    {
        return this._inBoundDetails.asObservable();
    }

    /**
     * Getter for Detail Pagenation
     */
    get inBoundDetailPagenation$(): Observable<InBoundDetailPagenations>
    {
        return this._inBoundDetailPagenation.asObservable();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setData(inBoundData) {
        this._inBoundDetails.next(inBoundData);
    }
}
