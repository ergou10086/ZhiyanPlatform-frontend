import path from 'path';

import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { webpackBundler } from '@vuepress/bundler-webpack'

export default defineUserConfig({
  lang: 'zh-CN',

  title: '智研平台帮助文档',
  description: '智研平台——高校科研团队协作与成果管理平台 - 帮助文档',

  // 设置 base 路径，使文档可以通过 /docs/ 访问
  base: '/docs/',

  // 设置构建输出目录到主项目的 public/docs
  dest: path.resolve(__dirname, '../../../public/docs'),

  // 添加端口配置
  port: 8012,
  host: '0.0.0.0',

  theme: defaultTheme({
    logo: 'logo.svg',
    navbar: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/get-started.html' },
      { text: '演示视频', link: '/videos/' }
    ],
    sidebar: {
      '/': [
        {
          text: '指南',
          children: [
            '/get-started.md'
          ]
        }
      ],
      '/videos/': [
        {
          text: '演示视频',
          children: [
            '/videos/introduction.md'
          ]
        }
      ]
    }
  }),

  bundler: webpackBundler(),
})
