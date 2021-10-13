import { Ref, useEffect, useImperativeHandle, useState } from 'react';
import { Form, Input, message, Modal, notification, Popconfirm, Space, Switch, Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { deleteApps, getApps, setApps } from '@/services/app/api';
import IconSelect from '@/components/IconSelect';
import { iconMap } from '@/global';
import { history } from '@@/core/history';

/**
 * @Description: 组件管理
 * @author suhui.bai@proinnova.com.cn
 * @date 2021/9/24 6:03 下午
 */
interface ComponentItem {
  id: string;
  key?: string;
  name: string; //名称
  type?: string; //组件类型
  desc?: string; //描述
  create_time?: string; //创建时间
  modify_time?: string;
  ud2?: string; // 是否启用
  ud3?: string; // 组件图标
}

export default (props: any, ref: Ref<unknown> | undefined) => {
  const initial: ComponentItem[] = [];
  const [dataArray, setDataArray] = useState(initial);
  // 标识是否打开新建或编辑弹出框
  const [visible, setVisible] = useState(false);
  // 抽屉组件点击确定时的loading
  const [confirmLoading, setConfirmLoading] = useState(false);
  // 抽屉组件的标题-新建应用/编辑应用
  const [title, setTitle] = useState('新建组件');
  // 保存当前选中的应用数据
  const initialItem: API.AppItem = {};
  const [nowItem, setNowItem] = useState(initialItem);
  const [form] = Form.useForm();

  const getApp = (params?: API.AppItem) => {
    const initialParams: API.AppItem = params ? params : { type: 'Component' };
    getApps(initialParams)
      .then((res) => {
        if (res && res.err) {
          notification.error({
            description: res.err,
            message: '',
          });
        } else {
          const newArray: ComponentItem[] = res.res;
          setDataArray(newArray);
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
    setApps({ ...params, type: 'Component' })
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
        setVisible(false);
        setConfirmLoading(false);
        form.resetFields();
        notification.error({
          description: err,
          message: '',
        });
      });
  };

  useEffect(() => {
    getApp();
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
        if (title === '新建组件') {
          delete params.id;
        }
        setApp(params);
      })
      .catch(() => {
        setConfirmLoading(false);
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

  const addComponent = () => {
    setVisible(true);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      desc: '',
      key: '',
      ud2: true,
      ud3: '',
    });
    setTitle('新建组件');
  };

  // 传参给父组件
  useImperativeHandle(ref, () => ({
    addComponent,
  }));

  const columns: ColumnsType<ComponentItem> = [
    {
      title: '组件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => {
        return record.ud3 ? (
          <Space>
            {iconMap[record.ud3]}
            {text}
          </Space>
        ) : (
          <Space style={{ marginLeft: 22 }}>{text}</Space>
        );
      },
    },
    {
      title: '组件类型',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: '组件描述',
      dataIndex: 'desc',
      key: 'desc',
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
    },
    {
      title: '修改时间',
      dataIndex: 'modify_time',
      key: 'modify_time',
    },
    {
      title: '状态',
      key: 'ud2',
      dataIndex: 'ud2',
      render: (text: string) => {
        const flag = text === 'true' || text === undefined ? true : false;
        return <Switch checked={flag} defaultChecked={true} />;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: ComponentItem) => (
        <Space size="middle">
          <a
            onClick={() => {
              setTitle('编辑组件');
              setNowItem(record);
              form.resetFields();
              form.setFieldsValue({
                name: record.name,
                desc: record.desc,
                key: record.key,
                ud2: record.ud2 === 'true' || record.ud2 === undefined ? true : false,
                ud3: record.ud3,
              });
              setVisible(true);
            }}
          >
            编辑
          </a>
          <a
            onClick={() => {
              // 跳转到编辑视图页面
              history.push({
                pathname: '/customerJs',
                query: {
                  id: record.id,
                },
                state: { name: record.name },
              });
            }}
          >
            自定义js
          </a>
          <Popconfirm
            title="确定删除该组件类型吗?"
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

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataArray}
        size="middle"
        rowKey={(record: ComponentItem) => record.id}
      />
      <Modal
        visible={visible}
        title={title}
        okText="确定"
        cancelText="取消"
        confirmLoading={confirmLoading}
        onCancel={() => {
          setConfirmLoading(false);
          setVisible(!visible);
        }}
        onOk={modalOk}
      >
        <Form
          name="basic"
          form={form}
          initialValues={{ ...nowItem }}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 18 }}
        >
          <Form.Item
            label="名称"
            name="name"
            rules={[{ required: true, message: '组件名称不能为空!' }]}
          >
            <Input placeholder="请输入组件名称" />
          </Form.Item>
          <Form.Item
            label="类型"
            name="key"
            rules={[{ required: true, message: '组件类型不能为空!' }]}
          >
            <Input placeholder="请输入组件类型" />
          </Form.Item>
          <Form.Item label="描述" name="desc">
            <Input placeholder="请输入组件描述" />
          </Form.Item>
          <Form.Item name="ud3" label="组件图标">
            <IconSelect />
          </Form.Item>
          <Form.Item label="状态" name="ud2">
            <Switch defaultChecked={true} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
