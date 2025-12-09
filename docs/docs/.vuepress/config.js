import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { webpackBundler } from '@vuepress/bundler-webpack'

export default defineUserConfig({
  lang: 'en-US',

  title: 'ZhiyanPlatform Doc',
  description: '智研项目平台的使用帮助文档',

  // 添加端口配置
  port: 8002,
  host: '0.0.0.0',

  theme: defaultTheme({
    logo: 'D:\\WorkSpace\\JavaDemo\\Programe\\ZhiyanPlatform\\zhiyan_front\\src\\assets\\image\\logo.svg',
    navbar: ['/', '/get-started']
  }),

  bundler: webpackBundler(),
})
