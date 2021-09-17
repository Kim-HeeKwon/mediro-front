import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from '@angular/router';

interface RouteStorageObject {
    snapshot: ActivatedRouteSnapshot;
    handle: DetachedRouteHandle;
}
export class TeamPlatReuseStrategy extends RouteReuseStrategy {

    private handlers: {[key: string]: DetachedRouteHandle} = {};

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        if (!route.routeConfig || route.routeConfig.loadChildren) {
            return false;
        }
        return true;
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        this.handlers[this.calcPath(route)] = handle;
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!this.handlers[this.calcPath(route)];
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        return this.handlers[this.calcPath(route)];
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        //return future.routeConfig === curr.routeConfig;
        if (future.outlet !== 'primary') {
            // do the switcheroo
            [future, curr] = [curr, future];
        }
        if (curr.routeConfig && curr.routeConfig.data && curr.routeConfig.data.useOnce) {
            return false;
        } else {
            return future.routeConfig === curr.routeConfig;
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    private calcPath(route: ActivatedRouteSnapshot) {
        return (route as any)._routerState.url;
    }
}
