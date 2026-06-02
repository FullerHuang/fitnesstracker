import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { detectPlatform, getPlatformLabel, openVideo } from '../utils/videoPlatform';

interface Props {
  url: string;
  title: string;
  onDelete?: () => void;
}

export function VideoCard({ url, title, onDelete }: Props) {
  const platform = detectPlatform(url);
  const platformLabel = getPlatformLabel(platform);

  const handlePress = async () => {
    const ok = await openVideo(url);
    if (!ok) {
      Alert.alert('无法打开链接', '请确认已安装对应 App');
    }
  };

  return (
    <Pressable style={styles.card} onPress={handlePress} onLongPress={onDelete}>
      <View style={styles.platformBadge}>
        <Text style={styles.platformText}>{platformLabel}</Text>
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title || url}
      </Text>
      <Text style={styles.url} numberOfLines={1}>
        {url}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B35',
  },
  platformBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 6,
  },
  platformText: { fontSize: 11, color: '#111111' },
  title: { fontSize: 14, fontWeight: '600', color: '#111111', marginBottom: 4 },
  url: { fontSize: 12, color: '#777777' },
});
