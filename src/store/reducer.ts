import { ACTION_TYPE, OPERATE_TAGS, TAGS_INFO_TYPE } from './types';

export const initislState: { tagsInfo: TAGS_INFO_TYPE } = {
  tagsInfo: {
    operate: '',
    params: {},
  },
};

export function countReducer(state = initislState, action: ACTION_TYPE) {
  switch (action.type) {
    case OPERATE_TAGS:
      return { ...state, tagsInfo: action.tagsInfo };
    default:
      return state;
  }
}
