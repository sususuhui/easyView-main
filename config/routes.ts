export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './user/Login',
          },
        ],
      },
    ],
  },
  {
    path: '/welcome',
    name: '应用管理',
    icon: 'smile',
    component: './Welcome',
    hideInMenu: true,
  },
  {
    path: '/componentList',
    name: '元素管理',
    component: './Customer/componentList',
    hideInMenu: true,
  },
  {
    path: '/customerJs',
    name: '编辑视图',
    component: './Customer/customerJs',
    hideInMenu: true,
  },
  {
    path: '/',
    redirect: '/welcome',
    hideInMenu: true,
  },
  {
    path: '/404',
    component: './404',
    hideInMenu: true,
  },
];
