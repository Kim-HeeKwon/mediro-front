import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable} from "rxjs";
import {UdiCodeGroup, UdiCodeGroupPagination} from "./udi-code-group.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {ActivatedRoute} from "@angular/router";
import {map, switchMap, take} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})

export class UdiCodeGroupService {

    private _udiCodeGroup: BehaviorSubject<UdiCodeGroup> = new BehaviorSubject(null);
    private _udiCodeGroups: BehaviorSubject<UdiCodeGroup[]> = new BehaviorSubject(null);
    private _pagination: BehaviorSubject<UdiCodeGroupPagination | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient, private _common: Common,
                private _route: ActivatedRoute,) {
    }

    /**
     * Getter for product
     */
    get udiCodeGroup$(): Observable<UdiCodeGroup>
    {
        return this._udiCodeGroup.asObservable();
    }


    /**
     * Getter for products
     */
    get udiCodeGroups$(): Observable<UdiCodeGroup[]>
    {
        return this._udiCodeGroups.asObservable();
    }

    /**
     * Getter for pagenation
     */
    get pagenation$(): Observable<UdiCodeGroupPagination>
    {
        return this._pagination.asObservable();
    }

    /**
     * Post getItems
     *
     * @returns
     */
    getUdiCodeGroups(page: number = 0, size: number = 40, sort: string = 'udiDiCode', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Promise<{ pagination: UdiCodeGroupPagination; products: UdiCodeGroup[] }>{

        const searchParam = {};

        const pageParam = {
            page: page,
            size: size,
        };

        // 파마미터 설정
        this._route.queryParams.subscribe((params) => {
            if(Object.keys(params).length > 0){
                for (const kk in params) {
                    searchParam[kk] = params[kk];
                }
            }else{
                searchParam['order'] = order;
                searchParam['sort'] = sort;

                // 검색조건 Null Check
                if((Object.keys(search).length === 0) === false){
                    // eslint-disable-next-line guard-for-in
                    for (const k in search) {
                        searchParam[k] = search[k];
                    }
                }
            }
        });

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/basicInfo/udi-code-group/udi-code-group-List')
                .subscribe((response: any) => {
                    this._udiCodeGroups.next(response.data);
                    this._pagination.next(response.pageNation);
                    resolve({products: response.data, pagination: response.pageNation});
                }, reject);
        });
    }

    /**
     * save
     */
    saveUdiDiCodeGroup(udiCodeGroupData: UdiCodeGroup[]): Observable<UdiCodeGroup>
    {
        return this.udiCodeGroups$.pipe(
            take(1),
            switchMap(products => this._common.sendListDataLoading(udiCodeGroupData, 'v1/api/basicInfo/udi-code-group/save-udi-code-group').pipe(
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
