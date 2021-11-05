/* eslint-disable import/no-extraneous-dependencies */
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

/**
 * 自定义 webpack 配置
 * @param config
 */
const chainWebpackConfig = (config: any) => {
  const isDev = process.env.NODE_ENV === 'production';

  /**
   * 模块目录归类
   *
   * 目前 dist 目录不允许资源平铺模式，因此将路由生成的 js 、css 文件纳入到各自的文件夹中
   */
  const hash = isDev ? '.[contenthash:8]' : '';
  config.output.chunkFilename(`js/[name]${hash}.async.js`);

  // 编辑器插件
  config.plugin('monaco-editor').use(MonacoWebpackPlugin, [{ languages: ['json'] }]);

  // config.module.set('unknownContextCritical', false).set('exprContextCritical', false);

  // config.optimization.splitChunks({
  //   chunks: 'all',
  //   name: 'vendors',
  //   cacheGroups: {
  //     monaco: {
  //       name: 'monaco',
  //       test: /[\\/]node_modules[\\/](monaco-editor)/,
  //       enforce: true,
  //       chunks: 'all',
  //       priority: 1,
  //     },
  //   },
  // });
};

export default chainWebpackConfig;
