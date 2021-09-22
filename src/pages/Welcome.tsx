import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Button, Form, Input, Modal, notification, Popconfirm, Tabs } from 'antd';
import {
  DeleteOutlined,
  DesktopOutlined,
  EditOutlined,
  EllipsisOutlined,
  PlusCircleOutlined,
  SaveOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import styles from './Welcome.less';
import { deleteApps, getApps, setApps } from '../services/app/api';
import TabPane from '@ant-design/pro-card/lib/components/TabPane';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';

export default (): React.ReactNode => {
  const [appArray, setAppArray] = useState([]);
  const initialItem: API.AppItem = {};
  const [nowItem, setNowItem] = useState(initialItem);
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [title, setTitle] = useState('新建应用');
  const [componentVisible, setComponentVisible] = useState(false);
  const [form] = Form.useForm();

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
    if (title === '新建应用') {
      delete params.id;
    }
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

  useEffect(() => {
    getApp();
  }, []);

  const ComponentEditor = () => {
    return (
      <Modal
        title={
          <div className={styles.title}>
            <div style={{ color: '#999', fontSize: '14px' }}>
              {nowItem.type}-{nowItem.name}
            </div>
            <div className={styles.btn}>
              <div>
                <Button icon={<SyncOutlined />}>刷新</Button>
              </div>
              <div>
                <Button icon={<DesktopOutlined />}>预览</Button>
              </div>
              <div>
                <Button icon={<SaveOutlined />}>保存</Button>
              </div>
            </div>
          </div>
        }
        visible={componentVisible}
        className={styles.myModal}
        onCancel={() => {
          setComponentVisible(false);
        }}
        footer={null}
      >
        <Tabs type="card">
          <TabPane tab="自定义js" key="1">
            <div style={{ height: 'calc(100vh - 150px)', border: '1px solid #dedbdb' }}>
              <div style={{ height: '100%', width: '100%' }}>
                <MonacoEditor
                  language="javascript"
                  value={'<div>324234</div>'}
                  options={{ selectOnLineNumbers: true, tabSize: 2 }}
                />
              </div>
            </div>
          </TabPane>
          <TabPane tab="Python" key="2">
            <div style={{ height: 'calc(100vh - 150px)', border: '1px solid #dedbdb' }}>
              <div style={{ height: '100%', width: '100%' }}>
                <MonacoEditor
                  language="python"
                  value={'<div>324234</div>'}
                  options={{ selectOnLineNumbers: true, tabSize: 2 }}
                />
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    );
  };

  const extraContent = [
    <Button key="2">
      <SettingOutlined />
      组件管理
    </Button>,
    <Button
      key="1"
      type="primary"
      onClick={() => {
        setTitle('新建应用');
        updateOrAdd();
      }}
    >
      <PlusCircleOutlined />
      新建应用
    </Button>,
  ];
  return (
    <PageContainer extra={extraContent}>
      <ProCard gutter={[24, 24]} wrap={true} className={styles.card}>
        {appArray &&
          appArray.length > 0 &&
          appArray.map((item: any) => {
            return (
              <ProCard
                key={item.id}
                title={item.name}
                colSpan={8}
                bordered={true}
                actions={[
                  <EditOutlined
                    key="edit"
                    onClick={() => {
                      setTitle('修改应用');
                      updateOrAdd(item, 'update');
                    }}
                  />,
                  <Popconfirm
                    title="确定删除该应用吗?"
                    onConfirm={() => deleteApp({ id: item.id })}
                    placement="top"
                    okText="确定"
                    cancelText="取消"
                  >
                    <DeleteOutlined />
                  </Popconfirm>,
                  <EllipsisOutlined
                    key="ellipsis"
                    onClick={() => {
                      setNowItem(item);
                      setComponentVisible(true);
                    }}
                  />,
                ]}
              >
                <div>{item.desc}</div>
              </ProCard>
            );
          })}
      </ProCard>
      <Modal
        visible={visible}
        title={title}
        confirmLoading={confirmLoading}
        onCancel={() => {
          form.resetFields();
          setVisible(!visible);
        }}
        onOk={() => {
          setConfirmLoading(true);
          form
            .validateFields()
            .then((values) => {
              const params: API.AppItem = {
                id: nowItem?.id,
                ...values,
              };
              setApp(params);
            })
            .catch(() => {
              setConfirmLoading(false);
            });
        }}
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
      <ComponentEditor />
    </PageContainer>
  );
};
