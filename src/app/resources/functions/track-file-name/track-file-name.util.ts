export const trackFileName = (url: string): string => {
  if (url) {
    return url.split('?')[0].split('/').pop();
  }
  return '';
};
