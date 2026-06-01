import { Linking } from 'react-native';

export type VideoPlatform = 'bilibili' | 'douyin' | 'youtube' | 'other';

export function detectPlatform(url: string): VideoPlatform {
  if (url.includes('bilibili.com') || url.includes('b23.tv')) return 'bilibili';
  if (url.includes('douyin.com') || url.includes('iesdouyin.com')) return 'douyin';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  return 'other';
}

export function getPlatformLabel(platform: VideoPlatform): string {
  switch (platform) {
    case 'bilibili':
      return 'B站';
    case 'douyin':
      return '抖音';
    case 'youtube':
      return 'YouTube';
    default:
      return '链接';
  }
}

export async function openVideo(url: string): Promise<boolean> {
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  return false;
}
