import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes Pink as a selectable extra theme', () => {
    const pink = getSelectableThemes().find((theme) => theme.id === 'pink');

    expect(pink?.id).toBe('pink');
    expect(pink?.name).toBe('Pink');
    expect(pink?.isExtra).toBe(true);
  });
});
