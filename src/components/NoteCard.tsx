import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

interface Props {
  content: string;
  images: string[];
  onPress: () => void;
}

export function NoteCard({ content, images, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {content ? (
        <Text style={styles.content} numberOfLines={3}>
          {content}
        </Text>
      ) : (
        <Text style={styles.placeholder}>点击添加训练心得...</Text>
      )}
      {images.length > 0 ? (
        <View style={styles.imageRow}>
          {images.slice(0, 4).map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.thumb} />
          ))}
          {images.length > 4 ? (
            <View style={styles.moreBadge}>
              <Text style={styles.moreText}>+{images.length - 4}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
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
  },
  content: { fontSize: 14, color: '#111111', lineHeight: 20, marginBottom: 8 },
  placeholder: { fontSize: 14, color: '#999999', fontStyle: 'italic' },
  imageRow: { flexDirection: 'row', gap: 6 },
  thumb: { width: 56, height: 56, borderRadius: 6 },
  moreBadge: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
