import { request } from 'umi';

/**
 * @Description: 对组件应用表的操作
 * @author suhui.bai@proinnova.com.cn
 * @date 2021/9/20 7:56 下午
 */
/** 查询所有应用/单个应用 {type:'App'}/{id:1}*/
/** 查询指定content-json {id:1,fields:["name","content"]}*/
export async function getApps(body: API.AppItem, options?: { [key: string]: any }) {
  return request('/api/Get', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function setApps(body: API.AppItem, options?: { [key: string]: any }) {
  return request('/api/Set', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function deleteApps(body: API.AppItem, options?: { [key: string]: any }) {
  return request('/api/Delete', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 查询content-json中某个值 {"id": 5,"exp": "$.cc"}*/
export async function getContents(body: API.AppItem, options?: { [key: string]: any }) {
  return request('/api/Content/Get', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function setContents(body: API.AppItem, options?: { [key: string]: any }) {
  return request('/api/Content/Set', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

export async function deleteContents(body: API.AppItem, options?: { [key: string]: any }) {
  return request('/api/Content/Delete', {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}
