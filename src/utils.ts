// is there a better way to get link text?
export function path2linkText(path: string): string {
  return path.replace(/\.md$/, "").replace(/.*\//, "");
}
