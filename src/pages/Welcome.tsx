import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Form, Input, message, Modal, notification, Popconfirm, Space, Tabs } from 'antd';
import { DeleteOutlined, EditOutlined, EllipsisOutlined, PlusCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import styles from './Welcome.less';
import { deleteApps, getApps, setApps } from '../services/app/api';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import { history } from 'umi';
import TabPane from '@ant-design/pro-card/es/components/TabPane';
import ManageList from '@/components/ManageList';
import { useModel } from '@@/plugin-model/useModel';

function Welcome() {
  // 保存应用数据
  const [appArray, setAppArray] = useState([]);
  const initialItem: API.AppItem = {};
  // 保存当前选中的应用数据
  const [nowItem, setNowItem] = useState(initialItem);
  // 标识是否打开新建或编辑弹出框
  const [visible, setVisible] = useState(false);
  // 抽屉组件点击确定时的loading
  const [confirmLoading, setConfirmLoading] = useState(false);
  // 抽屉组件的标题-新建应用/编辑应用
  const [title, setTitle] = useState('新建应用');
  const [activeKey, setActiveKey] = useState('1');
  const [form] = Form.useForm();
  const { setInitialState, initialState } = useModel('@@initialState');

  const getApp = (params?: API.AppItem) => {
    const initialParams: API.AppItem = params ? params : { type: 'App' };
    getApps(initialParams)
      .then((res) => {
        if (res && res.err) {
          notification.error({
            description: res.err,
            message: '',
          });
        } else {
          setAppArray(res.res);
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
    setApps({ ...params, type: 'App' })
      .then((res) => {
        setVisible(false);
        setConfirmLoading(false);
        form.resetFields();
        if (res && res.err) {
          notification.error({
            description: res.err,
            message: '',
          });
        } else {
          message.success('保存成功');
          getApp();
        }
      })
      .catch((err) => {
        setConfirmLoading(false);
        setVisible(false);
        form.resetFields();
        notification.error({
          description: err,
          message: '',
        });
      });
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
          getApp();
        }
      })
      .catch((err) => {
        notification.error({
          description: err,
          message: '',
        });
      });
  };

  /** 点击新建或编辑应用按钮时的操作 **/
  const updateOrAdd = (item?: API.AppItem, flag?: string) => {
    form.resetFields();
    if (item && flag === 'update') {
      form.setFieldsValue(item);
      setNowItem(item);
    } else {
      form.setFieldsValue({ name: '', desc: '' });
    }
    setVisible(true);
  };

  const initialEffect = () => {
    const appId = localStorage.getItem('appId') ? (localStorage.getItem('appId') as string) : '';
    localStorage.setItem('appId', appId);
    getApp();
  };

  useEffect(() => {
    console.log('welcome mount');
    initialEffect();
  }, []);

  const modalOk = () => {
    setConfirmLoading(true);
    form
      .validateFields()
      .then((values) => {
        const params: API.AppItem = {
          id: nowItem?.id,
          ...values,
        };
        if (title === '新建应用') {
          delete params.id;
        }
        setApp(params);
      })
      .catch(() => {
        setConfirmLoading(false);
      });
  };

  /** 进入app逻辑 **/
  const intoApp = (item: any) => {
    history.push({
      pathname: '/componentList',
      query: { id: item.id },
      state: { name: item.name },
    });
    localStorage.setItem('appId', item.id);
    localStorage.setItem('menu_mode', 'element');
    // 刷新左侧菜单，重新设置appId的值
    setInitialState({ ...initialState, appId: item.id });
  };

  const callback = (key: string) => {
    setActiveKey(key);
  };

  const MyTab = () => (
    <Tabs defaultActiveKey="1" activeKey={activeKey} className={styles.tabs} onChange={callback}>
      <TabPane tab="应用管理" key="1"></TabPane>
      <TabPane tab="组件管理" key="2"></TabPane>
    </Tabs>
  );

  // 父子组件通信
  const Manage = forwardRef(ManageList);
  const childRef = useRef();

  return (
    <PageContainer
      fixedHeader
      title={
        <div>
          <div
            className={styles.operate}
            onClick={() => {
              if (activeKey === '1') {
                setTitle('新建应用');
                updateOrAdd();
              } else {
                const current = childRef.current as any;
                const addComponent = current?.addComponent;
                addComponent();
              }
            }}
          >
            <Space>
              <PlusCircleOutlined />
              <div>{activeKey === '1' ? '新建应用' : '新建组件'}</div>
            </Space>
          </div>
          <MyTab />
        </div>
      }
    >
      {activeKey === '1' ? (
        <div>
          <ProCard gutter={[24, 24]} wrap={true} className={styles.card}>
            {appArray &&
              appArray.length > 0 &&
              appArray.map((item: any) => {
                return (
                  <ProCard
                    hoverable
                    key={item.id}
                    title={item.name}
                    colSpan={6}
                    bordered={true}
                    onClick={(e) => {
                      e.stopPropagation();
                      intoApp(item);
                    }}
                    actions={[
                      <EditOutlined
                        key="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTitle('修改应用');
                          updateOrAdd(item, 'update');
                        }}
                      />,
                      <Popconfirm
                        title="确定删除该应用吗?"
                        onConfirm={(e) => {
                          e?.stopPropagation();
                          deleteApp({ id: item.id });
                        }}
                        onCancel={(e) => e?.stopPropagation()}
                        placement="top"
                        okText="确定"
                        cancelText="取消"
                      >
                        <DeleteOutlined onClick={(e) => e.stopPropagation()} />
                      </Popconfirm>,
                      <EllipsisOutlined
                        key="ellipsis"
                        onClick={(e) => {
                          e.stopPropagation();
                          // 跳转到编辑视图页面
                          history.push({
                            pathname: '/customerJs',
                            query: {
                              id: item.id,
                            },
                            state: { name: item.name },
                          });
                        }}
                      />,
                    ]}
                  >
                    <div>{item.desc}</div>
                  </ProCard>
                );
              })}
          </ProCard>
        </div>
      ) : (
        <Manage ref={childRef} />
      )}

      <Modal
        visible={visible}
        title={title}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setConfirmLoading(false);
          setVisible(!visible);
        }}
        onOk={modalOk}
      >
        <Form name="basic" form={form} initialValues={{ ...nowItem }}>
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '应用名称不能为空!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="描述"
            name="desc"
            rules={[{ required: true, message: '应用描述不能为空!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}

export default (): React.ReactNode => {
  return <Welcome />;
};
