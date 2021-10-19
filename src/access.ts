import { MenuDataItem } from '@ant-design/pro-layout/lib/typings';
import { iconMap } from './global';
import { getApps } from '@/services/app/api';
/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
  };
}

const loop = (menu: MenuDataItem[], components: any[]): MenuDataItem[] => {
  return menu.map(({ icon, children, ...item }) => {
    let menuIcon: string = '';
    if (components && components.length) {
      const array = components.filter((temp) => temp.key === item.fileType);
      if (array && array.length) {
        menuIcon = array[0].ud3;
      }
    }
    return {
      ...item,
      key: `/iframe/${item.id}`,
      name: item.title,
      path: `/iframe/${item.id}`,
      icon: menuIcon ? iconMap[menuIcon] : item.type === 'folder' ? iconMap['FolderFilled'] : '',
      routes: children && loop(children, components),
    };
  });
};

// 获取菜单信息
export const loopMenuItem = async (
  menus: MenuDataItem[],
  currentProject: string | undefined,
): Promise<MenuDataItem[]> => {
  // 查询所有组件图标
  const { res } = await getApps({ type: 'Component' });
  if (menus && menus.length > 0) {
    const filterItem = menus.filter((item) => item.id === currentProject);
    if (filterItem && filterItem.length > 0 && filterItem[0].children) {
      return loop(filterItem[0].children, res);
    }
  }
  return [];
};
