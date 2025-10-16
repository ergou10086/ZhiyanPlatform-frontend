<template>
  <div class="project-create-container">
    <!-- 侧边栏弹窗 -->
    <Sidebar :isOpen="sidebarOpen" @close="closeSidebar" />
    
    <!-- 顶部导航栏 -->
    <div class="top-header">
      <div class="header-left">
        <button class="menu-btn" @click="toggleSidebar" aria-label="open sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="page-title">创建项目</span>
      </div>
      <div class="header-right">
        <nav class="breadcrumb">
          <a class="breadcrumb-link" @click.prevent="$router.push('/home')">首页</a>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">创建项目</span>
        </nav>
        <div class="user-profile">
          <div class="user-avatar">
            <img v-if="userAvatar" :src="userAvatar" alt="用户头像" />
            <div v-else class="avatar-placeholder">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 - 左右分栏布局 -->
    <div class="main-content">
      <!-- 左侧表单区域 -->
      <div class="form-section">
        <!-- 项目基本信息 -->
        <div class="form-group">
          <h3 class="section-title">项目基本信息</h3>
          
          <div class="form-field">
            <label class="form-label">项目名称</label>
            <input
              type="text"
              v-model="formData.projectName"
              class="form-input"
              placeholder="请输入项目名称"
            />
          </div>

          <div class="form-field">
            <label class="form-label">项目简介</label>
            <textarea
              v-model="formData.projectDescription"
              class="form-textarea"
              placeholder="请简要介绍您的项目目标和预期成果"
              rows="4"
            ></textarea>
          </div>

          <div class="form-field">
            <label class="form-label">项目周期</label>
            <div class="date-range">
              <input
                type="date"
                v-model="formData.startDate"
                class="form-input date-input"
              />
              <span class="date-separator">-</span>
              <input
                type="date"
                v-model="formData.endDate"
                class="form-input date-input"
              />
            </div>
          </div>

          <div class="form-field">
            <label class="form-label">项目分类</label>
            <select v-model="formData.category" class="form-input" required>
              <option value="">请选择项目分类</option>
              <option value="医疗健康">医疗健康</option>
              <option value="环境气候">环境气候</option>
              <option value="生物信息">生物信息</option>
              <option value="科研探索">科研探索</option>
              <option value="材料科学">材料科学</option>
              <option value="天文学">天文学</option>
              <option value="智慧城市">智慧城市</option>
              <option value="金融科技">金融科技</option>
              <option value="教育科技">教育科技</option>
              <option value="农业科技">农业科技</option>
              <option value="工业4.0">工业4.0</option>
              <option value="人工智能">人工智能</option>
              <option value="数据科学">数据科学</option>
            </select>
          </div>
          
          <div class="form-field">
            <label class="form-label">自定义标签</label>
            <div class="tag-input-container">
              <input
                type="text"
                v-model="newTag"
                @keyup.enter="addTag"
                class="form-input tag-input"
                placeholder="输入标签后按回车添加（可选）"
              />
              <button type="button" @click="addTag" class="add-tag-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            <div class="tags-display" v-if="formData.tags.length > 0">
              <span v-for="(tag, index) in formData.tags" :key="index" class="tag">
                {{ tag }}
                <button @click="removeTag(index)" class="tag-remove">×</button>
              </span>
            </div>
          </div>
        </div>

        <!-- 任务配置 -->
        <div class="form-group">
          <div class="section-header">
            <h3 class="section-title">任务配置</h3>
            <button type="button" @click="addTask" class="add-task-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              添加新任务
            </button>
          </div>

          <div v-for="(task, index) in formData.tasks" :key="task.id" class="task-item">
            <div class="task-header">
              <span class="task-title">任务 {{ index + 1 }}</span>
              <button @click="removeTask(index)" class="delete-task-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div class="form-field">
              <label class="form-label">任务标题</label>
              <input
                type="text"
                v-model="task.title"
                class="form-input"
                placeholder="请输入任务标题"
              />
            </div>

            <div class="form-field">
              <label class="form-label">任务描述</label>
              <textarea
                v-model="task.description"
                class="form-textarea"
                placeholder="请输入任务描述"
                rows="3"
              ></textarea>
            </div>

            <div class="task-row">
              <div class="form-field">
                <label class="form-label">截止日期</label>
                <input
                  type="date"
                  v-model="task.dueDate"
                  class="form-input"
                />
              </div>
              <div class="form-field">
                <label class="form-label">优先级</label>
                <select v-model="task.priority" class="form-select">
                  <option value="高">高</option>
                  <option value="中">中</option>
                  <option value="低">低</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- 岗位配置 -->
        <div class="form-group">
          <div class="section-header">
            <h3 class="section-title">岗位配置</h3>
            <button type="button" @click="addPosition" class="add-position-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              添加岗位
            </button>
          </div>

          <div v-for="(position, index) in formData.positions" :key="position.id" class="position-item">
            <div class="position-header">
              <span class="position-title">岗位 {{ index + 1 }}</span>
              <button @click="removePosition(index)" class="delete-position-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div class="form-field">
              <label class="form-label">岗位名称</label>
              <input
                type="text"
                v-model="position.name"
                class="form-input"
                placeholder="如：前端开发工程师"
              />
            </div>
            
            <div class="form-field">
              <label class="form-label">岗位描述</label>
              <textarea
                v-model="position.description"
                class="form-textarea"
                placeholder="描述该岗位的职责和要求"
                rows="3"
              ></textarea>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="form-label">需求人数</label>
                <input
                  type="number"
                  v-model.number="position.count"
                  class="form-input"
                  min="1"
                  max="10"
                />
              </div>
              <div class="form-field">
                <label class="form-label">技能要求</label>
                <input
                  type="text"
                  v-model="position.skills"
                  class="form-input"
                  placeholder="如：Vue.js, JavaScript"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧实时预览区域 -->
      <div class="preview-section">
        <h3 class="preview-title">实时预览</h3>
        
        <div class="preview-content">
          <div class="preview-item">
            <label class="preview-label">项目名称</label>
            <div class="preview-value">{{ formData.projectName || '项目名称' }}</div>
          </div>

          <div class="preview-item">
            <label class="preview-label">项目简介</label>
            <div class="preview-value">{{ formData.projectDescription || '项目简介将在此显示' }}</div>
          </div>

          <div class="preview-item">
            <label class="preview-label">项目分类</label>
            <div class="preview-category">
              <span v-if="!formData.category" class="preview-placeholder">分类将在此显示</span>
              <span v-else class="preview-category-tag">{{ formData.category }}</span>
            </div>
          </div>
          
          <div class="preview-item">
            <label class="preview-label">自定义标签</label>
            <div class="preview-tags">
              <span v-if="formData.tags.length === 0" class="preview-placeholder">标签将在此显示</span>
              <span v-else v-for="(tag, index) in formData.tags" :key="index" class="preview-tag">{{ tag }}</span>
            </div>
          </div>

          <div class="preview-item">
            <label class="preview-label">项目周期</label>
            <div class="preview-value">
              {{ getProjectPeriod() || '项目周期: 未设置' }}
            </div>
          </div>

          <div class="preview-item">
            <label class="preview-label">任务列表</label>
            <div class="preview-tasks">
              <div v-if="formData.tasks.length === 0" class="preview-placeholder">暂无任务</div>
              <div v-else v-for="(task, index) in formData.tasks" :key="task.id" class="preview-task">
                <div class="task-name">{{ task.title || '未命名任务' }}</div>
                <div class="task-meta">
                  <span class="task-due">截止: {{ task.dueDate || '未设置' }}</span>
                  <span class="task-priority">{{ task.priority || '中' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="preview-item">
            <label class="preview-label">岗位需求</label>
            <div class="preview-positions">
              <div v-if="formData.positions.length === 0" class="preview-placeholder">暂无岗位</div>
              <div v-else v-for="(position, index) in formData.positions" :key="position.id" class="preview-position">
                <div class="position-name">{{ position.name || '未命名岗位' }}</div>
                <div class="position-meta">
                  <span class="position-count">需求: {{ position.count || 1 }}人</span>
                  <span class="position-skills">{{ position.skills || '无特殊要求' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作按钮 -->
    <div class="footer-actions">
      <button type="button" @click="saveDraft" class="btn btn-secondary">
        保存草稿
      </button>
      <button type="button" @click="publishProject" class="btn btn-primary" :disabled="isSubmitting">
        {{ isSubmitting ? '发布中...' : '发布项目' }}
      </button>
    </div>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'

export default {
  name: 'ProjectCreate',
  components: {
    Sidebar
  },
  data() {
    return {
      sidebarOpen: false,
      isSubmitting: false,
      userAvatar: null,
      newTag: '',
      formData: {
        projectName: '',
        projectDescription: '',
        startDate: '',
        endDate: '',
        category: '',
        tags: [],
        tasks: [],
        positions: []
      }
    }
  },
  mounted() {
    this.loadUserAvatar()
  },
  methods: {
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },
    closeSidebar() {
      this.sidebarOpen = false
    },
    loadUserAvatar() {
      const savedAvatar = localStorage.getItem('userAvatar')
      if (savedAvatar) this.userAvatar = savedAvatar
    },
    getCurrentUserName() {
      // 从localStorage获取当前用户信息
      const globalUserInfo = localStorage.getItem('globalUserInfo')
      if (globalUserInfo) {
        const userInfo = JSON.parse(globalUserInfo)
        return userInfo.nickname || userInfo.name || '用户'
      }
      return '用户'
    },
    addTag() {
      if (this.newTag.trim() && !this.formData.tags.includes(this.newTag.trim())) {
        this.formData.tags.push(this.newTag.trim())
        this.newTag = ''
      }
    },
    removeTag(index) {
      this.formData.tags.splice(index, 1)
    },
    addTask() {
      this.formData.tasks.push({
        id: Date.now(),
        title: '',
        description: '',
        due_date: '', // 添加数据库字段名
        dueDate: '', // 保留前端字段名
        priority: 'MEDIUM', // 修改为与数据库枚举一致
        status: 'TODO', // 添加状态字段
        assignee_id: [] // 添加负责人ID字段
      })
    },
    removeTask(index) {
      this.formData.tasks.splice(index, 1)
    },
    addPosition() {
      this.formData.positions.push({
        id: Date.now(),
        name: '',
        description: '',
        requirements: '', // 修改为与数据库字段一致
        count: 1,
        skills: '', // 保留前端字段
        status: 'OPEN', // 添加状态字段
        created_at: new Date().toISOString() // 添加创建时间
      })
    },
    removePosition(index) {
      this.formData.positions.splice(index, 1)
    },
    getProjectPeriod() {
      if (this.formData.startDate && this.formData.endDate) {
        return `${this.formData.startDate} - ${this.formData.endDate}`
      }
      return null
    },
    async saveDraft() {
      try {
        // 模拟保存草稿
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert('草稿保存成功！')
      } catch (error) {
        console.error('保存草稿失败:', error)
        alert('保存草稿失败，请重试')
      }
    },
    async publishProject() {
      if (this.isSubmitting) return
      
      this.isSubmitting = true
      
      try {
        // 验证表单数据
        if (!this.formData.projectName || this.formData.projectName.trim() === '') {
          alert('请输入项目名称')
          this.isSubmitting = false
          return
        }
        
        if (!this.formData.category) {
          alert('请选择项目分类')
          this.isSubmitting = false
          return
        }
        
        console.log('表单数据:', this.formData)
        
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // 创建新项目对象
        const newProject = {
          id: Date.now(), // 使用时间戳作为唯一ID
          name: this.formData.projectName, // 修改为与数据库一致的字段名
          title: this.formData.projectName, // 保留title字段用于前端显示
          status: 'ONGOING', // 修改为与数据库枚举一致
          visibility: 'PRIVATE', // 添加可见性字段
          teamSize: this.formData.tasks.length || 1,
          dataAssets: this.formData.projectDescription || '暂无描述',
          direction: this.formData.projectDescription || '暂无描述',
          aiCore: '待定',
          category: this.formData.category || '其他',
          // 保存完整的项目信息
          description: this.formData.projectDescription,
          start_date: this.formData.startDate, // 修改为与数据库一致的字段名
          startDate: this.formData.startDate, // 保留驼峰命名用于前端
          end_date: this.formData.endDate, // 修改为与数据库一致的字段名
          endDate: this.formData.endDate, // 保留驼峰命名用于前端
          created_by: 1, // 添加创建人ID
          tags: this.formData.tags,
          tasks: this.formData.tasks,
          // 添加默认团队成员信息
          teamMembers: [
            { 
              id: 1, 
              user_id: 1, // 添加数据库字段名
              name: this.getCurrentUserName(), 
              project_role: 'LEADER', // 修改为与数据库枚举一致
              role: '项目负责人', // 保留前端显示字段
              avatar: null,
              joined_at: new Date().toISOString() // 添加加入时间
            }
          ],
          inviteSlots: [],
          // 添加岗位信息
          positions: this.formData.positions
        }
        
        console.log('新项目数据:', newProject)
        console.log('项目周期数据:', this.formData.startDate, this.formData.endDate)
        console.log('项目任务数据:', this.formData.tasks)
        
        // 从localStorage获取现有项目
        const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]')
        
        // 添加新项目到列表开头
        existingProjects.unshift(newProject)
        
        // 保存到localStorage
        localStorage.setItem('projects', JSON.stringify(existingProjects))
        
        // 显示成功消息
        alert('项目发布成功！')
        
        // 跳转到项目广场
        this.$router.push('/project-square')
      } catch (error) {
        console.error('发布项目失败:', error)
        alert('发布项目失败，请重试')
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.project-create-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.top-header {
  background: white;
  border-bottom: 1px solid #e9ecef;
  height: 64px;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  color: #666;
  transition: background-color 0.3s ease;
}

.menu-btn:hover {
  background-color: #f8f9fa;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d;
  font-size: 14px;
}

.breadcrumb-link {
  color: #6c757d;
  cursor: pointer;
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: #343a40;
}

.breadcrumb-sep {
  color: #adb5bd;
}

.breadcrumb-current {
  color: #333;
  font-weight: 500;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.user-profile:hover {
  background-color: #f8f9fa;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.form-section {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.preview-section {
  width: 300px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.form-group {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-task-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #5b6bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-task-btn:hover {
  background: #4c5ce6;
}

.form-field {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: white;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #5b6bff;
  box-shadow: 0 0 0 3px rgba(91, 107, 255, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  flex: 1;
}

.date-separator {
  color: #6c757d;
  font-weight: 500;
}

.tag-input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tag-input {
  flex: 1;
}

.add-tag-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #5b6bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-tag-btn:hover {
  background: #4c5ce6;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #e8f3ff;
  color: #2c6df2;
  border-radius: 16px;
  font-size: 12px;
  border: 1px solid #cfe2ff;
}

.tag-remove {
  background: none;
  border: none;
  color: #2c6df2;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  background: #fafbfc;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.delete-task-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #ff4757;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-task-btn:hover {
  background: #ff3742;
}

.task-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #dee2e6;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.preview-value {
  font-size: 13px;
  color: #6c757d;
  line-height: 1.4;
}

.preview-placeholder {
  font-size: 13px;
  color: #adb5bd;
  font-style: italic;
}

.preview-category {
  margin-bottom: 8px;
}

.preview-category-tag {
  background: #4caf50;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-tag {
  padding: 4px 12px;
  background: #e8f3ff;
  color: #2c6df2;
  border-radius: 16px;
  font-size: 12px;
  border: 1px solid #cfe2ff;
}

.preview-tasks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-positions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-position {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
}

.position-name {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.position-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6c757d;
}

.position-count {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
}

.position-skills {
  color: #6c757d;
}

.position-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.position-title {
  font-weight: 500;
  color: #333;
}

.delete-position-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
}

.delete-position-btn:hover {
  background: #c82333;
}

.add-position-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-position-btn:hover {
  background: #218838;
}

.preview-task {
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.task-name {
  font-size: 13px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #6c757d;
}

.task-due {
  color: #6c757d;
}

.task-priority {
  padding: 2px 6px;
  background: #fff3cd;
  color: #cc9a06;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 500;
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding: 24px;
  background: white;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.btn-secondary {
  background: white;
  color: #5b6bff;
  border-color: #5b6bff;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.btn-primary {
  background: #5b6bff;
  color: white;
  border-color: #5b6bff;
}

.btn-primary:hover:not(:disabled) {
  background: #4c5ce6;
  border-color: #4c5ce6;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  
  .preview-section {
    order: -1;
    width: 100%;
    position: static;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 16px;
  }
  
  .task-row {
    grid-template-columns: 1fr;
  }
  
  .footer-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .form-section,
  .preview-section {
    padding: 20px;
  }
}
</style>
