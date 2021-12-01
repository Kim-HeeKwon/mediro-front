import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";

@Injectable({
    providedIn: 'root'
})
export class LatelyCardService {

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }

    /**
     * Post
     *
     * @returns
     */
    getLatelySearch(page: number = 0, size: number = 20, sort: string = '', order: 'asc' | 'desc' | '' = 'desc', search: any = {}, content: string):
        Observable<any> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // 검색조건 Null Check
        if ((Object.keys(search).length === 0) === false) {
            // eslint-disable-next-line guard-for-in
            for (const k in search) {
                searchParam[k] = search[k];
            }
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/' + content)
                .subscribe((response: any) => {
                    console.log(response);
                    if (response.status === 'SUCCESS') {
                        resolve(response.data);
                    }
                }, reject);
        });
    }

}
