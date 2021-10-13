import React, { useEffect, useRef, useState } from 'react';
import type { RouteContextType } from '@ant-design/pro-layout';
import { RouteContext } from '@ant-design/pro-layout';
import { history, useAliveController, useLocation, useModel } from 'umi';
import Tags from './Tags';
import styles from './index.less';
import store from '@/store/index';
import RightContent from '@/components/RightContent';
import { getParamSearch, judgePath } from '@/utils/utils';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
// import { loadMicroApp } from 'qiankun';

export type TagsItemType = {
  title?: string;
  path?: string;
  active?: boolean;
  query?: any;
  children?: any;
  refresh?: number;
  id?: string;
  tabKey?: string;
};

interface IProps {
  home: string;
}

/**
 * @component TagView 标签页组件
 */
const TagView: React.FC<IProps> = ({ children, home }) => {
  const [tagList, setTagList] = useState<TagsItemType[]>([]);
  const routeContextRef = useRef<RouteContextType>();
  const { setInitialState, initialState } = useModel('@@initialState');
  const { getCachingNodes, dropScope, refreshScope } = useAliveController();
  const cachingNodes = getCachingNodes();
  // 初始化 visitedViews
  const initTags = (routeContext: RouteContextType) => {
    // @ts-ignore
    const { location } = routeContext;
    if (tagList.length === 0 && routeContext.menuData) {
      const firstTag = judgePath(
        location.pathname === '/' ? home : location.pathname,
        routeContext,
      );
      if (firstTag) {
        const title = firstTag.name;
        const path = firstTag.path;
        history.push({
          pathname: firstTag.path,
          query: { id: getParamSearch('id', location.search) },
          state: location.state,
        });
        setTagList([
          {
            title,
            path,
            refresh: 0,
            active: true,
            query: { id: getParamSearch('id', location.search) },
            tabKey: location.pathname + location.search,
          },
        ]);
      }
    }
  };
  const before: any = useLocation();
  let beforeTitle: string = '';
  if (before && before.state && before.state.name) {
    beforeTitle = before?.state?.name || '';
  }

  // 监听路由改变
  const handleOnChange = (routeContext: any) => {
    const currentMenu = judgePath(location.pathname, routeContext);
    // tags初始化
    if (currentMenu.path === '/' || tagList.length === 0) {
      return initTags(routeContext);
    }
    // const app = loadMicroApp({ name: '/myHtml', entry: '//localhost:7104/', container: '.ant-layout-content' });
    // console.log(app)
    // 判断是否已打开过该页面
    let hasOpen = false;
    let tagsCopy: TagsItemType[] = [];
    const nowQuery = { id: location.search ? getParamSearch('id', location.search) : undefined };
    tagsCopy = tagList.map((item) => {
      if (currentMenu && currentMenu.path) {
        if (currentMenu.path === item.path && nowQuery.id === item.query.id) {
          hasOpen = true;
          item.title = currentMenu.name;
          // 刷新浏览器时，重新覆盖当前 path 的 children
          return { ...item, active: true, children };
        } else {
          return { ...item, active: false };
        }
      } else {
        return { ...item, active: false };
      }
    });
    // 没有该tag时追加一个,并打开这个tag页面
    if (!hasOpen) {
      const title = currentMenu?.title;
      const path = currentMenu?.path;
      tagsCopy.push({
        title: `${title}${beforeTitle ? '-' + beforeTitle : ''}`,
        path,
        refresh: 0,
        active: true,
        query: { id: getParamSearch('id', location.search) },
        tabKey: location.pathname + location.search,
      });
    }
    return setTagList(tagsCopy);
  };

  useEffect(() => {
    if (routeContextRef?.current) {
      handleOnChange(routeContextRef.current);
    }
  }, [routeContextRef?.current, getParamSearch('id')]);

  // 关闭标签
  const handleCloseTag = (tag: TagsItemType) => {
    const tagsCopy: TagsItemType[] = tagList.map((el) => ({ ...el }));
    // 判断关闭标签是否处于打开状态
    tagList.forEach((el, i) => {
      if (el.tabKey === tag.tabKey && tag.active) {
        const next = tagList[i - 1];
        if (next) {
          next.active = true;
          history.push({ pathname: next?.path, query: next?.query });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          tag.tabKey !== home ? history.push(home) : null;
        }
      }
    });
    setTagList(tagsCopy.filter((el) => el.tabKey !== tag?.tabKey));
    // 移除缓存
    if (cachingNodes && cachingNodes.length > 0) {
      cachingNodes.forEach((item) => {
        if (item.name === tag.tabKey) {
          dropScope(item.name as string);
        }
      });
    }
  };

  // 关闭所有标签
  const handleCloseAll = () => {
    const tagsCopy: TagsItemType[] = tagList.filter((el) => el.path === home);
    history.push(home);
    setTagList(tagsCopy);
    // 移除缓存
    if (cachingNodes && cachingNodes.length > 0) {
      cachingNodes.forEach((item) => {
        if (item.name !== home) {
          dropScope(item.name as string);
        }
      });
    }
  };

  // 关闭其他标签
  const handleCloseOther = (tag: TagsItemType) => {
    const tagsCopy: TagsItemType[] = tagList.filter(
      (el) => el.path === home || el.tabKey === tag.tabKey,
    );
    history.push({ pathname: tag?.path, query: tag?.query });
    setTagList(tagsCopy);
    // 移除缓存
    if (cachingNodes && cachingNodes.length > 0) {
      cachingNodes.forEach((item) => {
        if (item.name !== tag.tabKey) {
          dropScope(item.name as string);
        }
      });
    }
  };

  // 刷新选择的标签
  const handleRefreshTag = (tag: TagsItemType) => {
    const tagsCopy: TagsItemType[] = tagList.map((item) => {
      if (item.tabKey === tag.tabKey) {
        if (cachingNodes && cachingNodes.length > 0) {
          cachingNodes.forEach(async (temp) => {
            if (temp.name === tag.tabKey) {
              history.push({ pathname: tag?.path, query: tag?.query });
              refreshScope(temp.name as string);
            }
          });
        }
        return {
          ...item,
          refresh: item.refresh || item.refresh === 0 ? item.refresh + 1 : 0,
          active: true,
        };
      }
      return { ...item, active: false };
    });
    setTagList(tagsCopy);
  };

  const [tagOperation, setTagOperation] = useState(store.getState().countReducer);
  store.subscribe(() => {
    const { countReducer } = store.getState();
    if (countReducer && countReducer.tagsInfo) {
      setTagOperation(store.getState().countReducer);
    }
  });
  useEffect(() => {
    const {
      tagsInfo: { operate, params },
    } = store.getState().countReducer;
    switch (operate) {
      case 'refreshTag':
        handleRefreshTag(params as TagsItemType);
        break;
      case 'closeSelectedTag':
        handleCloseTag(params as TagsItemType);
        break;
      case 'closeOthersTags':
        handleCloseOther(params as TagsItemType);
        break;
      case 'closeAllTags':
        handleCloseAll();
        break;
      default:
        break;
    }
  }, [tagOperation]);

  return (
    <>
      <RouteContext.Consumer>
        {(value: RouteContextType) => {
          routeContextRef.current = value;
          return (
            <div
              className={styles.tag_view}
              style={
                initialState?.collapsed
                  ? { width: 'calc(100% - 36px)' }
                  : { width: 'calc(100% - 208px)' }
              }
            >
              {initialState?.collapsed ? (
                <MenuUnfoldOutlined
                  style={{ fontSize: '18px', marginLeft: '20px', marginRight: '10px' }}
                  onClick={() => {
                    setInitialState({ ...initialState, collapsed: false });
                  }}
                />
              ) : (
                <MenuFoldOutlined
                  style={{ fontSize: '18px', margin: '10px' }}
                  onClick={() => {
                    setInitialState({ ...initialState, collapsed: true });
                  }}
                />
              )}
              <Tags
                tagList={tagList}
                closeTag={handleCloseTag}
                closeAllTag={handleCloseAll}
                closeOtherTag={handleCloseOther}
                refreshTag={handleRefreshTag}
              />
              <RightContent />
            </div>
          );
        }}
      </RouteContext.Consumer>
    </>
  );
};

export default TagView;
