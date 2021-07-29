import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {OutBoundDetails, OutBoundDetailPagenations} from './common-udi-scan.types';

@Injectable({
    providedIn: 'root'
})
export class CommonUdiScanService{

    private _outBoundDetails: BehaviorSubject<OutBoundDetails[]> = new BehaviorSubject(null);
    private _outBoundDetailPagenation: BehaviorSubject<OutBoundDetailPagenations | null> = new BehaviorSubject(null);

    /**
     * Getter for details
     */
    get outBoundDetails$(): Observable<OutBoundDetails[]>
    {
        return this._outBoundDetails.asObservable();
    }

    /**
     * Getter for Detail Pagenation
     */
    get outBoundDetailPagenation$(): Observable<OutBoundDetailPagenations>
    {
        return this._outBoundDetailPagenation.asObservable();
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    setData(outBoundData) {
        this._outBoundDetails.next(outBoundData);
    }
}
