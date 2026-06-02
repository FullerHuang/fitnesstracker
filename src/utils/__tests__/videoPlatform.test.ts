import { detectPlatform, getPlatformLabel } from '../videoPlatform';

describe('detectPlatform', () => {
  it('识别 B站 bilibili.com', () => {
    expect(detectPlatform('https://www.bilibili.com/video/BV1xx411c7mD')).toBe('bilibili');
  });

  it('识别 B站短链 b23.tv', () => {
    expect(detectPlatform('https://b23.tv/abcd1234')).toBe('bilibili');
  });

  it('识别抖音 douyin.com', () => {
    expect(detectPlatform('https://www.douyin.com/video/123456789')).toBe('douyin');
  });

  it('识别抖音 iesdouyin.com', () => {
    expect(detectPlatform('https://www.iesdouyin.com/share/video/123/')).toBe('douyin');
  });

  it('识别 YouTube youtube.com', () => {
    expect(detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('youtube');
  });

  it('识别 YouTube 短链 youtu.be', () => {
    expect(detectPlatform('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
  });

  it('未知平台返回 other', () => {
    expect(detectPlatform('https://example.com/video')).toBe('other');
  });

  it('空字符串返回 other', () => {
    expect(detectPlatform('')).toBe('other');
  });
});

describe('getPlatformLabel', () => {
  it('bilibili → B站', () => {
    expect(getPlatformLabel('bilibili')).toBe('B站');
  });

  it('douyin → 抖音', () => {
    expect(getPlatformLabel('douyin')).toBe('抖音');
  });

  it('youtube → YouTube', () => {
    expect(getPlatformLabel('youtube')).toBe('YouTube');
  });

  it('other → 链接', () => {
    expect(getPlatformLabel('other')).toBe('链接');
  });
});
