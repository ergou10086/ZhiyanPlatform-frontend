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
              <li><a :href="docsBaseUrl + 'API.html'" class="footer-link">API文档</a></li>
              <li><a href="#" class="footer-link">使用指南</a></li>
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
              <li><a href="#" class="footer-link">贡献指南</a></li>
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
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              京ICP备12345678号-1
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { DOCS_BASE_URL } from '@/config'

export default {
  name: 'Footer',
  computed: {
    docsBaseUrl() {
      // 使用配置的文档基础 URL，默认为 '/docs/'
      return DOCS_BASE_URL || '/docs/'
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
