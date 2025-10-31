# 事件总线使用指南

## 为什么不使用全局刷新？

### ❌ 全局刷新的问题

```javascript
// 坏的做法：
methods: {
  async uploadAvatar() {
    await api.upload()
    this.globalRefresh() // 刷新所有东西！
  }
}
```

**问题：**
1. 🔥 性能问题：所有组件都刷新，产生大量请求
2. 💔 用户体验差：界面闪烁，滚动位置丢失
3. 🐛 难以调试：不知道谁触发了刷新
4. 💸 浪费资源：无关组件也刷新

### ✅ 精确事件的优势

```javascript
// 好的做法：
methods: {
  async uploadAvatar() {
    await api.upload()
    this.$eventBus.emit(this.$EventTypes.USER_AVATAR_UPDATED, { 
      userId: this.userId,
      avatarUrl: this.newAvatarUrl 
    })
  }
}
```

**优势：**
1. ⚡ 高性能：只有关心头像的组件刷新
2. 😊 体验好：最小化刷新范围
3. 🔍 易调试：明确的事件类型
4. 💰 省资源：按需刷新

---

## 安装

在 `main.js` 中：

```javascript
import EventBus from '@/utils/eventBus'

Vue.use(EventBus)
```

---

## 基础用法

### 1. 发送事件

```javascript
// Profile.vue - 上传头像后
export default {
  methods: {
    async uploadAvatar() {
      try {
        const response = await avatarAPI.uploadAvatar(file)
        
        // 触发精确的事件
        this.$eventBus.emit(this.$EventTypes.USER_AVATAR_UPDATED, {
          userId: this.currentUserId,
          avatarUrl: response.data.cdn_url
        })
        
      } catch (error) {
        console.error('上传失败:', error)
      }
    }
  }
}
```

### 2. 监听事件

```javascript
// ProjectDetail.vue - 监听头像更新
export default {
  mounted() {
    // 监听头像更新事件
    this.$eventBus.on(
      this.$EventTypes.USER_AVATAR_UPDATED, 
      this.handleAvatarUpdated
    )
  },
  
  beforeDestroy() {
    // 取消监听
    this.$eventBus.off(
      this.$EventTypes.USER_AVATAR_UPDATED, 
      this.handleAvatarUpdated
    )
  },
  
  methods: {
    handleAvatarUpdated(data) {
      console.log('头像更新了:', data)
      // 只刷新团队成员列表中该用户的头像
      this.updateMemberAvatar(data.userId, data.avatarUrl)
    },
    
    updateMemberAvatar(userId, newAvatar) {
      const member = this.teamMembers.find(m => m.id === userId)
      if (member) {
        member.avatar = newAvatar
      }
    }
  }
}
```

### 3. 带防抖的监听

```javascript
// 防止短时间内多次触发
this.$eventBus.on(
  this.$EventTypes.PROJECT_UPDATED,
  this.refreshProject,
  { debounce: 500 } // 500ms防抖
)
```

---

## 完整示例

### 场景：用户上传头像

#### 步骤1：Profile.vue 发送事件

```javascript
// src/views/Profile.vue
export default {
  methods: {
    async applyAvatarCrop() {
      try {
        const response = await avatarAPI.uploadAvatar(file)
        const avatarUrl = response.data.cdn_url
        
        // 更新本地状态
        this.userInfo.avatar = avatarUrl
        
        // 🎯 发送精确事件
        this.$eventBus.emit(this.$EventTypes.USER_AVATAR_UPDATED, {
          userId: this.userInfo.id,
          avatarUrl: avatarUrl,
          timestamp: Date.now()
        })
        
        this.showSuccessToast('头像上传成功！')
      } catch (error) {
        console.error('上传失败:', error)
      }
    }
  }
}
```

#### 步骤2：ProjectDetail.vue 监听并局部更新

```javascript
// src/views/ProjectDetail.vue
export default {
  mounted() {
    this.$eventBus.on(
      this.$EventTypes.USER_AVATAR_UPDATED,
      this.handleAvatarUpdated,
      { debounce: 300 } // 防抖
    )
  },
  
  beforeDestroy() {
    this.$eventBus.off(
      this.$EventTypes.USER_AVATAR_UPDATED,
      this.handleAvatarUpdated
    )
  },
  
  methods: {
    handleAvatarUpdated({ userId, avatarUrl }) {
      // 💡 只更新受影响的成员，不是全量刷新
      const member = this.teamMembers.find(m => m.id === userId)
      if (member) {
        this.$set(member, 'avatar', avatarUrl)
        console.log(`✅ 已更新成员 ${userId} 的头像`)
      }
    }
  }
}
```

