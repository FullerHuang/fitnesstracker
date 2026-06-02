import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Alert, Platform } from 'react-native';
import { getAllExercises, importExercise, Exercise } from '../db/exercises';
import { getAllSessions, importSession, TrainingSession } from '../db/sessions';
import { getAllSets, importSet, TrainingSet } from '../db/sets';
import { getAllVideos, importVideo, ExerciseVideo } from '../db/videos';
import { getAllTemplates, importTemplate, Template } from '../db/templates';

interface ExportData {
  version: number;
  app: string;
  exported_at: string;
  data: {
    exercises: Exercise[];
    training_sessions: TrainingSession[];
    training_sets: TrainingSet[];
    exercise_videos: ExerciseVideo[];
    templates: Template[];
    images: never[];
  };
}

export async function exportData(): Promise<void> {
  try {
    const exportObj: ExportData = {
      version: 1,
      app: 'FitnessTracker',
      exported_at: new Date().toISOString(),
      data: {
        exercises: getAllExercises(),
        training_sessions: getAllSessions(),
        training_sets: getAllSets(),
        exercise_videos: getAllVideos(),
        templates: getAllTemplates(),
        images: [],
      },
    };

    const json = JSON.stringify(exportObj, null, 2);
    const filename = `FitnessTracker_backup_${new Date().toISOString().split('T')[0]}.json`;
    const filePath = `${FileSystem.cacheDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(filePath, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'application/json',
        dialogTitle: '导出训练数据',
        UTI: 'public.json',
      });
    } else {
      Alert.alert('分享不可用', '当前设备不支持文件分享功能');
    }
  } catch (e) {
    console.error('Export failed:', e);
    Alert.alert('导出失败', '导出数据时出错，请重试');
  }
}

export async function importData(): Promise<void> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parsed = JSON.parse(content);

    if (parsed.app !== 'FitnessTracker' || parsed.version !== 1) {
      Alert.alert('无效的备份文件', '该文件不是 FitnessTracker 的备份文件或格式不兼容');
      return;
    }

    const d = parsed.data;
    if (!d || !Array.isArray(d.exercises) || !Array.isArray(d.training_sessions)) {
      Alert.alert('无效的备份文件', '备份文件数据格式不正确');
      return;
    }

    const counts = [
      `动作: ${(d.exercises ?? []).length} 个`,
      `训练记录: ${(d.training_sessions ?? []).length} 条`,
      `训练组: ${(d.training_sets ?? []).length} 组`,
      `视频: ${(d.exercise_videos ?? []).length} 个`,
      `模板: ${(d.templates ?? []).length} 个`,
    ].join('\n');

    return new Promise((resolve) => {
      Alert.alert('导入数据预览', `即将导入以下内容：\n\n${counts}\n\n导入不会覆盖已有数据（同 ID 则合并）`, [
        { text: '取消', style: 'cancel', onPress: () => resolve() },
        {
          text: '确认导入',
          onPress: () => {
            try {
              (d.exercises ?? []).forEach((row: Exercise) => importExercise(row));
              (d.training_sessions ?? []).forEach((row: TrainingSession) => importSession(row));
              (d.training_sets ?? []).forEach((row: TrainingSet) => importSet(row));
              (d.exercise_videos ?? []).forEach((row: ExerciseVideo) => importVideo(row));
              (d.templates ?? []).forEach((row: Template) => importTemplate(row));
              Alert.alert('导入完成', '数据已成功导入，请重新打开应用以刷新数据');
              resolve();
            } catch (e) {
              console.error('Import failed:', e);
              Alert.alert('导入失败', '写入数据时出错，请重试');
              resolve();
            }
          },
        },
      ]);
    });
  } catch (e) {
    console.error('Import failed:', e);
    Alert.alert('导入失败', '读取备份文件时出错，请确认文件格式正确');
  }
}
