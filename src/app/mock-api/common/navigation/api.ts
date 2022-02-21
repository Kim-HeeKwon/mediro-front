import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { FuseNavigationItem } from '@teamplat/components/navigation';
import { FuseMockApiService } from '@teamplat/lib/mock-api';
import {
    compactNavigation,
    defaultNavigation, defaultNavigationAdmin,
    defaultNavigationM, defaultNavigationTest,
    futuristicNavigation,
    horizontalNavigation
} from 'app/mock-api/common/navigation/data';
import {BreakpointObserver, Breakpoints, BreakpointState} from "@angular/cdk/layout";
import {DeviceDetectorService} from "ngx-device-detector";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NavigationMockApi
{
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    isMobile: boolean = false;

    private readonly _compactNavigation: FuseNavigationItem[] = compactNavigation;
    private readonly _defaultNavigation: FuseNavigationItem[] = defaultNavigation;
    private readonly _defaultNavigationM: FuseNavigationItem[] = defaultNavigationM;
    private readonly _defaultNavigationAdmin: FuseNavigationItem[] = defaultNavigationAdmin;
    private readonly _defaultNavigationTest: FuseNavigationItem[] = defaultNavigationTest;
    private readonly _futuristicNavigation: FuseNavigationItem[] = futuristicNavigation;
    private readonly _horizontalNavigation: FuseNavigationItem[] = horizontalNavigation;

    /**
     * Constructor
     */
    constructor(private _fuseMockApiService: FuseMockApiService,
                private readonly breakpointObserver: BreakpointObserver,
                private _deviceService: DeviceDetectorService,)
    {
        this.isMobile = this._deviceService.isMobile();
        // Register Mock API handlers
        this.registerHandlers();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Register Mock API handlers
     */
    registerHandlers(): void
    {
        // -----------------------------------------------------------------------------------------------------
        // @ Navigation - GET  // 모바일 PC 분기
        // -----------------------------------------------------------------------------------------------------
        this._fuseMockApiService
            .onGet('api/common/navigation')
            .reply(() => {

                // Fill compact navigation children using the default navigation
                this._compactNavigation.forEach((compactNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === compactNavItem.id )
                        {
                            compactNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill futuristic navigation children using the default navigation
                this._futuristicNavigation.forEach((futuristicNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === futuristicNavItem.id )
                        {
                            futuristicNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });

                // Fill horizontal navigation children using the default navigation
                this._horizontalNavigation.forEach((horizontalNavItem) => {
                    this._defaultNavigation.forEach((defaultNavItem) => {
                        if ( defaultNavItem.id === horizontalNavItem.id )
                        {
                            horizontalNavItem.children = cloneDeep(defaultNavItem.children);
                        }
                    });
                });


                const userId = localStorage.getItem('id');
                const userGroup = localStorage.getItem('userGroup');

                //console.log(userGroup);

                if(userGroup === 'ADMIN'){
                    return [
                        200,
                        {
                            compact   : cloneDeep(this._compactNavigation),
                            default   : cloneDeep(this._defaultNavigationAdmin),
                            futuristic: cloneDeep(this._futuristicNavigation),
                            horizontal: cloneDeep(this._horizontalNavigation)
                        }
                    ];
                }else{
                    if(userId === 'test@naver.com'){
                        return [
                            200,
                            {
                                compact   : cloneDeep(this._compactNavigation),
                                default   : cloneDeep(this._defaultNavigationTest),
                                futuristic: cloneDeep(this._futuristicNavigation),
                                horizontal: cloneDeep(this._horizontalNavigation)
                            }
                        ];
                    }else{
                        if(this.isMobile){
                            // Return the response
                            return [
                                200,
                                {
                                    compact   : cloneDeep(this._compactNavigation),
                                    default   : cloneDeep(this._defaultNavigationM),
                                    futuristic: cloneDeep(this._futuristicNavigation),
                                    horizontal: cloneDeep(this._horizontalNavigation)
                                }
                            ];
                        }else{
                            // Return the response
                            return [
                                200,
                                {
                                    compact   : cloneDeep(this._compactNavigation),
                                    default   : cloneDeep(this._defaultNavigation),
                                    futuristic: cloneDeep(this._futuristicNavigation),
                                    horizontal: cloneDeep(this._horizontalNavigation)
                                }
                            ];
                        }
                    }
                }




                // Return the response
                // return [
                //     200,
                //     {
                //         compact   : cloneDeep(this._compactNavigation),
                //         default   : cloneDeep(this._defaultNavigation),
                //         futuristic: cloneDeep(this._futuristicNavigation),
                //         horizontal: cloneDeep(this._horizontalNavigation)
                //     }
                // ];
            });
    }
}
