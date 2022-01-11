// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    hmr       : false,
    analytics: {
        id: 'UA-128668132-1' // test: UA-128668132-1   main : UA-128083111-1
    },
    userLogtest: 'Y',
    defaultUserId: 'mediroDefault',
    serverUrl: '',
    //serverTaxUrl: '',
    serverTaxUrl: 'http://localhost:8097/teamPlatBill/',
    //paymentHookUrl: 'https://www.teammediro.com/teamPlatFw/v1/api/payment',
    paymentHookUrl: 'https://localhost:8096/teamPlatFw/v1/api/payment',
    tossClientKey: 'test_ck_XjExPeJWYVQ20nbeAkpr49R5gvNL',
    test: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

