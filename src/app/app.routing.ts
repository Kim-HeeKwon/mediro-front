import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import {InitialCommonPopupDataResolver, InitialDataResolver} from 'app/app.resolvers';
import { InitialCommonCodeDataResolver } from 'app/app.resolvers';

// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    // Redirect empty path to '/monitoring/dashboards'
    {path: '', pathMatch : 'full', redirectTo: 'monitoring/dashboards'},

    // Redirect signed in user to the '/monitoring/dashboards'
    //
    // After the user signs in, the sign in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'monitoring/dashboards'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)}
        ]
    },

    // Landing routes
    {
        path: '',
        component  : LayoutComponent,
        data: {
            layout: 'empty'
        },
        children   : [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
        ]
    },

    // Admin routes
    {
        path       : '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component  : LayoutComponent,
        resolve    : {
            initialData: InitialDataResolver,
            initialCommonCodeData:InitialCommonCodeDataResolver,
            initialCommonPopupData:InitialCommonPopupDataResolver
        },
        children   : [
            //
            {path: 'basic-info', children: [
                    // stock
                    {path: 'stock', loadChildren: () => import('app/modules/admin/basic-info/stock/stock.module').then(m => m.StockModule)},
                    // account
                    {path: 'account', loadChildren: () => import('app/modules/admin/basic-info/account/account.module').then(m => m.AccountModule)},
                    // supplier
                    //{path: 'supplier', loadChildren: () => import('app/modules/admin/basic-info/supplier/supplier.module').then(m => m.SupplierModule)},
                    // items
                    {path: 'items', loadChildren: () => import('app/modules/admin/basic-info/items/items.module').then(m => m.ItemsModule)},
                ]},
            // estimate-order
            {path: 'estimate-order', children: [
                    // estimate
                    {path: 'estimate', loadChildren: () => import('app/modules/admin/estimate-order/estimate/estimate.module').then(m => m.EstimateModule)},
                    // order
                    {path: 'order', loadChildren: () => import('app/modules/admin/estimate-order/order/order.module').then(m => m.OrderModule)},
                ]},
            // salesorder
            {path: 'salesorder', children: [
                    // estimate
                    {path: 'salesorder', loadChildren: () => import('app/modules/admin/salesorder/salesorder/salesorder.module').then(m => m.SalesorderModule)},
                ]
            },
            // in-out
            {path: 'in-out', children: [
                    // in
                    {path: 'in', loadChildren: () => import('app/modules/admin/in-out/in/in.module').then(m => m.InModule)},
                    // out
                    {path: 'out', loadChildren: () => import('app/modules/admin/in-out/out/out.module').then(m => m.OutModule)},
                ]},
            // stock
            {path: 'stock', children: [
                    // stock
                    {path: 'stock', loadChildren: () => import('app/modules/admin/stock/stock/stock.module').then(m => m.StockModule)},
                ]},
            // calculate
            {path: 'calculate', children: [
                    // bill
                    {path: 'bill', loadChildren: () => import('app/modules/admin/calculate/bill/bill.module').then(m => m.BillModule)},
                    // tax
                    {path: 'tax', loadChildren: () => import('app/modules/admin/calculate/tax/tax.module').then(m => m.TaxModule)},
                ]},
            // udi
            {path: 'udi', children: [
                    // manages
                    {path: 'manages', loadChildren: () => import('app/modules/admin/udi/manages/manages.module').then(m => m.ManagesModule)},
                ]},
            // Monitoring
            {path: 'monitoring', children: [
                    // dashboards
                    {path: 'dashboards', loadChildren: () => import('app/modules/admin/monitoring/dashboards/dashboards.module').then(m => m.DashboardsModule)},
                ]},

            // example
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
            // Pages
            {path: 'pages', children: [
                    // Settings
                    {path: 'settings', loadChildren: () => import('app/modules/admin/pages/settings/settings.module').then(m => m.SettingsModule)},
                ]},
            // User interface
            {path: 'ui', children: [
                    // Icons
                    {path: 'icons', loadChildren: () => import('app/modules/admin/ui/icons/icons.module').then(m => m.IconsModule)},
                    // Forms
                    {path: 'forms', children: [
                            {path: 'fields', loadChildren: () => import('app/modules/admin/ui/forms/fields/fields.module').then(m => m.FormsFieldsModule)},
                            {path: 'layouts', loadChildren: () => import('app/modules/admin/ui/forms/layouts/layouts.module').then(m => m.FormsLayoutsModule)},
                            {path: 'wizards', loadChildren: () => import('app/modules/admin/ui/forms/wizards/wizards.module').then(m => m.FormsWizardsModule)}
                        ]},
                    // Cards
                    {path: 'cards', loadChildren: () => import('app/modules/admin/ui/cards/cards.module').then(m => m.CardsModule)}
                ]},
        ]
    }
];
