import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { webpackBundler } from '@vuepress/bundler-webpack'

export default defineUserConfig({
  lang: 'zh-CN',

  title: '智研平台帮助文档',
  description: '高校科研团队协作与成果管理平台 - 帮助文档',

  // 添加端口配置
  port: 8002,
  host: '0.0.0.0',

  theme: defaultTheme({
    logo: '/logo.svg',
    navbar: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/get-started.html' }
    ],
    sidebar: {
      '/': [
        {
          text: '指南',
          children: [
            '/get-started.md'
          ]
        }
      ]
    }
  }),

  bundler: webpackBundler(),
})
