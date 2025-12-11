<template>
  <div class="profile-container">
    <!-- 侧边栏 -->
    <Sidebar :isOpen="sidebarOpen" @close="closeSidebar" />
    
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <button class="menu-btn" @click="toggleSidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="back-btn" @click="goToHome" title="返回首页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">{{ profileTitle }}</span>
      </div>
     </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 数据加载完成后再显示主体内容，避免先渲染自己的信息再切换到他人 -->
      <div v-if="!isProfileLoading" class="profile-content">
        <!-- 个人信息标题 -->
        <h1 class="profile-title">{{ profileTitle }}</h1>
        
        <!-- 两栏布局容器 -->
        <div class="profile-grid">
          <!-- 左侧栏：基础信息 -->
          <div class="profile-left-column">
            <!-- 头像和昵称卡片 -->
            <div class="info-card">
          <div class="avatar-section">
            <div class="avatar-container" @click="isViewingSelf && triggerAvatarUpload()">
              <img v-if="userInfo.avatar" :src="avatarUrlWithTimestamp" alt="用户头像" class="avatar-image" />
            <div v-else class="avatar-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
              <div v-if="isViewingSelf" class="camera-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 4H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="13" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
          </div>
            </div>
            <div class="nickname-section">
              <div v-if="editingNickname" class="nickname-edit">
                <input 
                  v-model="tempNickname" 
                  @keyup.enter="saveNickname"
                  @keyup.escape="cancelEditNickname"
                  class="nickname-input"
                  ref="nicknameInput"
                  placeholder="请输入昵称"
                />
                <div class="nickname-actions">
                  <button @click="saveNickname" class="save-btn-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
                  </button>
                  <button @click="cancelEditNickname" class="cancel-btn-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div v-else class="nickname-display-container">
                <div class="nickname-info">
                  <span class="nickname-display">{{ userInfo.nickname }}</span>
                  <span v-if="userInfo.id" class="user-id-display">ID: {{ userInfo.id }}</span>
                </div>
                <button v-if="isViewingSelf" @click="editNickname" class="edit-nickname-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 邮箱地址卡片 -->
        <div class="info-card">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">邮箱地址</h3>
              <button
                v-if="isLoggedIn && isViewingSelf"
                @click="goToChangeEmail"
                class="edit-btn"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                修改邮箱
              </button>
            </div>
            <p class="info-value">
              <span v-if="userInfo.email">
                {{ maskEmail(userInfo.email) }}
              </span>
              <span v-else>
                未设置邮箱
              </span>
            </p>
          </div>
        </div>

        <!-- 关联链接卡片 -->
        <div class="info-card">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">关联链接</h3>
              <button
                v-if="isLoggedIn && isViewingSelf"
                @click="saveProfileLinks()"
                class="edit-btn"
                :disabled="isSavingLinks"
              >
                {{ isSavingLinks ? '保存中...' : '保存' }}
              </button>
              <button
                v-if="isLoggedIn && isViewingSelf && canAddMoreLinks && !showAddLinkRow"
                @click="showAddLinkRow = true"
                class="edit-btn"
              >
                添加
              </button>
            </div>
            <div class="links-container">
              <div v-if="profileLinks.length === 0" class="link-empty">
                <p>还没有添加任何关联链接</p>
              </div>
              <div v-else class="link-list">
                <div v-for="(link, index) in profileLinks" :key="index" class="link-item">
                  <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link-text">
                    {{ link.label || link.url }}
                  </a>
                  <span class="link-url">{{ link.url }}</span>
                  <button
                    v-if="isLoggedIn && isViewingSelf"
                    class="link-remove-btn"
                    @click="removeProfileLink(index)"
                    :disabled="isSavingLinks"
                    title="移除链接"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div
              v-if="isLoggedIn && isViewingSelf && canAddMoreLinks && showAddLinkRow"
              class="link-add-row"
            >
              <input
                v-model="newProfileLink.label"
                class="link-input"
                placeholder="链接名称（可选）"
                maxlength="50"
              />
              <input
                v-model="newProfileLink.url"
                class="link-input"
                placeholder="https://example.com"
                maxlength="500"
              />
              <button @click="addProfileLink" class="add-link-btn" :disabled="isSavingLinks">
                添加
              </button>
            </div>
          </div>
        </div>

        <!-- 机构信息卡片 -->
        <div class="info-card">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">所属机构</h3>
              <button v-if="!editingOrganization && isLoggedIn && isViewingSelf" @click="editOrganization" class="edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                编辑
              </button>
            </div>
            <div v-if="editingOrganization" class="intro-edit">
              <div class="organization-edit-container">
                <input 
                  v-model="tempOrganization" 
                  @keyup.enter="saveOrganization"
                  @blur="cancelEditOrganization" 
                  class="intro-textarea organization-input"
                  ref="organizationInput"
                  placeholder="请输入所属机构"
                />
                <div class="organization-actions">
                  <button @mousedown.prevent @click="saveOrganization" class="save-btn-small" title="确认保存">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <button @mousedown.prevent @click="cancelEditOrganization" class="cancel-btn-small" title="取消">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <p v-else class="info-value">{{ userInfo.organization || '未设置机构' }}</p>
          </div>
        </div>

        <!-- OAuth2账号绑定卡片 -->
        <div class="info-card" v-if="isLoggedIn && isViewingSelf">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">第三方账号绑定</h3>
            </div>
            <div class="oauth2-bindings">
              <!-- GitHub绑定 -->
              <div class="oauth2-binding-item">
                <div class="oauth2-binding-info">
                  <svg class="oauth2-icon github-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <div class="oauth2-binding-text">
                    <span class="oauth2-binding-label">GitHub</span>
                    <span v-if="userInfo.githubId" class="oauth2-binding-status">
                      <span class="status-badge bound">已绑定</span>
                      <span class="binding-username">@{{ maskAccount(userInfo.githubUsername || userInfo.githubId, 'github') }}</span>
                    </span>
                    <span v-else class="oauth2-binding-status">
                      <span class="status-badge unbound">未绑定</span>
                    </span>
                  </div>
                </div>
                <button 
                  v-if="!userInfo.githubId" 
                  @click="handleGithubBind" 
                  class="oauth2-bind-btn github-bind-btn"
                >
                  绑定
                </button>
                <button 
                  v-else
                  @click="handleGithubBind" 
                  class="oauth2-bind-btn oauth2-unbind-btn"
                  title="解绑GitHub账号"
                >
                  解绑
                </button>
              </div>

              <!-- ORCID绑定 -->
              <div class="oauth2-binding-item">
                <div class="oauth2-binding-info">
                  <svg class="oauth2-icon orcid-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm-2.5 17.5c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5 2.5 1 2.5 2.5-1 2.5-2.5 2.5zm5 0c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5 2.5 1 2.5 2.5-1 2.5-2.5 2.5z"/>
                  </svg>
                  <div class="oauth2-binding-text">
                    <span class="oauth2-binding-label">ORCID</span>
                    <span v-if="userInfo.orcidId" class="oauth2-binding-status">
                      <span class="status-badge bound">已绑定</span>
                      <span class="binding-username">{{ maskAccount(userInfo.orcidId, 'orcid') }}</span>
                    </span>
                    <span v-else class="oauth2-binding-status">
                      <span class="status-badge unbound">未绑定</span>
                    </span>
                  </div>
                </div>
                <button 
                  v-if="!userInfo.orcidId" 
                  @click="handleOrcidBind" 
                  class="oauth2-bind-btn orcid-bind-btn"
                >
                  绑定
                </button>
                <button 
                  v-else
                  @click="handleOrcidBind" 
                  class="oauth2-bind-btn oauth2-unbind-btn"
                  title="解绑ORCID账号"
                >
                  解绑
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 个人简介卡片 -->
        <div class="info-card">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">个人简介</h3>
              <button v-if="!editingIntro && isLoggedIn && isViewingSelf" @click="editIntro" class="edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M18.5 2.5C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10218 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
                编辑
              </button>
          </div>
            <div v-if="editingIntro" class="intro-edit">
              <textarea 
                v-model="tempIntro" 
                @blur="saveIntro" 
                class="intro-textarea"
                placeholder="请输入个人简介..."
                ref="introTextarea"
              ></textarea>
              <div class="intro-actions">
                <button @click="saveIntro" class="save-btn">保存</button>
                <button @click="cancelEditIntro" class="cancel-btn">取消</button>
              </div>
            </div>
            <p v-else class="info-value intro-content">{{ displayIntroduction }}</p>
          </div>
        </div>
          </div>
          <!-- 左侧栏结束 -->
          
          <!-- 右侧栏：扩展信息 -->
          <div class="profile-right-column">
        <!-- 研究方向标签卡片 -->
        <div class="info-card" v-if="isLoggedIn">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">研究方向</h3>
              <button v-if="isViewingSelf" @click="showTagModal = true" class="edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                管理标签
              </button>
            </div>
            <div class="research-tags-container">
              <div v-if="researchTags.length === 0" class="empty-tags">
                <p>还未添加研究方向标签，点击"管理标签"开始添加</p>
              </div>
              <div v-else class="tags-list">
                <div v-for="(tag, index) in researchTags" :key="index" class="research-tag">
                  <span class="tag-hierarchy" v-if="tag.path">{{ tag.path }}</span>
                  <span class="tag-name">{{ tag.name || tag }}</span>
                  <button v-if="isViewingSelf" @click="removeTag(index)" class="tag-remove-btn" title="移除标签">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 学术成果关联卡片 -->
        <div class="info-card" v-if="isLoggedIn">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">学术成果</h3>
              <button v-if="isViewingSelf" @click="showAchievementModal = true" class="edit-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                关联成果
              </button>
            </div>
            <div class="achievements-container">
              <div v-if="linkedAchievements.length === 0" class="empty-achievements">
                <p>还未关联学术成果，点击"关联成果"开始添加</p>
              </div>
              <div v-else>
                <div class="achievements-list">
                  <div v-for="achievement in visibleLinkedAchievements" :key="achievement.achievementId || achievement.id" class="achievement-item">
                  <div class="achievement-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <div class="achievement-info">
                    <h4 class="achievement-title">{{ achievement.title }}</h4>
                    <p class="achievement-meta">{{ achievement.type }} · {{ achievement.date }}</p>
                  </div>
                  <button v-if="isViewingSelf" @click="unlinkAchievement(achievement.achievementId || achievement.id)" class="achievement-remove-btn" title="取消关联">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </button>
                  </div>
                </div>
                <div v-if="linkedAchievements.length > 6" class="achievements-more-wrapper">
                  <button class="achievements-more-btn" @click="showLinkedAchievementsModal = true">
                    查看更多成果
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 隐私设置卡片 -->
        <div class="info-card privacy-card" v-if="isLoggedIn">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">隐私设置</h3>
            </div>
            
            <div class="privacy-settings-list">
              <div class="privacy-row">
                <label class="privacy-row-label">个人主页可见范围</label>
                <select v-model="privacySettings.profileVisibility" @change="savePrivacySettings" class="privacy-row-select">
                  <option value="public">公开</option>
                  <option value="project_members">仅项目成员</option>
                  <option value="team">仅团队</option>
                  <option value="private">私密</option>
                </select>
              </div>
              <div class="privacy-row">
                <label class="privacy-row-label">研究方向可见范围</label>
                <select v-model="privacySettings.tagsVisibility" @change="savePrivacySettings" class="privacy-row-select">
                  <option value="public">公开</option>
                  <option value="project_members">仅项目成员</option>
                  <option value="private">私密</option>
                </select>
              </div>
              <div class="privacy-row">
                <label class="privacy-row-label">学术成果可见范围</label>
                <select v-model="privacySettings.achievementsVisibility" @change="savePrivacySettings" class="privacy-row-select">
                  <option value="public">公开</option>
                  <option value="project_members">仅项目成员</option>
                  <option value="private">私密</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 2FA双因素认证设置卡片 -->
        <div class="info-card two-factor-card" v-if="isLoggedIn && isViewingSelf">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">双因素认证 (2FA)</h3>
            </div>
            
            <div class="two-factor-content">
              <div class="two-factor-status">
                <div class="two-factor-status-info">
                  <span class="two-factor-status-label">当前状态：</span>
                  <span class="two-factor-status-value" :class="{ enabled: twoFactorEnabled, disabled: !twoFactorEnabled }">
                    {{ twoFactorEnabled ? '已启用' : '未启用' }}
                  </span>
                </div>
                <p class="two-factor-description">
                  使用 Microsoft Authenticator 应用扫描二维码，为您的账号添加额外的安全保护。
                  启用后，登录时需要输入验证码。
                </p>
              </div>

              <div class="two-factor-actions">
                <button 
                  v-if="!twoFactorEnabled" 
                  @click="handleEnable2FA" 
                  class="two-factor-btn two-factor-btn-enable"
                  :disabled="twoFactorLoading"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  启用2FA
                </button>
                <button 
                  v-else 
                  @click="handleDisable2FA" 
                  class="two-factor-btn two-factor-btn-disable"
                  :disabled="twoFactorLoading"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  禁用2FA
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 游客登录提示卡片 -->
        <div v-if="!isLoggedIn" class="info-card login-prompt-card">
          <div class="info-item">
            <h3 class="info-label">登录账号</h3>
            <p class="info-value">请登录您的账号以查看完整个人信息</p>
            <button @click="goToLogin" class="login-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="10,17 15,12 10,7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
              立即登录
            </button>
          </div>
        </div>
          </div>
          <!-- 右侧栏结束 -->
        </div>
        <!-- Grid容器结束 -->

        <!-- 自定义弹窗 -->
        <div v-if="showModal" class="modal-overlay" @click="closeModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>需要登录</h3>
              <button @click="closeModal" class="modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <p>{{ modalMessage }}</p>
            </div>
            <div class="modal-footer">
              <button @click="closeModal" class="modal-btn modal-btn-cancel">取消</button>
              <button @click="goToLogin" class="modal-btn modal-btn-confirm">去登录</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 成功提示Toast -->
    <div v-if="showToast" class="success-toast">
      {{ toastMessage }}
      </div>
    
    <!-- 头像裁切Modal -->
    <div v-if="showAvatarCropModal" class="avatar-crop-modal-overlay">
      <div class="avatar-crop-modal-content" @click.stop>
        <div class="avatar-crop-modal-header">
          <h3>裁切头像</h3>
          <p class="avatar-crop-hint">请拖拽选择裁切区域，头像将显示为圆形</p>
    </div>
        <div class="avatar-crop-modal-body">
          <div class="avatar-crop-container">
            <canvas ref="avatarCropCanvas" class="avatar-crop-canvas"></canvas>
            <div class="avatar-crop-overlay" ref="avatarCropOverlay">
              <div class="avatar-crop-selection" ref="avatarCropSelection">
                <!-- 调整大小的控制点 -->
                <div class="avatar-resize-handle avatar-resize-handle-se"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="avatar-crop-modal-footer">
          <button class="btn-cancel" @click="closeAvatarCropModal">重新选择图片</button>
          <button class="btn-confirm" @click="applyAvatarCrop">完成裁切</button>
        </div>
      </div>
    </div>

    <!-- 研究方向标签管理弹窗 -->
    <div v-if="showTagModal" class="modal-overlay" @click="showTagModal = false">
      <div class="modal-content tag-modal-content" @click.stop>
        <div class="modal-header">
          <h3>管理研究方向标签</h3>
          <button @click="showTagModal = false" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body tag-modal-body">
          <div class="tag-modal-scroll-area">
            <p class="modal-hint">最多可添加5个研究方向标签，当前已添加 {{ researchTags.length }}/5</p>
            
            <!-- 搜索框 -->
            <div class="tag-search">
              <input 
                v-model="tagSearchKeyword" 
                @input="searchTags"
                placeholder="搜索预设标签或输入自定义标签..."
                class="tag-search-input"
              />
            </div>
            
            <!-- 层级导航 -->
            <div v-if="tagBreadcrumb.length > 0" class="tag-breadcrumb">
              <span class="breadcrumb-item" @click="navigateToTagLevel(-1)">全部</span>
              <span v-for="(level, index) in tagBreadcrumb" :key="index" class="breadcrumb-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span @click="navigateToTagLevel(index)">{{ level.name }}</span>
              </span>
            </div>
            
            <!-- 标签选择区 -->
            <div class="tag-selection-area">
              <div v-if="filteredPresetTags.length === 0 && tagSearchKeyword" class="custom-tag-suggestion">
                <p>未找到匹配的预设标签</p>
                <button @click="addCustomTag" class="btn-add-custom" :disabled="researchTags.length >= 5">
                  添加自定义标签 "{{ tagSearchKeyword }}"
                </button>
                <p class="custom-tag-note">*自定义标签将直接添加到您的标签列表</p>
              </div>
              <div v-else class="preset-tags-grid">
                <div 
                  v-for="tag in filteredPresetTags" 
                  :key="tag.id"
                  class="preset-tag-item"
                  :class="{ selected: isTagSelected(tag.id), disabled: researchTags.length >= 5 && !isTagSelected(tag.id) }"
                  @click="toggleTagSelection(tag)"
                >
                  <span class="preset-tag-name">{{ tag.name }}</span>
                  <svg v-if="tag.hasChildren" width="12" height="12" viewBox="0 0 24 24" fill="none" class="tag-arrow">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <svg v-if="isTagSelected(tag.id)" width="16" height="16" viewBox="0 0 24 24" fill="none" class="tag-checkmark">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- 已选标签 -->
          <div v-if="researchTags.length > 0" class="selected-tags-section">
            <h4>已选标签</h4>
            <div class="selected-tags-list">
              <div v-for="(tag, index) in researchTags" :key="tag.id" class="selected-tag">
                <span>{{ tag.name }}</span>
                <button v-if="isViewingSelf" @click="removeTag(index)" class="selected-tag-remove">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showTagModal = false" class="modal-btn modal-btn-confirm">完成</button>
        </div>
      </div>
    </div>

    <!-- 学术成果关联弹窗 -->
    <div v-if="showAchievementModal" class="modal-overlay" @click="showAchievementModal = false">
      <div class="modal-content achievement-modal-content" @click.stop>
        <div class="modal-header">
          <h3>关联学术成果</h3>
          <button @click="showAchievementModal = false" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-hint">从您参与的项目中选择公开的学术成果进行关联</p>
          
          <!-- 搜索框 -->
          <div class="achievement-search">
            <input 
              v-model="achievementSearchKeyword" 
              @input="searchAchievements"
              placeholder="搜索成果标题..."
              class="achievement-search-input"
            />
          </div>
          
          <!-- 项目筛选 -->
          <div class="project-filter">
            <label>筛选项目：</label>
            <div class="project-filter-select" @click.stop="toggleProjectDropdown">
              <span class="project-filter-selected-text">
                {{ currentProjectFilterLabel }}
              </span>
              <span class="project-filter-arrow">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <div v-if="showProjectDropdown" class="project-filter-dropdown">
                <div 
                  class="project-filter-option" 
                  :class="{ active: !selectedProjectFilter }"
                  @click.stop="selectProjectFilter('')"
                >
                  全部项目
                </div>
                <div 
                  v-for="project in userProjects" 
                  :key="project.id" 
                  class="project-filter-option"
                  :class="{ active: String(selectedProjectFilter) === String(project.id) }"
                  @click.stop="selectProjectFilter(project.id)"
                >
                  {{ project.name }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 成果列表 -->
          <div class="achievements-selection-area">
            <div v-if="isLoadingAchievements" class="loading-state">
              <div class="loading-spinner"></div>
              <p>加载中...</p>
            </div>
            <div v-else-if="availableAchievements.length === 0" class="empty-achievements-state">
              <p>暂无可关联的成果</p>
            </div>
            <div v-else class="achievements-selection-list">
              <div 
                v-for="achievement in availableAchievements" 
                :key="achievement.achievementId || achievement.id"
                class="achievement-selection-item"
                :class="{ selected: isAchievementSelected(achievement.achievementId || achievement.id) }"
                @click="toggleAchievementLink(achievement)"
              >
                <div class="achievement-selection-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="achievement-selection-info">
                  <h4>{{ achievement.title }}</h4>
                  <p>{{ achievement.type }} · {{ achievement.projectName }} · {{ achievement.date }}</p>
                </div>
                <div v-if="isAchievementSelected(achievement.achievementId || achievement.id)" class="achievement-checkmark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showAchievementModal = false" class="modal-btn modal-btn-cancel">取消</button>
          <button @click="saveAchievementLinks" class="modal-btn modal-btn-confirm">确认</button>
        </div>
      </div>
    </div>

    <!-- 已关联成果列表弹窗（只读查看更多） -->
    <div v-if="showLinkedAchievementsModal" class="modal-overlay" @click="showLinkedAchievementsModal = false">
      <div class="modal-content achievement-modal-content" @click.stop>
        <div class="modal-header">
          <h3>已关联学术成果</h3>
          <button @click="showLinkedAchievementsModal = false" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="achievements-selection-area">
            <div v-if="linkedAchievements.length === 0" class="empty-achievements-state">
              <p>当前没有已关联的学术成果</p>
            </div>
            <div v-else class="achievements-selection-list">
              <div
                v-for="achievement in linkedAchievements"
                :key="achievement.achievementId || achievement.id"
                class="achievement-selection-item">
                <div class="achievement-selection-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="achievement-selection-info">
                  <h4>{{ achievement.title }}</h4>
                  <p>{{ achievement.type }} · {{ achievement.date }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showLinkedAchievementsModal = false" class="modal-btn modal-btn-confirm">关闭</button>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件上传输入 -->
    <input 
      ref="avatarUpload" 
      type="file" 
      accept="image/*" 
      @change="handleAvatarUpload" 
      style="display: none"
    />

    <!-- 2FA启用模态框 -->
    <div v-if="show2FAEnableModal" class="modal-overlay" @click="close2FAEnableModal">
      <div class="modal-content two-factor-modal-content" @click.stop>
        <div class="modal-header">
          <h3>启用双因素认证</h3>
          <button @click="close2FAEnableModal" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="two-factor-setup-content">
            <div class="two-factor-steps">
              <div class="step-item active">
                <div class="step-number">1</div>
                <div class="step-content">
                  <h4>下载 Microsoft Authenticator</h4>
                  <p>在您的手机上安装 Microsoft Authenticator 应用</p>
                </div>
              </div>
              <div class="step-item" :class="{ active: twoFactorQRCode }">
                <div class="step-number">2</div>
                <div class="step-content">
                  <h4>扫描二维码</h4>
                  <p>使用 Microsoft Authenticator 扫描下方二维码</p>
                </div>
              </div>
              <div class="step-item" :class="{ active: twoFactorConfirming }">
                <div class="step-number">3</div>
                <div class="step-content">
                  <h4>输入验证码</h4>
                  <p>在应用中输入显示的6位验证码以确认启用</p>
                </div>
              </div>
            </div>

            <div v-if="twoFactorQRCode" class="two-factor-qr-section">
              <div class="qr-code-container">
                <img 
                  :src="twoFactorQRCode" 
                  alt="2FA二维码" 
                  class="qr-code-image"
                  @error="handleQRCodeImageError"
                  @load="handleQRCodeImageLoad"
                />
              </div>
              <p class="qr-code-hint">使用 Microsoft Authenticator 扫描此二维码</p>
            </div>

            <div v-if="twoFactorQRCode" class="two-factor-verify-section">
              <label class="two-factor-input-label">输入验证码</label>
              <input 
                v-model="twoFactorCode" 
                type="text" 
                class="two-factor-code-input"
                placeholder="请输入6位验证码"
                maxlength="6"
                @keyup.enter="confirmEnable2FA"
                ref="twoFactorCodeInput"
              />
              <p class="two-factor-input-hint">请输入 Microsoft Authenticator 中显示的6位验证码</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="close2FAEnableModal" class="modal-btn modal-btn-cancel">取消</button>
          <button 
            v-if="twoFactorQRCode" 
            @click="confirmEnable2FA" 
            class="modal-btn modal-btn-confirm"
            :disabled="!twoFactorCode || twoFactorCode.length !== 6 || twoFactorLoading"
          >
            {{ twoFactorLoading ? '验证中...' : '确认启用' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 2FA禁用模态框 -->
    <div v-if="show2FADisableModal" class="modal-overlay" @click="close2FADisableModal">
      <div class="modal-content two-factor-modal-content" @click.stop>
        <div class="modal-header">
          <h3>禁用双因素认证</h3>
          <button @click="close2FADisableModal" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="two-factor-disable-content">
            <p class="two-factor-disable-warning">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              禁用2FA后，您的账号将失去额外的安全保护。请确认您要禁用双因素认证。
            </p>
            <div class="two-factor-verify-section">
              <label class="two-factor-input-label">输入验证码以确认</label>
              <input 
                v-model="twoFactorDisableCode" 
                type="text" 
                class="two-factor-code-input"
                placeholder="请输入6位验证码"
                maxlength="6"
                @keyup.enter="confirmDisable2FA"
                ref="twoFactorDisableCodeInput"
              />
              <p class="two-factor-input-hint">请输入 Microsoft Authenticator 中显示的6位验证码</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="close2FADisableModal" class="modal-btn modal-btn-cancel">取消</button>
          <button 
            @click="confirmDisable2FA" 
            class="modal-btn modal-btn-confirm"
            :disabled="!twoFactorDisableCode || twoFactorDisableCode.length !== 6 || twoFactorLoading"
          >
            {{ twoFactorLoading ? '验证中...' : '确认禁用' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import '@/assets/styles/Profile.css'
import '@/assets/styles/ProfileEnhancements.css'
import { avatarAPI } from '@/api/avatar'
import { authAPI } from '@/api/auth'
import { profileAPI } from '@/api/profile'
import { projectAPI } from '@/api/project'
import { knowledgeAPI, TYPE_DISPLAY } from '@/api/knowledge'
import { addTimestampToUrl } from '@/utils/imageUtils'

export default {
  name: 'Profile',
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      userMenuOpen: false,
      userAvatar: null,
      editingNickname: false,
      editingIntro: false,
      editingOrganization: false,
      tempNickname: '',
      tempIntro: '',
      tempOrganization: '',
      isLoggedIn: false,
      showModal: false,
      modalMessage: '',
      showToast: false,
      toastMessage: '',
      showAvatarCropModal: false,
      originalAvatarData: null,
      avatarCropData: {
        x: 0,
        y: 0,
        size: 0
      },
      isProfileLoading: true,
      currentUserId: null,
      userInfo: {
        id: null,
        username: '',
        email: '',
        nickname: '',
        avatar: '',
        organization: '',
        introduction: '',
        role: '',
        status: ''
      },
      viewingUserId: null,
      isViewingOther: false,
      // 研究方向标签相关
      showTagModal: false,
      researchTags: [],
      presetTags: [],
      filteredPresetTags: [],
      tagSearchKeyword: '',
      tagBreadcrumb: [],
      currentTagLevel: null,
      // 学术成果相关
      showAchievementModal: false,
      linkedAchievements: [],
      availableAchievements: [],
      achievementSearchKeyword: '',
      selectedProjectFilter: '',
      userProjects: [],
      isLoadingAchievements: false,
      selectedAchievementIds: [],
      showProjectDropdown: false,
      showLinkedAchievementsModal: false,
      // 关联链接
      profileLinks: [],
      newProfileLink: {
        label: '',
        url: ''
      },
      showAddLinkRow: false,
      isSavingLinks: false,
      // 隐私设置
      privacySettings: {
        profileVisibility: 'public',
        tagsVisibility: 'public',
        achievementsVisibility: 'public'
      },
      // 2FA相关
      twoFactorEnabled: false,
      twoFactorLoading: false,
      show2FAEnableModal: false,
      show2FADisableModal: false,
      twoFactorQRCode: null,
      twoFactorCode: '',
      twoFactorDisableCode: '',
      twoFactorConfirming: false
    }
  },
  computed: {
    avatarUrlWithTimestamp() {
      return addTimestampToUrl(this.userInfo.avatar)
    },

    currentProjectFilterLabel() {
      if (!this.selectedProjectFilter) {
        return '全部项目'
      }
      const project = this.userProjects.find(p => String(p.id) === String(this.selectedProjectFilter))
      return project ? project.name : '全部项目'
    },

    visibleLinkedAchievements() {
      // 主页上最多展示 6 条成果
      return this.linkedAchievements.slice(0, 6)
    },

    canAddMoreLinks() {
      return this.profileLinks.length < 6
    },

    isViewingSelf() {
      if (!this.currentUserId) return true
      if (!this.viewingUserId) return true
      return String(this.currentUserId) === String(this.viewingUserId)
    },

    profileTitle() {
      // 自己：显示"个人信息"；查看他人：显示对方昵称/姓名
      if (this.isViewingSelf) {
        return '个人信息'
      }
      return this.userInfo.nickname || this.userInfo.username || '个人信息'
    },

    displayIntroduction() {
      // 确保个人简介正确显示，优先使用 introduction，其次使用 description
      // 注意：如果introduction是默认值，但description有值，应该使用description
      let intro = this.userInfo.introduction
      
      // 如果introduction是默认值，尝试使用description
      if (intro === '这个人很懒，什么都没有留下...' && this.userInfo.description) {
        intro = this.userInfo.description
      }
      
      // 如果还是没有，直接使用description
      if (!intro || intro === '这个人很懒，什么都没有留下...') {
        intro = this.userInfo.description || intro
      }
      
      console.log('[Profile] displayIntroduction计算属性:', {
        'userInfo.introduction': this.userInfo.introduction,
        'userInfo.description': this.userInfo.description,
        '最终intro': intro
      })
      
      // 如果是默认值或空，显示默认文本
      if (!intro || intro.trim() === '' || intro === '这个人很懒，什么都没有留下...') {
        return '这个人很懒，什么都没有留下...'
      }
      return intro
    }
  },
  watch: {
    showAchievementModal(newVal) {
      if (newVal) {
        // 确保项目列表已加载
        if (this.userProjects.length === 0) {
          this.loadUserProjects().then(() => {
            this.loadProjectAchievements()
          })
        } else {
          this.loadProjectAchievements()
        }

        // 初始化弹窗中的选中状态为当前已关联成果
        this.selectedAchievementIds = this.linkedAchievements.map(a => String(a.achievementId || a.id))
      }
    },
    selectedProjectFilter() {
      // 当项目筛选改变时，重新加载成果
      if (this.showAchievementModal) {
        this.loadProjectAchievements()
      }
    }
  },
  mounted() {
    this.loadUserInfo()
    this.loadUserAvatar()
    this.loadPrivacySettings()
    this.loadPresetTags()
    this.loadUserProjects()
    this.load2FAStatus()
    document.addEventListener('click', this.handleClickOutside)
    // 监听用户信息更新事件
    this.$root.$on('userInfoUpdated', () => {
      console.log('🔄 收到用户信息更新事件，重新加载用户信息')
      this.loadUserInfo()
      // 同时重新加载2FA状态
      this.load2FAStatus()
    })
  },
  beforeRouteUpdate(to, from, next) {
    const isReturningToSelf = !!from.query.userId && (typeof to.query.userId === 'undefined' || to.query.userId === null || to.query.userId === '')

    if (isReturningToSelf) {
      next()
      window.location.reload()
      return
    }

    if (to.query.userId !== from.query.userId) {
      this.isProfileLoading = true
      this.loadUserInfo({
        routeUserId: typeof to.query.userId === 'undefined' ? undefined : to.query.userId
      })
    }
    next()
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    this.$root.$off('userInfoUpdated', this.loadUserInfo)
  },
  methods: {
    async loadOtherUserProfile(userId) {
      try {
        // 加载他人基本信息
        const response = await authAPI.getUserById(userId)
        if (response && response.code === 200 && response.data) {
          const data = response.data
          console.log('[Profile] 加载他人信息 getUserById 返回数据:', data)
          this.userInfo = {
            id: data.id || data.userId,
            username: data.username || data.name || '',
            email: data.email || '',
            nickname: data.nickname || data.name || '未设置昵称',
            avatar: data.avatar || data.avatarUrl || data.imageUrl || this.userInfo.avatar || '',
            organization: data.organization || data.institution || '未设置机构',
            introduction: data.introduction || data.description || '这个人很懒，什么都没有留下...',
            role: data.role || 'MEMBER',
            status: data.status || 'ACTIVE'
          }
        }

        const parallelTasks = []

        // 并发加载头像、标签、成果，避免串行等待
        parallelTasks.push(
          (async () => {
            try {
              const avatarResp = await avatarAPI.getAvatarInfoById(userId)
              if (avatarResp && avatarResp.code === 200 && avatarResp.data) {
                const a = avatarResp.data
                let url = a.cdn_url || a.minio_url || a.avatarUrl || a.url || null

                if (!url && a.avatarData) {
                  const contentType = a.contentType || 'image/jpeg'
                  url = `data:${contentType};base64,${a.avatarData}`
                }

                if (url) {
                  this.userInfo.avatar = url
                }
              }
            } catch (error) {
              console.error('加载他人头像失败:', error)
            }
          })()
        )

        parallelTasks.push(
          (async () => {
            try {
              const tagResp = await profileAPI.getUserResearchTags(userId)
              if (tagResp && tagResp.code === 200 && tagResp.data) {
                this.researchTags = tagResp.data.map((tag, index) => ({
                  id: index + 1,
                  name: tag,
                  path: null
                }))
              } else {
                this.researchTags = []
              }
            } catch (error) {
              console.error('加载他人研究方向标签失败:', error)
              this.researchTags = []
            }
          })()
        )

        parallelTasks.push(
          (async () => {
            try {
              const linkResp = await profileAPI.getUserProfileLinks(userId)
              if (linkResp && linkResp.code === 200 && Array.isArray(linkResp.data)) {
                this.profileLinks = linkResp.data
              } else {
                this.profileLinks = []
              }
            } catch (error) {
              console.error('加载他人关联链接失败:', error)
              this.profileLinks = []
            }
          })()
        )

        parallelTasks.push(
          (async () => {
            try {
              const achvResp = await profileAPI.getUserAchievements(userId)
              if (achvResp && achvResp.code === 200 && achvResp.data) {
                this.linkedAchievements = await this.mapAchievementsList(achvResp.data)
              } else {
                this.linkedAchievements = []
              }
            } catch (error) {
              console.error('加载他人学术成果失败:', error)
              this.linkedAchievements = []
            }
          })()
        )

        await Promise.all(parallelTasks)
      } catch (error) {
        console.error('加载他人用户信息失败:', error)
      } finally {
        this.isProfileLoading = false
      }
    },
    async loadMyProfileFromServer() {
      // 从后端获取最新的用户信息，确保包含 description 等最新字段
      try {
        const response = await authAPI.getCurrentUserInfo()
        if (response && response.code === 200 && response.data) {
          const data = response.data
          console.log('[Profile] 从服务器获取最新用户信息:', data)
          console.log('[Profile] description字段值:', data.description)
          console.log('[Profile] introduction字段值:', data.introduction)
          
          // 获取description字段（后端返回的是description）
          // 注意：即使description是空字符串，也要使用它（因为用户可能清空了简介）
          const description = data.description !== undefined && data.description !== null 
            ? data.description 
            : (data.introduction !== undefined && data.introduction !== null 
              ? data.introduction 
              : '')
          console.log('[Profile] 最终使用的个人简介:', description, '类型:', typeof description, '长度:', description ? description.length : 0)
          
          // 更新 userInfo，使用Vue.set确保响应式更新
          this.$set(this.userInfo, 'id', data.id || data.userId || this.userInfo.id)
          this.$set(this.userInfo, 'username', data.username || data.name || this.userInfo.username)
          this.$set(this.userInfo, 'email', data.email || this.userInfo.email)
          this.$set(this.userInfo, 'nickname', data.nickname || data.name || this.userInfo.nickname)
          this.$set(this.userInfo, 'avatar', data.avatar || data.avatarUrl || data.avatarData || this.userInfo.avatar)
          this.$set(this.userInfo, 'organization', data.organization || data.institution || this.userInfo.organization)
          // 如果description为空字符串，显示默认文本；否则显示实际内容
          const displayIntro = description && description.trim() !== '' 
            ? description 
            : '这个人很懒，什么都没有留下..'
          this.$set(this.userInfo, 'introduction', displayIntro)
          this.$set(this.userInfo, 'description', description) // 同时设置description字段（保持原始值）
          this.$set(this.userInfo, 'role', data.role || this.userInfo.role)
          this.$set(this.userInfo, 'status', data.status || this.userInfo.status)
          
          // 更新OAuth2绑定信息（确保OAuth2绑定状态被正确更新）
          if (data.githubId !== undefined) {
            this.$set(this.userInfo, 'githubId', data.githubId)
            console.log('✅ 更新GitHub ID:', data.githubId)
          }
          if (data.githubUsername !== undefined) {
            this.$set(this.userInfo, 'githubUsername', data.githubUsername)
            console.log('✅ 更新GitHub用户名:', data.githubUsername)
          }
          if (data.orcidId !== undefined) {
            this.$set(this.userInfo, 'orcidId', data.orcidId)
            console.log('✅ 更新ORCID ID:', data.orcidId)
          }
          if (data.orcidBound !== undefined) {
            this.$set(this.userInfo, 'orcidBound', Boolean(data.orcidBound))
            console.log('✅ 更新ORCID绑定状态:', data.orcidBound)
          }
          if (Array.isArray(data.profileLinks)) {
            this.profileLinks = data.profileLinks
          } else {
            await this.loadMyProfileLinks()
          }
          
          // 更新2FA状态（重要：确保2FA状态同步）
          if (data.twoFactorEnabled !== undefined) {
            this.twoFactorEnabled = Boolean(data.twoFactorEnabled)
            console.log('✅ 从服务器更新2FA状态:', this.twoFactorEnabled)
          }
          
          console.log('[Profile] 更新后的userInfo.introduction:', this.userInfo.introduction)
          console.log('[Profile] 更新后的userInfo.description:', this.userInfo.description)
          console.log('[Profile] 更新后的完整userInfo:', JSON.stringify(this.userInfo))
          
          // 更新 localStorage 中的用户信息
          const savedUserInfo = localStorage.getItem('user_info')
          if (savedUserInfo) {
            try {
              const userData = JSON.parse(savedUserInfo)
              // 更新所有字段，确保包含 description
              // 优先使用后端返回的description字段
              if (data.description !== undefined && data.description !== null) {
                userData.description = data.description
                userData.introduction = data.description // 同时设置introduction以兼容
              } else if (data.introduction !== undefined && data.introduction !== null) {
                userData.introduction = data.introduction
                userData.description = data.introduction
              }
              userData.organization = data.organization || data.institution || userData.organization
              userData.nickname = data.nickname || data.name || userData.nickname
              if (data.avatar || data.avatarUrl || data.avatarData) {
                userData.avatar = data.avatar || data.avatarUrl || data.avatarData
              }
              // 更新2FA状态（重要：确保2FA状态被保存）
              if (data.twoFactorEnabled !== undefined) {
                userData.twoFactorEnabled = Boolean(data.twoFactorEnabled)
                console.log('✅ 已更新localStorage中的2FA状态:', userData.twoFactorEnabled)
              }
              // 更新OAuth2绑定信息（确保OAuth2绑定状态被保存）
              if (data.githubId !== undefined) {
                userData.githubId = data.githubId
                console.log('✅ 已更新localStorage中的GitHub ID:', userData.githubId)
              }
              if (data.githubUsername !== undefined) {
                userData.githubUsername = data.githubUsername
                console.log('✅ 已更新localStorage中的GitHub用户名:', userData.githubUsername)
              }
              if (data.orcidId !== undefined) {
                userData.orcidId = data.orcidId
                console.log('✅ 已更新localStorage中的ORCID ID:', userData.orcidId)
              }
              if (data.orcidBound !== undefined) {
                userData.orcidBound = Boolean(data.orcidBound)
                console.log('✅ 已更新localStorage中的ORCID绑定状态:', userData.orcidBound)
              }
              userData.profileLinks = Array.isArray(data.profileLinks) ? data.profileLinks : []
              localStorage.setItem('user_info', JSON.stringify(userData))
              console.log('✅ 已更新 localStorage 中的用户信息')
              console.log('✅ localStorage中的description:', userData.description)
              console.log('✅ localStorage中的introduction:', userData.introduction)
              console.log('✅ localStorage中的twoFactorEnabled:', userData.twoFactorEnabled)
              console.log('✅ localStorage中的githubId:', userData.githubId)
              console.log('✅ localStorage中的githubUsername:', userData.githubUsername)
              console.log('✅ localStorage中的orcidId:', userData.orcidId)
              console.log('✅ localStorage中的orcidBound:', userData.orcidBound)
            } catch (error) {
              console.error('更新 localStorage 失败:', error)
            }
          } else {
            // 如果没有保存的用户信息，直接保存从服务器获取的数据
            const userDataToSave = {
              ...data,
              description: description,
              introduction: description,
              twoFactorEnabled: data.twoFactorEnabled !== undefined ? Boolean(data.twoFactorEnabled) : false,
              githubId: data.githubId || null,
              githubUsername: data.githubUsername || null,
              orcidId: data.orcidId || null,
              orcidBound: data.orcidBound !== undefined ? Boolean(data.orcidBound) : false
            }
            localStorage.setItem('user_info', JSON.stringify(userDataToSave))
            console.log('✅ 首次保存用户信息到 localStorage')
            console.log('✅ 保存的2FA状态:', userDataToSave.twoFactorEnabled)
            console.log('✅ 保存的GitHub ID:', userDataToSave.githubId)
            console.log('✅ 保存的GitHub用户名:', userDataToSave.githubUsername)
            console.log('✅ 保存的ORCID ID:', userDataToSave.orcidId)
            console.log('✅ 保存的ORCID绑定状态:', userDataToSave.orcidBound)
          }
          
          this.isProfileLoading = false
        } else {
          this.isProfileLoading = false
        }
      } catch (error) {
        console.error('从服务器获取用户信息失败:', error)
        this.isProfileLoading = false
      }
    },
    triggerAvatarUpload() {
      if (!this.isViewingSelf) return
      const input = this.$refs.avatarUpload
      if (input) {
        input.click()
      }
    },
    loadUserInfo(options = {}) {
      const hasRouteOverride = Object.prototype.hasOwnProperty.call(options, 'routeUserId')
      const routeUserId = hasRouteOverride ? options.routeUserId : this.$route.query.userId
      const normalizedRouteUserId = routeUserId != null && routeUserId !== '' ? String(routeUserId) : null

      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const savedUserInfo = localStorage.getItem('user_info')
      this.isLoggedIn = !!(token && savedUserInfo)
      
      if (this.isLoggedIn && savedUserInfo) {
        try {
          const userData = JSON.parse(savedUserInfo)
          this.currentUserId = userData.id || userData.userId
          const normalizedCurrentUserId = this.currentUserId != null ? String(this.currentUserId) : null

          // 如果路由上带了 userId，并且与当前用户不同：直接进入“查看他人”模式，避免先闪现自己的信息
          if (normalizedRouteUserId && normalizedRouteUserId !== normalizedCurrentUserId) {
            this.viewingUserId = normalizedRouteUserId
            this.isViewingOther = true

            // 初始化为一个空的占位信息（不要用自己的 userInfo）
            const routeAvatar = this.$route.query?.avatar
            this.userInfo = {
              id: this.viewingUserId,
              username: '',
              email: '',
              nickname: '',
              avatar: routeAvatar || '',
              organization: '',
              introduction: '',
              role: 'MEMBER',
              status: 'ACTIVE'
            }

            this.researchTags = []
            this.linkedAchievements = []

            this.loadOtherUserProfile(this.viewingUserId)
          } else {
            // 默认显示当前登录用户自己的信息
            this.viewingUserId = this.currentUserId
            this.isViewingOther = false

            // 先从 localStorage 读取，然后从后端获取最新信息以确保数据同步
            this.userInfo = {
              id: userData.id || userData.userId,
              username: userData.username || userData.name || '',
              email: userData.email || '',
              nickname: userData.nickname || userData.name || '未设置昵称',
              avatar: userData.avatar || '',
              organization: userData.organization || userData.institution || '未设置机构',
              introduction: userData.introduction || userData.description || '这个人很懒，什么都没有留下...',
              role: userData.role || 'MEMBER',
              status: userData.status || 'ACTIVE',
              githubId: userData.githubId || null,
              githubUsername: userData.githubUsername || null,
              orcidId: userData.orcidId || null,
              orcidBound: userData.orcidBound !== undefined ? Boolean(userData.orcidBound) : false
            }
            console.log('加载用户信息（从localStorage）:', this.userInfo)
            this.profileLinks = Array.isArray(userData.profileLinks) ? userData.profileLinks : []

            // 从后端获取最新的用户信息，确保包含 description 字段
            this.loadMyProfileFromServer()

            // 查看自己的资料时，加载当前用户的研究方向和学术成果
            this.loadResearchTags()
            this.loadLinkedAchievements()
            this.showAddLinkRow = false
            
            // 加载2FA状态（确保状态同步）
            this.load2FAStatus()
          }
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.isLoggedIn = false
        }
      } else {
        // 游客模式
        this.isLoggedIn = false
        this.currentUserId = null
        this.viewingUserId = null
        this.isViewingOther = false
        this.userInfo = {
          id: null,
          username: '',
          email: '',
          nickname: '游客',
          avatar: '',
          organization: '',
          introduction: '您还未登录，请登录后查看个人信息',
          role: 'GUEST',
          status: 'GUEST'
        }
        this.profileLinks = []
            this.showAddLinkRow = false
      }
    },
    loadUserAvatar() {
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) {
        this.userAvatar = savedAvatar
      }
    },
    handleClickOutside(event) {
      const userMenu = this.$refs.userMenu
      const userProfile = this.$refs.userProfile
      if (userMenu && !userMenu.contains(event.target) && userProfile && !userProfile.contains(event.target)) {
        this.userMenuOpen = false
      }

      // 关闭项目筛选下拉
      if (this.showProjectDropdown) {
        this.showProjectDropdown = false
      }
    },
    toggleProjectDropdown() {
      if (!this.isLoggedIn || this.userProjects.length === 0) {
        // 未登录或没有项目时，不显示下拉
        return
      }
      this.showProjectDropdown = !this.showProjectDropdown
    },
    selectProjectFilter(projectId) {
      this.selectedProjectFilter = projectId
      this.showProjectDropdown = false
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    goToHome() {
      this.$router.push('/home')
    },
    goToLogin() {
      this.$router.push({ name: 'Login' })
    },
    showSuccessToast(message) {
      this.toastMessage = message
      this.showToast = true
      
      // 1秒后自动隐藏
      setTimeout(() => {
        this.showToast = false
        this.toastMessage = ''
      }, 1000)
    },
    closeModal() {
      this.showModal = false
      this.modalMessage = ''
    },
    toggleUserMenu() {
      this.userMenuOpen = !this.userMenuOpen
    },
    goToProfile() {
      this.userMenuOpen = false
      // 已经在个人信息页面，不需要跳转
    },
    logout() {
      this.userMenuOpen = false
      
      // 清除所有认证信息
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('remember_me_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('userAvatar')
      localStorage.removeItem('globalUserInfo')
      
      // 清除所有以userData_开头的用户数据
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('userData_')) {
          localStorage.removeItem(key)
        }
      })
      
      this.showSuccessToast('退出登录成功！')
      // 延迟跳转到登录页面，让用户看到提示
      setTimeout(() => {
      this.$router.push('/login')
      }, 1000)
    },
    goToChangeEmail() {
      if (!this.isLoggedIn) {
        this.modalMessage = '请先登录才能修改邮箱'
        this.showModal = true
        return
      }
      this.$router.push({ name: 'ChangeEmail' })
    },
    maskEmail(email) {
      if (!email || typeof email !== 'string') return ''
      const [local, domain] = email.split('@')
      if (!domain) {
        return email
      }
      if (!local || local.length <= 2) {
        return '*@' + domain
      }
      const start = local.slice(0, 2)
      const end = local.slice(-2)
      const stars = '*'.repeat(Math.max(local.length - 4, 1))
      return `${start}${stars}${end}@${domain}`
    },
    // 头像裁切相关方法
    closeAvatarCropModal() {
      // 如果用户取消裁切，清空文件输入
      this.$refs.avatarUpload.value = ''
      this.showAvatarCropModal = false
      this.originalAvatarData = null
    },
    initAvatarCropCanvas() {
      const canvas = this.$refs.avatarCropCanvas
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // 设置画布尺寸，保持图片比例
        const maxSize = 400
        let { width, height } = img
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)
        
        // 初始化圆形裁切区域
        const cropSize = Math.min(width, height) * 0.6
        this.avatarCropData = {
          x: (width - cropSize) / 2,
          y: (height - cropSize) / 2,
          size: cropSize
        }
        
        this.updateAvatarCropSelection()
        this.setupAvatarCropInteraction()
      }
      
      // 🛡️ 修复：添加图片加载错误处理
      img.onerror = (error) => {
        console.error('图片加载失败:', error)
        alert('图片加载失败，请重新选择')
        this.closeAvatarCropModal()
      }
      
      img.src = this.originalAvatarData
    },
    updateAvatarCropSelection() {
      const selection = this.$refs.avatarCropSelection
      if (selection) {
        selection.style.left = this.avatarCropData.x + 'px'
        selection.style.top = this.avatarCropData.y + 'px'
        selection.style.width = this.avatarCropData.size + 'px'
        selection.style.height = this.avatarCropData.size + 'px'
      }
    },
    setupAvatarCropInteraction() {
      const selection = this.$refs.avatarCropSelection
      const canvas = this.$refs.avatarCropCanvas
      
      if (!selection || !canvas) return
      
      let isDragging = false
      let isResizing = false
      let startX = 0
      let startY = 0
      let startCropX = 0
      let startCropY = 0
      let startCropSize = 0
      
      const startDrag = (e) => {
        if (e.target.classList.contains('avatar-resize-handle')) {
          isResizing = true
        } else {
          isDragging = true
        }
        
        const rect = canvas.getBoundingClientRect()
        startX = e.clientX - rect.left
        startY = e.clientY - rect.top
        startCropX = this.avatarCropData.x
        startCropY = this.avatarCropData.y
        startCropSize = this.avatarCropData.size
      }
      
      const drag = (e) => {
        if (!isDragging && !isResizing) return
        
        const rect = canvas.getBoundingClientRect()
        const currentX = e.clientX - rect.left
        const currentY = e.clientY - rect.top
        
        const deltaX = currentX - startX
        const deltaY = currentY - startY
        
        if (isDragging) {
          // 移动圆形裁切框
          const newX = Math.max(0, Math.min(canvas.width - this.avatarCropData.size, startCropX + deltaX))
          const newY = Math.max(0, Math.min(canvas.height - this.avatarCropData.size, startCropY + deltaY))
          
          this.avatarCropData.x = newX
          this.avatarCropData.y = newY
        } else if (isResizing) {
          // 调整圆形裁切框大小
          const deltaSize = deltaX + deltaY
          const newSize = Math.max(50, Math.min(Math.min(canvas.width, canvas.height), startCropSize + deltaSize))
          
          // 保持圆形居中
          const newX = Math.max(0, Math.min(canvas.width - newSize, startCropX + (startCropSize - newSize) / 2))
          const newY = Math.max(0, Math.min(canvas.height - newSize, startCropY + (startCropSize - newSize) / 2))
          
          this.avatarCropData.x = newX
          this.avatarCropData.y = newY
          this.avatarCropData.size = newSize
        }
        
        this.updateAvatarCropSelection()
      }
      
      const endDrag = () => {
        isDragging = false
        isResizing = false
      }
      
      selection.addEventListener('mousedown', startDrag)
      document.addEventListener('mousemove', drag)
      document.addEventListener('mouseup', endDrag)
      
      // 清理事件监听器
      this.$once('hook:beforeDestroy', () => {
        selection.removeEventListener('mousedown', startDrag)
        document.removeEventListener('mousemove', drag)
        document.removeEventListener('mouseup', endDrag)
      })
    },
    applyAvatarCrop() {
      if (!this.originalAvatarData) return
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // 设置圆形头像的尺寸（与页面显示尺寸一致）
      const avatarSize = 80
      canvas.width = avatarSize
      canvas.height = avatarSize
      
      // 创建圆形裁切路径
      ctx.beginPath()
      ctx.arc(avatarSize / 2, avatarSize / 2, avatarSize / 2, 0, 2 * Math.PI)
      ctx.clip()
      
      // 获取原始图片的实际尺寸
      const img = new Image()
      img.onload = async () => {
        // 计算裁切区域在原图中的实际位置和尺寸
        const canvasWidth = this.$refs.avatarCropCanvas.width
        const canvasHeight = this.$refs.avatarCropCanvas.height
        
        const sourceX = (this.avatarCropData.x / canvasWidth) * img.width
        const sourceY = (this.avatarCropData.y / canvasHeight) * img.height
        const sourceSize = (this.avatarCropData.size / canvasWidth) * img.width
        
        // 绘制裁切后的图片
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, avatarSize, avatarSize
        )
        
        // 转换为Blob以便上传
        canvas.toBlob(async (blob) => {
          // 🛡️ 修复：检查blob是否为null
          if (!blob) {
            console.error('Canvas转Blob失败')
            alert('图片处理失败，请重试')
            return
          }
          
          try {
            // 先关闭裁剪模态框
            this.closeAvatarCropModal()
            
            // 创建File对象
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
            console.log('准备上传头像到后端，文件大小:', file.size, 'bytes')
            
            // 调用后端API上传头像
            const response = await avatarAPI.uploadAvatar(file)
            console.log('头像上传成功，后端响应:', response)
            
            // 获取后端返回的头像URL
            let avatarUrl = ''
            if (response.code === 200 && response.data) {
              // 优先使用 cdnUrl（驼峰命名），其次是 minioUrl
              avatarUrl = response.data.cdnUrl || response.data.minioUrl || ''
              console.log('后端返回的头像URL:', avatarUrl)
              console.log('响应数据详情:', response.data)
            } else {
              console.warn('后端响应异常:', response)
            }
            
            // 如果后端返回了URL，使用后端URL；否则使用本地base64
            let finalAvatar = avatarUrl || canvas.toDataURL('image/jpeg', 0.9)
            
            // 🔧 修复：添加时间戳参数强制浏览器刷新缓存
            const timestamp = Date.now()
            finalAvatar = addTimestampToUrl(finalAvatar, timestamp)
            console.log('✅ 已添加时间戳参数，强制浏览器刷新:', finalAvatar.substring(0, 100) + '...')
            
            // 更新本地状态
            this.userInfo.avatar = finalAvatar
            this.userAvatar = finalAvatar
            
            // 🛡️ 修复：添加localStorage异常捕获
            try {
              localStorage.setItem('userAvatar', finalAvatar)
            } catch (e) {
              console.error('保存头像到localStorage失败:', e)
              if (e.name === 'QuotaExceededError') {
                console.warn('localStorage空间已满')
              }
            }
            
            // 更新user_info中的头像信息
            const savedUserInfo = localStorage.getItem('user_info')
            let currentUserId = this.userInfo.id
            if (savedUserInfo) {
              try {
                const userData = JSON.parse(savedUserInfo)
                userData.avatar = finalAvatar
                currentUserId = userData.id || userData.userId || currentUserId
                localStorage.setItem('user_info', JSON.stringify(userData))
                console.log('头像已更新到user_info')
              } catch (error) {
                console.error('更新user_info头像失败:', error)
                if (error.name === 'QuotaExceededError') {
                  console.warn('localStorage空间已满，请清理浏览器缓存')
                }
              }
            }
            
            // 🎯 使用精确事件通知其他组件
            const eventData = {
              userId: String(currentUserId),  // 确保 userId 是字符串
              avatarUrl: finalAvatar,
              timestamp: Date.now()
            }
            console.log('📤 发送头像更新事件:', {
              userId: eventData.userId,
              userIdType: typeof eventData.userId,
              avatarUrl: eventData.avatarUrl.substring(0, 50) + '...',
              timestamp: eventData.timestamp
            })
            this.$eventBus.emit(this.$EventTypes.USER_AVATAR_UPDATED, eventData)
            
            // 触发全局更新事件（兼容旧代码）
            this.$root.$emit('userInfoUpdated')
            
            // 显示成功提示
            this.showSuccessToast('头像上传成功！')
            
          } catch (error) {
            console.error('上传头像失败:', error)
            
            // 🛡️ 修复：添加重试机制
            const errorMsg = error.msg || error.message || '未知错误'
            const retry = confirm(`头像上传失败: ${errorMsg}\n\n是否重试？`)
            
            if (retry) {
              // 重新触发上传
              this.applyAvatarCrop()
              return
            }
            
            // 即使上传失败，也先用本地base64显示
            let localAvatar = canvas.toDataURL('image/jpeg', 0.9)
            
            // 🔧 修复：添加时间戳参数强制浏览器刷新缓存
            localAvatar = addTimestampToUrl(localAvatar, Date.now())
            
            this.userInfo.avatar = localAvatar
            this.userAvatar = localAvatar
            
            // 🛡️ 修复：添加localStorage异常捕获
            try {
              localStorage.setItem('userAvatar', localAvatar)
            } catch (e) {
              console.error('保存头像到localStorage失败:', e)
              if (e.name === 'QuotaExceededError') {
                console.warn('localStorage空间已满')
              }
            }
            
            // 更新user_info
            const savedUserInfo = localStorage.getItem('user_info')
            if (savedUserInfo) {
              try {
                const userData = JSON.parse(savedUserInfo)
                userData.avatar = localAvatar
                localStorage.setItem('user_info', JSON.stringify(userData))
              } catch (e) {
                console.error('更新user_info失败:', e)
                if (e.name === 'QuotaExceededError') {
                  console.warn('localStorage空间已满，请清理浏览器缓存')
                }
              }
            }
            
            // 触发更新
            this.$root.$emit('userInfoUpdated')
          }
        }, 'image/jpeg', 0.9)
      }
      
      // 🛡️ 修复：添加图片加载错误处理
      img.onerror = (error) => {
        console.error('裁切图片加载失败:', error)
        alert('图片处理失败，请重试')
      }
      
      img.src = this.originalAvatarData
    },
    // 头像相关方法
    triggerAvatarUpload() {
      if (!this.isLoggedIn) {
        this.modalMessage = '请先登录才能修改头像'
        this.showModal = true
        return
      }
      this.$refs.avatarUpload.click()
    },
    handleAvatarUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
          alert('请选择图片文件')
          this.$refs.avatarUpload.value = ''
          return
        }
        
        // 检查文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('图片文件大小不能超过5MB')
          this.$refs.avatarUpload.value = ''
          return
        }
        
        const reader = new FileReader()
        
        reader.onload = (e) => {
          this.originalAvatarData = e.target.result
          // 立即显示圆形裁切模态
          this.showAvatarCropModal = true
          this.$nextTick(() => {
            this.initAvatarCropCanvas()
          })
        }
        
        // 🛡️ 修复：添加错误处理
        reader.onerror = (error) => {
          console.error('文件读取失败:', error)
          alert('文件读取失败，请重新选择图片')
          this.$refs.avatarUpload.value = ''
        }
        
        reader.readAsDataURL(file)
      } catch (error) {
        console.error('处理文件失败:', error)
        alert('处理文件失败: ' + error.message)
        this.$refs.avatarUpload.value = ''
      }
    },
    // 昵称编辑方法
    editNickname() {
      if (!this.isLoggedIn) {
        this.modalMessage = '请先登录才能修改昵称'
        this.showModal = true
        return
      }
      this.editingNickname = true
      this.tempNickname = this.userInfo.nickname
      this.$nextTick(() => {
        this.$refs.nicknameInput.focus()
        this.$refs.nicknameInput.select()
      })
    },
    async saveNickname() {
      const trimmedNickname = this.tempNickname.trim()
      if (trimmedNickname && trimmedNickname !== this.userInfo.nickname) {
        // 验证昵称长度
        if (trimmedNickname.length < 2) {
          alert('昵称至少需要2个字符')
          return
        }
        if (trimmedNickname.length > 20) {
          alert('昵称不能超过20个字符')
          return
        }
        // 确认修改
        if (confirm(`确定要将昵称修改为"${trimmedNickname}"吗？`)) {
          try {
            // 调用后端API更新昵称（后端字段为name）
            const response = await authAPI.updateUserInfo({
              name: trimmedNickname
            })
            
            if (response && response.code === 200) {
              // 更新成功
              this.userInfo.nickname = trimmedNickname
              this.editingNickname = false
              
              // 更新user_info中的昵称信息
              const savedUserInfo = localStorage.getItem('user_info')
              if (savedUserInfo) {
                try {
                  const userData = JSON.parse(savedUserInfo)
                  userData.nickname = trimmedNickname
                  localStorage.setItem('user_info', JSON.stringify(userData))
                  console.log('昵称已更新到user_info:', userData.nickname)
                } catch (error) {
                  console.error('更新user_info昵称失败:', error)
                }
              }
              
              // 触发全局更新事件
              this.$root.$emit('userInfoUpdated')
              console.log('昵称已更新:', trimmedNickname)
              
              // 显示成功提示
              this.showSuccessToast('昵称更新成功！')
            } else {
              throw new Error(response.msg || '更新失败')
            }
          } catch (error) {
            console.error('更新昵称失败:', error)
            alert('更新昵称失败: ' + (error.message || error.msg || '请稍后重试'))
            // 恢复原昵称
            this.tempNickname = this.userInfo.nickname
          }
        }
      } else if (trimmedNickname === this.userInfo.nickname) {
        // 没有变化，直接退出编辑
        this.editingNickname = false
      } else {
        alert('昵称不能为空')
      }
    },
    cancelEditNickname() {
      this.tempNickname = this.userInfo.nickname
      this.editingNickname = false
    },
    // 个人简介编辑方法
    editIntro() {
      this.editingIntro = true
      // 使用计算属性确保获取正确的值
      const intro = this.userInfo.introduction || this.userInfo.description || ''
      this.tempIntro = intro === '这个人很懒，什么都没有留下...' ? '' : intro
      this.$nextTick(() => {
        this.$refs.introTextarea.focus()
      })
    },
    async saveIntro() {
      const trimmedIntro = this.tempIntro.trim()
      
      // 验证简介长度
      if (trimmedIntro.length > 500) {
        alert('个人简介不能超过500个字符')
        return
      }
      
      // 如果内容没有变化，直接退出编辑
      const currentIntro = this.userInfo.introduction || this.userInfo.description || ''
      if (trimmedIntro === currentIntro || (trimmedIntro === '' && (currentIntro === '' || currentIntro === '这个人很懒，什么都没有留下...'))) {
        this.editingIntro = false
        return
      }
      
      try {
        // 调用后端API更新个人简介
        const response = await profileAPI.updateDescription(trimmedIntro)
        
        if (response && response.code === 200) {
          // 更新成功，重新获取用户信息以确保数据同步
          try {
            const userInfoResp = await authAPI.getCurrentUserInfo()
            if (userInfoResp && userInfoResp.code === 200 && userInfoResp.data) {
              const updatedData = userInfoResp.data
            // 更新本地 userInfo
            this.userInfo.introduction = updatedData.introduction || updatedData.description || trimmedIntro
            
            // 更新 localStorage 中的用户信息
            const savedUserInfo = localStorage.getItem('user_info')
            if (savedUserInfo) {
              try {
                const userData = JSON.parse(savedUserInfo)
                userData.introduction = updatedData.introduction || updatedData.description || trimmedIntro
                userData.description = updatedData.description || updatedData.introduction || trimmedIntro
                // 同时更新2FA状态（如果后端返回了）
                if (updatedData.twoFactorEnabled !== undefined) {
                  userData.twoFactorEnabled = Boolean(updatedData.twoFactorEnabled)
                  this.twoFactorEnabled = Boolean(updatedData.twoFactorEnabled)
                }
                localStorage.setItem('user_info', JSON.stringify(userData))
                console.log('个人简介已更新到user_info')
              } catch (error) {
                console.error('更新user_info简介失败:', error)
              }
            }
            } else {
              // 如果获取失败，直接使用保存的值
              this.userInfo.introduction = trimmedIntro
              const savedUserInfo = localStorage.getItem('user_info')
              if (savedUserInfo) {
                try {
                  const userData = JSON.parse(savedUserInfo)
                  userData.introduction = trimmedIntro
                  userData.description = trimmedIntro
                  localStorage.setItem('user_info', JSON.stringify(userData))
                } catch (error) {
                  console.error('更新user_info简介失败:', error)
                }
              }
            }
          } catch (error) {
            console.error('重新获取用户信息失败:', error)
            // 如果重新获取失败，直接使用保存的值
            this.userInfo.introduction = trimmedIntro
            const savedUserInfo = localStorage.getItem('user_info')
            if (savedUserInfo) {
              try {
                const userData = JSON.parse(savedUserInfo)
                userData.introduction = trimmedIntro
                userData.description = trimmedIntro
                localStorage.setItem('user_info', JSON.stringify(userData))
              } catch (e) {
                console.error('更新user_info简介失败:', e)
              }
            }
          }
          
          this.editingIntro = false
          
          // 触发全局更新事件
          this.$root.$emit('userInfoUpdated')
          
          // 显示成功提示
          this.showSuccessToast('个人简介更新成功！')
        } else {
          throw new Error(response.msg || '更新失败')
        }
      } catch (error) {
        console.error('更新个人简介失败:', error)
        alert('更新个人简介失败: ' + (error.message || error.msg || '请稍后重试'))
        // 恢复原简介
        const intro = this.userInfo.introduction || this.userInfo.description || ''
        this.tempIntro = intro === '这个人很懒，什么都没有留下...' ? '' : intro
      }
    },
    cancelEditIntro() {
      const intro = this.userInfo.introduction || this.userInfo.description || ''
      this.tempIntro = intro === '这个人很懒，什么都没有留下...' ? '' : intro
      this.editingIntro = false
    },
    // 机构编辑方法
    editOrganization() {
      if (!this.isLoggedIn) {
        this.modalMessage = '请先登录才能修改机构'
        this.showModal = true
        return
      }
      this.editingOrganization = true
      this.tempOrganization = this.userInfo.organization || ''
      this.$nextTick(() => {
        this.$refs.organizationInput.focus()
      })
    },
    async saveOrganization() {
      const trimmedOrganization = this.tempOrganization.trim()
      
      // 如果内容没有变化，直接退出编辑
      if (trimmedOrganization === this.userInfo.organization) {
        this.editingOrganization = false
        return
      }
      
      try {
        // 调用后端API更新机构
        const response = await authAPI.updateUserInfo({
          organization: trimmedOrganization
        })
        
        console.log('更新机构API响应:', response)
        
        // 检查响应格式
        if (response && response.success === false) {
          throw new Error(response.message || response.msg || '更新失败')
        }
        
        if (response && response.code === 200) {
          // 更新成功
          // 从响应中获取更新后的机构信息（后端返回的是institution字段）
          const updatedInstitution = response.data?.institution || trimmedOrganization || '未设置机构'
          this.userInfo.organization = updatedInstitution
          this.editingOrganization = false
          
          // 更新user_info中的机构信息（同时保存organization和institution字段以兼容）
          const savedUserInfo = localStorage.getItem('user_info')
          if (savedUserInfo) {
            try {
              const userData = JSON.parse(savedUserInfo)
              userData.organization = updatedInstitution
              userData.institution = updatedInstitution // 同时保存institution字段以兼容
              localStorage.setItem('user_info', JSON.stringify(userData))
              console.log('机构已更新到user_info:', userData.organization)
            } catch (error) {
              console.error('更新user_info机构失败:', error)
            }
          }
          
          // 触发全局更新事件，重新加载用户信息
          this.$root.$emit('userInfoUpdated')
          
          // 显示成功提示
          this.showSuccessToast('机构更新成功！')
        } else {
          throw new Error(response?.msg || response?.message || '更新失败')
        }
      } catch (error) {
        console.error('更新机构失败:', error)
        console.error('错误详情:', error.response)
        alert('更新机构失败: ' + (error.message || error.msg || error.response?.data?.msg || '请稍后重试'))
        // 恢复原机构
        this.tempOrganization = this.userInfo.organization || ''
      }
    },
    cancelEditOrganization() {
      // 恢复原机构名称
      this.tempOrganization = this.userInfo.organization || ''
      this.editingOrganization = false
    },
    
    // ===== 研究方向标签相关方法 =====
    async loadResearchTags() {
      if (!this.isLoggedIn) return
      
      try {
        const response = await profileAPI.getResearchTags()
        if (response && response.code === 200 && response.data) {
          // 后端返回的是字符串数组，转换为前端需要的格式
          this.researchTags = response.data.map((tag, index) => ({
            id: index + 1, // 临时ID，用于前端显示
            name: tag,
            path: null // 后端不返回路径信息
          }))
        } else {
          this.researchTags = []
        }
      } catch (error) {
        console.error('加载研究方向标签失败:', error)
        this.researchTags = []
      }
    },
    
    async loadPresetTags() {
      try {
        // TODO: 调用后端API加载预设标签库
        // const response = await profileAPI.getPresetTags()
        // this.presetTags = response.data || []
        
        // 模拟层级标签数据
        this.presetTags = [
          // 计算机科学 / 人工智能
          { id: 1, name: '人工智能', parentId: null, hasChildren: true },
          { id: 2, name: '机器学习', parentId: 1, hasChildren: true },
          { id: 3, name: '深度学习', parentId: 2, hasChildren: true },
          { id: 4, name: '自然语言处理', parentId: 1, hasChildren: true },
          { id: 5, name: '计算机视觉', parentId: 1, hasChildren: true },
          { id: 6, name: '强化学习', parentId: 1, hasChildren: false },
          { id: 7, name: '推荐系统', parentId: 1, hasChildren: false },
          { id: 8, name: '知识图谱', parentId: 1, hasChildren: false },

          { id: 9, name: '大模型', parentId: 3, hasChildren: false },
          { id: 10, name: '神经网络结构', parentId: 3, hasChildren: true },
          { id: 11, name: 'CNN', parentId: 10, hasChildren: false },
          { id: 12, name: 'RNN/LSTM', parentId: 10, hasChildren: false },
          { id: 13, name: 'Transformer', parentId: 10, hasChildren: false },

          { id: 14, name: '文本挖掘', parentId: 4, hasChildren: false },
          { id: 15, name: '对话系统', parentId: 4, hasChildren: false },
          { id: 16, name: '机器翻译', parentId: 4, hasChildren: false },
          { id: 17, name: '信息检索', parentId: 4, hasChildren: false },

          { id: 18, name: '目标检测', parentId: 5, hasChildren: false },
          { id: 19, name: '图像分割', parentId: 5, hasChildren: false },
          { id: 20, name: '三维视觉', parentId: 5, hasChildren: false },
          { id: 21, name: '多模态学习', parentId: 5, hasChildren: false },

          { id: 22, name: '数据挖掘', parentId: null, hasChildren: true },
          { id: 23, name: '时序数据分析', parentId: 22, hasChildren: false },
          { id: 24, name: '图数据挖掘', parentId: 22, hasChildren: false },
          { id: 25, name: '用户行为分析', parentId: 22, hasChildren: false },

          { id: 26, name: '软件工程', parentId: null, hasChildren: true },
          { id: 27, name: '软件架构', parentId: 26, hasChildren: false },
          { id: 28, name: '形式化验证', parentId: 26, hasChildren: false },
          { id: 29, name: 'DevOps', parentId: 26, hasChildren: false },

          { id: 30, name: '网络与安全', parentId: null, hasChildren: true },
          { id: 31, name: '网络协议', parentId: 30, hasChildren: false },
          { id: 32, name: '网络安全', parentId: 30, hasChildren: true },
          { id: 33, name: '密码学', parentId: 32, hasChildren: false },
          { id: 34, name: '入侵检测', parentId: 32, hasChildren: false },

          { id: 35, name: '分布式系统', parentId: null, hasChildren: true },
          { id: 36, name: '云计算', parentId: 35, hasChildren: false },
          { id: 37, name: '边缘计算', parentId: 35, hasChildren: false },
          { id: 38, name: '高性能计算', parentId: 35, hasChildren: false },

          // 数学与统计
          { id: 39, name: '应用数学', parentId: null, hasChildren: true },
          { id: 40, name: '数值分析', parentId: 39, hasChildren: false },
          { id: 41, name: '优化理论', parentId: 39, hasChildren: false },
          { id: 42, name: '随机过程', parentId: 39, hasChildren: false },

          { id: 43, name: '统计学', parentId: null, hasChildren: true },
          { id: 44, name: '贝叶斯统计', parentId: 43, hasChildren: false },
          { id: 45, name: '高维统计', parentId: 43, hasChildren: false },

          // 物理与工程
          { id: 46, name: '量子计算', parentId: null, hasChildren: true },
          { id: 47, name: '量子算法', parentId: 46, hasChildren: false },
          { id: 48, name: '量子通信', parentId: 46, hasChildren: false },

          { id: 49, name: '凝聚态物理', parentId: null, hasChildren: false },
          { id: 50, name: '光学工程', parentId: null, hasChildren: false },
          { id: 51, name: '控制理论', parentId: null, hasChildren: true },
          { id: 52, name: '智能控制', parentId: 51, hasChildren: false },
          { id: 53, name: '鲁棒控制', parentId: 51, hasChildren: false },

          // 生命科学与医工结合
          { id: 54, name: '生物信息学', parentId: null, hasChildren: true },
          { id: 55, name: '基因组学', parentId: 54, hasChildren: false },
          { id: 56, name: '蛋白质组学', parentId: 54, hasChildren: false },
          { id: 57, name: '单细胞分析', parentId: 54, hasChildren: false },

          { id: 58, name: '计算生物学', parentId: null, hasChildren: false },
          { id: 59, name: '医学影像分析', parentId: null, hasChildren: false },

          // 人文社科与交叉
          { id: 60, name: '管理科学与工程', parentId: null, hasChildren: true },
          { id: 61, name: '运筹与决策', parentId: 60, hasChildren: false },
          { id: 62, name: '供应链管理', parentId: 60, hasChildren: false },

          { id: 63, name: '经济学', parentId: null, hasChildren: true },
          { id: 64, name: '金融工程', parentId: 63, hasChildren: false },
          { id: 65, name: '计量经济学', parentId: 63, hasChildren: false },

          { id: 66, name: '教育技术', parentId: null, hasChildren: false },
          { id: 67, name: '数字人文', parentId: null, hasChildren: false }
        ]
        this.filteredPresetTags = this.presetTags.filter(tag => tag.parentId === null)
      } catch (error) {
        console.error('加载预设标签失败:', error)
      }
    },
    
    searchTags() {
      const keyword = this.tagSearchKeyword.trim().toLowerCase()
      if (!keyword) {
        this.filteredPresetTags = this.presetTags.filter(tag => 
          tag.parentId === (this.currentTagLevel ? this.currentTagLevel.id : null)
        )
        return
      }
      
      this.filteredPresetTags = this.presetTags.filter(tag => 
        tag.name.toLowerCase().includes(keyword)
      )
    },
    
    navigateToTagLevel(index) {
      if (index === -1) {
        // 返回顶层
        this.tagBreadcrumb = []
        this.currentTagLevel = null
        this.filteredPresetTags = this.presetTags.filter(tag => tag.parentId === null)
      } else {
        // 返回到指定层级
        this.tagBreadcrumb = this.tagBreadcrumb.slice(0, index + 1)
        this.currentTagLevel = this.tagBreadcrumb[index]
        this.filteredPresetTags = this.presetTags.filter(tag => tag.parentId === this.currentTagLevel.id)
      }
    },
    
    toggleTagSelection(tag) {
      if (tag.hasChildren) {
        // 进入子级
        this.tagBreadcrumb.push(tag)
        this.currentTagLevel = tag
        this.filteredPresetTags = this.presetTags.filter(t => t.parentId === tag.id)
        return
      }
      
      const index = this.researchTags.findIndex(t => t.id === tag.id)
      if (index > -1) {
        // 取消选择
        this.researchTags.splice(index, 1)
      } else if (this.researchTags.length < 5) {
        // 添加标签
        const path = this.getTagPath(tag)
        this.researchTags.push({
          ...tag,
          path
        })
        this.saveResearchTags()
      }
    },
    
    getTagPath(tag) {
      const path = []
      let current = tag
      while (current.parentId) {
        const parent = this.presetTags.find(t => t.id === current.parentId)
        if (parent) {
          path.unshift(parent.name)
          current = parent
        } else {
          break
        }
      }
      return path.join(' → ')
    },
    
    isTagSelected(tagId) {
      return this.researchTags.some(t => t.id === tagId)
    },
    
    async removeTag(index) {
      if (index >= 0 && index < this.researchTags.length) {
        this.researchTags.splice(index, 1)
        await this.saveResearchTags()
      }
    },
    
    async addCustomTag() {
      if (!this.tagSearchKeyword.trim() || this.researchTags.length >= 5) return
      
      try {
        // 直接添加自定义标签到列表
        const customTag = this.tagSearchKeyword.trim()
        if (this.researchTags.some(t => (t.name || t) === customTag)) {
          this.showSuccessToast('标签已存在')
          return
        }
        
        this.researchTags.push({
          id: Date.now(), // 临时ID
          name: customTag,
          path: null
        })
        
        // 保存到后端
        await this.saveResearchTags()
        this.tagSearchKeyword = ''
      } catch (error) {
        console.error('添加自定义标签失败:', error)
        alert('添加失败: ' + (error.msg || error.message || '请稍后重试'))
      }
    },
    
    async saveResearchTags() {
      if (!this.isLoggedIn) return
      
      try {
        // 提取标签名称数组
        const tagNames = this.researchTags.map(t => t.name || t)
        
        let response
        if (tagNames.length === 0) {
          response = await profileAPI.clearResearchTags()
        } else {
          response = await profileAPI.updateResearchTags(tagNames)
        }
        if (response && response.code === 200) {
          // 更新成功后，重新加载标签
          await this.loadResearchTags()
          this.showSuccessToast(tagNames.length === 0 ? '研究方向标签已清空' : '研究方向标签已更新')
        } else {
          throw new Error(response?.msg || '更新失败')
        }
      } catch (error) {
        console.error('保存研究方向标签失败:', error)
        alert('保存失败: ' + (error.msg || error.message || '请稍后重试'))
      }
    },
    
    // ===== OAuth2账号绑定相关方法 =====
    
    /**
     * 脱敏显示账号信息
     * @param {String} account - 账号（ID或用户名）
     * @param {String} type - 类型（github/orcid）
     * @returns {String} 脱敏后的账号
     */
    maskAccount(account, type) {
      if (!account) return ''
      
      if (type === 'github') {
        // GitHub用户名：显示前3位，中间用*替代，保留后2位
        if (account.length <= 5) {
          return account.charAt(0) + '*'.repeat(account.length - 1)
        }
        const start = account.substring(0, 3)
        const end = account.substring(account.length - 2)
        return start + '*'.repeat(Math.max(account.length - 5, 2)) + end
      } else if (type === 'orcid') {
        // ORCID ID格式：0000-0002-1825-0097，显示前4位和后4位，中间用*替代
        const parts = account.split('-')
        if (parts.length === 4) {
          return `${parts[0]}-****-****-${parts[3]}`
        }
        // 如果不是标准格式，显示前4位和后4位
        if (account.length <= 8) {
          return account.charAt(0) + '*'.repeat(account.length - 1)
        }
        const start = account.substring(0, 4)
        const end = account.substring(account.length - 4)
        return start + '*'.repeat(account.length - 8) + end
      }
      
      // 默认脱敏：显示前3位和后2位
      if (account.length <= 4) {
        return '*'.repeat(account.length)
      }
      const start = account.substring(0, 3)
      const end = account.substring(account.length - 2)
      return start + '*'.repeat(account.length - 4) + end
    },

    /**
     * 显示绑定提示弹窗
     * @param {String} provider - 提供商名称
     */
    showBindModal(provider) {
      const providerName = provider === 'github' ? 'GitHub' : 'ORCID'
      const message = `绑定${providerName}账号需要您退出当前登录，然后使用${providerName}账号登录。\n\n绑定成功后，您可以使用${providerName}账号直接登录本平台。\n\n是否继续？`
      
      if (confirm(message)) {
        // 退出登录
        this.logout()
      }
    },

    async handleGithubBind() {
      // 如果已绑定，显示解绑确认
      if (this.userInfo.githubId) {
        this.showUnbindModal('github')
        return
      }
      
      // 未绑定，显示绑定提示
      this.showBindModal('github')
    },

    async handleOrcidBind() {
      // 如果已绑定，显示解绑确认
      if (this.userInfo.orcidId) {
        this.showUnbindModal('orcid')
        return
      }
      
      // 未绑定，显示绑定提示
      this.showBindModal('orcid')
    },

    /**
     * 显示解绑确认弹窗
     * @param {String} provider - 提供商名称
     */
    showUnbindModal(provider) {
      const providerName = provider === 'github' ? 'GitHub' : 'ORCID'
      const account = provider === 'github' 
        ? (this.userInfo.githubUsername || this.userInfo.githubId)
        : this.userInfo.orcidId
      const maskedAccount = this.maskAccount(account, provider)
      
      const message = `确定要解绑${providerName}账号吗？\n\n已绑定账号：${maskedAccount}\n\n解绑后，您将无法使用${providerName}账号登录本平台。`
      
      if (confirm(message)) {
        this.unbindOAuth2Account(provider)
      }
    },

    /**
     * 解绑OAuth2账号
     * @param {String} provider - 提供商名称
     */
    async unbindOAuth2Account(provider) {
      try {
        console.log('🔓 开始解绑OAuth2账号, provider:', provider)
        
        const response = await authAPI.unbindOAuth2Account(provider)
        
        if (response.code === 200) {
          console.log('✅ 解绑成功')
          
          // 更新本地用户信息
          if (provider === 'github') {
            this.userInfo.githubId = null
            this.userInfo.githubUsername = null
          } else if (provider === 'orcid') {
            this.userInfo.orcidId = null
            this.userInfo.orcidBound = false
          }
          
          // 更新localStorage
          const savedUserInfo = localStorage.getItem('user_info')
          if (savedUserInfo) {
            try {
              const userData = JSON.parse(savedUserInfo)
              if (provider === 'github') {
                userData.githubId = null
                userData.githubUsername = null
              } else if (provider === 'orcid') {
                userData.orcidId = null
                userData.orcidBound = false
              }
              localStorage.setItem('user_info', JSON.stringify(userData))
            } catch (error) {
              console.error('更新localStorage失败:', error)
            }
          }
          
          // 触发全局更新事件
          this.$root.$emit('userInfoUpdated')
          
          this.showSuccessToast(`${provider === 'github' ? 'GitHub' : 'ORCID'}账号解绑成功`)
        } else {
          throw new Error(response.msg || '解绑失败')
        }
      } catch (error) {
        console.error('❌ 解绑失败:', error)
        alert('解绑失败：' + (error.message || error.msg || '网络错误'))
      }
    },

    // ===== 关联链接相关方法 =====
    async loadMyProfileLinks() {
      if (!this.isLoggedIn) return
      try {
        const response = await profileAPI.getMyProfileLinks()
        if (response && response.code === 200 && Array.isArray(response.data)) {
          this.profileLinks = response.data
        } else {
          this.profileLinks = []
        }
        this.showAddLinkRow = false
      } catch (error) {
        console.error('加载关联链接失败:', error)
        this.profileLinks = []
        this.showAddLinkRow = false
      }
    },

    async loadUserProfileLinks(userId) {
      try {
        const response = await profileAPI.getUserProfileLinks(userId)
        if (response && response.code === 200 && Array.isArray(response.data)) {
          this.profileLinks = response.data
        } else {
          this.profileLinks = []
        }
        this.showAddLinkRow = false
      } catch (error) {
        console.error('加载用户关联链接失败:', error)
        this.profileLinks = []
        this.showAddLinkRow = false
      }
    },

    async saveProfileLinks(nextLinks = this.profileLinks) {
      if (!this.isLoggedIn || !this.isViewingSelf) return
      this.isSavingLinks = true
      try {
        const response = await profileAPI.updateProfileLinks(nextLinks)
        if (response && response.code === 200) {
          this.profileLinks = Array.isArray(response.data) ? response.data : nextLinks
          this.showSuccessToast('关联链接已更新')
          this.showAddLinkRow = false
        } else {
          throw new Error(response?.msg || '更新失败')
        }
      } catch (error) {
        console.error('保存关联链接失败:', error)
        alert('保存失败: ' + (error.msg || error.message || '请稍后重试'))
      } finally {
        this.isSavingLinks = false
      }
    },

    async addProfileLink() {
      if (!this.isLoggedIn || !this.isViewingSelf) return
      if (!this.canAddMoreLinks) {
        alert('关联链接最多6个')
        return
      }

      const url = (this.newProfileLink.url || '').trim()
      let label = (this.newProfileLink.label || '').trim()

      if (!url) {
        alert('请填写链接地址')
        return
      }
      if (!/^https?:\/\//i.test(url)) {
        alert('链接需以 http 或 https 开头')
        return
      }

      if (!label) {
        label = url
      }

      const nextLinks = [...this.profileLinks, { label, url }]
      await this.saveProfileLinks(nextLinks)
      this.newProfileLink = { label: '', url: '' }
      this.showAddLinkRow = false
    },

    async removeProfileLink(index) {
      if (!this.isLoggedIn || !this.isViewingSelf) return
      const nextLinks = this.profileLinks.filter((_, i) => i !== index)
      await this.saveProfileLinks(nextLinks)
    },
    
    // ===== 学术成果关联相关方法 =====
    async mapAchievementsList(sourceList) {
      // 统一的成果映射与补全逻辑，供本人和他人复用
      if (!Array.isArray(sourceList) || sourceList.length === 0) return []

      const mapped = await Promise.all(sourceList.map(async item => {
        let title = item.achievementTitle || item.title
        let type = TYPE_DISPLAY[item.achievementType] || TYPE_DISPLAY[item.type] || item.achievementType || item.type || '未知类型'
        let date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN') : ''

        // 如果后端没有返回标题/类型，则调用知识库接口补充信息
        if (!title || title === '未命名成果' || title === '未知标题') {
          try {
            const detailResp = await knowledgeAPI.getAchievementDetail(item.achievementId)
            if (detailResp && detailResp.code === 200 && detailResp.data) {
              title = detailResp.data.title || title
              type = TYPE_DISPLAY[detailResp.data.type] || detailResp.data.type || type
              if (detailResp.data.createdAt) {
                date = new Date(detailResp.data.createdAt).toLocaleDateString('zh-CN')
              }
            }
          } catch (error) {
            console.warn('获取成果详情失败:', item.achievementId, error)
          }
        }

        return {
          id: item.achievementId,
          achievementId: item.achievementId,
          title: title || '未命名成果',
          type,
          date,
          projectId: item.projectId,
          displayOrder: item.displayOrder || 0,
          remark: item.remark || ''
        }
      }))

      return mapped
    },

    async loadLinkedAchievements() {
      if (!this.isLoggedIn) return
      
      try {
        const response = await profileAPI.getMyAchievements()
        if (response && response.code === 200 && response.data) {
          this.linkedAchievements = await this.mapAchievementsList(response.data)
        } else {
          this.linkedAchievements = []
        }
      } catch (error) {
        console.error('加载已关联成果失败:', error)
        this.linkedAchievements = []
      }
    },
    
    async loadUserProjects() {
      if (!this.isLoggedIn) return
      
      try {
        const response = await projectAPI.getMyProjects(0, 100) // 获取前100个项目
        if (response && response.code === 200 && response.data) {
          // 转换分页数据格式
          const projectList = response.data.content || response.data
          this.userProjects = projectList.map(project => ({
            id: project.id,
            name: project.name || '未命名项目'
          }))
        } else {
          this.userProjects = []
        }
      } catch (error) {
        console.error('加载用户项目失败:', error)
        this.userProjects = []
      }
    },
    
    async loadProjectAchievements() {
      if (!this.isLoggedIn) return
      
      this.isLoadingAchievements = true
      try {
        let allAchievements = []
        
        if (this.selectedProjectFilter) {
          // 加载指定项目的成果
          const response = await knowledgeAPI.getProjectAchievements(
            this.selectedProjectFilter,
            0,
            100
          )
          if (response && response.code === 200 && response.data) {
            const achievementList = response.data.content || response.data
            allAchievements = achievementList.map(achievement => ({
              id: achievement.id,
              achievementId: achievement.id,
              title: achievement.title || '未命名成果',
              type: TYPE_DISPLAY[achievement.type] || achievement.type || '未知类型',
              projectName: achievement.projectName || '未知项目',
              date: achievement.createdAt ? new Date(achievement.createdAt).toLocaleDateString('zh-CN') : '',
              projectId: achievement.projectId,
              isPublic: achievement.isPublic,
              status: achievement.status
            }))
          }
        } else {
          // 加载所有项目中的成果（后台已根据权限过滤）
          for (const project of this.userProjects) {
            try {
              const response = await knowledgeAPI.getProjectAchievements(project.id, 0, 100)
              if (response && response.code === 200 && response.data) {
                const achievementList = response.data.content || response.data
                const projectAchievements = achievementList.map(achievement => ({
                  id: achievement.id,
                  achievementId: achievement.id,
                  title: achievement.title || '未命名成果',
                  type: TYPE_DISPLAY[achievement.type] || achievement.type || '未知类型',
                  projectName: project.name,
                  date: achievement.createdAt ? new Date(achievement.createdAt).toLocaleDateString('zh-CN') : '',
                  projectId: project.id,
                  isPublic: achievement.isPublic,
                  status: achievement.status
                }))
                allAchievements = allAchievements.concat(projectAchievements)
              }
            } catch (error) {
              console.error(`加载项目[${project.id}]成果失败:`, error)
            }
          }
        }
        
        // 应用搜索过滤
        if (this.achievementSearchKeyword) {
          const keyword = this.achievementSearchKeyword.toLowerCase()
          allAchievements = allAchievements.filter(achievement =>
            achievement.title.toLowerCase().includes(keyword)
          )
        }
        
        this.availableAchievements = allAchievements
      } catch (error) {
        console.error('加载项目成果失败:', error)
        this.availableAchievements = []
      } finally {
        this.isLoadingAchievements = false
      }
    },
    
    searchAchievements() {
      // 重新加载成果列表，会自动应用搜索过滤
      this.loadProjectAchievements()
    },
    
    isAchievementLinked(achievementId) {
      return this.linkedAchievements.some(a => a.achievementId === String(achievementId) || a.id === String(achievementId))
    },

    isAchievementSelected(achievementId) {
      const idStr = String(achievementId)
      return this.selectedAchievementIds.includes(idStr)
    },
    
    toggleAchievementLink(achievement) {
      // 在弹窗内仅切换前端选中状态，不立刻调用后端
      const idStr = String(achievement.achievementId || achievement.id)
      const index = this.selectedAchievementIds.indexOf(idStr)
      if (index > -1) {
        this.selectedAchievementIds.splice(index, 1)
      } else {
        this.selectedAchievementIds.push(idStr)
      }
    },
    
    async unlinkAchievement(achievementId) {
      try {
        await profileAPI.unlinkAchievement(achievementId)
        // 重新加载关联列表
        await this.loadLinkedAchievements()
        this.showSuccessToast('已取消关联')
      } catch (error) {
        console.error('取消关联成果失败:', error)
        alert('取消关联失败: ' + (error.msg || error.message || '请稍后重试'))
      }
    },
    
    async saveAchievementLinks() {
      if (!this.isLoggedIn) {
        this.showAchievementModal = false
        return
      }

      try {
        const currentIds = this.linkedAchievements.map(a => String(a.achievementId || a.id))
        const selectedSet = new Set(this.selectedAchievementIds)

        // 需要取消关联的：原来有，现在没选中
        const toUnlink = currentIds.filter(id => !selectedSet.has(id))

        // 需要新关联的：现在选中，但原来没有
        const toLink = this.selectedAchievementIds.filter(id => !currentIds.includes(id))

        // 先处理取消关联
        for (const id of toUnlink) {
          try {
            await profileAPI.unlinkAchievement(id)
          } catch (error) {
            console.error('取消关联失败:', id, error)
          }
        }

        // 再处理新增关联
        for (const id of toLink) {
          const achievement = this.availableAchievements.find(a => String(a.achievementId || a.id) === id)
          if (!achievement) continue
          try {
            await profileAPI.linkAchievement({
              achievementId: achievement.achievementId || achievement.id,
              projectId: achievement.projectId,
              displayOrder: this.linkedAchievements.length + 1
            })
          } catch (error) {
            console.error('关联成果失败:', id, error)
          }
        }

        // 重新加载已关联列表并关闭弹窗
        await this.loadLinkedAchievements()
        this.showAchievementModal = false
        this.showSuccessToast('学术成果关联已更新')
      } catch (error) {
        console.error('保存成果关联失败:', error)
        alert('保存失败: ' + (error.msg || error.message || '请稍后重试'))
      }
    },
    
    // ===== 隐私设置相关方法 =====
    async loadPrivacySettings() {
      if (!this.isLoggedIn) return
      
      try {
        // TODO: 调用后端API加载隐私设置
        // const response = await profileAPI.getPrivacySettings()
        // this.privacySettings = response.data || this.privacySettings
        
        // 从localStorage加载（模拟）
        const saved = localStorage.getItem('profile_privacy_settings')
        if (saved) {
          this.privacySettings = JSON.parse(saved)
        }
      } catch (error) {
        console.error('加载隐私设置失败:', error)
      }
    },
    
    async savePrivacySettings() {
      if (!this.isLoggedIn) return
      
      try {
        // TODO: 调用后端API保存隐私设置
        // const response = await profileAPI.updatePrivacySettings(this.privacySettings)
        
        // 保存到localStorage（模拟）
        localStorage.setItem('profile_privacy_settings', JSON.stringify(this.privacySettings))
        
        this.showSuccessToast('隐私设置已更新')
      } catch (error) {
        console.error('保存隐私设置失败:', error)
        alert('保存失败，请稍后重试')
      }
    },

    // ===== 2FA双因素认证相关方法 =====
    async load2FAStatus() {
      if (!this.isLoggedIn || !this.isViewingSelf) return
      
      try {
        // 优先从后端获取最新状态（确保数据准确）
        try {
          const response = await authAPI.getCurrentUserInfo()
          console.log('获取2FA状态 - 后端响应:', response)
          console.log('获取2FA状态 - response.data:', response?.data)
          console.log('获取2FA状态 - response.data.twoFactorEnabled:', response?.data?.twoFactorEnabled)
          if (response && response.code === 200 && response.data) {
            const twoFactorEnabled = Boolean(response.data.twoFactorEnabled)
            this.twoFactorEnabled = twoFactorEnabled
            console.log('✅ 从后端获取2FA状态:', twoFactorEnabled, '(原始值:', response.data.twoFactorEnabled, ')')
            
            // 更新localStorage中的2FA状态
            const savedUserInfo = localStorage.getItem('user_info')
            if (savedUserInfo) {
              try {
                const userData = JSON.parse(savedUserInfo)
                userData.twoFactorEnabled = twoFactorEnabled
                localStorage.setItem('user_info', JSON.stringify(userData))
                console.log('✅ 已更新localStorage中的2FA状态:', twoFactorEnabled)
              } catch (e) {
                console.error('更新localStorage中的2FA状态失败:', e)
              }
            }
            return
          }
        } catch (error) {
          console.warn('从后端获取2FA状态失败，使用本地缓存:', error)
        }
        
        // 如果后端获取失败，从localStorage读取
        const savedUserInfo = localStorage.getItem('user_info')
        if (savedUserInfo) {
          try {
            const userData = JSON.parse(savedUserInfo)
            this.twoFactorEnabled = Boolean(userData.twoFactorEnabled)
            console.log('从localStorage读取2FA状态:', this.twoFactorEnabled)
          } catch (e) {
            console.error('解析localStorage用户信息失败:', e)
            this.twoFactorEnabled = false
          }
        } else {
          this.twoFactorEnabled = false
        }
      } catch (error) {
        console.error('加载2FA状态失败:', error)
        this.twoFactorEnabled = false
      }
    },

    async handleEnable2FA() {
      if (!this.isLoggedIn || !this.isViewingSelf) return
      
      this.twoFactorLoading = true
      try {
        const response = await authAPI.enableTwoFactorAuth()
        console.log('启用2FA完整响应:', JSON.stringify(response, null, 2))
        
        if (response && response.code === 200 && response.data) {
          // 处理base64数据，确保有正确的前缀
          let qrCodeBase64 = response.data.qrCodeBase64
          
          console.log('原始二维码数据:', {
            exists: !!qrCodeBase64,
            type: typeof qrCodeBase64,
            length: qrCodeBase64 ? qrCodeBase64.length : 0,
            startsWithData: qrCodeBase64 ? qrCodeBase64.startsWith('data:') : false,
            preview: qrCodeBase64 ? qrCodeBase64.substring(0, 50) + '...' : 'null'
          })
          
          if (qrCodeBase64) {
            // 如果base64字符串不包含data URL前缀，则添加
            if (!qrCodeBase64.startsWith('data:')) {
              qrCodeBase64 = 'data:image/png;base64,' + qrCodeBase64
              console.log('已添加data URL前缀')
            }
            
            // 验证base64字符串格式
            if (!qrCodeBase64.startsWith('data:image/')) {
              console.error('二维码数据格式不正确:', qrCodeBase64.substring(0, 100))
              throw new Error('二维码数据格式不正确')
            }
            
            this.twoFactorQRCode = qrCodeBase64
            console.log('✅ 二维码数据已设置，最终格式:', qrCodeBase64.substring(0, 50) + '...')
          } else {
            console.error('后端未返回二维码数据，响应数据:', response.data)
            throw new Error('后端未返回二维码数据')
          }
          
          this.show2FAEnableModal = true
          this.twoFactorCode = ''
          this.twoFactorConfirming = false
          
          // 聚焦到验证码输入框
          this.$nextTick(() => {
            if (this.$refs.twoFactorCodeInput) {
              this.$refs.twoFactorCodeInput.focus()
            }
          })
        } else {
          console.error('启用2FA响应格式错误:', response)
          throw new Error(response?.msg || '启用2FA失败')
        }
      } catch (error) {
        console.error('启用2FA失败:', error)
        alert('启用2FA失败: ' + (error.msg || error.message || '请稍后重试'))
      } finally {
        this.twoFactorLoading = false
      }
    },

    async confirmEnable2FA() {
      if (!this.twoFactorCode || this.twoFactorCode.length !== 6) {
        alert('请输入6位验证码')
        return
      }
      
      this.twoFactorLoading = true
      this.twoFactorConfirming = true
      try {
        const response = await authAPI.confirmEnableTwoFactorAuth(this.twoFactorCode)
        if (response && response.code === 200) {
          this.twoFactorEnabled = true
          this.show2FAEnableModal = false
          this.twoFactorQRCode = null
          this.twoFactorCode = ''
          this.twoFactorConfirming = false
          
          // 更新本地用户信息
          const savedUserInfo = localStorage.getItem('user_info')
          if (savedUserInfo) {
            try {
              const userData = JSON.parse(savedUserInfo)
              userData.twoFactorEnabled = true
              localStorage.setItem('user_info', JSON.stringify(userData))
              console.log('✅ 已更新localStorage中的2FA状态为启用')
            } catch (error) {
              console.error('更新user_info失败:', error)
            }
          }
          
          // 重新从后端获取最新状态，确保数据同步
          await this.load2FAStatus()
          
          this.showSuccessToast('2FA已成功启用')
        } else {
          throw new Error(response.msg || '确认启用2FA失败')
        }
      } catch (error) {
        console.error('确认启用2FA失败:', error)
        alert('验证码错误或已过期，请重新输入')
        this.twoFactorCode = ''
        if (this.$refs.twoFactorCodeInput) {
          this.$refs.twoFactorCodeInput.focus()
        }
      } finally {
        this.twoFactorLoading = false
        this.twoFactorConfirming = false
      }
    },

    handleDisable2FA() {
      if (!this.isLoggedIn || !this.isViewingSelf) return
      
      this.show2FADisableModal = true
      this.twoFactorDisableCode = ''
      this.$nextTick(() => {
        if (this.$refs.twoFactorDisableCodeInput) {
          this.$refs.twoFactorDisableCodeInput.focus()
        }
      })
    },

    async confirmDisable2FA() {
      if (!this.twoFactorDisableCode || this.twoFactorDisableCode.length !== 6) {
        alert('请输入6位验证码')
        return
      }
      
      this.twoFactorLoading = true
      try {
        const response = await authAPI.disableTwoFactorAuth(this.twoFactorDisableCode)
        if (response && response.code === 200) {
          this.twoFactorEnabled = false
          this.show2FADisableModal = false
          this.twoFactorDisableCode = ''
          
          // 更新本地用户信息
          const savedUserInfo = localStorage.getItem('user_info')
          if (savedUserInfo) {
            try {
              const userData = JSON.parse(savedUserInfo)
              userData.twoFactorEnabled = false
              localStorage.setItem('user_info', JSON.stringify(userData))
              console.log('✅ 已更新localStorage中的2FA状态为禁用')
            } catch (error) {
              console.error('更新user_info失败:', error)
            }
          }
          
          // 重新从后端获取最新状态，确保数据同步
          await this.load2FAStatus()
          
          this.showSuccessToast('2FA已成功禁用')
        } else {
          throw new Error(response.msg || '禁用2FA失败')
        }
      } catch (error) {
        console.error('禁用2FA失败:', error)
        alert('验证码错误或已过期，请重新输入')
        this.twoFactorDisableCode = ''
        if (this.$refs.twoFactorDisableCodeInput) {
          this.$refs.twoFactorDisableCodeInput.focus()
        }
      } finally {
        this.twoFactorLoading = false
      }
    },

    close2FAEnableModal() {
      this.show2FAEnableModal = false
      this.twoFactorQRCode = null
      this.twoFactorCode = ''
      this.twoFactorConfirming = false
    },

    close2FADisableModal() {
      this.show2FADisableModal = false
      this.twoFactorDisableCode = ''
    },

    handleQRCodeImageError(event) {
      console.error('二维码图片加载失败:', event)
      console.error('图片src:', event.target?.src?.substring(0, 100))
      alert('二维码图片加载失败，请刷新页面重试')
    },

    handleQRCodeImageLoad(event) {
      console.log('✅ 二维码图片加载成功')
    }
  }
}
</script>

