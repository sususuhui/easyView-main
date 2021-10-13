import React, { useState, useRef, useEffect } from 'react';
import { history } from 'umi';
import { Scrollbars } from 'react-custom-scrollbars';
import { CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TagsItemType } from '../index';
import styles from './index.less';
import { Divider } from 'antd';

interface IProps {
  tagList: TagsItemType[];
  closeTag: (tag: TagsItemType) => void;
  closeAllTag: () => void;
  closeOtherTag: (tag: TagsItemType) => void;
  refreshTag: (tag: TagsItemType) => void;
}

const Tags: React.FC<IProps> = ({ tagList, closeTag, closeAllTag, closeOtherTag, refreshTag }) => {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentTag, setCurrentTag] = useState<TagsItemType>();

  const tagListRef = useRef<any>();
  const contextMenuRef = useRef<any>();

  const handleClickOutside = (event: Event) => {
    const isOutside = !(contextMenuRef.current && contextMenuRef.current.contains(event.target));
    if (isOutside && menuVisible) {
      setMenuVisible(false);
    }
  };

  useEffect(() => {
    return () => {
      document.body.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // 由于react的state不能及时穿透到 document.body.addEventListener去，需要在每次值发送改变时进行解绑和再次监听
  useEffect(() => {
    document.body.removeEventListener('click', handleClickOutside);
    document.body.addEventListener('click', handleClickOutside);
  }, [menuVisible]);

  const openContextMenu = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    tag: TagsItemType,
  ) => {
    event.preventDefault();
    const menuMinWidth = 105;
    const clickX = event.clientX;
    const clickY = event.clientY; //事件发生时鼠标的Y坐标
    const clientWidth = tagListRef.current?.clientWidth || 0; // container width
    const maxLeft = clientWidth - menuMinWidth; // left boundary
    setCurrentTag(tag);
    setMenuVisible(true);
    setTop(clickY);

    // 当鼠标点击位置大于左侧边界时，说明鼠标点击的位置偏右，将菜单放在左边
    // 反之，当鼠标点击的位置偏左，将菜单放在右边
    const Left = clickX > maxLeft ? clickX - menuMinWidth + 15 : clickX;
    setLeft(Left);
  };

  return (
    <div className={styles.tags_wrapper} ref={tagListRef}>
      <Scrollbars autoHide autoHideTimeout={1000} autoHideDuration={200}>
        {tagList.map((item) => (
          <div
            key={item.tabKey}
            className={item.active ? `${styles.item} ${styles.active}` : styles.item}
            onClick={(e) => {
              e.stopPropagation();
              if (item.query?.id) {
                history.push({
                  pathname: item.path,
                  query: item.query,
                });
              } else {
                history.push({
                  pathname: item.path,
                });
              }
            }}
            onContextMenu={(e) => openContextMenu(e, item)}
          >
            <span>{item.title}</span>
            <ReloadOutlined
              className={styles.icon_close}
              onClick={(e) => {
                e.stopPropagation();
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                refreshTag && refreshTag(item);
              }}
            />
            <CloseOutlined
              className={styles.icon_close}
              onClick={(e) => {
                e.stopPropagation();
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                closeTag && closeTag(item);
              }}
            />
            <Divider
              type="vertical"
              style={{ borderLeft: '1px solid #e8e8e8', marginLeft: '10px' }}
            />
          </div>
        ))}
      </Scrollbars>
      {menuVisible ? (
        <ul
          className={styles.contextmenu}
          style={{ left: `${left}px`, top: `${top}px` }}
          ref={contextMenuRef}
        >
          <li
            onClick={() => {
              setMenuVisible(false);
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              currentTag && refreshTag && refreshTag(currentTag);
            }}
          >
            刷新
          </li>
          <li
            onClick={() => {
              setMenuVisible(false);
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              currentTag && closeTag && closeTag(currentTag);
            }}
          >
            关闭
          </li>
          <li
            onClick={() => {
              setMenuVisible(false);
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              currentTag && closeOtherTag && closeOtherTag(currentTag);
            }}
          >
            关闭其他
          </li>
          <li
            onClick={() => {
              setMenuVisible(false);
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              closeAllTag && closeAllTag();
            }}
          >
            关闭所有
          </li>
        </ul>
      ) : null}
    </div>
  );
};

export default Tags;
