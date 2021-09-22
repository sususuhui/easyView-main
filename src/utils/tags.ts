import { operateTags } from '@/store/action';
import store from '@/store/index';
import { history } from 'umi';
import { message } from 'antd';

/**
 * @Description: 多标签页工具类
 * @author suhui.bai@proinnova.com.cn
 * @date 2021/9/19 4:42 下午
 */
interface ITagParams {
  operate: string;
  params: {
    path: string;
    query: any;
  };
}

export default {
  data: {},
  method: {
    // 打开指定标签页：openTag关闭指定标签页:closeSelectedTag;
    // 关闭其它标签closeOthersTags;关闭全部：closeAllTags
    dealTags: (tagParams: ITagParams) => {
      const { params, operate } = tagParams;
      if (!operate) {
        message.warning('传入的参数有误');
        return;
      }
      if (operate === 'openTag') {
        // 打开指定标签页
        history.push({
          pathname: params.path,
          query: params.query,
        });
      } else {
        const action = operateTags(tagParams);
        store.dispatch(action);
      }
    },
  },
};
