import React, { useEffect, useRef, useState } from 'react';
import type { RouteContextType } from '@ant-design/pro-layout';
import { RouteContext } from '@ant-design/pro-layout';
import { useModel } from 'umi';
import Tags from './Tags';
import styles from './index.less';
import store from '@/store/index';
import RightContent from '@/components/RightContent';
import useTabView from '@/components/TagView/TagViewHook';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { getParamSearch } from '@/utils/utils';

export type TagsItemType = {
  title?: string;
  path?: string;
  active?: boolean;
  query?: any;
  children?: any;
  refresh: number;
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
  const routeContextRef = useRef<RouteContextType>();
  const { setInitialState, initialState } = useModel('@@initialState');
  const {
    tagList,
    handleRefreshTag,
    handleCloseOther,
    handleCloseAll,
    handleCloseTag,
    handleOnChange,
  } = useTabView(home, children);

  useEffect(() => {
    if (routeContextRef?.current) {
      const tabKey = location.pathname + location.search;
      const currentTag = tagList.filter((item) => item.tabKey === tabKey);
      handleOnChange(
        routeContextRef.current,
        currentTag && currentTag.length > 0 ? currentTag[0] : '',
      );
    }
    // @ts-ignore
  }, [routeContextRef?.current, getParamSearch('id', location.search)]);

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
          // // @ts-ignore
          // value.route.routes.map((item: { name: string; path: string }) => {
          //   if (item.name === 'iframe') {
          //     item.path = '/iframe/:id';
          //   }
          // });
          routeContextRef.current = value;
          return null;
        }}
      </RouteContext.Consumer>
      <div
        className={styles.tag_view}
        style={
          initialState?.collapsed ? { width: 'calc(100% - 36px)' } : { width: 'calc(100% - 208px)' }
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
      {tagList.map((item) => {
        return (
          <div key={item.tabKey} style={{ display: item.active ? 'block' : 'none' }}>
            <div key={item.refresh}>{item.children}</div>
          </div>
        );
      })}
    </>
  );
};

export default TagView;
