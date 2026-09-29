import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes an extra theme with id pink and name Pink', () => {
    const pink = getSelectableThemes().find((theme) => theme.id === 'pink');

    expect(pink?.id).toBe('pink');
    expect(pink?.name).toBe('Pink');
  });
});
