import { ACTION_TYPE, OPERATE_TAGS, TAGS_INFO_TYPE } from './types';

const operateTags = (tagsInfo: TAGS_INFO_TYPE): ACTION_TYPE => ({
  type: OPERATE_TAGS,
  tagsInfo,
});

export { operateTags };
