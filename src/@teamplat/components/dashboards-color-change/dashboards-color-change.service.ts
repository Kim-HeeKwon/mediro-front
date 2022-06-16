import {Injectable} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DashboardsColorChangeService {

    private newDateCreationSource = new Subject<any>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dateCreated$ = this.newDateCreationSource.asObservable();

    broadcastDate(val: any): void {

        // 업데이트 -> 컬러
        console.log('service color change');
        console.log(val);

        this.newDateCreationSource.next(val);
    }
}
