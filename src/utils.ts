// is there a better way to get link text?
export function path2linkText(path: string): string {
  return path.replace(/\.md$/, "").replace(/.*\//, "");
}

// Remove block reference. e.g. `[[somefile#^7e8e5f]]`
export function removeBlockReference(src: string): string {
  return src.replace(/#.*$/, "");
}
