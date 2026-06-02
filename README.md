# FitTrack - 健身训练记录

基于 React Native (Expo) 的健身训练记录 App。记录每次训练的动作、组数、重量、RPE，追踪 PR 进步，管理视频参考和训练笔记。

## 功能

| Tab | 功能 |
|-----|------|
| 动作库 | 42 个默认训练动作 + 自定义动作，按分类筛选 |
| 训练日历 | 月历视图 + 每日训练记录，快速录入训练数据 |
| 统计分析 | 训练天数/次数概览、动作排名、训练量统计 |

### 训练记录详情

- 组数据编辑（重量 / 次数 / RPE / PR 标记）
- 视频参考卡片（自动识别 B站 / 抖音 / YouTube，一键跳转）
- 训练心得笔记（支持插入图片）
- 动作级通用视频 + 日期级训练笔记 两层管理

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | React Native (Expo SDK 56) |
| 路由 | expo-router (文件路由) |
| 数据库 | expo-sqlite (本地 SQLite) |
| 状态管理 | Zustand |
| 日历组件 | react-native-calendars |
| 图片选取 | expo-image-picker |
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
│   │   │   ├── index.tsx           # 动作库列表
│   │   │   └── [id].tsx            # 动作详情
│   │   ├── calendar/
│   │   │   ├── index.tsx           # 训练日历
│   │   │   └── session/
│   │   │       └── [sessionId].tsx # 训练详情
│   │   └── stats/
│   │       └── index.tsx           # 统计分析
│   └── record/
│       └── [date].tsx              # 训练记录
├── src/
│   ├── db/                         # SQLite 数据层
│   │   ├── database.ts             # 建表 + 初始化
│   │   ├── exercises.ts            # 动作 CRUD
│   │   ├── sessions.ts             # 训练会话 CRUD
│   │   ├── sets.ts                 # 组数据 CRUD
│   │   ├── notes.ts                # 图片笔记 CRUD
│   │   └── videos.ts               # 视频参考 CRUD
│   ├── stores/                     # Zustand 状态
│   │   ├── useExerciseStore.ts
│   │   ├── useTrainingStore.ts
│   │   └── useCalendarStore.ts
│   ├── components/                 # 可复用 UI 组件
│   │   ├── ExerciseCard.tsx
│   │   ├── SetRow.tsx / SetEditor.tsx
│   │   ├── VideoCard.tsx / NoteCard.tsx
│   │   ├── EmptyState.tsx
│   │   └── ConfirmDialog.tsx
│   ├── utils/
│   │   └── videoPlatform.ts        # 视频平台识别 + Deep Link
│   └── constants/
│       └── defaultExercises.ts     # 默认训练动作
├── assets/                         # 图标、启动屏
├── app.json                        # Expo 配置
├── eas.json                        # EAS Build 配置
└── package.json
```

## 快速开始

```bash
# 安装依赖
npm install

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
  ├── TrainingSession (训练会话, 某天某动作)
  │     ├── TrainingSet[] (每组数据: 重量/次数/RPE/PR)
  │     ├── SessionImage[] (训练照片)
  │     └── ExerciseVideo (日期级视频)
  └── ExerciseVideo[] (动作级视频)

日期格式: YYYY-MM-DD
组数据核心字段: weight(kg), reps, rpe(1-10), is_pr
```

## 设计

暗色工业运动风 — `#1a1a2e` 深海军蓝底 + `#16213e` 分层卡片 + `#e94560` 红色强调。

## License

MIT
