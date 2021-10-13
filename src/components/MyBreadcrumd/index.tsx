import { useEffect, useState } from 'react';
import styles from './index.less';
import { Breadcrumb } from 'antd';
import { FolderFilled } from '@ant-design/icons';
import Search from 'antd/es/input/Search';

/**
 * @Description: 面包屑公用组件
 * @author suhui.bai@proinnova.com.cn
 * @date 2021/9/28 10:00 上午
 */
interface ComponentItem {
  id: string;
  key?: string;
  name: string; //名称
  type?: string; //类型
  desc?: string; //描述
  create_time?: string; //创建时间
  modify_time?: string;
  ud1?: string; // 父级标识
  app?: string;
}

export default (props: any) => {
  const { changeBreadData, changeBreadId } = props;
  const [breadData, setBreadData] = useState(changeBreadData); // 面包屑数据
  useEffect(() => {
    setBreadData(changeBreadData);
  }, [changeBreadData]);
  return (
    <div className={styles.myTitle}>
      <Breadcrumb>
        <Breadcrumb.Item key="root" href="#" onClick={() => changeBreadId('root')}>
          <FolderFilled style={{ marginRight: '4px', color: '#26a69a', fontSize: '14px' }} />
          根目录
        </Breadcrumb.Item>
        {breadData && breadData.length > 0
          ? breadData.map((item: ComponentItem) => {
              return (
                <Breadcrumb.Item
                  key={item.id}
                  href="#"
                  onClick={() => changeBreadId(item.id.toString())}
                >
                  <FolderFilled
                    style={{ marginRight: '4px', color: '#26a69a', fontSize: '14px' }}
                  />
                  <span>{item.name}</span>
                </Breadcrumb.Item>
              );
            })
          : null}
      </Breadcrumb>
      <Search
        placeholder="请输入搜索关键字"
        style={{ width: 200 }}
        onSearch={(value) => props.onSearch(value)}
      />
    </div>
  );
};
