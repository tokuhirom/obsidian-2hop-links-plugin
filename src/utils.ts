// is there a better way to get title?
export function path2title(path: string): string {
  return path.replace(/\.md$/, "").replace(/.*\//, "");
}
