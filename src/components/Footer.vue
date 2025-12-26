<template>
  <footer class="zhiyan-footer">
    <div class="footer-container">
      <!-- 主要内容区域 -->
      <div class="footer-main">
        <!-- Logo 和简介 -->
        <div class="footer-brand">
          <div class="footer-logo">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="logo-text">智研平台</span>
          </div>
          <p class="footer-description">高校科研团队协作与成果管理平台</p>
        </div>

        <!-- 导航链接区域 -->
        <div class="footer-links-group">
          <!-- 快速导航 -->
          <div class="footer-section">
            <h3 class="section-title">快速导航</h3>
            <ul class="link-list">
              <li><a href="/" class="footer-link">首页</a></li>
              <li><a href="/project-square" class="footer-link">项目广场</a></li>
              <li><a href="/my-activity" class="footer-link">我的活动</a></li>
              <li><a href="/ai-assistant" class="footer-link">AI助手</a></li>
            </ul>
          </div>

          <!-- 文档资源 -->
          <div class="footer-section">
            <h3 class="section-title">文档资源</h3>
            <ul class="link-list">
              <li><a :href="docsBaseUrl" class="footer-link">帮助文档</a></li>
              <li><a :href="docsBaseUrl + 'get-started.html'" class="footer-link">快速开始</a></li>
              <li><a :href="apiDocsUrl" target="_blank" rel="noopener" class="footer-link">API文档</a></li>
            </ul>
          </div>

          <!-- 开源仓库 -->
          <div class="footer-section">
            <h3 class="section-title">开源仓库</h3>
            <ul class="link-list">
              <li>
                <a href="https://github.com/ergou10086/ZhiyanPlatform-frontend" target="_blank" class="footer-link icon-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  前端仓库
                </a>
              </li>
              <li>
                <a href="https://github.com/ergou10086/ZhiyanPlatform_NewBackend" target="_blank" class="footer-link icon-link">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  后端仓库
                </a>
              </li>
              <li><a href="https://github.com/ergou10086/ZhiyanPlatform-frontend/issues" class="footer-link">问题反馈</a></li>
            </ul>
          </div>

          <!-- 联系我们 -->
          <div class="footer-section">
            <h3 class="section-title">联系我们</h3>
            <ul class="link-list">
              <li class="contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <path d="M22 6l-10 7L2 6"/>
                </svg>
                <span>zhiyan163verif@163.com</span>
              </li>
              <li class="contact-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
                <span>15230810472</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 底部版权信息 -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>© 2024-present 智研平台 | Copyright © Zhiyan Platform</p>
            <p class="license-info">
              <a href="https://www.eclipse.org/legal/epl-2.0/" target="_blank" class="license-link">EPL-2.0 License</a>
            </p>
          </div>
          <div class="footer-bottom-links">
            <a href="#" class="bottom-link">隐私政策</a>
            <span class="separator">|</span>
            <a href="#" class="bottom-link">服务条款</a>
            <span class="separator">|</span>
            <a href="#" class="bottom-link filing-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 4px;">
                <path d="M923.05 338.33a447.29 447.29 0 0 0-217.71-228.5q-9.71-4.66-19.67-8.88a447.5 447.5 0 0 0-347.32 0q-20.28 8.58-39.5 19a442.63 442.63 0 0 0-79.41 55.21q-11.77 10.23-22.89 21.36a445.77 445.77 0 0 0 0 630.92q11.21 11.2 23.08 21.53a443 443 0 0 0 99.47 65.38q9.5 4.56 19.24 8.68a447.38 447.38 0 0 0 340 3c2.42-1 4.85-2 7.26-3a446.56 446.56 0 0 0 237.45-584.7zM662.29 156.2a384.42 384.42 0 0 1 68.13 37.3c-6.26 21.25-21.83 41.52-45.53 59.08q-7.41-21.11-16.08-40.38c-11.88-26.38-25.18-49.2-39.64-68.2q16.77 5.29 33.12 12.2z m2.28 325.8H542V362.52c37.29-3 73-10.74 105.29-22.73 9.71 44.02 15.6 92.11 17.28 142.21z m-305.15 60H482v108.11c-38.13 2.1-74.79 9.11-108.14 20.55A799.3 799.3 0 0 1 359.42 542z m16.5-198.58c32.79 11 68.73 17.8 106.08 19.85V482H359.42c1.64-48.72 7.26-95.55 16.5-138.58zM542 542h122.57a795.74 795.74 0 0 1-15.19 132.37c-32.87-12.43-69.28-20.44-107.38-23.51z m0-398.2c25.91 14.3 51.14 46.5 72.1 93a460.89 460.89 0 0 1 17.33 44.82c-27 10.65-57.37 17.67-89.43 20.65z m-60 0v159.38c-32.26-2-63-8.12-90.64-17.85a468.59 468.59 0 0 1 18.53-48.49c20.96-46.54 46.19-78.74 72.11-93.04z m-120.29 12.4q16.29-6.91 33.12-12.2c-14.46 19.05-27.77 41.87-39.64 68.25-6.63 14.72-12.71 30.3-18.23 46.62-26.18-17.24-44-37.52-52.3-59a383.92 383.92 0 0 1 77.05-43.67zM156.2 361.71a384.64 384.64 0 0 1 81.38-121.35q3.27 5.85 7.12 11.58c15.3 22.75 36.84 43 64 60.05q5.53 3.48 11.3 6.74c-11.76 50.5-18.8 105.82-20.62 163.27H127a382.41 382.41 0 0 1 29.2-120.29z m0 300.58A382.54 382.54 0 0 1 127 542h172.4c1.71 53.91 8 105.94 18.5 153.87-3.12 1.79-6.17 3.63-9.18 5.52-27.18 17.1-48.72 37.3-64 60.05A160.93 160.93 0 0 0 234 779.92a384.53 384.53 0 0 1-77.8-117.63z m205.51 205.5a384.1 384.1 0 0 1-79.82-45.65c6.25-23.84 24.21-46.54 52.21-65.65a526.35 526.35 0 0 0 21.09 55.3c11.87 26.38 25.18 49.2 39.64 68.25q-16.83-5.34-33.12-12.25zM482 880.19c-25.92-14.3-51.15-46.49-72.11-93a478 478 0 0 1-21.51-58c28.42-10.34 60.2-16.79 93.62-18.91z m60 0V711.07c33.26 3.09 64.66 10.53 92.45 21.85a473.57 473.57 0 0 1-20.35 54.24c-20.96 46.54-46.19 78.73-72.1 93.03z m120.29-12.4Q646 874.71 629.17 880c14.46-19 27.76-41.87 39.64-68.25a513.8 513.8 0 0 0 19-48.82c25.36 19.59 40.81 42.38 44.76 66.06a383.56 383.56 0 0 1-70.28 38.8z m205.5-205.5A384.82 384.82 0 0 1 785 785q-1.28 1.28-2.55 2.52a157.18 157.18 0 0 0-14.26-26.11c-15.19-22.59-36.52-42.66-63.43-59.68 11.27-49.55 18-103.64 19.81-159.76H897a382.26 382.26 0 0 1-29.21 120.32zM724.6 482c-1.89-59.64-9.41-117-22-169l1.59-1c27.18-17.09 48.71-37.3 64-60.05a159.1 159.1 0 0 0 10.89-18.77c2 1.91 4 3.84 5.92 5.79A384.76 384.76 0 0 1 897 482z" fill="#211B13" p-id="8967"></path>
              </svg>
              <a href="https://beian.miit.gov.cn/" target="_blank"> 辽ICP备2025070128号-1 </a>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { DOCS_BASE_URL, API_BASE_URL } from '@/config'

