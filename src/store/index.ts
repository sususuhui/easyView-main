import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { countReducer, initislState } from './reducer';

const reducers = combineReducers({
  countReducer,
});

export type reducerType = ReturnType<typeof reducers>; // 获取合并后的reducers类型
export default createStore(
  reducers,
  {
    countReducer: initislState,
  },
  applyMiddleware(thunk),
);
