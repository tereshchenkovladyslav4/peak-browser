export const trackContentType = (fileName: string) => {
  const ext = fileName?.split('.')?.pop();
  switch (ext) {
    case 'docx': {
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
  }
  return '';
};
