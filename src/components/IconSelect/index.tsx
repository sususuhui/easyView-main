import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { CloseCircleOutlined, DownOutlined } from '@ant-design/icons';
import { Input, Popover } from 'antd';
import { iconMap } from '@/global';

/**
 * @Description: 图标选择器
 * @author suhui.bai@proinnova.com.cn
 * @date 2021/9/28 11:24 上午
 */
export default (props: any) => {
  // 所选图标组件
  const [icon, setIcon] = useState(iconMap[props.value]);
  // 是否显示图标选择框
  const [visible, setVisible] = useState(false);
  // 所选图标的键值
  const [desc, setDesc] = useState('');
  const inputRef = useRef<Input | null>(null);
  useEffect(() => {}, []);
  const contentIcon = () => {
    const mapArray = [];
    for (const iconMapKey in iconMap) {
      mapArray.push([iconMapKey, iconMap[iconMapKey]]);
    }
    return (
      <div className={styles.icons}>
        {mapArray.map((item, index) => (
          <div
            key={index}
            className={`${styles.item} ${item[1] === icon ? styles.active : ''}`}
            onClick={() => {
              setIcon(item[1]);
              setDesc(item[0]);
              if (inputRef.current) {
                inputRef.current.focus();
              }
              setVisible(false);
            }}
          >
            {item[1]}
          </div>
        ))}
      </div>
    );
  };

  const handleVisibleChange = (view: boolean) => {
    setVisible(view);
  };

  return (
    <div className={styles.myTitle}>
      <Popover
        content={contentIcon}
        onVisibleChange={handleVisibleChange}
        trigger="click"
        placement="bottomLeft"
        visible={visible}
      >
        <Input
          prefix={
            icon ? (
              icon
            ) : (
              <span style={{ color: '#c5c5c5' }} onClick={() => setVisible(true)}>
                请选择
              </span>
            )
          }
          suffix={
            !icon ? (
              <DownOutlined style={{ color: '#c5c5c5' }} onClick={() => setVisible(true)} />
            ) : (
              <CloseCircleOutlined
                style={{ color: '#c5c5c5' }}
                onClick={() => {
                  setIcon('');
                  setDesc('');
                  setVisible(false);
                }}
              />
            )
          }
          readOnly
          ref={inputRef}
          onClick={() => {
            if (inputRef.current) {
              inputRef.current.focus();
            }
          }}
          onBlur={() => {
            props.onChange(desc);
          }}
          style={{ cursor: 'pointer' }}
        />
      </Popover>
    </div>
  );
};
