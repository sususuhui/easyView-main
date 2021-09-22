import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { notification } from 'antd';
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history, MicroApp } from 'umi';
import TagView from '@/components/TagView';
import { currentUser as queryCurrentUser } from './services/ant-design-pro/api';
import { MenuDataItem } from '@ant-design/pro-layout/lib/typings';
import { createRef, ReactChild, ReactFragment, ReactPortal } from 'react';
import tagUtil from '@/utils/tags';

const logoInfo = require('/public/logo-seepln-easyview1.png');
const {
  method: { dealTags },
} = tagUtil;
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const currentUser = await queryCurrentUser();
      return currentUser;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      fetchUserInfo,
      currentUser,
      settings: {},
    };
  }
  return {
    fetchUserInfo,
    settings: {},
  };
}

/**
 * 异常处理程序
 200: '服务器成功返回请求的数据。',
 201: '新建或修改数据成功。',
 202: '一个请求已经进入后台排队（异步任务）。',
 204: '删除数据成功。',
 400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
 401: '用户没有权限（令牌、用户名、密码错误）。',
 403: '用户得到授权，但是访问是被禁止的。',
 404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
 405: '请求方法不被允许。',
 406: '请求的格式不可得。',
 410: '请求的资源被永久删除，且不会再得到的。',
 422: '当创建一个对象时，发生一个验证错误。',
 500: '服务器发生错误，请检查服务器。',
 502: '网关错误。',
 503: '服务不可用，服务器暂时过载或维护。',
 504: '网关超时。',
 * @see https://beta-pro.ant.design/docs/request-cn
 */
export const request: RequestConfig = {
  errorHandler: (error: any) => {
    const { response } = error;

    if (!response) {
      notification.error({
        description: '您的网络发生异常，无法连接服务器',
        message: '网络异常',
      });
    }
    throw error;
  },
};

const dynamicRoute = {
  // 注册子应用信息
  apps: [
    {
      name: 'myHtml', // 唯一 id
      entry: '//localhost:7104', //本地启动
    },
  ],
  routes: [
    {
      name: 'myHtml',
      path: '/myHtml',
      microApp: 'myHtml',
    },
  ],
};

let menusData: MenuDataItem[] = [
  {
    path: '/welcome',
    name: '我的应用',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: '管理页',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      {
        path: '/admin/sub-page',
        name: '二级管理页',
        component: './Welcome',
      },
    ],
  },
  {
    name: '查询表格',
    path: '/list',
    component: './TableList',
  },
  {
    name: '我的html',
    path: '/myHtml/index',
  },
  {
    name: '我的html1',
    path: '/myHtml/index1',
  },
  {
    name: '我的html2',
    path: '/myHtml/index2',
  },
];
export const layoutActionRef = createRef<{ reload: () => void | undefined }>();
const app = () => (
  <MicroApp
    name="myHtml"
    dealTags={dealTags}
    autoSetLoading
    refreshMenu={(data: MenuDataItem[]) => {
      menusData = data;
      layoutActionRef.current?.reload();
    }}
  />
);

const newRoutes = [
  {
    name: 'myHtml',
    path: '/myHtml/index',
    exact: true,
    icon: 'smile',
    key: 'myHtml',
    component: app, // 设置自定义 loading 动画
  },
  {
    name: 'myHtml1',
    path: '/myHtml/index1',
    exact: true,
    icon: 'smile',
    key: 'myHtml1',
    component: app, // 设置自定义 loading 动画
  },
  {
    name: 'myHtml2',
    path: '/myHtml/index2',
    exact: true,
    icon: 'smile',
    key: 'myHtml2',
    component: app, // 设置自定义 loading 动画
  },
];

export function patchRoutes(props: { routes: any }) {
  const { routes } = props;
  newRoutes.forEach((element) => {
    routes[0].routes.unshift(element);
  });
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
// @ts-ignore
export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    contentStyle: {
      paddingTop: '0px',
    },
    setting: {
      primaryColor: 'red',
    },
    logo: logoInfo,
    menuHeaderRender: (logo) => <div id="customize_menu_header">{logo}</div>,
    disableContentMargin: false,
    headerRender: () => false,
    // rightContentRender: () => <RightContent />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== loginPath) {
        history.push(loginPath);
      }
    },
    actionRef: layoutActionRef,
    menu: {
      locale: false,
      request: async () => {
        console.log('===重新请求菜单', menusData);
        return menusData; //不能直接返回空数组，若是无数据，需返回，[{}]
      },
    },
    childrenRender: (
      children: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined,
    ) => {
      return (
        <>
          {initialState?.currentUser && location.pathname !== loginPath ? (
            <TagView children={children} home="/welcome" />
          ) : (
            children
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

export const qiankun = Promise.resolve({
  // 注册子应用信息
  apps: dynamicRoute.apps,
  jsSandbox: true,
  prefetch: true,
  // sandbox: {strictStyleIsolation: true},
});

export async function render(oldRender: any) {
  oldRender();
}
