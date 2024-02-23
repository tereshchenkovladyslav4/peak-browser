export const isEmptyHtml = (htmlString: string) => {
  // Should consider special tags which don't have textContent
  if (htmlString?.includes('<img')) return false;

  const tempElement = document.createElement('div');
  tempElement.innerHTML = htmlString;

  return tempElement.textContent.trim() === '';
};
