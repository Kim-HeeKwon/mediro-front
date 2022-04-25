import {ActivatedRouteSnapshot, Route} from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import {InitialCommonPopupDataResolver, InitialDataResolver, InitialSysConfigDataResolver} from 'app/app.resolvers';
import { InitialCommonCodeDataResolver } from 'app/app.resolvers';
import {environment} from "../environments/environment.prod";

export const version = environment;
// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    //관리자
    // {
    //     path: 'admin',
    //     // canActivate: [NoAuthGuard],
    //     // canActivateChild: [NoAuthGuard],
    //     component: LayoutComponent,
    //     data: {
    //         layout: 'empty'
    //     },
    //     children: [
    //         {path: 'sign-in', loadChildren: () => import('app/modules/adm/auth/sign-in/sign-in.module').then(m => m.SignInModule)}
    //     ]
    // },

    //관리자 routes
    {
        path: 'admin',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
            initialCommonCodeData: InitialCommonCodeDataResolver,
            initialCommonPopupData: InitialCommonPopupDataResolver
        },
        children   : [
            //
            {path: 'user',
                children: [
                    {path: 'user', data:{key: 'user'}, loadChildren: () => import('app/modules/adm/user/user/user.module').then(m => m.UserModule)},
                    {path: 'userInfo', data:{key: 'userInfo'}, loadChildren: () => import('app/modules/adm/user/user-info/user-info.module').then(m => m.UserInfoModule)},
                    {path: 'userList', data:{key: 'userList'}, loadChildren: () => import('app/modules/adm/user/user-list/user-list.module').then(m => m.UserListModule)},
                ]
            },
            {path: 'service',
                children: [
                    {path: 'serviceCharge', data:{key: 'serviceCharge'}, loadChildren: () => import('app/modules/adm/service/service-charge/service-charge.module').then(m => m.ServiceChargeModule)},
                ]
            },
            {path: 'fee',
                children: [
                    {path: 'billManagement', data:{key: 'billManagement'}, loadChildren: () => import('app/modules/adm/fee/billing-management/billing-management.module').then(m => m.BillingManagementModule)},
                    {path: 'feeUser', data:{key: 'feeUser'}, loadChildren: () => import('app/modules/adm/fee/fee-user/fee-user.module').then(m => m.FeeUserModule)},
                ]
            },
        ]
    },


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

    {
        path: 'report',
        //canActivate: [NoAuthGuard],
        //canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'list', loadChildren: () => import('@teamplat/components/common-report-list/common-report-list.module').then(m => m.CommonReportListModule)},
        ]
    },
    {
        path: 'notice',
        //canActivate: [NoAuthGuard],
        //canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'board', loadChildren: () => import('@teamplat/components/notice-board/notice-board.module').then(m => m.NoticeBoardModule)},
        ]
    },



    {
        path: '',
        //canActivate: [NoAuthGuard],
        //canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'experience', loadChildren: () => import('app/modules/auth/sign-experience/sign-experience.module').then(m => m.SignExperienceModule)},
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

    // landing routes
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
            initialCommonPopupData:InitialCommonPopupDataResolver,
            //initialSysConfig:InitialSysConfigDataResolver,
        },
        children   : [
            //
            {path: 'basic-info', children: [
                    // stock
                    //{path: 'stock', loadChildren: () => import('app/modules/admin/basic-info/stock/stock.module').then(m => m.StockModule)},
                    // account
                    //{path: 'account', loadChildren: () => import('app/modules/dms/basic-info/account/account.module').then(m => m.AccountModule)},
                    {path: 'account', data:{key: 'account'}, loadChildren: () => import('app/modules/dms/basic-info/account/account.module').then(m => m.AccountModule)},
                    // supplier
                    //{path: 'supplier', loadChildren: () => import('app/modules/admin/basic-info/supplier/supplier.module').then(m => m.SupplierModule)},
                    // items
                    // {path: 'items', data: {key: 'items'}, loadChildren: () => import('app/modules/admin/basic-info/items/items.module').then(m => m.ItemsModule)},
                    {path: 'items', data: {key: 'items'}, loadChildren: () => import('app/modules/dms/basic-info/items/items.module').then(m => m.ItemsModule)},
                ]},
            {path: 'basic-info', children: [
                    // item-price
                    // {path: 'item-price', data: {key: 'item-price'}, loadChildren: () => import('app/modules/admin/basic-info/item-price/item-price.module').then(m => m.ItemPriceModule)},
                    {path: 'item-price', data: {key: 'item-price'}, loadChildren: () => import('app/modules/dms/basic-info/item-price/item-price.module').then(m => m.ItemPriceModule)},
                    ]},
            // estimate-order
            {path: 'estimate-order', children: [
                    // estimate
                    // {path: 'estimate', data: {key: 'estimate'}, loadChildren: () => import('app/modules/admin/estimate-order/estimate/estimate.module').then(m => m.EstimateModule)},
                    {path: 'estimate', data: {key: 'estimate'}, loadChildren: () => import('app/modules/dms/estimate-order/estimate/estimate.module').then(m => m.EstimateModule)},
                    // order
                    // {path: 'order', data: {key: 'order'}, loadChildren: () => import('app/modules/admin/estimate-order/order/order.module').then(m => m.OrderModule)},
                    {path: 'order', data: {key: 'order'}, loadChildren: () => import('app/modules/dms/estimate-order/order/order.module').then(m => m.OrderModule)},
                ]},
            // salesorder
            {path: 'salesorder', children: [
                    // estimate
                    //{path: 'salesorder', data: {key: 'salesorder'}, loadChildren: () => import('app/modules/admin/salesorder/salesorder/salesorder.module').then(m => m.SalesorderModule)},
                    {path: 'salesorder', data: {key: 'salesorder'}, loadChildren: () => import('app/modules/dms/salesorder/salesorder/salesorder.module').then(m => m.SalesorderModule)},
                ]
            },
            // in-out
            {path: 'bound', children: [
                    // inbound
                    //{path: 'in', loadChildren: () => import('app/modules/admin/in-out/in/in.module').then(m => m.InModule)},
                    //{path: 'inbound', data: {key: 'inbound'}, loadChildren: () => import('app/modules/admin/bound/inbound/inbound.module').then(m => m.InboundModule)},
                    {path: 'inbound', data: {key: 'inbound'}, loadChildren: () => import('app/modules/dms/bound/inbound/inbound.module').then(m => m.InboundModule)},
                    // outbound
                    //{path: 'outbound', data: {key: 'outbound'}, loadChildren: () => import('app/modules/admin/bound/outbound/outbound.module').then(m => m.OutboundModule)},
                    {path: 'outbound', data: {key: 'outbound'}, loadChildren: () => import('app/modules/dms/bound/outbound/outbound.module').then(m => m.OutboundModule)},
                ]},
            // {path: 'payment', children: [
            //         {path: 'payment-history', data: {key: 'payment-history'}, loadChildren: () => import('app/modules/dms/payment/payment-history/payment-history.module').then(m => m.paymentHistoryModule)},
            //     ]
            // },
            // stock
            {path: 'stock', children: [
                    // stock
                    // {path: 'stock', data: {key: 'stock'}, loadChildren: () => import('app/modules/admin/stock/stock/stock.module').then(m => m.StockModule)},
                    {path: 'stock', data: {key: 'stock'}, loadChildren: () => import('app/modules/dms/stock/stock/stock.module').then(m => m.StockModule)},
                    // validity
                    //{path: 'validity', data: {key: 'validity'}, loadChildren: () => import('app/modules/admin/stock/validity/validity.module').then(m => m.ValidityModule)},
                    {path: 'validity', data: {key: 'validity'}, loadChildren: () => import('app/modules/dms/stock/validity/validity.module').then(m => m.ValidityModule)},
                    {path: 'safety', data: {key: 'safety'}, loadChildren: () => import('app/modules/dms/stock/safety/safety.module').then(m => m.SafetyModule)},
                    {path: 'acceptable', data: {key: 'acceptable'}, loadChildren: () => import('app/modules/dms/stock/acceptable/acceptable.module').then(m => m.AcceptableModule)},
                    {path: 'long-term', data: {key: 'long-term'}, loadChildren: () => import('app/modules/dms/stock/long-term/long-term.module').then(m => m.LongTermModule)},

                ]},
            /*{path: 'bill', children: [
                    // bill
                    {path: 'bill', loadChildren: () => import('app/modules/admin/bill/bill/bill.module').then(m => m.BillModule)},
                ]},*/
            // calculate
            {path: 'calculate', children: [
                    // bill
                    //{path: 'bill', data: {key: 'bill'}, loadChildren: () => import('app/modules/admin/calculate/bill/bill.module').then(m => m.BillModule)},
                    {path: 'bill', data: {key: 'bill'}, loadChildren: () => import('app/modules/dms/calculate/bill/bill.module').then(m => m.BillModule)},
                    // tax
                    //{path: 'tax', data: {key: 'tax'}, loadChildren: () => import('app/modules/admin/calculate/tax/tax.module').then(m => m.TaxModule)},
                    {path: 'tax', data: {key: 'tax'}, loadChildren: () => import('app/modules/dms/calculate/tax/tax.module').then(m => m.TaxModule)},
                ]},
            // {path: 'realgrid', children: [
            //         // bill
            //         {path: 'realgrid', loadChildren: () => import('app/modules/admin/realgrid/realgrid/realgrid.module').then(m => m.RealgridModule)},
            //         {path: 'realgridHD', loadChildren: () => import('app/modules/admin/realgrid/header-detail/header-detail.module').then(m => m.HeaderDetailModule)},
            //     ]},
            // deposit-withdrawal
            {path: 'deposit-withdrawal', children: [
                    {path: 'deposit', data: {key: 'deposit'}, loadChildren: () => import('app/modules/dms/deposit-withdrawal/deposit/deposit.module').then(m => m.DepositModule)},
                    {path: 'withdrawal', data: {key: 'withdrawal'}, loadChildren: () => import('app/modules/dms/deposit-withdrawal/withdrawal/withdrawal.module').then(m => m.WithdrawalModule)},
                    {path: 'income-outcome', data: {key: 'income-outcome'}, loadChildren: () => import('app/modules/dms/deposit-withdrawal/income-outcome/income-outcome.module').then(m => m.IncomeOutcomeModule)},
                ]},
            // udi
            {path: 'udi', children: [
                    // manages
                    //{path: 'manages', data: {key: 'manages'}, loadChildren: () => import('app/modules/admin/udi/manages/manages.module').then(m => m.ManagesModule)},
                    {path: 'manages', data: {key: 'manages'}, loadChildren: () => import('app/modules/dms/udi/manages/manages.module').then(m => m.ManagesModule)},
                    {path: 'manages-email', data: {key: 'manages-email'}, loadChildren: () => import('app/modules/dms/udi/manages-email/manages-email.module').then(m => m.ManagesEmailModule)},
                    // status
                    //{path: 'status', data: {key: 'status'}, loadChildren: () => import('app/modules/admin/udi/status/status.module').then(m => m.StatusModule)},
                    {path: 'status', data: {key: 'status'}, loadChildren: () => import('app/modules/dms/udi/status/status.module').then(m => m.StatusModule)},
                ]},
            // Monitoring
            {path: 'monitoring', children: [
                    // dashboards
                    {path: 'dashboards', data: {key: 'dashboards'}, loadChildren: () => import('app/modules/dms/monitoring/dashboards/dashboards.module').then(m => m.DashboardsModule)},
                ]},

            // example
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
            // Pages
            {path: 'manual', children: [
                    {path: 'manual', data: {key: 'manual'}, loadChildren: () => import('app/modules/dms/manual/manual/manual.module').then(m => m.ManualModule)},
                ]},
            {path: 'pages', children: [
                    // Settings
                    {path: 'settings', loadChildren: () => import('app/modules/admin/pages/settings/settings.module').then(m => m.SettingsModule)},
                    // Error
                    {path: 'error', children: [
                            {path: '404', loadChildren: () => import('app/modules/admin/pages/error/error-404/error-404.module').then(m => m.Error404Module)},
                            {path: '500', loadChildren: () => import('app/modules/admin/pages/error/error-500/error-500.module').then(m => m.Error500Module)}
                        ]},
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
