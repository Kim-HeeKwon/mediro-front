import {Injectable, Renderer2} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";
import {Common} from "../../providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class DashboardsColorChangeService {
    /**
     * Constructor
     */
    constructor(
        private _common: Common,
    )
    {
    }

    private newDateCreationSource = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dateCreated$ = this.newDateCreationSource.asObservable();

    broadcastDate(val: any): void {

        // 업데이트 -> 컬러
        const form = {
            id: localStorage.getItem('id'),
            mId: localStorage.getItem('mId'),
            email: localStorage.getItem('email'),
            dashboardColor : val,
        };

        this._common.sendData(form,'/v1/api/auth/update-user-dashboard-color')
            .subscribe((a: any) => {
                localStorage.setItem('dashboardColor', val);
            });

        this.newDateCreationSource.next(val);
    }
}
