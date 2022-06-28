/* tslint:disable:max-line-length */
import {FuseNavigationItem} from '@teamplat/components/navigation';
import {environment} from '../../../../environments/environment.prod';

export const version = environment;
export const defaultNavigation: FuseNavigationItem[] = [
    /* {
         id      : 'user-interface',
         title   : 'User Interface',
         subtitle: '개발자 참고',
         type    : 'group',
         icon    : 'heroicons_outline:collection',
         children: [
             {
                          id      : 'user-interface.icons',
                          title   : 'Icons',
                          type    : 'collapsable',
                          icon    : 'heroicons_outline:lightning-bolt',
                          children: [
                              {
                                  id   : 'user-interface.icons.heroicons-outline',
                                  title: 'Heroicons Outline',
                                  type : 'basic',
                                  link : '/ui/icons/heroicons-outline'
                              },
                              {
                                  id   : 'user-interface.icons.heroicons-solid',
                                  title: 'Heroicons Solid',
                                  type : 'basic',
                                  link : '/ui/icons/heroicons-solid'
                              },
             {
                                  id   : 'user-interface.icons.material-twotone',
                                  title: 'Material Twotone',
                                  type : 'basic',
                                  link : '/ui/icons/material-twotone'
                              },
                              {
                                  id   : 'user-interface.icons.material-outline',
                                  title: 'Material Outline',
                                  type : 'basic',
                                  link : '/ui/icons/material-outline'
                              },
                              {
                                  id   : 'user-interface.icons.material-solid',
                                  title: 'Material Solid',
                                  type : 'basic',
                                  link : '/ui/icons/material-solid'
                              },
                              {
                                  id   : 'user-interface.icons.iconsmind',
                                  title: 'Iconsmind',
                                  type : 'basic',
                                  link : '/ui/icons/iconsmind'
                              },
                              {
                                  id   : 'user-interface.icons.feather',
                                  title: 'Feather',
                                  type : 'basic',
                                 link : '/ui/icons/feather'
                              }
                          ]
                      },
        ]
     },*/
    {
        id      : 'monitoring',
        title   : '대시보드',
        type    : 'collapsable',
        icon    : 'space_dashboard',
        children: [
            {
                id   : 'monitoring.dashboards',
                title: '모니터링',
                type : 'basic',
                icon : 'heroicons_outline:presentation-chart-bar',
                link : '/monitoring/dashboards'
            },
            // {
            //     id   : 'analytics.dashboards',
            //     title: '애널리틱스',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // }
        ]
    },
    {
        id      : 'monitoring',
        title   : '유통관리',
        type    : 'collapsable',
        icon    : 'local_shipping',
        children: [
            {
                id   : 'estimate-order.estimate',
                title: '견적 관리',
                type: 'basic',
                icon: 'heroicons_outline:pencil-alt',
                link: '/estimate-order/estimate'
            },
            {
                id: 'estimate-order.order',
                title: '발주 관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:pencil',
                link: '/estimate-order/order'
            },
            {
                id: 'salesorder.salesorder',
                title: '주문 관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:pencil',
                link: '/salesorder/salesorder'
            },
            {
                id: 'bound.inbound',
                title: '입고 관리',
                type: 'basic',
                icon: 'heroicons_outline:folder-add',
                link: '/bound/inbound'
            },
            {
                id: 'bound.outbound',
                title: '출고 관리',
                type: 'basic',
                icon: 'heroicons_outline:folder-remove',
                link: '/bound/outbound'
            },
            {
                id: 'stock.stock',
                title: '재고 관리',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/stock'
            },
        ]
    },
    {
        id: 'monitoring',
        title: '정산관리',
        type: 'collapsable',
        icon: 'heroicons_outline:archive',
        tag: '',
        children: [
            {
                id: 'calculate.bill',
                title: '정산 및 마감',
                type: 'basic',
                icon: 'heroicons_outline:archive',
                link: '/calculate/bill'
            },
            {
                id: 'calculate.tax',
                title: '계산서 발행',
                type: 'basic',
                icon: 'heroicons_outline:archive',
                link: '/calculate/tax'
            },
            {
                id: 'deposit-withdrawal.deposit',
                title: '입금관리',
                type: 'basic',
                icon: 'monetization_on',
                link: '/deposit-withdrawal/deposit',
                tag: ''
            },
            {
                id: 'deposit-withdrawal.withdrawal',
                title: '출금관리',
                type: 'basic',
                icon: 'monetization_on',
                link: '/deposit-withdrawal/withdrawal',
                tag: ''
            },
            {
                id: 'deposit-withdrawal.income-outcome',
                title: '원장관리',
                type: 'basic',
                icon: 'credit_score',
                link: '/deposit-withdrawal/income-outcome',
                tag: ''
            },
        ]
    },
    {
        id: 'udi',
        title: '공급내역 보고',
        type: 'collapsable',
        icon: 'insert_chart',
        children: [
            {
                id: 'udi.manages',
                title: '식약처 공급내역보고',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/udi/manages'
            },
            // {
            //     id   : 'udi.manages-email',
            //     title: '공급내역 이메일 전송',
            //     type : 'basic',
            //     icon : 'heroicons_outline:identification',
            //     link : '/udi/manages-email'
            // },
            {
                id: 'udi.status',
                title: '통합시스템 전송내역',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/udi/status'
            },
            // {
            //     id   : 'udi.manage-sample',
            //     title: '공급내역 맛보기',
            //     type : 'basic',
            //     icon : 'heroicons_outline:identification',
            //     link : '/udi/manageSample'
            // },
        ]
    },
    {
        id: 'smart-plus',
        title: '스마트플러스',
        type: 'collapsable',
        icon: 'playlist_add',
        tag: '',
        children: [
            // {
            //     id   : 'smart-plus.manages',
            //     title: '자동발주',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // },
            // {
            //     id   : 'smart-plus.status',
            //     title: '정기주문',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // },
            {
                id: 'stock.safety',
                title: '안전재고',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/safety',
                tag: ''
            },
            {
                id: 'stock.validity',
                title: '유효기간',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/stock/validity',
                tag: ''
            },
            {
                id: 'smart-plus.status',
                title: '장기재고',
                type: 'basic',
                icon: 'receipt_long',
                link: '/stock/long-term',
                tag: ''
            },
            {
                id: 'stock.acceptable',
                title: '가납재고',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/acceptable',
                tag: ''
            },
        ]
    },
    {
        id: 'report',
        title: '리포트 관리',
        type: 'collapsable',
        icon: 'fact_check',
        children: [
            {
                id: 'report.bound',
                title: '수불 현황',
                type: 'basic',
                icon: 'analytics',
                link: '/report/report-bound'
            },
            {
                id: 'report.bill',
                title: '매입/매출 현황',
                type: 'basic',
                icon: 'leaderboard',
                link: '/report/report-bill'
            },
        ]
    },
    {
        id: 'basic-info',
        title: '기준정보',
        type: 'collapsable',
        icon: 'info',
        tag: '',
        children: [
            // {
            //     id   : 'basic-info.status',
            //     title: '초기재고등록',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '/pages/error/500'
            // },
            {
                id: 'basic-info.account',
                title: '거래처관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:library',
                link: '/basic-info/account'
            },
            {
                id: 'basic-info.items',
                title: '품목관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/basic-info/items'
            },
            {
                id: 'basic-info.item-price',
                title: '계약단가 관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:currency-dollar',
                link: '/basic-info/item-price'
            },
            {
                id: 'basic-info.udi-code',
                title: 'UDI DI 코드 관리',
                subtitle: '',
                type: 'basic',
                icon: 'code',
                link: '/basic-info/udi-code',
                tag: '',
            },
            {
                id: 'basic-info.udi-code-group',
                title: 'UDI DI 그룹 관리',
                subtitle: '',
                type: 'basic',
                icon: 'inventory_2',
                link: '/basic-info/udi-code-group',
                tag: '',
            },
        ]
    },
    {
        id: 'my-pages',
        title: '마이페이지',
        subtitle: '부가기능 관리',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'my-pages.setting',
                title: '마이페이지',
                type: 'basic',
                icon: 'heroicons_outline:cog',
                link: '/pages/settings'
            },
            {
                id: 'manual',
                title: '매뉴얼',
                type: 'collapsable',
                icon: 'search',
                tag: '',
                children: [
                    {
                        id: 'manual.manual',
                        title: '영상',
                        subtitle: '',
                        type: 'basic',
                        icon: 'play_circle',
                        link: '/manual/manual'
                    },
                    {
                        id: 'manual.manual-book',
                        title: '문서',
                        subtitle: '',
                        type: 'basic',
                        icon: 'menu_book',
                        link: '/manual/manual'
                    },
                ]
            },

            // {
            //     id   : 'payment.payment-history',
            //     title: '부가서비스',
            //     subtitle: '',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '/payment/payment-history'
            // },
            // {
            //     id   : 'realgrid.realgrid',
            //     title: '그리드 one',
            //     type : 'basic',
            //     //icon : 'heroicons_outline:desktop-computer',
            //     link : '/realgrid/realgrid'
            // },
            // {
            //     id   : 'realgrid.realgridHD',
            //     title: '그리드 (H-D)',
            //     type : 'basic',
            //     //icon : 'heroicons_outline:desktop-computer',
            //     link : '/realgrid/realgridHD'
            // },
        ]
    },
    // {
    //     id      : 'user-interface',
    //     title   : 'User Interface',
    //     subtitle: '개발자 참고',
    //     type    : 'group',
    //     icon    : 'heroicons_outline:collection',
    //     children: [
    //         {
    //             id      : 'user-interface.icons',
    //             title   : 'Icons',
    //             type    : 'collapsable',
    //             icon    : 'heroicons_outline:lightning-bolt',
    //             children: [
    //                 {
    //                     id   : 'user-interface.icons.heroicons-outline',
    //                     title: 'Heroicons Outline',
    //                     type : 'basic',
    //                     link : '/ui/icons/heroicons-outline'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.heroicons-solid',
    //                     title: 'Heroicons Solid',
    //                     type : 'basic',
    //                     link : '/ui/icons/heroicons-solid'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-twotone',
    //                     title: 'Material Twotone',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-twotone'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-outline',
    //                     title: 'Material Outline',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-outline'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-solid',
    //                     title: 'Material Solid',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-solid'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.iconsmind',
    //                     title: 'Iconsmind',
    //                     type : 'basic',
    //                     link : '/ui/icons/iconsmind'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.feather',
    //                     title: 'Feather',
    //                     type : 'basic',
    //                     link : '/ui/icons/feather'
    //                 }
    //             ]
    //         },
    //         {
    //             id      : 'user-interface.forms',
    //             title   : 'Forms',
    //             type    : 'collapsable',
    //             icon    : 'heroicons_outline:pencil-alt',
    //             children: [
    //                 {
    //                     id   : 'user-interface.forms.fields',
    //                     title: 'Fields',
    //                     type : 'basic',
    //                     link : '/ui/forms/fields'
    //                 },
    //                 {
    //                     id   : 'user-interface.forms.layouts',
    //                     title: 'Layouts',
    //                     type : 'basic',
    //                     link : '/ui/forms/layouts'
    //                 },
    //                 {
    //                     id   : 'user-interface.forms.wizards',
    //                     title: 'Wizards',
    //                     type : 'basic',
    //                     link : '/ui/forms/wizards'
    //                 }
    //             ]
    //         },
    //         {
    //             id   : 'user-interface.cards',
    //             title: 'Cards',
    //             type : 'basic',
    //             icon : 'heroicons_outline:duplicate',
    //             link : '/ui/cards'
    //         },
    //         {
    //             id   : 'user-interface.example',
    //             title: 'Example',
    //             type : 'basic',
    //             icon : 'heroicons_outline:duplicate',
    //             link : '/example'
    //         },
    //     ]
    // },
    {
        id: 'divider-2',
        type: 'divider'
    },
];