export default {
  name: 'Footer',
  computed: {
    docsBaseUrl() {
      // 使用配置的文档基础 URL，默认为 '/docs/'
      return DOCS_BASE_URL || '/docs/'
    },
    apiDocsUrl() {
      // 后端 Swagger UI 地址（线上线下统一指向 /swagger-ui/index.html）
      const base = API_BASE_URL || ''
      return `${base}/swagger-ui/index.html`
    },
    usageGuideUrl() {
      // 使用指南直达帮助文档的视频段落
      return `${this.docsBaseUrl}docs/introduction.html#平台介绍视频`
    }
  }
}
</script>

<style scoped>
/* ==================== 基础样式 ==================== */
.zhiyan-footer {
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-top: 1px solid var(--border-primary);
  margin-top: auto;
  position: relative;
  z-index: 10;
  transition: all var(--transition-normal);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0;
}

/* ==================== 主要内容区域 ==================== */
.footer-main {
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  gap: 3rem;
  padding: 3rem 2rem 2rem;
  border-bottom: 1px solid var(--border-primary);
}

/* ==================== Logo 和品牌区域 ==================== */
.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--primary-color, #2573F5);
}

.footer-logo svg {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.footer-logo:hover svg {
  transform: translateY(-2px);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color, #2573F5), var(--primary-dark, #0C2D67));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0;
  opacity: 0.85;
}

/* ==================== 导航链接区域 ==================== */
.footer-links-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: var(--text-secondary);
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.25rem 0;
  display: inline-block;
  position: relative;
}

