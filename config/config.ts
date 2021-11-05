// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
import routes from './routes';
import chainWebpackConfig from './chainWebpackConfig';

const { REACT_APP_ENV, PUBLIC_PATH } = process.env;
// const PUBLIC_PATH = '/documents/';

export default defineConfig({
  define: {
    PUBLIC_PATH: process.env.PUBLIC_PATH
      ? process.env.PUBLIC_PATH.substring(0, process.env.PUBLIC_PATH.length - 1)
      : '',
  },
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    locale: true,
    siderWidth: 208,
    ...defaultSettings,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@ant-design/pro-layout/es/PageLoading',
  },
  targets: {
    ie: 11,
  },
  history: { type: 'browser' },
  base: PUBLIC_PATH ? PUBLIC_PATH : undefined,
  publicPath: PUBLIC_PATH ? PUBLIC_PATH : undefined,
  outputPath: 'documents',
  // umi routes: https://umijs.org/docs/routing
  routes,
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': defaultSettings.primaryColor,
  },
  // esbuild is father build tools
  // https://umijs.org/plugins/plugin-esbuild
  esbuild: {},
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
  qiankun: {
    master: {},
  },
  // chunks: ['vendors', 'umi', 'monaco'],
  chainWebpack: chainWebpackConfig,
});
