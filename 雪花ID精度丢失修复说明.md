# 雪花ID精度丢失修复说明

## 问题描述

后端使用雪花算法生成的ID（19位数字，例如：`1983699957701545984`）在传递到前端后出现精度丢失，变成了`1983699957701546000`。

## 问题原因

JavaScript的`Number`类型只能安全表示到 `2^53-1`（9007199254740991，16位数字），而雪花ID通常是19位数字，超出了JavaScript的安全整数范围，导致精度丢失。

## 解决方案

### 1. 配置Axios拦截器 - 将大整数转换为字符串

在所有Axios实例中添加`transformResponse`配置，使用正则表达式将JSON响应中的大整数（16位及以上）自动转换为字符串格式。

**修改的文件：**
- `src/utils/request.js` - 主请求工具
- `src/api/project.js` - 项目API
- `src/api/knowledge.js` - 知识库API
- `src/api/task.js` - 任务API
- `src/api/auth.js` - 认证API
- `src/api/coze.js` - Coze AI API
- `src/api/dify.js` - Dify AI API
- `src/api/wiki.js` - Wiki API

**核心代码：**
```javascript
/**
 * 自定义JSON解析函数 - 将大整数转换为字符串以避免精度丢失
 * 雪花ID（19位）超过JavaScript Number安全范围（2^53-1）
 */
function parseJSONWithBigInt(data) {
  if (typeof data !== 'string') return data
  try {
    // 使用正则表达式将大整数字段（通常是ID）转换为字符串
    // 匹配所有可能是ID的长整数（大于16位的整数）
    return JSON.parse(data.replace(/:(\s*)(\d{16,})/g, ':$1"$2"'))
  } catch (e) {
    console.error('JSON解析错误:', e)
    return data
  }
}

const api = axios.create({
  // ... 其他配置
  transformResponse: [function (data) {
    return parseJSONWithBigInt(data)
  }]
})
```

### 2. 移除前端代码中的parseInt/Number转换

将所有将ID转换为数字类型的代码改为保持字符串类型。

**修改的文件和位置：**

#### `src/views/KnowledgeBaseCabinet.vue`
- 第268行：`flatNodeList` 计算属性中的节点ID
- 第370行、379行：`parseWikiTree` 方法中的目录ID
- 第384行：`parseWikiTree` 方法中的文档ID
- 第406行：`selectDocument` 方法中的页面ID
- 第645-646行：`confirmNewDoc` 方法中的父节点ID

#### `src/views/KnowledgeBaseAI.vue`
- 第561行：处理成果ID
- 第568行：处理知识库文件ID
- 第1198行：处理文件ID列表
- 第1329行：`getKnowledgeFileName` 方法中的文件ID
- 第1342-1343行：文件ID比较
- 第1349行：文件信息映射键
- 第1393-1394行：`getKnowledgeFileSize` 方法中的文件ID比较
- 第467行：文件信息查找

#### `src/views/AIAssistant.vue`
- 第444行：聊天会话ID恢复

#### `src/views/ProjectDetail.vue`
- 第1137行：任务执行者用户ID

### 3. 统一使用字符串比较ID

将所有ID比较从数字比较改为字符串比较，确保精度不丢失。

**修改示例：**
```javascript
// 修改前
const doc = this.docs.find(d => d.id === this.activeId)

// 修改后
const doc = this.docs.find(d => String(d.id) === String(this.activeId))
```

## 修复效果

- ✅ 所有从后端接收的雪花ID现在都以字符串格式保存
- ✅ 前端不再对ID进行数字转换，避免精度丢失
- ✅ ID比较使用字符串比较，确保准确性
- ✅ localStorage中存储的ID也保持字符串格式

## 测试建议

1. 测试项目ID传递：创建项目后，检查项目ID是否保持完整
2. 测试成果ID传递：创建成果后，检查成果ID是否保持完整
3. 测试文件ID传递：上传文件后，检查文件ID是否保持完整
4. 测试任务ID传递：创建任务后，检查任务ID和执行者ID是否保持完整
5. 测试localStorage存储：刷新页面后，检查从localStorage读取的ID是否保持完整

## 注意事项

1. **后端兼容性**：后端需要能够接受字符串格式的ID参数
2. **URL参数**：路由参数中的ID现在是字符串格式，路由配置无需修改
3. **API调用**：所有API调用时传递的ID都是字符串格式
4. **数据库查询**：后端需要能够将字符串ID转换为Long类型进行数据库查询

## 修复日期

2025-11-06

## 修复人员

AI Assistant (Claude Sonnet 4.5)

