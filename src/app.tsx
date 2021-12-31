import type { Settings as LayoutSettings } from '@ant-design/pro-layout';
import { PageLoading } from '@ant-design/pro-layout';
import { notification, Select } from 'antd';
// @ts-ignore
import type { RequestConfig, RunTimeLayoutConfig } from 'umi';
import { history } from 'umi';
import TagView from '@/components/TagView';
import type { ReactChild, ReactFragment, ReactPortal } from 'react';
import { createRef } from 'react';
import { ApartmentOutlined, FolderViewOutlined, LeftOutlined } from '@ant-design/icons';
import styles from './app.less';
import { loopMenuItem } from './access';
import { getApps } from '@/services/app/api';
import TreeMenu from '@/components/TreeMenu';
import { Key } from 'rc-select/lib/interface/generator';

const { Option } = Select;
const logoInfo = require('/public/logo-seepln-easyview1.png');
const logoIco = require('/public/logo1.png');
const loginPath = '/user/login';

/** 获取用户信息比较慢的时候会展示一个 loading */
export const initialStateConfig = {
  loading: <PageLoading />,
};

export const layoutActionRef = createRef<{ reload: () => void | undefined }>();

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  collapsed?: boolean; // 自定义菜单栏收缩展开
  appId?: string | number | null; // 应用id
  menuMode?: string | null | undefined; //菜单类型，菜单/资源管理器
  projectArray?: any[]; // 菜单项目下拉数据
  currentProject?: string; // 当前选中的菜单下拉数据
}> {
  const fetchUserInfo = async () => {
    try {
      const currentUser = {
        name: 'Guest',
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
      };
      return currentUser;
    } catch (error) {
      history.push(loginPath);
    }
    return undefined;
  };
  const menuMode = localStorage.getItem('menu_mode') ? localStorage.getItem('menu_mode') : 'menu';
  // 如果是登录页面，不执行
  if (history.location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    return {
      appId: localStorage.getItem('appId'),
      menuMode,
      fetchUserInfo,
      collapsed: false,
      currentUser,
      settings: {},
      projectArray: [],
      currentProject: '',
    };
  }
  return {
    appId: localStorage.getItem('appId'),
    menuMode,
    collapsed: false,
    fetchUserInfo,
    settings: {},
    projectArray: [],
    currentProject: '',
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
  // @ts-ignore
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

// ProLayout 支持的api https://procomponents.ant.design/components/layout
//@ts-ignore
export const layout: RunTimeLayoutConfig = (initialModel) => {
  const { initialState, setInitialState } = initialModel;
  const menuMode = initialState?.menuMode;
  const projectArray = initialState?.projectArray;
  return {
    navTheme: 'dark',
    collapsed: initialState?.collapsed,
    collapsedButtonRender: false,
    className: styles.layout,
    menuExtraRender: (res) => {
      if (menuMode && menuMode === 'menu') {
        const { collapsed } = res;
        return (
          !collapsed && (
            <Select
              value={initialState.currentProject}
              className={styles.mySelect}
              dropdownClassName={styles.option}
              onChange={(value) => setInitialState({ ...initialState, currentProject: value })}
            >
              {projectArray && projectArray.length > 0
                ? projectArray.map((item: { title: string; id: Key }) => {
                    return (
                      <Option key={item.id} value={item.id}>
                        {item.title}
                      </Option>
                    );
                  })
                : null}
            </Select>
          )
        );
      } else {
        return <TreeMenu />;
      }
    },
    menuItemRender: (item) => {
      if (menuMode && menuMode === 'menu') {
        if (item && item.type === 'split') {
          if (!initialState?.collapsed) {
            return <div className={styles.title}>{item.name}</div>;
          }
          return (
            <div className={styles.title}>
              <ApartmentOutlined />
            </div>
          );
        }
        return (
          <div className={styles.path}>
            <a
              onClick={() => {
                if (item && item.path) {
                  history.push({
                    pathname: item.path,
                  });
                }
              }}
            >
              {item.icon}
              <span style={{ marginLeft: 10 }}>{item.name}</span>
            </a>
          </div>
        );
      } else {
        return false;
      }
    },
    subMenuItemRender: (_, dom) => {
      if (menuMode && menuMode === 'menu') {
        return <div>{dom}</div>;
      } else {
        return false;
      }
    },
    menu: {
      locale: false,
      params: {
        appId: initialState?.appId,
        menuMode: initialState?.menuMode,
        currentProject: initialState?.currentProject,
      },
      request: async (params: { appId: any }) => {
        const { appId } = params;
        let data: any[] = [{}];
        if (menuMode === 'menu') {
          if (appId) {
            const { res } = await getApps({
              app: localStorage.getItem('appId'),
              type: 'Menu',
            });
            if (res && res.err) {
              notification.error({
                description: res.err,
                message: '',
              });
            } else {
              //获取当前appId下的主菜单type为Menu，key为main的主菜单
              if (res && res.length) {
                const menu = res.filter((temp: { key: string }) => temp.key === 'main');
                if (menu && menu.length) {
                  const projectValue = initialState?.currentProject
                    ? initialState.currentProject
                    : menu[0].content && menu[0].content.length > 0
                    ? menu[0].content[0].id
                    : '';
                  setInitialState({
                    ...initialState,
                    currentProject: projectValue,
                    projectArray: menu[0].content
                      ? JSON.parse(JSON.stringify(menu[0].content))
                      : [],
                  });
                  //不能直接返回空数组，若是无数据，需返回，[{}]!!!!!!!!!!
                  data = await loopMenuItem(menu[0].content, projectValue);
                }
              }
            }
          }
        }
        return data;
      },
    },
    menuFooterRender: (props) => {
      return (
        <a
          style={{
            lineHeight: '48rpx',
            display: 'flex',
            height: 36,
            color: '#fff',
            alignItems: 'center',
            marginLeft: initialState?.collapsed ? 0 : 16,
            fontSize: 13,
            justifyContent: initialState?.collapsed ? 'center' : '',
          }}
          onClick={() => {
            localStorage.setItem('menu_mode', menuMode === 'menu' ? 'element' : 'menu');
            const newAppId = menuMode === 'menu' ? '' : localStorage.getItem('appId');
            setInitialState({
              ...initialState,
              menuMode: menuMode === 'menu' ? 'element' : 'menu',
              appId: newAppId,
            });
          }}
        >
          {!props?.collapsed &&
            (initialState?.menuMode === 'element' ? (
              <LeftOutlined style={{ fontSize: 16, marginRight: 4 }} />
            ) : (
              <FolderViewOutlined style={{ fontSize: 16, marginRight: 4 }} />
            ))}
          {!props?.collapsed && (initialState?.menuMode === 'element' ? '菜单' : '资源管理器')}
        </a>
      );
    },
    contentStyle: {
      paddingTop: '0px',
    },
    setting: {
      primaryColor: 'red',
    },
    logo: () => {
      return initialState?.collapsed ? <img src={logoIco} /> : <img src={logoInfo} />;
    },
    onMenuHeaderClick: () => {
      history.push({
        pathname: '/welcome',
      });
    },
    menuHeaderRender: (
      logo: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined,
    ) => <div id="customize_menu_header">{logo}</div>,
    disableContentMargin: false,
    // onPageChange: () => {
    //   const { location } = history;
    //   // 如果没有登录，重定向到 login
    //   if (!initialState?.currentUser && location.pathname !== loginPath) {
    //     history.push(loginPath);
    //   }
    // },
    childrenRender: (
      children: boolean | ReactChild | ReactFragment | ReactPortal | null | undefined,
    ) => {
      return (
        <>
          {initialState?.currentUser && location.pathname !== loginPath ? (
            <TagView children={children} home="/welcome" />
          ) : (
            <div>{children}</div>
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

// export const qiankun = Promise.resolve({
//   // 注册子应用信息
//   apps: dynamicRoute.apps,
//   prefetch: true,
//   sandbox: true,
//   lifeCycles: {
//     afterMount: () => {},
//   },
// });
//
// export async function render(oldRender: any) {
//   oldRender();
// }
