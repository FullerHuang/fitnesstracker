# FitTrack - 健身训练记录

基于 React Native (Expo) 的健身训练记录 App。记录每次训练的动作、组数、重量、RPE，追踪自定义标准，管理视频参考和训练笔记。

## 功能

| 页面 | 功能 |
|------|------|
| 动作库 | 训练动作 + 自定义动作 + 训练模板 + 自定义标准，按分类筛选 |
| 训练日历 | 月历视图 + 每日训练记录，一键存为模板，快速录入训练数据 |
| 统计分析 | 训练天数/次数概览、动作排名、训练量统计，数据导出/导入 |

### 训练记录

- **两步录入**：选择动作 → 录入组数据
- **模板系统**：将一天的训练保存为模板，下次一键导入，提高记录效率
- **数据备份**：导出所有数据为 JSON 文件，随时导入恢复

### 训练组结构

- **目标区**：目标重量 / 目标次数 / 目标RPE + 可添加自定义标准
- **完成区**：实际重量 / 次数 / RPE + 对应自定义标准完成值
- 自定义标准全局共享，填入目标后完成区自动跟随

### 训练详情

- 组数据编辑（目标/完成分区，支持自定义标准）
- 视频参考卡片（自动识别 B站 / 抖音 / YouTube，一键跳转）
- 训练心得（属于动作，失焦自动保存）
- 训练照片

### 动作详情

- 动作名称和训练部位可编辑
- 训练历史记录
- 动作级参考视频
- 训练心得（与训练页同步）

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React Native (Expo SDK 56) |
| 路由 | expo-router (文件路由) |
| 数据库 | expo-sqlite (本地 SQLite) |
| 状态管理 | Zustand |
| 日历组件 | react-native-calendars |
| 图片选取 | expo-image-picker |
| 文件分享 | expo-file-system / expo-sharing / expo-document-picker |
| 构建 | EAS Build |
| 语言 | TypeScript (strict) |

## 项目结构

```
FitnessTracker/
├── app/                            # expo-router 页面路由
│   ├── _layout.tsx                 # 根 Stack + DB 初始化
│   ├── index.tsx                   # 重定向 → 动作库
│   ├── (tabs)/
│   │   ├── _layout.tsx             # 底部三 Tab 导航
│   │   ├── exercises/
│   │   │   ├── index.tsx           # 动作库 / 模板 / 标准管理
│   │   │   └── [id].tsx            # 动作详情（可编辑）
│   │   ├── calendar/
│   │   │   ├── index.tsx           # 训练日历 + 存为模板
│   │   │   └── session/
│   │   │       └── [sessionId].tsx # 训练详情
│   │   └── stats/
│   │       └── index.tsx           # 统计分析 + 数据导出/导入
│   └── record/
│       └── [date].tsx              # 训练记录 + 模板导入
├── src/
│   ├── db/                         # SQLite 数据层
│   │   ├── database.ts             # 建表 + 初始化 + 迁移
│   │   ├── exercises.ts            # 动作 CRUD
│   │   ├── sessions.ts             # 训练会话 CRUD
│   │   ├── sets.ts                 # 组数据 CRUD
│   │   ├── videos.ts               # 视频参考 CRUD
│   │   ├── templates.ts            # 训练模板 CRUD
│   │   ├── customStandards.ts      # 自定义标准 CRUD
│   │   └── notes.ts                # 照片 CRUD
│   ├── stores/                     # Zustand 状态
│   │   ├── useExerciseStore.ts
│   │   ├── useTrainingStore.ts
│   │   ├── useCalendarStore.ts
│   │   ├── useTemplateStore.ts
│   │   └── useCustomStandardStore.ts
│   ├── components/                 # 可复用 UI 组件
│   │   ├── ExerciseCard.tsx
│   │   ├── SetRow.tsx / SetEditor.tsx
│   │   ├── VideoCard.tsx
│   │   ├── EmptyState.tsx
│   │   └── ConfirmDialog.tsx
│   ├── utils/
│   │   ├── videoPlatform.ts        # 视频平台识别 + Deep Link
│   │   └── backup.ts               # 数据导出/导入
│   └── constants/
│       └── defaultExercises.ts     # 默认训练动作
├── assets/                         # 图标、启动屏
├── app.json                        # Expo 配置
├── eas.json                        # EAS Build 配置
├── .npmrc                          # npm 配置
└── package.json
```

## 快速开始

```bash
# 安装依赖
npm install --legacy-peer-deps

# 开发模式 (手机扫码)
npx expo start

# Web 预览 (部分功能受限)
npx expo start --web
```

> 手机安装 Expo Go App，扫描终端中的二维码即可运行。

## 构建 APK

```bash
# 首次需要登录 Expo 账号
eas login

# Cloud 构建 APK
eas build --platform android --profile preview
```

构建完成后获得下载链接，直接安装到手机。

## 数据模型

```
Exercise (动作)
  ├── notes (训练心得)
  ├── ExerciseVideo[] (动作级视频)
  └── TrainingSession[] (训练会话, 某天某动作)
        ├── TrainingSet[] (每组: 目标重量/次数/RPE + 实际重量/次数/RPE + 自定义标准)
        ├── SessionImage[] (训练照片)
        └── ExerciseVideo[] (日期级视频)

Template (训练模板)
  └── data: TemplateExercise[] (快照: 动作名 + 组数据)

CustomStandard (自定义标准)
  └── name (全局共享, 组录入时可选取)

日期格式: YYYY-MM-DD
组数据核心字段: target_weight/reps/rpe, weight/reps/rpe, custom_fields(JSON)
```

### 数据表

| 表 | 说明 |
|----|------|
| `exercises` | 训练动作（含心得 notes） |
| `training_sessions` | 训练会话（某天某动作） |
| `training_sets` | 组数据（目标/完成分区 + 自定义标准 JSON） |
| `exercise_videos` | 参考视频（动作级 + 会话级） |
| `session_images` | 训练照片 |
| `templates` | 训练模板（JSON 快照） |
| `custom_standards` | 全局自定义标准库 |

## 设计

**Neon Pop** 青春活力风格 — 浅色底 + 高饱和霓虹色块，面向 20-30 岁健身爱好者。

| 令牌 | 色值 | 用途 |
|------|------|------|
| 页面底 | `#F8F9FA` | 全局背景 |
| 卡片 | `#FFFFFF` | 卡片、列表项，带浅阴影 |
| 主色 | `#FF6B35` 活力橙 | 主按钮、Tab 激活、选中态 |
| 标题 | `#111111` | 主要文字 16-18px Bold |
| 副标题 | `#777777` | 分类、辅助信息 12-14px |
| 边框 | `#E8E8E8` | 卡片边框、分割线 |
| 输入框 | `#F0F0F0` | 输入框背景 |

- 圆角 10-12px，胶囊 Chip 20px
- 卡片浅阴影
- Tab 栏白底 + 橙色激活态

## License

MIT