export const defaultNavigationAdmin: FuseNavigationItem[] = [
    {
        id: 'admin',
        title: '회원',
        subtitle: 'SaaS 유료 회원사 및 운영자 관리',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'user',
                title: '사용자',
                type: 'collapsable',
                icon: 'people_alt',
                children: [
                    {
                        id: 'user.user',
                        title: 'SaaS 회원사 목록',
                        type: 'basic',
                        icon: 'people_alt',
                        link: '/admin/user/user'
                    }, {
                        id: 'user.userInfo',
                        title: '사업자 정보',
                        type: 'basic',
                        icon: 'domain',
                        link: '/admin/user/userInfo'
                    }, {
                        id: 'user.userList',
                        title: '사용자 목록',
                        type: 'basic',
                        icon: 'heroicons_outline:user',
                        link: '/admin/user/userList'
                    },
                ]
            }, {
                id: 'operator',
                title: '운영자',
                type: 'collapsable',
                icon: 'admin_panel_settings',
                children: [
                    {
                        id: 'operator.operatorUserList',
                        title: '운영자 목록',
                        type: 'basic',
                        icon: 'supervisor_account',
                        //link : '/admin/user'
                    },
                    {
                        id: 'operator.operatorUserDetList',
                        title: '운영자 세부',
                        type: 'basic',
                        icon: 'person',
                        //link : '/admin/user'
                    }
                ]
            }
        ]
    },
    {
        id: 'service',
        title: '서비스',
        subtitle: 'SaaS 유료 회원사 서비스 관리',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'serviceCharge',
                title: '서비스 요금',
                type: 'collapsable',
                icon: 'manage_accounts',
                children: [
                    {
                        id: 'serviceCharge.serviceCharge',
                        title: '서비스 요금관리',
                        type: 'basic',
                        icon: 'payments',
                        link: '/admin/service/serviceCharge'
                    },
                    {
                        id: 'serviceCharge.promotion',
                        title: '프로모션 관리',
                        type: 'basic',
                        icon: 'sell',
                        //link : '/admin/user'
                    }
                ]
            }, {
                id: 'fee',
                title: '사용료',
                type: 'collapsable',
                icon: 'paid',
                children: [
                    {
                        id: 'fee.discount',
                        title: '할인율',
                        type: 'basic',
                        icon: 'heroicons_solid:cash',
                        link: '/admin/fee/discount'
                    },
                    {
                        id: 'fee.userDiscount',
                        title: '회원사 할인율',
                        type: 'basic',
                        icon: 'payment',
                        link: '/admin/fee/userDiscount'
                    },
                    {
                        id: 'fee.feeUser',
                        title: '사용료 목록',
                        type: 'basic',
                        icon: 'heroicons_solid:clipboard-check',
                        link: '/admin/fee/feeUser'
                    },
                    {
                        id: 'fee.feeBilling',
                        title: '청구서 관리',
                        type: 'basic',
                        icon: 'heroicons_solid:credit-card',
                        link: '/admin/fee/billManagement'
                    }
                ]
            }, {
                id: 'feeDashboard',
                title: '대시보드',
                type: 'collapsable',
                icon: 'space_dashboard',
                children: [
                    {
                        id: 'feeDashboard.feeDashboard',
                        title: '대시보드',
                        type: 'basic',
                        icon: 'dashboard_customize',
                        //link : '/admin/user'
                    },
                ]
            },
        ]
    },
    {
        id: 'userLog',
        title: '회원사 연결 관리',
        subtitle: 'SaaS 유료 회원사 연결 관리',
        type: 'group',
        icon: 'link',
        children: [
            {
                id: 'userLog',
                title: '연결 관리',
                type: 'collapsable',
                icon: 'link',
                children: [
                    {
                        id: 'userLog.userLog',
                        title: '접속 이력',
                        type: 'basic',
                        icon: 'share',
                        link: '/admin/connection/connectionHistory'
                    },
                    {
                        id: 'userLog.errorLog',
                        title: '에러 이력',
                        type: 'basic',
                        icon: 'error',
                        link: '/admin/connection/errorHistory'
                    },
                    {
                        id: 'userLog.scheduler',
                        title: '스케줄러 이력',
                        type: 'basic',
                        icon: 'heroicons_solid:clipboard-list',
                        link: '/admin/connection/schedulerHistory'
                    },
                ]
            },
        ]
    },
    {
        id: 'common',
        title: '공통 관리',
        subtitle: '공통 코드 및 팝업 관리',
        type: 'group',
        icon: 'link',
        children: [
            {
                id: 'common',
                title: '공통 관리',
                type: 'collapsable',
                icon: 'link',
                children: [
                    {
                        id: 'common.code',
                        title: '공통코드 관리',
                        type: 'basic',
                        icon: 'heroicons_solid:save',
                        link: '/admin/common/commonCode'
                    },
                    {
                        id: 'common.popup',
                        title: '공통팝업 관리',
                        type: 'basic',
                        icon: 'heroicons_solid:folder',
                        link: '/admin/common/commonPopup'
                    },
                ]
            },
        ]
    },
    {
        id: 'divider-2',
        type: 'divider'
    },
    // {
    //     id      : 'user-interface',
    //     title   : 'User Interface',
    //     subtitle: '개발자 참고',
    //     type    : 'group',
    //     icon    : 'heroicons_outline:collection',
    //     children: [
    //         {
    //                      id      : 'user-interface.icons',
    //                      title   : 'Icons',
    //                      type    : 'collapsable',
    //                      icon    : 'heroicons_outline:lightning-bolt',
    //                      children: [
    //                          {
    //                              id   : 'user-interface.icons.heroicons-outline',
    //                              title: 'Heroicons Outline',
    //                              type : 'basic',
    //                              link : '/ui/icons/heroicons-outline'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.heroicons-solid',
    //                              title: 'Heroicons Solid',
    //                              type : 'basic',
    //                              link : '/ui/icons/heroicons-solid'
    //                          },
    //         {
    //                              id   : 'user-interface.icons.material-twotone',
    //                              title: 'Material Twotone',
    //                              type : 'basic',
    //                              link : '/ui/icons/material-twotone'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.material-outline',
    //                              title: 'Material Outline',
    //                              type : 'basic',
    //                              link : '/ui/icons/material-outline'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.material-solid',
    //                              title: 'Material Solid',
    //                              type : 'basic',
    //                              link : '/ui/icons/material-solid'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.iconsmind',
    //                              title: 'Iconsmind',
    //                              type : 'basic',
    //                              link : '/ui/icons/iconsmind'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.feather',
    //                              title: 'Feather',
    //                              type : 'basic',
    //                             link : '/ui/icons/feather'
    //                          }
    //                      ]
    //                  },
    //    ]
    // },
];
export const defaultNavigationTest: FuseNavigationItem[] = [
    {
        id: 'monitoring',
        title: '대시보드',
        type: 'collapsable',
        icon: 'space_dashboard',
        children: [
            {
                id: 'monitoring.dashboards',
                title: '모니터링',
                type: 'basic',
                icon: 'heroicons_outline:presentation-chart-bar',
                link: '/monitoring/dashboards'
            },
            // {
            //     id   : 'analytics.dashboards',
            //     title: '애널리틱스',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // }
        ]
    },
    {
        id: 'monitoring',
        title: '유통관리',
        type: 'collapsable',
        icon: 'local_shipping',
        children: [
            {
                id: 'estimate-order.estimate',
                title: '견적 관리',
                type: 'basic',
                icon: 'heroicons_outline:pencil-alt',
                link: '/estimate-order/estimate'
            },
            {
                id: 'estimate-order.order',
                title: '발주 관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:pencil',
                link: '/estimate-order/order'
            },
            {
                id: 'salesorder.salesorder',
                title: '주문 관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:pencil',
                link: '/salesorder/salesorder'
            },
            {
                id: 'bound.inbound',
                title: '입고 관리',
                type: 'basic',
                icon: 'heroicons_outline:folder-add',
                link: '/bound/inbound'
            },
            {
                id: 'bound.outbound',
                title: '출고 관리',
                type: 'basic',
                icon: 'heroicons_outline:folder-remove',
                link: '/bound/outbound'
            },
            {
                id: 'stock.stock',
                title: '재고 관리',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/stock'
            },
        ]
    },
    {
        id: 'monitoring',
        title: '정산관리',
        type: 'collapsable',
        icon: 'heroicons_outline:archive',
        tag: '',
        children: [
            {
                id: 'calculate.bill',
                title: '정산 및 마감',
                type: 'basic',
                icon: 'heroicons_outline:archive',
                link: '/calculate/bill'
            },
            {
                id: 'calculate.tax',
                title: '계산서 발행',
                type: 'basic',
                icon: 'heroicons_outline:archive',
                link: '/calculate/tax'
            },
            {
                id: 'deposit-withdrawal.deposit',
                title: '입금관리',
                type: 'basic',
                icon: 'monetization_on',
                link: '/deposit-withdrawal/deposit',
                tag: ''
            },
            {
                id: 'deposit-withdrawal.withdrawal',
                title: '출금관리',
                type: 'basic',
                icon: 'monetization_on',
                link: '/deposit-withdrawal/withdrawal',
                tag: ''
            },
            {
                id: 'deposit-withdrawal.income-outcome',
                title: '원장관리',
                type: 'basic',
                icon: 'credit_score',
                link: '/deposit-withdrawal/income-outcome',
                tag: ''
            },
        ]
    },
    {
        id: 'udi',
        title: '공급내역 보고',
        type: 'collapsable',
        icon: 'insert_chart',
        children: [
            {
                id: 'udi.manages',
                title: '식약처 공급내역보고',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/udi/manages'
            },
            // {
            //     id   : 'udi.manages-email',
            //     title: '공급내역 이메일 전송',
            //     type : 'basic',
            //     icon : 'heroicons_outline:identification',
            //     link : '/udi/manages-email'
            // },
            {
                id: 'udi.status',
                title: '통합시스템 전송내역',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/udi/status'
            },
            // {
            //     id   : 'udi.manage-sample',
            //     title: '공급내역 맛보기',
            //     type : 'basic',
            //     icon : 'heroicons_outline:identification',
            //     link : '/udi/manageSample'
            // },
        ]
    },
    {
        id: 'smart-plus',
        title: '스마트플러스',
        type: 'collapsable',
        icon: 'playlist_add',
        tag: '',
        children: [
            // {
            //     id   : 'smart-plus.manages',
            //     title: '자동발주',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // },
            // {
            //     id   : 'smart-plus.status',
            //     title: '정기주문',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // },
            {
                id: 'stock.safety',
                title: '안전재고',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/safety',
                tag: ''
            },
            {
                id: 'stock.validity',
                title: '유효기간',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/stock/validity',
                tag: ''
            },
            {
                id: 'smart-plus.status',
                title: '장기재고',
                type: 'basic',
                icon: 'receipt_long',
                link: '/stock/long-term',
                tag: ''
            },
            {
                id: 'stock.acceptable',
                title: '가납재고',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/acceptable',
                tag: ''
            },
        ]
    },
    // {
    //     id      : 'basic-info',
    //     title   : '기준정보',
    //     type    : 'collapsable',
    //     icon    : 'info',
    //     children: [
    //         {
    //             id      : 'basic-info.account',
    //             title   : '거래처관리',
    //             subtitle: '',
    //             type    : 'basic',
    //             icon    : 'heroicons_outline:library',
    //             link    : '/basic-info/account'
    //         },
    //         {
    //             id      : 'basic-info.items',
    //             title   : '품목관리',
    //             subtitle: '',
    //             type    : 'basic',
    //             icon    : 'heroicons_outline:cube',
    //             link    : '/basic-info/items'
    //         },
    //         {
    //             id      : 'basic-info.item-price',
    //             title   : '계약단가관리',
    //             subtitle: '',
    //             type    : 'basic',
    //             icon    : 'heroicons_outline:currency-dollar',
    //             link    : '/basic-info/item-price'
    //         },
    //     ]
    // },
    // {
    //     id      : 'my-pages',
    //     title   : '마이페이지',
    //     subtitle: '부가기능 관리',
    //     type    : 'group',
    //     icon    : 'heroicons_outline:home',
    //     children: [
    //         {
    //             id   : 'my-pages.setting',
    //             title: '마이페이지',
    //             type : 'basic',
    //             icon : 'heroicons_outline:cog',
    //             link : '/pages/settings'
    //         },
    //         {
    //             id   : 'manual.manual',
    //             title: '매뉴얼',
    //             type : 'basic',
    //             icon : 'heroicons_outline:play',
    //             link : '/manual/manual'
    //         },
    //     ]
    // },
    {
        id: 'divider-2',
        type: 'divider'
    },
];
export const defaultNavigationM: FuseNavigationItem[] = [
    // {
    //     id      : 'user-interface',
    //     title   : 'User Interface',
    //     subtitle: '개발자 참고',
    //     type    : 'group',
    //     icon    : 'heroicons_outline:collection',
    //     children: [
    //         {
    //                      id      : 'user-interface.icons',
    //                      title   : 'Icons',
    //                      type    : 'collapsable',
    //                      icon    : 'heroicons_outline:lightning-bolt',
    //                      children: [
    //                          {
    //                              id   : 'user-interface.icons.heroicons-outline',
    //                              title: 'Heroicons Outline',
    //                              type : 'basic',
    //                              link : '/ui/icons/heroicons-outline'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.heroicons-solid',
    //                              title: 'Heroicons Solid',
    //                              type : 'basic',
    //                              link : '/ui/icons/heroicons-solid'
    //                          },
    //         {
    //                              id   : 'user-interface.icons.material-twotone',
    //                              title: 'Material Twotone',
    //                              type : 'basic',
    //                              link : '/ui/icons/material-twotone'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.material-outline',
    //                              title: 'Material Outline',
    //                              type : 'basic',
    //                              link : '/ui/icons/material-outline'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.material-solid',
    //                              title: 'Material Solid',
    //                              type : 'basic',
    //                              link : '/ui/icons/material-solid'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.iconsmind',
    //                              title: 'Iconsmind',
    //                              type : 'basic',
    //                              link : '/ui/icons/iconsmind'
    //                          },
    //                          {
    //                              id   : 'user-interface.icons.feather',
    //                              title: 'Feather',
    //                              type : 'basic',
    //                             link : '/ui/icons/feather'
    //                          }
    //                      ]
    //                  },
    //    ]
    // },
    {
        id: 'monitoring',
        title: '대시보드',
        type: 'collapsable',
        icon: 'space_dashboard',
        children: [
            {
                id: 'monitoring.dashboards',
                title: '모니터링',
                type: 'basic',
                icon: 'heroicons_outline:presentation-chart-bar',
                link: '/monitoring/dashboards'
            },
            // {
            //     id   : 'analytics.dashboards',
            //     title: '애널리틱스',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // }
        ]
    },
    {
        id: 'monitoring',
        title: '유통관리',
        type: 'collapsable',
        icon: 'local_shipping',
        children: [
            {
                id: 'estimate-order.estimate',
                title: '견적 관리',
                type: 'basic',
                icon: 'heroicons_outline:pencil-alt',
                link: '/estimate-order/estimate'
            },
            {
                id: 'estimate-order.order',
                title: '발주 관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:pencil',
                link: '/estimate-order/order'
            },
            {
                id: 'salesorder.salesorder',
                title: '주문 관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:pencil',
                link: '/salesorder/salesorder'
            },
            {
                id: 'bound.inbound',
                title: '입고 관리',
                type: 'basic',
                icon: 'heroicons_outline:folder-add',
                link: '/bound/inbound'
            },
            {
                id: 'bound.outbound',
                title: '출고 관리',
                type: 'basic',
                icon: 'heroicons_outline:folder-remove',
                link: '/bound/outbound'
            },
            {
                id: 'stock.stock',
                title: '재고 관리',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/stock'
            },
        ]
    },
    {
        id: 'monitoring',
        title: '정산관리',
        type: 'collapsable',
        icon: 'heroicons_outline:archive',
        tag: '',
        children: [
            {
                id: 'calculate.bill',
                title: '정산 및 마감',
                type: 'basic',
                icon: 'heroicons_outline:archive',
                link: '/calculate/bill'
            },
            {
                id: 'calculate.tax',
                title: '계산서 발행',
                type: 'basic',
                icon: 'heroicons_outline:archive',
                link: '/calculate/tax'
            },
            {
                id: 'deposit-withdrawal.deposit',
                title: '입금관리',
                type: 'basic',
                icon: 'monetization_on',
                link: '/deposit-withdrawal/deposit',
                tag: ''
            },
            {
                id: 'deposit-withdrawal.withdrawal',
                title: '출금관리',
                type: 'basic',
                icon: 'monetization_on',
                link: '/deposit-withdrawal/withdrawal',
                tag: ''
            },
            {
                id: 'deposit-withdrawal.income-outcome',
                title: '원장관리',
                type: 'basic',
                icon: 'credit_score',
                link: '/deposit-withdrawal/income-outcome',
                tag: ''
            },
        ]
    },
    {
        id: 'udi',
        title: '공급내역 보고',
        type: 'collapsable',
        icon: 'insert_chart',
        children: [
            {
                id: 'udi.manages',
                title: '식약처 공급내역보고',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/udi/manages'
            },
            // {
            //     id   : 'udi.manages-email',
            //     title: '공급내역 이메일 전송',
            //     type : 'basic',
            //     icon : 'heroicons_outline:identification',
            //     link : '/udi/manages-email'
            // },
            {
                id: 'udi.status',
                title: '통합시스템 전송내역',
                type: 'basic',
                icon: 'heroicons_outline:identification',
                link: '/udi/status'
            },
            // {
            //     id   : 'udi.manage-sample',
            //     title: '공급내역 맛보기',
            //     type : 'basic',
            //     icon : 'heroicons_outline:identification',
            //     link : '/udi/manageSample'
            // },
        ]
    },
    {
        id: 'smart-plus',
        title: '스마트플러스',
        type: 'collapsable',
        icon: 'playlist_add',
        tag: '',
        children: [
            // {
            //     id   : 'smart-plus.manages',
            //     title: '자동발주',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // },
            // {
            //     id   : 'smart-plus.status',
            //     title: '정기주문',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '',
            //     tag: '개발중'
            // },
            {
                id: 'stock.safety',
                title: '안전재고',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/safety',
                tag: ''
            },
            {
                id: 'stock.validity',
                title: '유효기간',
                type: 'basic',
                icon: 'heroicons_outline:calendar',
                link: '/stock/validity',
                tag: ''
            },
            {
                id: 'smart-plus.status',
                title: '장기재고',
                type: 'basic',
                icon: 'receipt_long',
                link: '/stock/long-term',
                tag: ''
            },
            {
                id: 'stock.acceptable',
                title: '가납재고',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/stock/acceptable',
                tag: ''
            }
        ]
    },
    {
        id: 'basic-info',
        title: '기준정보',
        type: 'collapsable',
        icon: 'info',
        tag: '',
        children: [
            // {
            //     id   : 'basic-info.status',
            //     title: '초기재고등록',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '/pages/error/500'
            // },
            {
                id: 'basic-info.account',
                title: '거래처관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:library',
                link: '/basic-info/account'
            },
            {
                id: 'basic-info.items',
                title: '품목관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:cube',
                link: '/basic-info/items'
            },
            {
                id: 'basic-info.item-price',
                title: '계약단가 관리',
                subtitle: '',
                type: 'basic',
                icon: 'heroicons_outline:currency-dollar',
                link: '/basic-info/item-price'
            },
            {
                id: 'basic-info.udi-code',
                title: 'UDI DI 코드 관리',
                subtitle: '',
                type: 'basic',
                icon: 'code',
                link: '/basic-info/udi-code',
                tag: '',
            },
            {
                id: 'basic-info.udi-code-group',
                title: 'UDI DI 그룹 관리',
                subtitle: '',
                type: 'basic',
                icon: 'inventory_2',
                link: '/basic-info/udi-code-group',
                tag: '',
            },
        ]
    },
    {
        id: 'my-pages',
        title: '마이페이지',
        subtitle: '부가기능 관리',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'my-pages.setting',
                title: '마이페이지',
                type: 'basic',
                icon: 'heroicons_outline:cog',
                link: '/pages/settings'
            },
            {
                id: 'manual.manual',
                title: '매뉴얼',
                type: 'basic',
                icon: 'heroicons_outline:play',
                link: '/manual/manual'
            },
            // {
            //     id   : 'realgrid.realgrid',
            //     title: '그리드 one',
            //     type : 'basic',
            //     //icon : 'heroicons_outline:desktop-computer',
            //     link : '/realgrid/realgrid'
            // },
            // {
            //     id   : 'realgrid.realgridHD',
            //     title: '그리드 (H-D)',
            //     type : 'basic',
            //     //icon : 'heroicons_outline:desktop-computer',
            //     link : '/realgrid/realgridHD'
            // },
        ]
    },
    // {
    //     id      : 'user-interface',
    //     title   : 'User Interface',
    //     subtitle: '개발자 참고',
    //     type    : 'group',
    //     icon    : 'heroicons_outline:collection',
    //     children: [
    //         {
    //             id      : 'user-interface.icons',
    //             title   : 'Icons',
    //             type    : 'collapsable',
    //             icon    : 'heroicons_outline:lightning-bolt',
    //             children: [
    //                 {
    //                     id   : 'user-interface.icons.heroicons-outline',
    //                     title: 'Heroicons Outline',
    //                     type : 'basic',
    //                     link : '/ui/icons/heroicons-outline'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.heroicons-solid',
    //                     title: 'Heroicons Solid',
    //                     type : 'basic',
    //                     link : '/ui/icons/heroicons-solid'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-twotone',
    //                     title: 'Material Twotone',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-twotone'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-outline',
    //                     title: 'Material Outline',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-outline'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-solid',
    //                     title: 'Material Solid',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-solid'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.iconsmind',
    //                     title: 'Iconsmind',
    //                     type : 'basic',
    //                     link : '/ui/icons/iconsmind'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.feather',
    //                     title: 'Feather',
    //                     type : 'basic',
    //                     link : '/ui/icons/feather'
    //                 }
    //             ]
    //         },
    //         {
    //             id      : 'user-interface.forms',
    //             title   : 'Forms',
    //             type    : 'collapsable',
    //             icon    : 'heroicons_outline:pencil-alt',
    //             children: [
    //                 {
    //                     id   : 'user-interface.forms.fields',
    //                     title: 'Fields',
    //                     type : 'basic',
    //                     link : '/ui/forms/fields'
    //                 },
    //                 {
    //                     id   : 'user-interface.forms.layouts',
    //                     title: 'Layouts',
    //                     type : 'basic',
    //                     link : '/ui/forms/layouts'
    //                 },
    //                 {
    //                     id   : 'user-interface.forms.wizards',
    //                     title: 'Wizards',
    //                     type : 'basic',
    //                     link : '/ui/forms/wizards'
    //                 }
    //             ]
    //         },
    //         {
    //             id   : 'user-interface.cards',
    //             title: 'Cards',
    //             type : 'basic',
    //             icon : 'heroicons_outline:duplicate',
    //             link : '/ui/cards'
    //         },
    //         {
    //             id   : 'user-interface.example',
    //             title: 'Example',
    //             type : 'basic',
    //             icon : 'heroicons_outline:duplicate',
    //             link : '/example'
    //         },
    //     ]
    // },
    {
        id: 'divider-2',
        type: 'divider'
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'estimate-order.estimate',
        title: '견적',
        type: 'basic',
        icon: 'heroicons_outline:pencil-alt',
        link: '/estimate-order/estimate'
    },
    {
        id: 'estimate-order.order',
        title: '발주',
        subtitle: '',
        type: 'basic',
        icon: 'heroicons_outline:pencil',
        link: '/estimate-order/order'
    },
    {
        id: 'salesorder.salesorder',
        title: '주문',
        subtitle: '',
        type: 'basic',
        icon: 'heroicons_outline:pencil',
        link: '/salesorder/salesorder'
    },
    {
        id: 'bound.inbound',
        title: '입고',
        type: 'basic',
        icon: 'heroicons_outline:folder-add',
        link: '/bound/inbound'
    },
    {
        id: 'bound.outbound',
        title: '출고',
        type: 'basic',
        icon: 'heroicons_outline:folder-remove',
        link: '/bound/outbound'
    },
    {
        id: 'stock.stock',
        title: '재고',
        type: 'basic',
        icon: 'heroicons_outline:cube',
        link: '/stock/stock'
    },
    {
        id: 'stock.validity',
        title: '유효기간',
        type: 'basic',
        icon: 'heroicons_outline:calendar',
        link: '/stock/validity'
    },
    {
        id: 'calculate.bill',
        title: '정산 및 마감',
        type: 'basic',
        icon: 'heroicons_outline:archive',
        link: '/calculate/bill'
    },
    {
        id: 'calculate.tax',
        title: '계산서 발행',
        type: 'basic',
        icon: 'heroicons_outline:archive',
        link: '/calculate/tax'
    },
    // {
    //     id   : 'calculate.bill2',
    //     title: '반입/반출',
    //     type : 'basic',
    //     icon : 'heroicons_outline:desktop-computer',
    //     link : '/pages/error/500'
    // },
    {
        id: 'realgrid.realgrid',
        title: '그리드',
        type: 'basic',
        //icon : 'heroicons_outline:desktop-computer',
        link: '/realgrid/realgrid'
    },
    {
        id: 'realgrid.realgridHD',
        title: '그리드(2)',
        type: 'basic',
        //icon : 'heroicons_outline:desktop-computer',
        link: '/realgrid/realgridHD'
    },
];
