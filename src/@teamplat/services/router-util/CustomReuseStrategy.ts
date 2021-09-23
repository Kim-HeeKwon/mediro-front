import {ActivatedRouteSnapshot, RouteReuseStrategy, DetachedRouteHandle} from "@angular/router";

interface RouteStorageObject {
    snapshot: ActivatedRouteSnapshot;
    handle: DetachedRouteHandle;
}
export class CustomReuseStrategy implements RouteReuseStrategy {
    public static handlers: { [key: string]: DetachedRouteHandle } = {};

    public static waitDelete: string;
    public shouldDetach(route: ActivatedRouteSnapshot): boolean {
        if (route.routeConfig.loadChildren) return false;
        return true;
    }

    public store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        if (route.routeConfig.loadChildren) return null;
        if (CustomReuseStrategy.waitDelete && CustomReuseStrategy.waitDelete === this.getRouteUrl(route)) {
            CustomReuseStrategy.waitDelete = null;
            return;
        }
        CustomReuseStrategy.handlers[this.getRouteUrl(route)] = handle
    }

    public shouldAttach(route: ActivatedRouteSnapshot): boolean {
        if (route.routeConfig.loadChildren) return null;
        return !!route.routeConfig && !!CustomReuseStrategy.handlers[this.getRouteUrl(route)]
    }

    public retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        if (!route.routeConfig) return null;
        if (route.routeConfig.loadChildren) return null;

        return CustomReuseStrategy.handlers[this.getRouteUrl(route)];
    }

    public shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {

        return future.routeConfig === curr.routeConfig &&
            JSON.stringify(future.params) === JSON.stringify(curr.params);
    }

    // private getRouteUrl(route: ActivatedRouteSnapshot) {
    //     if (route.routeConfig.loadChildren) return null;
    //     return route['_routerState'].url.replace(/\//g, '_');
    // }
    private getRouteUrl(route: ActivatedRouteSnapshot) {
        if (route.routeConfig.loadChildren) return null;
        //console.log(route.routeConfig.loadChildren);
        //console.log(route['_routerState'].url.replace(/\//g, '_'));
        return route['_routerState'].url.replace(/\//g, '_');
        // return route['_routerState'].url.replace(/\//g, '_')
        //     + '_' + (route.routeConfig.loadChildren || route.routeConfig.component.toString().split('(')[0].split(' ')[1] );
    }
}
