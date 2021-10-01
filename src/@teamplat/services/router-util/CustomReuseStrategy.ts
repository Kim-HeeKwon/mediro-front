import {ActivatedRouteSnapshot, RouteReuseStrategy, DetachedRouteHandle} from "@angular/router";

export class CustomReuseStrategy implements RouteReuseStrategy {

    routesToCache: string[] = [
        'dashboards',
        'account',
        'items',
        'item-price',
        'estimate',
        'estimate/estimate-new',
        'estimate/estimate-detail',
        'order' ,
        'order/order-new',
        'order/order-detail',
        'salesorder',
        'salesorder/salesorder-new',
        'salesorder/salesorder-detail',
        // 'inbound',
        // 'inbound-new',
        // 'inbound-detail',
        // 'outbound',
        // 'outbound-new',
        // 'outbound-detail',
        // 'stock',
        // 'validity',
        // 'bill',
        // 'manages',
        // 'status',
    ];
    storedRouteHandles = new Map<string, DetachedRouteHandle>();

    // Decides if the route should be stored
    shouldDetach(route: ActivatedRouteSnapshot): boolean {

        return this.routesToCache.indexOf(route.data['key']) > -1;
        //return route.data['shouldDetach'] === true || this.routesToCache.indexOf(route.data['key']) > -1;
    }

    //Store the information for the route we're destructing
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        this.storedRouteHandles.set(route.data['key'], handle);
    }

    //Return true if we have a stored route object for the next route
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return this.storedRouteHandles.has(route.data['key']);
    }

    //If we returned true in shouldAttach(), now return the actual route data for restoration
    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        return this.storedRouteHandles.get(route.data['key']);
    }

    //Reuse the route if we're going to and from the same route
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return future.routeConfig === curr.routeConfig;
    }
}
