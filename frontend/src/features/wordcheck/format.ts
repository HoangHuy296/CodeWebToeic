/** "1p 29s" for >= 1 minute, "45s" otherwise. Ported from the standalone toeic-web app. */
export function fmtTime(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}p ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
}
