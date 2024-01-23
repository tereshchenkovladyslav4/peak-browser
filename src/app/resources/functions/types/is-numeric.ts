export function isNumeric(num: any): boolean {
  return (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && !isNaN(num as number);
}
