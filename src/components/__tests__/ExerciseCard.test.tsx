import { render, fireEvent } from '@testing-library/react-native';
import { ExerciseCard } from '../ExerciseCard';

describe('ExerciseCard', () => {
  const defaultProps = {
    name: '杠铃卧推',
    category: '胸部',
    onPress: jest.fn(),
  };

  it('渲染动作名称和分类', () => {
    const { getByText } = render(<ExerciseCard {...defaultProps} />);
    expect(getByText('杠铃卧推')).toBeTruthy();
    expect(getByText('胸部')).toBeTruthy();
  });

  it('显示训练次数', () => {
    const { getByText } = render(<ExerciseCard {...defaultProps} sessionCount={12} />);
    expect(getByText('12')).toBeTruthy();
    expect(getByText('次训练')).toBeTruthy();
  });

  it('不传 sessionCount 时隐藏次数组件', () => {
    const { queryByText } = render(<ExerciseCard {...defaultProps} />);
    expect(queryByText('次训练')).toBeNull();
  });

  it('点击触发 onPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ExerciseCard {...defaultProps} onPress={onPress} />
    );
    fireEvent.press(getByText('杠铃卧推'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('长按触发 onLongPress', () => {
    const onLongPress = jest.fn();
    const { getByText } = render(
      <ExerciseCard {...defaultProps} onLongPress={onLongPress} />
    );
    fireEvent(getByText('杠铃卧推'), 'onLongPress');
    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
