import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, notification, Tabs } from 'antd';
import styles from '@/pages/Customer/index.less';
import { SaveOutlined, SettingOutlined } from '@ant-design/icons';
import TabPane from '@ant-design/pro-card/lib/components/TabPane';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';
import { PageContainer } from '@ant-design/pro-layout';
import { useDebounceFn } from 'ahooks';
import { getParamSearch } from '@/utils/utils';
import { getApps, setApps } from '@/services/app/api';

interface ComponentItem {
  id?: string;
  key?: number;
  name?: string; //名称
  type?: string; //类型
  desc?: string; //描述
  create_time?: string; //创建时间
  modify_time?: string;
  ud1?: string; // 父级标识
  app?: string;
}

const CustomerJs = () => {
  // js输入内容
  const [jsCode, setJsCode] = useState('');
  // python输入内容
  const [pyCode, setPyCode] = useState('');
  // 标识是否打开新建或编辑弹出框
  const [visible, setVisible] = useState(false);
  // 点击确定时的loading
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [title] = useState('编辑视图');
  const initial: ComponentItem = {};
  const [editorData, setEditorData] = useState(initial);
  const [form] = Form.useForm();
  const id = getParamSearch('id');

  const getApp = () => {
    const initialParams: API.AppItem = { id };
    getApps(initialParams)
      .then((res) => {
        if (res && res.err) {
          notification.error({
            description: res.err,
            message: '',
          });
        } else {
          const data = res.res[0];
          setJsCode(data?.js);
          setPyCode(data?.py);
          setEditorData(data);
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
    setApps({ ...params })
      .then((res) => {
        setVisible(false);
        setConfirmLoading(false);
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
        setVisible(false);
        setConfirmLoading(false);
        notification.error({
          description: err,
          message: '',
        });
      });
  };

  useEffect(() => {
    getApp();
  }, []);

  // 代码输入框的change事件做防抖处理
  const { run: onChangeJs } = useDebounceFn(
    (value: string) => {
      setJsCode(value);
    },
    {
      wait: 500,
    },
  );

  // 代码输入框的change事件做防抖处理
  const { run: onChangePython } = useDebounceFn(
    (value: string) => {
      setPyCode(value);
    },
    {
      wait: 500,
    },
  );

  const myExtra = (
    <div className={styles.extra}>
      <div>
        <Button
          icon={<SaveOutlined />}
          onClick={() => {
            const params = {
              js: jsCode,
              py: pyCode,
              id,
            };
            setApp(params);
          }}
        >
          保存
        </Button>
      </div>
    </div>
  );

  const myTitle = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div>编辑视图</div>
      <SettingOutlined
        style={{
          marginLeft: '8px',
          display: editorData && editorData.type === 'App' ? 'none' : 'inline-block',
        }}
        onClick={() => {
          setVisible(true);
        }}
      />
    </div>
  );

  const modalOk = () => {
    setConfirmLoading(true);
    form
      .validateFields()
      .then((values) => {
        const params: API.AppItem = {
          id: editorData?.id,
          ...values,
        };
        setApp(params);
      })
      .catch(() => {
        setConfirmLoading(false);
      });
  };

  const MyModal = () => {
    return (
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
        <Form
          layout="vertical"
          className={styles.form}
          form={form}
          initialValues={{ ...editorData }}
        >
          <Form.Item
            name="name"
            label="组件名称"
            rules={[{ required: true, message: '组件名称不能为空!' }]}
          >
            <Input placeholder="请输入组件名称" />
          </Form.Item>
          <Form.Item name="key" label="关键key">
            <Input placeholder="请输入关键key" />
          </Form.Item>
          <Form.Item name="desc" label="描述">
            <Input placeholder="请输入组件描述" />
          </Form.Item>
        </Form>
      </Modal>
    );
  };

  return (
    <PageContainer title={myTitle} fixedHeader extra={myExtra} className={styles.container}>
      <Tabs type="card" style={{ padding: '14px', background: '#fff' }}>
        <TabPane tab="自定义js" key="1">
          <div style={{ height: 'calc(100vh - 250px)', border: '1px solid #dedbdb' }}>
            <MonacoEditor
              height="100%"
              width="100%"
              theme="vs-dark"
              language="javascript"
              value={jsCode}
              onChange={onChangeJs}
              options={{ selectOnLineNumbers: true, tabSize: 2 }}
            />
          </div>
        </TabPane>
        <TabPane tab="Python" key="2">
          <div style={{ height: 'calc(100vh - 250px)', border: '1px solid #dedbdb' }}>
            <MonacoEditor
              height="100%"
              width="100%"
              theme="vs-dark"
              language="python"
              value={pyCode}
              onChange={onChangePython}
              options={{ selectOnLineNumbers: true, tabSize: 2 }}
            />
          </div>
        </TabPane>
      </Tabs>
      <MyModal />
    </PageContainer>
  );
};

export default (): React.ReactNode => {
  return (
    // <KeepAlive
    //   id={location.pathname + location.search}
    //   name={location.pathname + location.search}
    //   saveScrollPosition="screen"
    // >
    //   <CustomerJs />
    // </KeepAlive>
    <CustomerJs />
  );
};
