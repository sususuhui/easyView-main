# Ant Design Pro

This project is initialized with [Ant Design Pro](https://pro.ant.design). Follow is the quick guide for how to use.

## Environment Prepare

Install `node_modules`:

```bash
npm install
```

or

```bash
yarn
```

## Provided Scripts

Ant Design Pro provides some useful script to help you quick start and build with web project, code style check and test.

Scripts provided in `package.json`. It's safe to modify or add additional script:

### Start project

```bash
npm start
```

### Build project

```bash
npm run build
```

### Check code style

```bash
npm run lint
```

You can also use script to auto fix some lint error:

```bash
npm run lint:fix
```

### Test code

```bash
npm test
```

## More

You can view full document on our [official website](https://pro.ant.design). And welcome any feedback in our [github](https://github.com/ant-design/ant-design-pro).


Vue的keep-alive原理
## 同react 的keep-alive相似，无法实现iframe缓存
要实现对保持iframe页的状态。我们先搞清楚为什么Vue的keep-alive不能凑效。keep-alive原理是把组件里的节点信息保留在了 VNode （在内存里），在需要渲染时候从Vnode渲染到真实DOM上。iframe页里的内容并不属于节点的信息，所以使用keep-alive依然会重新渲染iframe内的内容。 另外 ，我也尝试有过想法：如果把整个iframe节点保存起来，然后需要切换时把它渲染到目标节点上，能否实现iframe页不被刷新呢？————也是不可行的，iframe每一次渲染就相当于打开一个新的网页窗口，即使把节点保存下来，在渲染时iframe页还是刷新的。

