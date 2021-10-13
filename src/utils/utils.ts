import { iconMap } from '@/global';
import { RouteContextType } from '@ant-design/pro-layout';

const reg =
  /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export const isUrl = (path: string): boolean => reg.test(path);

export const isAntDesignPro = (): boolean => {
  if (ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION === 'site') {
    return true;
  }
  return window.location.hostname === 'preview.pro.ant.design';
};

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export const isAntDesignProOrDev = (): boolean => {
  const { NODE_ENV } = process.env;
  if (NODE_ENV === 'development') {
    return true;
  }
  return isAntDesignPro();
};

export function getParamSearch(key: string, search?: string) {
  let paras: any = search ? search : window.location.search;
  const result = paras.match(/[^\?&]*=[^&]*/g); //match是字符串中符合的字段一个一个取出来，result中的值为['login=xx','table=admin']
  paras = {}; //让paras变成没有内容的json对象
  for (const i in result) {
    const temp = result[i].split('='); //split()将一个字符串分解成一个数组,两次遍历result中的值分别为['itemId','xx']
    paras[temp[0]] = temp[1];
  }
  return paras[key];
}

/**
 * 扁平化层级结构数据
 * @param arr
 */

export const flatData = (oldArray: any[]) => {
  const newArr: any[] = []; // 新建一个数据，用于存储扁平化化后的数组
  const loop = (arr: any[]) => {
    arr.forEach((item) => {
      newArr.push(item);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      item.children && item.children.length > 0 ? loop(item.children) : '';
      item.children = ''; //如果扁平化后的数组需要显示父子层级，可以把这一项删除
    });
  };
  loop(oldArray);
  return newArr;
};

/**
 * 将扁平化数据层级结构输出
 * @param newArray 扁平化数据
 * @param parentFlag 父级标识
 * @param componentData 组件数据
 */
export function hierarchyData(
  newArray: any[],
  parentFlag = 'ud1',
  componentData: any[],
  params: any,
) {
  const treeList = newArray.reduce(
    (prev: any, cur: any) => {
      cur.title = cur.name;
      cur.key = cur.id;
      cur.path = '根目录';
      prev[cur['id']] = cur;
      return prev;
    },
    { id: '' },
  );
  const newData = newArray.reduce((prev: any[], cur: any) => {
    const pid = !params && cur[parentFlag] ? cur[parentFlag] : 0;
    // 是否显示图标
    if (componentData && componentData.length) {
      // 类型不是文件夹，则设置为叶子节点
      if (cur.type !== 'Folder') {
        cur.isLeaf = true;
        // 处理图标
        const array: any[] =
          componentData && componentData.length > 0
            ? componentData.filter((item) => item.key === cur.type)
            : [];
        if (array && array.length > 0) {
          cur.icon = array[0].ud3 ? iconMap[array[0].ud3] : iconMap['FileOutlined'];
        }
      } else {
        cur.icon = cur.parentIcon ? iconMap[cur.parentIcon] : iconMap['FolderFilled'];
      }
    }
    // pid为0的就找不到父对象，找到当前cur的父对象
    const parent = treeList[pid];
    // 如果父对象存在，就将cur放到父对象的children属性中
    if (parent) {
      cur.path = parent.path + `/${parent.name}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      parent.children ? parent.children.push(cur) : (parent.children = [cur]);
    } else if (pid === 0) {
      // 没有父对象，则此cur为根元素
      prev.push(cur);
    }
    return prev;
  }, []);
  return { afterData: newData };
}

/**
 * 判断路径是否存在路由或者菜单中
 * @param path 路径字符串
 */
export function judgePath(path: string, routeContext: RouteContextType) {
  let returnMenu: any = {
    path: '/404',
    title: '404',
  };
  const {
    currentMenu,
    // @ts-ignore
    route: { routes },
  } = routeContext;
  if (
    currentMenu &&
    currentMenu.path &&
    (currentMenu.path === path || (currentMenu.key && path.includes(currentMenu.key)))
  ) {
    returnMenu = currentMenu;
    returnMenu.title = currentMenu.name;
    returnMenu.path = path;
  } else {
    const loop = (data: any[]) => {
      if (data && data.length > 0) {
        data.forEach((item) => {
          if (item.children && item.children.length > 0) {
            loop(item.children);
          }
          if (item.path === path || (item.key && path.includes(item.key))) {
            returnMenu = item;
            returnMenu.title = item.name;
            returnMenu.path = path;
          }
        });
      }
    };
    if (routes && routes.length) {
      loop(routes);
    }
  }
  return returnMenu;
}
