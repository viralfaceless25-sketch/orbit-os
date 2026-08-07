export function generateInquiryReference(date: Date = new Date()): string {
  const year = date.getFullYear();
  const seq = String(date.getTime() % 1000).padStart(3, "0");
  return `PRJ-${year}-${seq}`;
}
