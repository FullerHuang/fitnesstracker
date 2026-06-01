export interface DefaultExercise {
  name: string;
  category: string;
}

export const DEFAULT_EXERCISES: DefaultExercise[] = [
  // 胸部
  { name: '杠铃卧推', category: '胸部' },
  { name: '哑铃卧推', category: '胸部' },
  { name: '上斜卧推', category: '胸部' },
  { name: '下斜卧推', category: '胸部' },
  { name: '哑铃飞鸟', category: '胸部' },
  { name: '绳索夹胸', category: '胸部' },
  { name: '双杠臂屈伸', category: '胸部' },
  { name: '俯卧撑', category: '胸部' },
  // 背部
  { name: '引体向上', category: '背部' },
  { name: '杠铃划船', category: '背部' },
  { name: '哑铃划船', category: '背部' },
  { name: '坐姿划船', category: '背部' },
  { name: '高位下拉', category: '背部' },
  { name: '硬拉', category: '背部' },
  { name: '罗马尼亚硬拉', category: '背部' },
  // 腿部
  { name: '深蹲', category: '腿部' },
  { name: '前蹲', category: '腿部' },
  { name: '腿举', category: '腿部' },
  { name: '腿弯举', category: '腿部' },
  { name: '腿伸展', category: '腿部' },
  { name: '保加利亚分腿蹲', category: '腿部' },
  { name: '臀桥', category: '腿部' },
  // 肩部
  { name: '杠铃推举', category: '肩部' },
  { name: '哑铃推举', category: '肩部' },
  { name: '侧平举', category: '肩部' },
  { name: '前平举', category: '肩部' },
  { name: '俯身飞鸟', category: '肩部' },
  { name: '阿诺德推举', category: '肩部' },
  // 手臂
  { name: '杠铃弯举', category: '手臂' },
  { name: '哑铃弯举', category: '手臂' },
  { name: '锤式弯举', category: '手臂' },
  { name: '三头臂屈伸', category: '手臂' },
  { name: '绳索下压', category: '手臂' },
  { name: '窄距卧推', category: '手臂' },
  // 核心
  { name: '平板支撑', category: '核心' },
  { name: '卷腹', category: '核心' },
  { name: '悬垂举腿', category: '核心' },
  { name: '俄罗斯转体', category: '核心' },
  // 有氧
  { name: '跑步', category: '有氧' },
  { name: '跳绳', category: '有氧' },
  { name: '划船机', category: '有氧' },
  { name: '骑行', category: '有氧' },
];
