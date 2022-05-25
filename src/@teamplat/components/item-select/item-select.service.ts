import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {map, switchMap, take} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";
import {ActivatedRoute} from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class ItemSelectService{

    private _itemList: BehaviorSubject<any[]> = new BehaviorSubject<any[]>(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common,
                private _route: ActivatedRoute,) {
    }

    /**
     * Getter for products
     */
    get itemLists$(): Observable<any[]>
    {
        return this._itemList.asObservable();
    }

    selectItem(itemLists: any[]): Observable<any>
    {
        return this.itemLists$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(itemLists, 'v1/api/basicInfo/item/select-item').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
}
