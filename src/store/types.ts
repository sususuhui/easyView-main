export const OPERATE_TAGS = 'OPERATE_TAGS';

export type OPERATE_TAGS_TYPE = typeof OPERATE_TAGS;

type Route = {
  title?: string;
  path?: string;
  closable?: boolean;
  query?: any;
};

export interface TAGS_INFO_TYPE {
  operate: string; // 对标签的动作:打开，关闭:closeSelectedTag，关闭其它:closeOthersTags，关闭全部:closeAllTags，刷新
  params: Route; // 传参
}

export interface TAGS_ACTION_TYPE {
  type: OPERATE_TAGS_TYPE;
  tagsInfo: TAGS_INFO_TYPE;
}

export type ACTION_TYPE = TAGS_ACTION_TYPE;