.footer-link::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color, #2573F5);
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: var(--primary-color, #2573F5);
  transform: translateX(4px);
}

.footer-link:hover::before {
  width: 100%;
}

.icon-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-link svg {
  flex-shrink: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.contact-item svg {
  flex-shrink: 0;
  color: var(--primary-color, #2573F5);
}

/* ==================== 底部版权区域 ==================== */
.footer-bottom {
  background: var(--bg-secondary);
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.copyright {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.copyright p {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  margin: 0;
}

.license-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.license-link {
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.license-link:hover {
  color: var(--primary-color, #2573F5);
}

.footer-bottom-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.bottom-link {
  color: var(--text-tertiary);
  font-size: 0.8rem;
  text-decoration: none;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
}

.bottom-link:hover {
  color: var(--primary-color, #2573F5);
}

.filing-link {
  display: flex;
  align-items: center;
}

.separator {
  color: var(--text-disabled);
  font-size: 0.75rem;
}

/* ==================== 暗色主题适配 ==================== */
html.dark-mode .zhiyan-footer {
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-top-color: var(--border-primary);
}

html.dark-mode .footer-main {
  border-bottom-color: var(--border-primary);
}

html.dark-mode .footer-logo {
  color: #3b82f6;
}

html.dark-mode .logo-text {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

html.dark-mode .footer-description {
  color: var(--text-tertiary);
}

html.dark-mode .section-title {
  color: var(--text-primary);
}

html.dark-mode .footer-link {
  color: var(--text-secondary);
}

html.dark-mode .footer-link:hover {
  color: var(--primary-color);
}

html.dark-mode .footer-link::before {
  background: var(--primary-color);
}

html.dark-mode .contact-item {
  color: var(--text-secondary);
}

html.dark-mode .contact-item svg {
  color: var(--primary-color);
}

html.dark-mode .footer-bottom {
  background: var(--bg-secondary);
}

html.dark-mode .copyright p,
html.dark-mode .license-link,
html.dark-mode .bottom-link {
  color: var(--text-tertiary);
}

html.dark-mode .license-link:hover,
html.dark-mode .bottom-link:hover {
  color: var(--primary-color);
}

html.dark-mode .separator {
  color: var(--text-disabled);
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 1200px) {
  .footer-links-group {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .footer-main {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 2rem 1.5rem 1.5rem;
  }

  .footer-links-group {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .footer-bottom-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.25rem 1.5rem;
    gap: 0.75rem;
  }

  .footer-bottom-links {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .separator {
    display: none;
  }

  .logo-text {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .footer-logo svg {
    width: 28px;
    height: 28px;
  }

  .logo-text {
    font-size: 1.125rem;
  }

  .section-title {
    font-size: 0.85rem;
  }

  .footer-link,
  .contact-item {
    font-size: 0.8125rem;
  }

  .copyright p,
  .bottom-link {
    font-size: 0.75rem;
  }
}
</style>