#### 步骤3：GlobalUserProfile.vue 也监听

```javascript
// src/components/GlobalUserProfile.vue
export default {
  mounted() {
    this.$eventBus.on(
      this.$EventTypes.USER_AVATAR_UPDATED,
      this.handleAvatarUpdated
    )
  },
  
  beforeDestroy() {
    this.$eventBus.off(
      this.$EventTypes.USER_AVATAR_UPDATED,
      this.handleAvatarUpdated
    )
  },
  
  methods: {
    handleAvatarUpdated({ userId, avatarUrl }) {
      // 只在是当前用户时更新
      if (userId === this.currentUserId) {
        this.globalUserInfo.avatar = avatarUrl
      }
    }
  }
}
```

---

## 对比：全局刷新 vs 精确事件

### 场景：10个组件在页面上，用户上传头像

| 方案 | 请求数 | 刷新的组件 | 用户体验 | 服务器压力 |
|------|--------|-----------|---------|-----------|
| 全局刷新 | 10+ | 全部10个 | ⚠️ 界面闪烁 | 🔴 高 |
| 精确事件 | 2-3 | 只有2-3个相关组件 | ✅ 流畅 | 🟢 低 |

### 数据对比

```javascript
// ❌ 全局刷新
用户上传头像
├─ Profile组件刷新      → 1个API请求
├─ Header组件刷新       → 1个API请求
├─ Sidebar组件刷新      → 1个API请求
├─ ProjectList刷新      → 1个API请求（不需要！）
├─ KnowledgeList刷新    → 1个API请求（不需要！）
├─ TaskList刷新         → 1个API请求（不需要！）
├─ Dashboard刷新        → 1个API请求（不需要！）
└─ ...
总计：10+个请求，7个无用请求


// ✅ 精确事件
用户上传头像
├─ 发送 USER_AVATAR_UPDATED 事件
├─ ProjectDetail 更新该用户头像（局部更新，无请求）
├─ GlobalUserProfile 更新头像（局部更新，无请求）
└─ Header 更新头像（局部更新，无请求）
总计：0个额外请求！只是内存中的数据更新
```

---

## 最佳实践

### 1. 使用常量，不要硬编码

```javascript
// ❌ 坏
this.$eventBus.emit('avatar-updated', data)

// ✅ 好
this.$eventBus.emit(this.$EventTypes.USER_AVATAR_UPDATED, data)
```

### 2. 总是在 beforeDestroy 中取消监听

```javascript
beforeDestroy() {
  // 防止内存泄漏
  this.$eventBus.off(this.$EventTypes.USER_AVATAR_UPDATED, this.handleAvatarUpdated)
}
```

### 3. 传递必要的数据

```javascript
// ❌ 坏 - 数据不足
this.$eventBus.emit(this.$EventTypes.USER_AVATAR_UPDATED, {
  avatar: 'url'  // 缺少userId
})

// ✅ 好 - 数据完整
this.$eventBus.emit(this.$EventTypes.USER_AVATAR_UPDATED, {
  userId: 123,
  avatarUrl: 'url',
  timestamp: Date.now()
})
```

### 4. 使用防抖避免频繁触发

```javascript
// 搜索框输入
this.$eventBus.on(
  this.$EventTypes.SEARCH_QUERY_CHANGED,
  this.handleSearch,
  { debounce: 500 } // 等待用户停止输入500ms后执行
)
```

### 5. 命名规范

```javascript
// 格式：模块:资源:动作
USER_AVATAR_UPDATED     // 用户:头像:已更新
PROJECT_MEMBER_ADDED    // 项目:成员:已添加
TASK_STATUS_CHANGED     // 任务:状态:已改变
```

---

## 常见问题

### Q1: 什么时候该用事件，什么时候该用全局刷新？

**A:** 
- 用事件：数据变化影响范围小且明确（90%的情况）
- 用全局刷新：真的需要刷新整个页面的数据（<10%的情况）

### Q2: 事件会不会太多？

**A:** 不会。事件多说明系统设计清晰。比全局刷新好100倍。

### Q3: 如何调试事件？

```javascript
// 在main.js中添加全局监听
if (process.env.NODE_ENV === 'development') {
  const originalEmit = eventBus.emit.bind(eventBus)
  eventBus.emit = function(eventType, data) {
    console.log(`📢 事件: ${eventType}`, data)
    return originalEmit(eventType, data)
  }
}
```

---

## 总结

✅ **推荐使用精确事件系统**
- 性能好
- 体验好  
- 易维护
- 可追踪

❌ **避免使用全局刷新**
- 性能差
- 体验差
- 难调试
- 浪费资源

**记住：精确才是王道！**

