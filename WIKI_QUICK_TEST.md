# 🧪 Wiki功能快速测试指南

## ⚡ 5分钟快速测试

### 第1步：启动服务

```powershell
# 确保Wiki服务已启动（端口8234）
# 确保前端开发服务器已启动
cd zhiyan_front
npm run serve
```

### 第2步：访问Wiki页面

1. 打开浏览器访问前端
2. 登录系统
3. 进入任意项目详情页
4. 点击"知识库"标签
5. 选择"项目wiki文档"选项卡

### 第3步：测试创建文件夹

1. 点击"+ 新建文件夹"按钮
2. 输入文件夹名称，例如："产品文档"
3. 点击"确认创建"
4. ✅ 应该看到新文件夹出现在左侧列表

### 第4步：测试创建文档

1. 点击"+ 新建文档"按钮
2. 填写信息：
   - 文档标题：`测试文档`
   - 文档分类：选择刚创建的文件夹
   - 文档内容：
   ```markdown
   # 测试文档
   
   这是一个测试文档。
   
   ## 功能列表
   - 创建文档 ✅
   - 编辑文档 ✅
   - 保存文档 ✅
   ```
3. 点击"确认创建"
4. ✅ 应该自动选中新文档并显示内容

### 第5步：测试编辑文档

1. 点击刚创建的"测试文档"（如果还未选中）
2. 点击"编辑"按钮
3. 修改内容，例如添加：
   ```markdown
   
   ## 更新日志
   - 2025-01-05：创建文档
   - 2025-01-05：测试编辑功能 ✅
   ```
4. 等待3秒（自动保存）或点击"保存"
5. ✅ 应该看到"文档保存成功"提示

### 第6步：验证数据持久化

1. 刷新页面
2. 重新进入Wiki页面
3. ✅ 应该看到刚才创建的文件夹和文档
4. 点击文档
5. ✅ 应该看到最新保存的内容

---

## 🔍 验证后端数据

### 检查MySQL数据

```sql
-- 查询Wiki页面元数据
SELECT * FROM wiki_page WHERE project_id = 你的项目ID;

-- 查看版本信息
SELECT id, title, current_version, created_at, updated_at 
FROM wiki_page 
WHERE project_id = 你的项目ID 
ORDER BY updated_at DESC;
```

### 检查MongoDB数据

```javascript
// 连接MongoDB
use zhiyan_wiki;

// 查询Wiki内容
db.wiki_content.find({ pageId: NumberLong(页面ID) });

// 查看最新版本
db.wiki_content.find({ 
  pageId: NumberLong(页面ID),
  isLatest: true 
}).pretty();
```

---

## 📊 预期结果

### 成功标志

- ✅ 可以看到左侧文件夹列表
- ✅ 可以创建文件夹（调用API）
- ✅ 可以创建文档（调用API）
- ✅ 点击文档可以查看内容
- ✅ 可以编辑文档
- ✅ 保存后数据持久化
- ✅ 刷新页面数据不丢失

### 控制台日志

打开浏览器控制台（F12），应该看到：

```
[KnowledgeBaseCabinet] 组件挂载, projectId: 123
[loadWikiTree] 加载Wiki树, projectId: 123
[loadWikiTree] Wiki树加载成功: [...]
[selectDocument] 加载页面详情, pageId: 456
[selectDocument] 页面详情加载成功: 测试文档
```

---

## ❌ 常见问题

### 1. 看不到数据

**原因：** 项目中还没有Wiki数据

**解决：** 
- 创建一个新文件夹
- 创建一个新文档
- 数据就会出现

### 2. 点击"保存"没反应

**检查：**
- 打开浏览器控制台（F12）
- 查看Network标签
- 看是否有API请求发出
- 查看请求是否返回200状态码

**可能原因：**
- Wiki服务未启动（端口8234）
- 代理配置错误
- 用户无权限

### 3. 提示"加载Wiki失败"

**检查清单：**
- [ ] Wiki服务是否启动？
  ```bash
  # 检查8234端口
  netstat -ano | findstr 8234
  ```
- [ ] MongoDB是否启动？
- [ ] vue.config.js中代理配置是否正确？
- [ ] 项目ID是否有效？

### 4. 创建文档后看不到

**原因：** 可能是父级ID设置错误

**解决：**
- 先创建文件夹
- 在新建文档时选择该文件夹
- 或者不选择文件夹（创建在根目录）

### 5. 自动保存不工作

**检查：**
- 是否已进入编辑模式？（点击"编辑"按钮）
- 是否修改了内容？
- 等待3秒
- 查看控制台是否有[autoSave]日志

---

## 🛠️ 调试技巧

### 1. 查看API请求

1. 打开浏览器开发者工具（F12）
2. 切换到Network标签
3. 筛选XHR请求
4. 操作Wiki功能
5. 查看请求和响应

### 2. 查看Vue组件状态

在浏览器控制台输入：
```javascript
// 查看组件数据
$vm0.$data

// 查看当前文档
$vm0.$data.currentPage

// 查看文档列表
$vm0.$data.docs
```

### 3. 手动调用API测试

在浏览器控制台输入：
```javascript
// 测试获取Wiki树
const response = await wikiAPI.page.getProjectWikiTree(你的项目ID)
console.log(response)

// 测试获取页面详情
const detail = await wikiAPI.page.getPageDetail(页面ID)
console.log(detail)
```

---

## 📞 获取帮助

如果遇到问题：

1. 查看浏览器控制台错误信息
2. 查看Network标签的API请求
3. 查看后端日志
4. 检查数据库数据
5. 参考 `WIKI_INTEGRATION_COMPLETE.md` 文档

---

**测试愉快！** 🎉

有问题随时查看文档或检查日志！

