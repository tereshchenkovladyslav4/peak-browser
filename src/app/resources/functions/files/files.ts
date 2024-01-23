export function isImgTypeValid(file: File, ...ValidFileTypes: Array<string>): boolean {
  return ValidFileTypes.map(type => type.toLowerCase()).includes(file.type.split('/')[1])
}

export function isImgSizeValid(file: File, maxSizeInKb: number): boolean {
  return file.size / 1024 <= maxSizeInKb;
}
