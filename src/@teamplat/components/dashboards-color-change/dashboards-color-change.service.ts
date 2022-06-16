import {Injectable} from "@angular/core";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class DashboardsColorChangeService {

    private newDateCreationSource = new Subject<Date>();
    // eslint-disable-next-line @typescript-eslint/member-ordering
    dateCreated$ = this.newDateCreationSource.asObservable();

    broadcastDate(date: Date): void {
        this.newDateCreationSource.next(date);
    }
}
