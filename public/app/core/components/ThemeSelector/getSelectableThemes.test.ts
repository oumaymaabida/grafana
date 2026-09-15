import { getSelectableThemes } from './getSelectableThemes';

describe('getSelectableThemes', () => {
  it('includes the Pink extra theme', () => {
    const pink = getSelectableThemes().find((theme) => theme.id === 'pink');

    expect(pink).toEqual(expect.objectContaining({ id: 'pink', name: 'Pink' }));
  });
});
