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
        <span class="page-title">个人信息</span>
      </div>
     </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="profile-content">
        <!-- 个人信息标题 -->
        <h1 class="profile-title">个人信息</h1>
        
        <!-- 两栏布局容器 -->
        <div class="profile-grid">
          <!-- 左侧栏：基础信息 -->
          <div class="profile-left-column">
            <!-- 头像和昵称卡片 -->
            <div class="info-card">
          <div class="avatar-section">
            <div class="avatar-container" @click="triggerAvatarUpload">
              <img v-if="userInfo.avatar" :src="avatarUrlWithTimestamp" alt="用户头像" class="avatar-image" />
            <div v-else class="avatar-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
              <div class="camera-icon">
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
                <button @click="editNickname" class="edit-nickname-btn">
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
            <h3 class="info-label">邮箱地址</h3>
            <p class="info-value">{{ userInfo.email }}</p>
          </div>
        </div>

        <!-- 机构信息卡片 -->
        <div class="info-card">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">所属机构</h3>
              <button v-if="!editingOrganization && isLoggedIn" @click="editOrganization" class="edit-btn">
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

        <!-- 个人简介卡片 -->
        <div class="info-card">
          <div class="info-item">
            <div class="intro-header">
              <h3 class="info-label">个人简介</h3>
              <button v-if="!editingIntro && isLoggedIn" @click="editIntro" class="edit-btn">
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
            <p v-else class="info-value intro-content">{{ userInfo.introduction }}</p>
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
              <button @click="showTagModal = true" class="edit-btn">
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
                  <button @click="removeTag(index)" class="tag-remove-btn" title="移除标签">
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
              <button @click="showAchievementModal = true" class="edit-btn">
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
              <div v-else class="achievements-list">
                <div v-for="achievement in linkedAchievements" :key="achievement.achievementId || achievement.id" class="achievement-item">
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
                  <button @click="unlinkAchievement(achievement.achievementId || achievement.id)" class="achievement-remove-btn" title="取消关联">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
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
        <div class="modal-body">
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
          
          <!-- 已选标签 -->
          <div v-if="researchTags.length > 0" class="selected-tags-section">
            <h4>已选标签</h4>
            <div class="selected-tags-list">
              <div v-for="tag in researchTags" :key="tag.id" class="selected-tag">
                <span>{{ tag.name }}</span>
                <button @click="removeTag(tag.id)" class="selected-tag-remove">
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
            <select v-model="selectedProjectFilter" @change="loadProjectAchievements" class="project-filter-select">
              <option value="">全部项目</option>
              <option v-for="project in userProjects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
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
                :class="{ selected: isAchievementLinked(achievement.achievementId || achievement.id) }"
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
                <div v-if="isAchievementLinked(achievement.achievementId || achievement.id)" class="achievement-checkmark">
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

    <!-- 隐藏的文件上传输入 -->
    <input 
      ref="avatarUpload" 
      type="file" 
      accept="image/*" 
      @change="handleAvatarUpload" 
      style="display: none"
    />
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
      // 隐私设置
      privacySettings: {
        profileVisibility: 'public',
        tagsVisibility: 'public',
        achievementsVisibility: 'public'
      }
    }
  },
  computed: {
    avatarUrlWithTimestamp() {
      return addTimestampToUrl(this.userInfo.avatar)
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
    this.loadResearchTags()
    this.loadLinkedAchievements()
    this.loadPrivacySettings()
    this.loadPresetTags()
    this.loadUserProjects()
    document.addEventListener('click', this.handleClickOutside)
    // 监听用户信息更新事件
    this.$root.$on('userInfoUpdated', this.loadUserInfo)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleClickOutside)
    this.$root.$off('userInfoUpdated', this.loadUserInfo)
  },
  methods: {
    loadUserInfo() {
      // 检查用户是否已登录
      const token = localStorage.getItem('access_token')
      const savedUserInfo = localStorage.getItem('user_info')
      this.isLoggedIn = !!(token && savedUserInfo)
      
      if (this.isLoggedIn && savedUserInfo) {
        try {
          const userData = JSON.parse(savedUserInfo)
          this.userInfo = {
            id: userData.id || userData.userId,
            username: userData.username || userData.name || '',
            email: userData.email || '',
            nickname: userData.nickname || userData.name || '未设置昵称',
            avatar: userData.avatar || '',
            organization: userData.organization || userData.institution || '未设置机构',
            introduction: userData.introduction || '这个人很懒，什么都没有留下...',
            role: userData.role || 'MEMBER',
            status: userData.status || 'ACTIVE'
          }
          console.log('加载用户信息:', this.userInfo)
        } catch (error) {
          console.error('解析用户信息失败:', error)
          this.isLoggedIn = false
        }
      } else {
        // 游客模式
        this.isLoggedIn = false
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
      }
    },
    loadUserAvatar() {
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) {
        this.userAvatar = savedAvatar
      }
    },
    handleClickOutside(event) {
      if (!event.target.closest('.user-profile') && !event.target.closest('.user-menu')) {
        this.userMenuOpen = false
      }
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
      this.$router.push('/login')
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
      this.tempIntro = this.userInfo.introduction
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
      if (trimmedIntro === this.userInfo.introduction) {
        this.editingIntro = false
        return
      }
      
      try {
        // 调用后端API更新个人简介（后端字段为title）
        const response = await authAPI.updateUserInfo({
          title: trimmedIntro
        })
        
        if (response && response.code === 200) {
          // 更新成功
          this.userInfo.introduction = trimmedIntro
          this.editingIntro = false
          
          // 更新user_info中的简介信息
          const savedUserInfo = localStorage.getItem('user_info')
          if (savedUserInfo) {
            try {
              const userData = JSON.parse(savedUserInfo)
              userData.introduction = trimmedIntro
              localStorage.setItem('user_info', JSON.stringify(userData))
              console.log('个人简介已更新到user_info')
            } catch (error) {
              console.error('更新user_info简介失败:', error)
            }
          }
          
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
        this.tempIntro = this.userInfo.introduction
      }
    },
    cancelEditIntro() {
      this.tempIntro = this.userInfo.introduction
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
          { id: 1, name: '人工智能', parentId: null, hasChildren: true },
          { id: 2, name: '机器学习', parentId: 1, hasChildren: true },
          { id: 3, name: '深度学习', parentId: 2, hasChildren: true },
          { id: 4, name: '自然语言处理', parentId: 1, hasChildren: true },
          { id: 5, name: '计算机视觉', parentId: 1, hasChildren: true },
          { id: 6, name: '大模型', parentId: 3, hasChildren: false },
          { id: 7, name: 'CNN', parentId: 3, hasChildren: false },
          { id: 8, name: 'Transformer', parentId: 4, hasChildren: false },
          { id: 9, name: '量子计算', parentId: null, hasChildren: true },
          { id: 10, name: '生物信息学', parentId: null, hasChildren: false }
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
        
        const response = await profileAPI.updateResearchTags(tagNames)
        if (response && response.code === 200) {
          // 更新成功后，重新加载标签
          await this.loadResearchTags()
          this.showSuccessToast('研究方向标签已更新')
        } else {
          throw new Error(response?.msg || '更新失败')
        }
      } catch (error) {
        console.error('保存研究方向标签失败:', error)
        alert('保存失败: ' + (error.msg || error.message || '请稍后重试'))
      }
    },
    
    // ===== 学术成果关联相关方法 =====
    async loadLinkedAchievements() {
      if (!this.isLoggedIn) return
      
      try {
        const response = await profileAPI.getMyAchievements()
        if (response && response.code === 200 && response.data) {
          // 转换后端数据格式为前端需要的格式
          this.linkedAchievements = response.data.map(item => ({
            id: item.achievementId,
            achievementId: item.achievementId,
            title: item.achievementTitle || '未命名成果',
            type: TYPE_DISPLAY[item.achievementType] || item.achievementType || '未知类型',
            date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('zh-CN') : '',
            projectId: item.projectId,
            displayOrder: item.displayOrder || 0,
            remark: item.remark || ''
          }))
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
            allAchievements = achievementList
              .filter(achievement => achievement.isPublic === true && achievement.status === 'published')
              .map(achievement => ({
                id: achievement.id,
                achievementId: achievement.id,
                title: achievement.title || '未命名成果',
                type: TYPE_DISPLAY[achievement.type] || achievement.type || '未知类型',
                projectName: achievement.projectName || '未知项目',
                date: achievement.createdAt ? new Date(achievement.createdAt).toLocaleDateString('zh-CN') : '',
                projectId: achievement.projectId
              }))
          }
        } else {
          // 加载所有项目中的公开成果
          for (const project of this.userProjects) {
            try {
              const response = await knowledgeAPI.getProjectAchievements(project.id, 0, 100)
              if (response && response.code === 200 && response.data) {
                const achievementList = response.data.content || response.data
                const publicAchievements = achievementList
                  .filter(achievement => achievement.isPublic === true && achievement.status === 'published')
                  .map(achievement => ({
                    id: achievement.id,
                    achievementId: achievement.id,
                    title: achievement.title || '未命名成果',
                    type: TYPE_DISPLAY[achievement.type] || achievement.type || '未知类型',
                    projectName: project.name,
                    date: achievement.createdAt ? new Date(achievement.createdAt).toLocaleDateString('zh-CN') : '',
                    projectId: project.id
                  }))
                allAchievements = allAchievements.concat(publicAchievements)
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
    
    async toggleAchievementLink(achievement) {
      const achievementId = achievement.achievementId || achievement.id
      const isLinked = this.isAchievementLinked(achievementId)
      
      try {
        if (isLinked) {
          // 取消关联
          await profileAPI.unlinkAchievement(achievementId)
          this.linkedAchievements = this.linkedAchievements.filter(
            a => a.achievementId !== String(achievementId) && a.id !== String(achievementId)
          )
          this.showSuccessToast('已取消关联')
        } else {
          // 关联成果
          const response = await profileAPI.linkAchievement({
            achievementId: achievementId,
            projectId: achievement.projectId,
            displayOrder: this.linkedAchievements.length + 1
          })
          if (response && response.code === 200) {
            // 重新加载关联列表
            await this.loadLinkedAchievements()
            this.showSuccessToast('已关联成果')
          } else {
            throw new Error(response?.msg || '关联失败')
          }
        }
      } catch (error) {
        console.error('切换成果关联状态失败:', error)
        alert('操作失败: ' + (error.msg || error.message || '请稍后重试'))
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
      // 这个方法现在不需要了，因为toggleAchievementLink已经实时保存
      // 保留用于兼容性
      this.showAchievementModal = false
      this.showSuccessToast('学术成果关联已更新')
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
    }
  }
}
</script>

