import { isEmptyHtml } from './is-empty-html';

describe('isEmptyHtml function', () => {
  test('returns true for empty HTML string', () => {
    const emptyHtml = '';
    expect(isEmptyHtml(emptyHtml)).toBe(true);
  });

  test('returns false for non-empty HTML string', () => {
    const nonEmptyHtml = '<p>Hello, world!</p>';
    expect(isEmptyHtml(nonEmptyHtml)).toBe(false);
  });

  test('returns false for HTML string with img tag', () => {
    const htmlWithImg = '<img src="image.jpg" alt="Image">';
    expect(isEmptyHtml(htmlWithImg)).toBe(false);
  });

  test('returns true for HTML string with whitespace', () => {
    const htmlWithWhitespace = '    ';
    expect(isEmptyHtml(htmlWithWhitespace)).toBe(true);
  });

  test('returns true for HTML string with nested empty tags', () => {
    const htmlWithNestedEmptyTags = '<div><span></span></div>';
    expect(isEmptyHtml(htmlWithNestedEmptyTags)).toBe(true);
  });
});
