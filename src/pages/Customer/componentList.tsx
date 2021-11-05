import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  message,
  notification,
  Popconfirm,
  Popover,
  Row,
  Space,
  Table,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '@ant-design/pro-layout';
import { PlusCircleOutlined } from '@ant-design/icons';
import { deleteApps, getApps, setApps } from '@/services/app/api';
import { flatData, getParamSearch, hierarchyData } from '@/utils/utils';
import styles from './index.less';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import { history, KeepAlive } from 'umi';
import MyBreadcrumds from '@/components/MyBreadcrumd';
import { iconMap } from '@/global';

/**
 * @Description: 元素管理页面
 * @author suhui.bai@proinnova.com.cn
 * @date 2021/9/22 6:12 下午
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
  ud3?: string; //图标字符串
  icon?: any;
}

function ComponentList() {
  // 是否显示抽屉编辑框标识
  const [showDrawer, setShowDrawer] = useState(false);
  // 是否显示资源新建选择框
  const [showPop, setShowPop] = useState(false);
  const initial: ComponentItem[] = [];
  // 当前表格数据
  const [appArray, setAppArray] = useState(initial);
  // 当前扁平化数据
  const [flatArray, setFlatArray] = useState([]);
  // 当前选择的行数据
  const [nowItem, setNowItem] = useState({ id: '', name: '' });
  // 抽屉弹出框标题
  const [title, setTitle] = useState('新建文件夹');
  // 当前应用id
  const [app] = useState(getParamSearch('id'));
  // 当前文件夹id
  const [folderId, setFolderId] = useState('');
  const initBread: ComponentItem[] = [];
  // 面包屑数据
  const [breadData, setBreadData] = useState(initBread);
  const [initialLoading, setInitialLoading] = useState(false);
  const initComponentType: ComponentItem[] = [];
  // 组件类型数据
  const [componentType, setComponentType] = useState(initComponentType);
  const [form] = Form.useForm();

  const getApp = (params?: API.AppItem) => {
    const initialParams: API.AppItem = params ? params : { type: 'App' };
    setInitialLoading(true);
    return new Promise((resolve) => {
      getApps(initialParams)
        .then((res) => {
          setInitialLoading(false);
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
          setInitialLoading(false);
          notification.error({
            description: err,
            message: '',
          });
        });
    }).then();
  };

  const dealQueryByApp = async (newArray: any, params?: { ud1: string }) => {
    let types;
    if (componentType && componentType.length > 0) {
      types = JSON.parse(JSON.stringify(componentType));
    } else {
      const { res } = await getApps({ type: 'Component' });
      types = res;
    }
    // 获取层级结构数据，包括path
    const { afterData } = hierarchyData(JSON.parse(JSON.stringify(newArray)), 'ud1', types, params);
    const flat = flatData(afterData);
    // @ts-ignore
    setFlatArray(flat);
    // 数据处理：文件夹数据显示在表格最前面
    const tempType: ComponentItem[] = flat.filter((item: { ud1: string; type: string }) => {
      return item.type === 'Folder' && (item.ud1 === params?.ud1 || item.ud1 === '');
    });
    const tempOther: ComponentItem[] = flat.filter((item: { ud1: string; type: string }) => {
      return item.type !== 'Folder' && (item.ud1 === params?.ud1 || item.ud1 === '');
    });
    const after: ComponentItem[] = [...tempType, ...tempOther];
    setAppArray(after);
  };

  const deleteApp = (params: API.AppItem) => {
    deleteApps(params)
      .then((res) => {
        if (res && res.err) {
          notification.error({
            description: res.err,
            message: '',
          });
        } else {
          getApp({ app }).then((result: any) => {
            if (result.success) {
              dealQueryByApp(result.data);
            }
          });
        }
      })
      .catch((err) => {
        notification.error({
          description: err,
          message: '',
        });
      });
  };

  const setApp = (params: API.AppItem) => {
    if (title === '新建文件夹') {
      delete params.id;
    }
    setApps({ ...params })
      .then((res) => {
        setShowDrawer(false);
        form.resetFields();
        if (res && res.err) {
          notification.error({
            description: res.err,
            message: '',
          });
        } else {
          message.success('保存成功');
          const param: API.AppItem = {
            app,
          };
          if (folderId) {
            param.ud1 = folderId;
          }
          getApp(param).then((result: any) => {
            if (result.success) {
              dealQueryByApp(result.data);
            }
          });
        }
      })
      .catch((err) => {
        setShowDrawer(false);
        form.resetFields();
        notification.error({
          description: err,
          message: '',
        });
      });
  };

  /** 表格编辑操作 **/
  const editorFun = (record: ComponentItem) => {
    setNowItem(record);
    if (record.type !== 'Folder') {
      // 跳转到编辑视图页面
      history.push({
        pathname: '/customerJs',
        query: {
          id: record.id,
        },
        state: { name: record.name },
      });
    } else {
      setTitle('编辑文件夹');
      form.setFieldsValue({ name: record.name, desc: record.desc });
      setShowDrawer(true);
    }
  };

  /** 前进到下一个文件夹目录或者打开页面 **/
  const goAnother = async (record: ComponentItem) => {
    if (record.type === 'Folder') {
      setFolderId(record.id.toString());
      setBreadData([...breadData, record]);
      const params = {
        app: record.app,
        ud1: record.id.toString(),
      };
      getApp(params).then((result: any) => {
        if (result.success) {
          dealQueryByApp(result.data, params);
        }
      });
    } else {
      history.push({
        pathname: `/iframe/${record.id}`,
      });
    }
  };

  const getIcons = (record: ComponentItem) => {
    const array: ComponentItem[] =
      componentType && componentType.length > 0
        ? componentType.filter((item) => item.key === record.type)
        : [];
    if (array && array.length > 0) {
      return array[0].ud3 ? iconMap[array[0].ud3] : iconMap['FileOutlined'];
    } else {
      return iconMap['FolderFilled'];
    }
  };

  const columns1: ColumnsType<ComponentItem> = [
    {
      key: 'name',
      title: '名称',
      dataIndex: 'name',
      render: (text, record: ComponentItem) => {
        return (
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              goAnother(record);
            }}
            className={styles.icons}
          >
            {record.icon}
            {text}
          </div>
        );
      },
    },
    {
      key: 'type',
      title: '类型',
      dataIndex: 'type',
    },
    {
      key: 'desc',
      title: '描述',
      dataIndex: 'desc',
    },
    {
      key: 'create_time',
      title: '创建时间',
      dataIndex: 'create_time',
    },
    {
      key: 'modify_time',
      title: '修改时间',
      dataIndex: 'modify_time',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record: ComponentItem) => (
        <Space size="middle">
          <a onClick={() => editorFun(record)}>编辑</a>
          <Popconfirm
            title="确定删除该组件吗?"
            okText="确定"
            cancelText="取消"
            onConfirm={() => {
              const param: API.AppItem = { id: record.id };
              deleteApp(param);
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const [columnData, setColumnData] = useState(columns1);

  const columns2: ColumnsType<ComponentItem> = [
    {
      key: 'name',
      title: '名称',
      dataIndex: 'name',
      render: (text, record: ComponentItem) => {
        return (
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => goAnother(record)}
            className={styles.icons}
          >
            {getIcons(record)}
            {text}
          </div>
        );
      },
    },
    {
      key: 'type',
      title: '类型',
      dataIndex: 'type',
    },
    {
      key: 'desc',
      title: '描述',
      dataIndex: 'desc',
    },
    {
      key: 'path',
      title: '地址',
      dataIndex: 'path',
    },
    {
      key: 'create_time',
      title: '创建时间',
      dataIndex: 'create_time',
    },
    {
      key: 'modify_time',
      title: '修改时间',
      dataIndex: 'modify_time',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record: ComponentItem) => (
        <Space size="middle">
          <a onClick={() => editorFun(record)}>编辑</a>
          <Popconfirm
            title="确定删除该组件吗?"
            okText="确定"
            cancelText="取消"
            onConfirm={() => {
              const param: API.AppItem = { id: record.id };
              deleteApp(param);
            }}
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const content = (
    <div className={styles.extraContent}>
      <Row gutter={24}>
        <Col span={16}>
          <div className={styles.title}>组件</div>
          <div className={styles.content}>
            {componentType && componentType.length > 0
              ? componentType.map((item) => (
                  <div key={item.id}>
                    <a
                      onClick={() => {
                        setShowPop(false);
                        form.setFieldsValue({ name: '', desc: '', type: item.key });
                        setTitle(`新建${item.name}`);
                        setShowDrawer(true);
                      }}
                    >
                      {item.name}
                    </a>
                  </div>
                ))
              : null}
          </div>
        </Col>
        <Col span={8}>
          <div className={styles.title}>工具</div>
          <div className={styles.content}>
            <div>
              <a
                onClick={() => {
                  setShowPop(false);
                  setTitle('新建文件夹');
                  setShowDrawer(true);
                }}
              >
                文件夹
              </a>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );

  const extraContent = [
    <Popover
      key="1"
      content={content}
      visible={showPop}
      title=""
      trigger="click"
      placement="bottomRight"
      onVisibleChange={(visible) => {
        form.resetFields();
        setShowPop(visible);
      }}
    >
      <Button type="primary">
        <PlusCircleOutlined />
        新建
      </Button>
    </Popover>,
  ];

  useEffect(() => {
    if (componentType && componentType.length) {
      getApp({ app }).then((result: any) => {
        if (result.success) {
          dealQueryByApp(result.data);
        }
      });
    }
  }, [componentType]);

  const initialEffect = async () => {
    const { res } = await getApps({ type: 'Component' });
    if (res.err) {
    } else {
      setComponentType(res);
    }
  };

  useEffect(() => {
    initialEffect().then();
  }, []);

  const extra = (
    <Space>
      <Button onClick={() => setShowDrawer(false)}>取消</Button>
      <Button
        type="primary"
        onClick={() => {
          form.validateFields().then((values) => {
            const params = { app, type: 'Folder', ud1: folderId, ...values };
            if (title === '编辑文件夹') {
              params.id = nowItem.id;
            }
            setApp(params);
          });
        }}
      >
        确定
      </Button>
    </Space>
  );

  /** 获取面包屑中点击的item项的id，传给子组件面包屑 **/
  const getBreadId = useCallback(
    (id: string) => {
      if (id === 'root') {
        setFolderId('');
        getApp({ app }).then((res: any) => {
          if (res.success === true) {
            dealQueryByApp(res.data);
            setBreadData([]);
          }
        });
      } else {
        setFolderId(id);
        getApp({ app, ud1: id }).then((res: any) => {
          if (res.success === true) {
            dealQueryByApp(res.data);
            let index = 0; // 当前点击的面包屑在数组中的下标
            if (breadData && breadData.length > 0) {
              breadData.forEach((temp, num) => {
                if (temp.id.toString() === folderId) {
                  index = num;
                }
              });
            }
            breadData.splice(index + 1);
            setBreadData([...breadData]);
          }
        });
      }
    },
    [breadData],
  );

  const searchData = (value: string) => {
    if (value) {
      const param: {
        app: string | number;
        '#like': {
          name: string;
        };
      } = {
        app,
        '#like': {
          name: value,
        },
      };
      //根据名称搜索
      getApps(param).then((res) => {
        const newData: any[] = [];
        if (flatArray && flatArray.length) {
          const search = res.res;
          if (search && search.length) {
            const idArray: any[] = [];
            search.forEach((item: { id: string }) => {
              idArray.push(item.id);
            });
            flatArray.forEach((temp: { id: string }) => {
              if (idArray && idArray.length && idArray.includes(temp.id)) {
                newData.push(temp);
              }
            });
          }
        }
        setColumnData(columns2);
        setAppArray(newData);
      });
    } else {
      getApp({ app }).then((result: any) => {
        if (result.success) {
          setColumnData(columns1);
          dealQueryByApp(result.data);
        }
      });
    }
  };

  const bread = () => {
    return (
      <MyBreadcrumds
        changeBreadId={getBreadId}
        changeBreadData={breadData}
        onSearch={(value: string) => {
          searchData(value);
        }}
      />
    );
  };

  /** breadData改变时渲染面包屑组件 **/
  const MyBread = useMemo(bread, [breadData, flatArray]);

  return (
    <PageContainer extra={extraContent} fixedHeader title={'元素管理'}>
      {MyBread}
      <Table
        columns={columnData}
        dataSource={appArray}
        size="middle"
        loading={initialLoading}
        rowKey={(record: ComponentItem) => record.id}
      />
      <Drawer
        title={title}
        width={320}
        onClose={() => setShowDrawer(false)}
        visible={showDrawer}
        bodyStyle={{ paddingBottom: 80 }}
        className={styles.drawer}
        footer={extra}
        footerStyle={{ textAlign: 'right' }}
      >
        <Form
          layout="vertical"
          className={styles.form}
          form={form}
          initialValues={{ name: '', des: '', choice: '' }}
        >
          <Row>
            <Col span={24}>
              <Form.Item
                name="name"
                label="名称"
                rules={[{ required: true, message: '名称不能为空!' }]}
              >
                <Input placeholder="请输入名称" />
              </Form.Item>
            </Col>
          </Row>
          {title !== '新建文件夹' && title !== '编辑文件夹' ? (
            <Row>
              <Col span={24}>
                <Form.Item name="type" label="类型">
                  <Input placeholder="请输入组件类型" disabled />
                </Form.Item>
              </Col>
            </Row>
          ) : null}
          <Row>
            <Col span={24}>
              <Form.Item name="desc" label="描述">
                <Input placeholder="请输入描述" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>
    </PageContainer>
  );
}

export default (): React.ReactNode => {
  return (
    <KeepAlive
      id={location.pathname + location.search}
      name={location.pathname + location.search}
      saveScrollPosition="screen"
    >
      <ComponentList />
    </KeepAlive>
  );
};
