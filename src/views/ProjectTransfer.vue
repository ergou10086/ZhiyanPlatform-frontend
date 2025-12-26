<template>
  <div class="project-transfer-container">
    <div class="top-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack" aria-label="返回个人信息">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <span class="page-title">注销前项目移交</span>
      </div>
    </div>

    <div class="main-content">
      <div class="content-card">
        <h1 class="page-main-title">注销前的项目移交</h1>
        <p class="page-desc">
          为了避免项目无人负责，在注销账号前，请先为你创建的项目选择新的负责人。
        </p>
        <ul class="hint-list">
          <li>仅展示由你创建的项目。</li>
          <li>每个项目请选择一名项目成员作为新的负责人。</li>
          <li>仅你一个人的项目将会在你注销账号时一并删除，请提前备份关键数据和文件。</li>
        </ul>
      </div>

      <div class="content-card" v-if="isLoading">
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载你创建的项目...</p>
        </div>
      </div>

      <div class="content-card" v-else>
        <div v-if="projects.length === 0" class="empty-state">
          <h2>当前没有你创建的项目</h2>
          <p>你可以直接返回个人信息页面继续注销账号。</p>
          <button class="primary-btn" @click="goToProfile">返回个人信息</button>
        </div>

        <div v-else class="projects-section">
          <div class="projects-header">
            <h2>我创建的项目 ({{ projects.length }})</h2>
            <p class="projects-summary">
              需要移交的项目：<strong>{{ transferableProjectCount }}</strong> 个，
              已选择新的负责人：<strong>{{ selectedTransferCount }}</strong> / {{ transferableProjectCount }} 个。
            </p>
          </div>

          <div class="project-list">
            <div
              v-for="project in projects"
              :key="project.id"
              class="project-item"
            >
              <div class="project-main">
                <h3 class="project-title">{{ project.title || '未命名项目' }}</h3>
                <p class="project-desc">{{ project.description || '暂无项目简介' }}</p>
                <div class="project-meta">
                  <span class="meta-item">项目ID：{{ project.id }}</span>
                  <span class="meta-item" v-if="projectStatusDisplay(project.status)">
                    状态：<span class="status-badge">{{ projectStatusDisplay(project.status) }}</span>
                  </span>
                  <span class="meta-item" v-if="memberMeta[project.id] && memberMeta[project.id].memberCount !== null">
                    成员数：{{ memberMeta[project.id].memberCount }}
                  </span>
                </div>

                <p
                  v-if="memberMeta[project.id] && memberMeta[project.id].onlySelf"
                  class="single-member-warning"
                >
                  该项目目前只有你一名成员。若不再邀请他人并移交，在你注销账号时，该项目将被一并清除，请提前备份关键数据和文件。
                </p>
              </div>

              <div class="project-actions">
                <button
                  class="secondary-btn"
                  @click="openMemberDialog(project)"
                  :disabled="loadingMembers[project.id]"
                >
                  <span v-if="!loadingMembers[project.id]">
                    {{ memberMeta[project.id] && memberMeta[project.id].hasCandidates ? '查看并选择移交对象' : '查看成员' }}
                  </span>
                  <span v-else>加载成员中...</span>
                </button>

                <div v-if="selectedTargets[project.id] && memberMeta[project.id] && memberMeta[project.id].hasCandidates" class="selected-target">
                  已选择移交给：
                  <strong>{{ displaySelectedTargetName(project.id) }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-actions">
            <button class="secondary-btn" @click="goBack">返回个人信息</button>
            <button
              class="primary-btn"
              :disabled="transferableProjectCount > 0 && selectedTransferCount < transferableProjectCount || submitting"
              @click="submitTransferAndLogout"
            >
              <span v-if="!submitting">批量移交并继续注销</span>
              <span v-else>正在执行移交...</span>
            </button>
          </div>
        </div>
      </div>

      <div v-if="showMemberModal" class="modal-overlay" @click.self="closeMemberDialog">
        <div class="modal-content">
          <div class="modal-header">
            <h3>选择新的项目负责人</h3>
            <button class="modal-close" @click="closeMemberDialog">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p v-if="activeProject" class="modal-project-title">
              当前项目：<strong>{{ activeProject.title || '未命名项目' }}</strong>
            </p>

            <div v-if="activeProject && memberMeta[activeProject.id] && memberMeta[activeProject.id].onlySelf" class="modal-warning">
              <p>
                该项目目前只有你一名成员，暂时无法移交给其他人。你可以选择邀请更多成员加入项目，或在确认无保留需求后直接进行账号注销。
              </p>
            </div>

            <div v-else-if="sortedMembers.length === 0" class="modal-empty">
              <p>暂无可选的项目成员。</p>
            </div>

            <div v-else class="member-list">
              <label
                v-for="member in sortedMembers"
                :key="member.userId || member.id"
                class="member-item"
              >
                <input
                  type="radio"
                  :name="'transfer-target-' + (activeProject && activeProject.id)"
                  :value="member.userId || member.id"
                  v-model="selectedTargetsLocal"
                  @change="onSelectTarget(member)"
                />
                <div class="member-info">
                  <div class="member-name-role">
                    <span class="member-name">{{ member.name }}</span>
                    <span class="role-badge" :class="roleBadgeClass(member)">{{ roleDisplayName(member) }}</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button class="secondary-btn" @click="closeMemberDialog">完成</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { projectAPI } from '@/api/project'

export default {
  name: 'ProjectTransfer',
  data() {
    return {
      isLoading: true,
      projects: [],
      membersByProject: {},
      memberMeta: {},
      loadingMembers: {},
      selectedTargets: {},
      showMemberModal: false,
      activeProject: null,
      selectedTargetsLocal: null,
      submitting: false,
      currentUserId: null
    }
  },
  computed: {
    transferableProjectCount() {
      return this.projects.filter(p => {
        const meta = this.memberMeta[p.id]
        return meta && meta.hasCandidates
      }).length
    },
    selectedTransferCount() {
      return Object.keys(this.selectedTargets).filter(projectId => {
        const meta = this.memberMeta[projectId]
        return meta && meta.hasCandidates && this.selectedTargets[projectId]
      }).length
    },
    sortedMembers() {
      if (!this.activeProject) return []
      const projectId = this.activeProject.id
      const members = this.membersByProject[projectId] || []
      const filtered = members.filter(m => {
        const userId = String(m.userId || m.id || '')
        return !this.currentUserId || userId !== String(this.currentUserId)
      })
      const owners = []
      const admins = []
      const normal = []
      filtered.forEach(member => {
        if (this.isOwnerMember(member)) {
          owners.push(member)
        } else if (this.isAdminRole(member)) {
          admins.push(member)
        } else {
          normal.push(member)
        }
      })
      return [...owners, ...admins, ...normal]
    }
  },
  created() {
    this.initCurrentUser()
  },
  mounted() {
    this.loadMyCreatedProjects()
  },
  methods: {
    initCurrentUser() {
      try {
        const raw = localStorage.getItem('user_info')
        if (!raw) return
        const parsed = JSON.parse(raw)
        if (parsed && parsed.id) {
          this.currentUserId = String(parsed.id)
        }
      } catch (e) {
        console.warn('[ProjectTransfer] 解析本地 user_info 失败:', e)
      }
    },
    goBack() {
      this.$router.push('/profile')
    },
    goToProfile() {
      this.$router.push('/profile')
    },
    projectStatusDisplay(status) {
      if (!status) return ''
      const map = {
        DRAFT: '草稿',
        ACTIVE: '进行中',
        COMPLETED: '已完成',
        ARCHIVED: '已归档',
        '进行中': '进行中',
        '已完成': '已完成',
        '已归档': '已归档'
      }
      const key = String(status).toUpperCase()
      return map[key] || status
    },
    async loadMyCreatedProjects() {
      this.isLoading = true
      try {
        const pageSize = 50
        const results = []
        let page = 0
        let hasMore = true
        while (hasMore) {
          const response = await projectAPI.getMyCreatedProjects(page, pageSize)
          const payload = response && response.data ? response.data : response
          const { projects, totalPages } = this.extractProjectsFromResponse(payload)
          if (Array.isArray(projects) && projects.length > 0) {
            results.push(...projects)
            if (typeof totalPages === 'number') {
              hasMore = page + 1 < totalPages
            } else {
              hasMore = projects.length === pageSize
            }
          } else {
            hasMore = false
          }
          page += 1
          if (page > 10) {
            hasMore = false
          }
        }
        this.projects = results.map(project => {
          return {
            id: project.id || project.projectId || project.project_id,
            title: project.title || project.name || project.projectName || '未命名项目',
            description: project.description || project.desc || '',
            status: project.status || ''
          }
        })
      } catch (error) {
        console.error('[ProjectTransfer] 加载我创建的项目失败:', error)
        this.projects = []
      } finally {
        this.isLoading = false
      }
    },
    extractProjectsFromResponse(payload) {
      const result = { projects: [], totalPages: null }
      if (!payload) {
        return result
      }
      if (Array.isArray(payload)) {
        result.projects = payload
        return result
      }
      if (Array.isArray(payload.content)) {
        result.projects = payload.content
        result.totalPages = payload.totalPages ?? payload.total_pages ?? null
        return result
      }
      if (Array.isArray(payload.list)) {
        result.projects = payload.list
        return result
      }
      if (Array.isArray(payload.records)) {
        result.projects = payload.records
        return result
      }
      return result
    },
    async openMemberDialog(project) {
      this.activeProject = project
      this.selectedTargetsLocal = this.selectedTargets[project.id] || null
      if (!this.membersByProject[project.id]) {
        await this.loadMembersForProject(project.id)
      }
      this.showMemberModal = true
    },
    closeMemberDialog() {
      this.showMemberModal = false
      this.activeProject = null
      this.selectedTargetsLocal = null
    },
    async loadMembersForProject(projectId) {
      if (!projectId) return
      this.$set(this.loadingMembers, projectId, true)
      try {
        const response = await projectAPI.getProjectMembers(projectId, 0, 100)
        let members = []
        if (response && response.code === 200) {
          const data = response.data
          if (data && Array.isArray(data.content)) {
            members = data.content
          } else if (Array.isArray(data)) {
            members = data
          }
        }
        const mapped = members.map(member => {
          const userId = String(member.userId || member.id || '')
          return {
            id: userId,
            userId: userId,
            name: member.username || member.name || '未知用户',
            role: member.roleName || member.role || '成员',
            roleCode: member.roleCode || this.getRoleCodeFromName(member.roleName || member.role)
          }
        })
        this.$set(this.membersByProject, projectId, mapped)
        const memberCount = mapped.length
        const hasCandidates = mapped.some(m => {
          const userId = String(m.userId || m.id || '')
          return !this.currentUserId || userId !== String(this.currentUserId)
        })
        const onlySelf = memberCount === 1 && mapped[0] && this.currentUserId && String(mapped[0].userId) === String(this.currentUserId)
        this.$set(this.memberMeta, projectId, {
          memberCount,
          hasCandidates,
          onlySelf
        })
      } catch (error) {
        console.error('[ProjectTransfer] 加载项目成员失败:', error)
        this.$set(this.membersByProject, projectId, [])
        this.$set(this.memberMeta, projectId, {
          memberCount: 0,
          hasCandidates: false,
          onlySelf: false
        })
      } finally {
        this.$set(this.loadingMembers, projectId, false)
      }
    },
    isOwnerMember(member) {
      const roleCode = String(member.roleCode || '').toUpperCase()
      const roleName = String(member.role || '').toUpperCase()
      return (
        roleCode === 'OWNER' ||
        roleName.includes('OWNER') ||
        roleName.includes('拥有者') ||
        roleName.includes('负责人')
      )
    },
    isAdminRole(member) {
      const roleCode = String(member.roleCode || '').toUpperCase()
      const roleName = String(member.role || '').toUpperCase()
      return (
        roleCode === 'ADMIN' ||
        roleName.includes('ADMIN') ||
        roleName.includes('管理员')
      )
    },
    getRoleCodeFromName(roleName) {
      if (!roleName) return 'MEMBER'
      const upper = String(roleName).toUpperCase()
      if (upper.includes('OWNER') || upper.includes('拥有者') || upper.includes('负责人')) {
        return 'OWNER'
      }
      if (upper.includes('ADMIN') || upper.includes('管理员')) {
        return 'ADMIN'
      }
      return 'MEMBER'
    },
    roleDisplayName(member) {
      const roleCode = String(member.roleCode || '').toUpperCase()
      if (roleCode === 'OWNER') return '项目拥有者'
      if (roleCode === 'ADMIN') return '项目管理员'
      return '项目成员'
    },
    roleBadgeClass(member) {
      const roleCode = String(member.roleCode || '').toUpperCase()
      if (roleCode === 'OWNER') return 'role-owner'
      if (roleCode === 'ADMIN') return 'role-admin'
      return 'role-member'
    },
    onSelectTarget(member) {
      if (!this.activeProject) return
      const projectId = this.activeProject.id
      const userId = member.userId || member.id
      this.$set(this.selectedTargets, projectId, String(userId))
    },
    displaySelectedTargetName(projectId) {
      const members = this.membersByProject[projectId] || []
      const targetId = this.selectedTargets[projectId]
      const target = members.find(m => String(m.userId || m.id) === String(targetId))
      return target ? target.name : '未知用户'
    },
    async submitTransferAndLogout() {
      if (this.transferableProjectCount > 0 && this.selectedTransferCount < this.transferableProjectCount) {
        alert('请先为所有可移交的项目选择新的负责人。')
        return
      }
      if (!window.confirm('确认对所有已选择的新负责人执行项目移交，并继续账号注销流程吗？')) {
        return
      }
      this.submitting = true
      try {
        const tasks = []
        Object.keys(this.selectedTargets).forEach(projectId => {
          const meta = this.memberMeta[projectId]
          const targetUserId = this.selectedTargets[projectId]
          if (meta && meta.hasCandidates && targetUserId) {
            tasks.push(projectAPI.updateMemberRole(projectId, targetUserId, 'OWNER'))
          }
        })
        if (tasks.length > 0) {
          const results = await Promise.all(tasks)
          const hasError = results.some(res => !res || res.code !== 200)
          if (hasError) {
            alert('部分项目移交失败，请稍后重试或检查网络连接。')
            this.submitting = false
            return
          }
        }
        this.$router.push({ path: '/profile', query: { afterTransfer: '1' } })
      } catch (error) {
        console.error('[ProjectTransfer] 执行批量移交失败:', error)
        alert('批量移交失败，请稍后重试。')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.project-transfer-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.top-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.back-btn:hover {
  background-color: #f8f9fa;
  color: #333;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.main-content {
  flex: 1;
  margin-top: 64px;
  padding: 32px 24px 40px;
  max-width: 1200px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.content-card {
  background: white;
  border-radius: 12px;
  padding: 24px 28px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.page-main-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #1f2933;
}

.page-desc {
  margin: 0 0 12px 0;
  color: #52606d;
}

.hint-list {
  margin: 0;
  padding-left: 20px;
  color: #52606d;
}

.hint-list li {
  margin-bottom: 4px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
}

.empty-state h2 {
  font-size: 18px;
  margin-bottom: 8px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 16px;
}

.primary-btn,
.secondary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.primary-btn {
  background: #3b82f6;
  color: white;
}

.primary-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
  box-shadow: none;
}

.primary-btn:not(:disabled):hover {
  background: #2563eb;
  box-shadow: 0 6px 18px rgba(37, 99, 235, 0.25);
}

.secondary-btn {
  background: #f3f4f6;
  color: #374151;
}

.secondary-btn:hover {
  background: #e5e7eb;
}

.projects-section {
  margin-top: 4px;
}

.projects-header {
  margin-bottom: 16px;
}

.projects-header h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
}

.projects-summary {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.project-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 18px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.project-main {
  flex: 1;
}

.project-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.project-desc {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #4b5563;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: #e5f0ff;
  color: #1d4ed8;
  font-size: 12px;
}

.single-member-warning {
  margin-top: 8px;
  font-size: 13px;
  color: #b91c1c;
  background-color: #fef2f2;
  border-radius: 6px;
  padding: 8px 10px;
}

.project-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.selected-target {
  font-size: 13px;
  color: #111827;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 520px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 22px 12px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #6b7280;
}

.modal-close:hover {
  background-color: #f3f4f6;
}

.modal-body {
  padding: 12px 22px 16px;
}

.modal-project-title {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #374151;
}

.modal-warning {
  background-color: #fef2f2;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #b91c1c;
}

.modal-empty {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
}

.member-list {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.member-item input[type='radio'] {
  flex-shrink: 0;
}

.member-info {
  flex: 1;
}

.member-name-role {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.role-owner {
  background-color: #fef3c7;
  color: #92400e;
}

.role-admin {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.role-member {
  background-color: #e5e7eb;
  color: #374151;
}

.modal-footer {
  padding: 12px 22px 16px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .project-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-actions {
    width: 100%;
    align-items: flex-start;
  }

  .footer-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
