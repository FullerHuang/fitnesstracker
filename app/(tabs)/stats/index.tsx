import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { getDatabase } from '@/db/database';
import { EmptyState } from '@/components/EmptyState';
import { exportData, importData } from '@/utils/backup';

interface StatRow {
  exercise_name: string;
  category: string;
  session_count: number;
  total_sets: number;
  max_weight: number;
  total_volume: number;
}

export default function StatsScreen() {
  const [stats, setStats] = useState<StatRow[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    try {
      const db = getDatabase();
      const dayResult = db.getFirstSync<{ cnt: number }>(
        'SELECT COUNT(DISTINCT date) as cnt FROM training_sessions;'
      );
      setTotalDays(dayResult?.cnt ?? 0);
      const sessionResult = db.getFirstSync<{ cnt: number }>(
        'SELECT COUNT(*) as cnt FROM training_sessions;'
      );
      setTotalSessions(sessionResult?.cnt ?? 0);
      const rows = db.getAllSync<StatRow>(
      `SELECT
        e.name as exercise_name,
        e.category,
        COUNT(DISTINCT ts.id) as session_count,
        COUNT(tset.id) as total_sets,
        COALESCE(MAX(tset.weight), 0) as max_weight,
        COALESCE(SUM(tset.weight * tset.reps), 0) as total_volume
      FROM exercises e
      LEFT JOIN training_sessions ts ON ts.exercise_id = e.id
      LEFT JOIN training_sets tset ON tset.session_id = ts.id
      GROUP BY e.id
      ORDER BY session_count DESC;`
    );
    setStats(rows.filter((r) => r.session_count > 0));
    } catch {
      setTotalDays(0);
      setTotalSessions(0);
      setStats([]);
    }
  }, []);

  const maxVolume = stats.length > 0 ? Math.max(...stats.map((s) => s.total_volume)) : 1;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>训练统计</Text>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.summaryDays]}>
          <Text style={styles.summaryNum}>{totalDays}</Text>
          <Text style={styles.summaryLabel}>训练天数</Text>
        </View>
        <View style={[styles.summaryCard, styles.summarySessions]}>
          <Text style={styles.summaryNum}>{totalSessions}</Text>
          <Text style={styles.summaryLabel}>总训练次数</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>动作排名</Text>
      {stats.length === 0 ? (
        <EmptyState icon="📊" title="还没有训练数据" subtitle="开始训练后这里会展示详细统计" />
      ) : (
        stats.map((row, i) => (
          <View key={i} style={styles.statRow}>
            <View style={styles.statLeft}>
              <View style={[styles.rankBadge, i < 3 ? styles.rankTop : undefined]}>
                <Text style={[styles.rankText, i < 3 ? styles.rankTopText : undefined]}>
                  {i + 1}
                </Text>
              </View>
              <View>
                <Text style={styles.statName}>{row.exercise_name}</Text>
                <Text style={styles.statCat}>{row.category}</Text>
              </View>
            </View>
            <View style={styles.statRight}>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{row.session_count}</Text>
                <Text style={styles.statUnit}>次</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{row.total_sets}</Text>
                <Text style={styles.statUnit}>组</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statVal}>{row.max_weight}</Text>
                <Text style={styles.statUnit}>kg</Text>
              </View>
            </View>
          </View>
        ))
      )}

      {stats.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>总训练量排名</Text>
          <Text style={styles.sectionSubtitle}>kg × reps</Text>
          {stats.map((row, i) => {
            const pct = Math.min(100, (row.total_volume / maxVolume) * 100);
            return (
              <View key={i} style={styles.volumeRow}>
                <Text style={styles.volumeName} numberOfLines={1}>
                  {row.exercise_name}
                </Text>
                <View style={styles.volumeTrack}>
                  <View style={[styles.volumeBar, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.volumeVal}>{row.total_volume.toLocaleString()}</Text>
              </View>
            );
          })}
        </>
      )}

      <View style={styles.backupDivider} />
      <Text style={styles.sectionTitle}>数据备份</Text>
      <Text style={styles.sectionSubtitle}>导出训练数据为 JSON 文件，以后可以重新导入</Text>
      <View style={styles.backupRow}>
        <Pressable style={styles.backupBtn} onPress={exportData}>
          <Text style={styles.backupBtnIcon}>📤</Text>
          <Text style={styles.backupBtnText}>导出数据</Text>
        </Pressable>
        <Pressable style={styles.backupBtnOutline} onPress={importData}>
          <Text style={styles.backupBtnIcon}>📥</Text>
          <Text style={styles.backupBtnTextOutline}>导入数据</Text>
        </Pressable>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
    paddingTop: 20,
    paddingBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 22,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryDays: { backgroundColor: '#FFFFFF' },
  summarySessions: { backgroundColor: '#F0F0F0' },
  summaryNum: { fontSize: 40, fontWeight: '800', color: '#FF6B35' },
  summaryLabel: { fontSize: 13, color: '#777777', marginTop: 6, fontWeight: '500' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#777777',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  statLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rankBadge: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankTop: { backgroundColor: '#FF6B35' },
  rankText: { fontSize: 14, fontWeight: '700', color: '#777777' },
  rankTopText: { color: '#fff' },
  statName: { fontSize: 15, fontWeight: '600', color: '#111111' },
  statCat: { fontSize: 11, color: '#777777', marginTop: 1 },
  statRight: { flexDirection: 'row', gap: 18 },
  statItem: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  statVal: { fontSize: 18, fontWeight: '700', color: '#111111' },
  statUnit: { fontSize: 11, color: '#777777' },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  volumeName: { width: 80, fontSize: 13, color: '#111111', fontWeight: '500' },
  volumeTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  volumeBar: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 5,
    minWidth: 4,
  },
  volumeVal: {
    width: 70,
    fontSize: 12,
    color: '#777777',
    textAlign: 'right',
    fontWeight: '500',
  },
  backupDivider: { height: 1, backgroundColor: '#F0F0F0', marginHorizontal: 16, marginTop: 32 },
  backupRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginTop: 12 },
  backupBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
  },
  backupBtnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF6B35',
  },
  backupBtnIcon: { fontSize: 16 },
  backupBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  backupBtnTextOutline: { color: '#FF6B35', fontSize: 15, fontWeight: '700' },
});
