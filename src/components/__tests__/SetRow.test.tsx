import { render, fireEvent } from '@testing-library/react-native';
import { SetRow } from '../SetRow';
import type { SetData } from '../SetRow';

describe('SetRow', () => {
  const defaultSet: SetData = {
    set_number: 1,
    weight: 60,
    reps: 8,
    rpe: 7,
    is_pr: false,
  };

  const defaultProps = {
    set: defaultSet,
    onChange: jest.fn(),
    onDelete: jest.fn(),
  };

  it('渲染组号', () => {
    const { getByText } = render(<SetRow {...defaultProps} />);
    expect(getByText('第1组')).toBeTruthy();
  });

  it('显示重量和次数', () => {
    const { getByDisplayValue } = render(<SetRow {...defaultProps} />);
    expect(getByDisplayValue('60')).toBeTruthy();
    expect(getByDisplayValue('8')).toBeTruthy();
  });

  it('显示 RPE 值', () => {
    const { getByDisplayValue } = render(<SetRow {...defaultProps} />);
    expect(getByDisplayValue('7')).toBeTruthy();
  });

  it('RPE 为 null 时显示占位符', () => {
    const set: SetData = { ...defaultSet, rpe: null };
    const { getByPlaceholderText } = render(
      <SetRow {...defaultProps} set={set} />
    );
    expect(getByPlaceholderText('-')).toBeTruthy();
  });

  it('PR switch 关闭时渲染', () => {
    const { getByText } = render(<SetRow {...defaultProps} />);
    expect(getByText('PR')).toBeTruthy();
  });

  it('点击删除按钮触发 onDelete', () => {
    const onDelete = jest.fn();
    const { getByText } = render(
      <SetRow {...defaultProps} onDelete={onDelete} />
    );
    fireEvent.press(getByText('X'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('修改重量输入框触发 onChange', () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = render(
      <SetRow {...defaultProps} onChange={onChange} />
    );
    fireEvent.changeText(getByDisplayValue('60'), '80');
    expect(onChange).toHaveBeenCalledWith({ ...defaultSet, weight: 80 });
  });

  it('修改次数输入框触发 onChange', () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = render(
      <SetRow {...defaultProps} onChange={onChange} />
    );
    fireEvent.changeText(getByDisplayValue('8'), '12');
    expect(onChange).toHaveBeenCalledWith({ ...defaultSet, reps: 12 });
  });

  it('修改 RPE 输入触发 onChange 带 null 处理', () => {
    const onChange = jest.fn();
    const { getByDisplayValue } = render(
      <SetRow {...defaultProps} onChange={onChange} />
    );
    fireEvent.changeText(getByDisplayValue('7'), '');
    expect(onChange).toHaveBeenCalledWith({ ...defaultSet, rpe: null });
  });
});
