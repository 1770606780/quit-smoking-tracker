# Supabase 设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com/) 并注册账号
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Project Name: 戒烟记录
   - Database Password: 设置一个密码
   - Region: 选择离你最近的地区（建议：Singapore）
4. 点击 "Create Project" 等待项目创建完成

## 2. 获取项目信息

项目创建完成后：

1. 进入项目 dashboard
2. 点击左侧 "Project Settings"
3. 点击 "API"
4. 复制以下信息：
   - Project URL (supabaseUrl)
   - Anon public key (supabaseKey)

## 3. 创建数据库表

1. 点击左侧 "Database"
2. 点击 "New Table" 创建以下表：

### 表 1: users

| 列名 | 数据类型 | 约束 | 描述 |
|------|---------|------|------|
| id | text | Primary Key | 用户ID |
| username | text | Unique | 用户名 |
| password | text | - | 密码 |
| role | text | - | 角色 (admin/user) |
| created_at | timestamp | Default: now() | 创建时间 |

### 表 2: smoking_records

| 列名 | 数据类型 | 约束 | 描述 |
|------|---------|------|------|
| id | text | Primary Key | 记录ID |
| user_id | text | Foreign Key (users.id) | 用户ID |
| date | text | - | 日期 (YYYY-MM-DD) |
| quantity | numeric | - | 抽烟数量 |
| note | text | - | 备注 |
| created_at | timestamp | Default: now() | 创建时间 |

## 4. 配置 RLS (Row Level Security)

为了保护数据安全：

1. 点击 "Authentication" -> "Policies"
2. 为 users 表和 smoking_records 表添加适当的访问策略

## 5. 更新代码

在 `app.js` 文件中更新 Supabase 配置：

```javascript
// 初始化 Supabase
initSupabase() {
    const supabaseUrl = 'YOUR_SUPABASE_URL'; // 替换为你的 Project URL
    const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // 替换为你的 Anon public key
    
    return supabase.createClient(supabaseUrl, supabaseKey);
}
```

## 6. 部署

1. 完成代码修改后，推送到 GitHub
2. 启用 GitHub Pages
3. 现在不同设备的用户就可以共享数据了！

## 7. 测试

1. 打开部署的网站
2. 注册新账号
3. 添加戒烟记录
4. 在另一台设备上登录同一账号
5. 验证数据是否同步

## 注意事项

- Supabase 提供免费额度，足够小型应用使用
- 数据会实时同步到所有设备
- 所有数据存储在云端，安全可靠
