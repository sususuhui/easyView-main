import React, { useEffect, useState } from 'react';
import { notification, Tree, TreeDataNode } from 'antd';
import styles from './index.less';
import { getApps } from '@/services/app/api';
import { EventDataNode } from 'rc-tree/lib/interface';
import { hierarchyData } from '@/utils/utils';
import { useModel } from '@@/plugin-model/useModel';

const { DirectoryTree } = Tree;
interface TreeItem {
  parentIcon?: string;
  id: string;
  key?: string;
  name?: string; //名称
  ud1?: string; // 父级标识
  app?: string;
  title?: string;
  isLeaf?: boolean;
  type?: string;
  icon?: any;
  ud3?: string;
}

export default () => {
  const initial: TreeDataNode[] = [];
  const [treeData, setTreeData] = useState(initial);
  const component: TreeItem[] = [];
  const [componentData, setComponentData] = useState(component);
  const flag: TreeItem[] = [];
  const [flatData, setFlatData] = useState(flag);
  const { initialState } = useModel('@@initialState');

  /** 数据处理：做层级数据结构 **/
  const dealData = (newArray: TreeItem[], queryComponentData: TreeItem[]) => {
    const { afterData } = hierarchyData(newArray, 'ud1', queryComponentData, '');
    // 数据处理：文件夹数据显示在表格最前面
    const tempType: TreeItem[] = afterData.filter((item) => {
      return item.type === 'Folder';
    });
    const tempOther: TreeItem[] = afterData.filter((item) => {
      return item.type !== 'Folder';
    });
    const after: TreeItem[] = [...tempType, ...tempOther];
    return after;
  };
  const getApp = async (params?: API.AppItem) => {
    const initialParams: API.AppItem = params ? params : { type: 'App' };
    return await new Promise((resolve) => {
      getApps(initialParams)
        .then((res) => {
          if (res && res.err) {
            notification.error({
              description: res.err,
              message: '',
            });
          } else {
            const newArray = res.res;
            resolve({ success: true, data: newArray });
          }
        })
        .catch((err) => {
          notification.error({
            description: err,
            message: '',
          });
        });
    }).then();
  };
  useEffect(() => {
    const showMenu = async () => {
      // 查询组件类型图标
      const res = (await getApp({ type: 'Component' })) as any;
      if (res && res.success) {
        setComponentData(res.data);
        const param = { app: localStorage.getItem('appId') ? localStorage.getItem('appId') : '' };
        // 查询所有资源数据
        getApp(param).then((result: any) => {
          if (result && result.success) {
            setFlatData(JSON.parse(JSON.stringify(result.data)));
            const after = dealData(result.data, res.data) as TreeDataNode[];
            setTreeData(after);
          }
        });
      }
    };
    showMenu();
  }, [initialState?.appId, initialState?.menuMode]);

  const onSelect = (keys: React.Key[], info: any) => {
    console.log('Trigger Select', keys, info);
  };

  const onExpand = (
    expandedKeys: any[],
    info: {
      node: EventDataNode;
      expanded: boolean;
    },
  ) => {
    const { expanded, node } = info;
    if (expanded) {
      node.icon = 'FolderOpenFilled';
    } else {
      node.icon = 'FolderFilled';
    }
    const newFlatData = JSON.parse(JSON.stringify(flatData)) as TreeItem[];
    if (newFlatData && newFlatData.length) {
      newFlatData.forEach((item) => {
        // @ts-ignore
        if (item.id === node.id) {
          // @ts-ignore
          item.parentIcon = node.icon;
        }
      });
      setFlatData(JSON.parse(JSON.stringify(newFlatData)));
      const after = dealData(newFlatData, componentData) as TreeDataNode[];
      setTreeData(after);
    }
  };
  return initialState?.collapsed ? null : (
    <DirectoryTree
      onSelect={onSelect}
      onExpand={onExpand}
      treeData={treeData}
      className={styles.tree}
    />
  );
};
