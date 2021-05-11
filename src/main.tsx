import { CachedMetadata, MarkdownView, Plugin, TFile } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";
import { FileEntity } from "./model/FileEntity";
import { TwohopLink } from "./model/TwohopLink";
import TwohopLinksRootView from "./ui/TwohopLinksRootView";
import { TagLinks } from "./model/TagLinks";
import { path2linkText } from "./utils";

export default class TwohopLinksPlugin extends Plugin {
  async onload(): Promise<void> {
    console.debug("------ loading obsidian-twohop-links plugin");

    this.app.workspace.on("file-open", this.renderTwohopLinks.bind(this));
    this.app.metadataCache.on("resolve", async (file) => {
      const activeFile: TFile = this.app.workspace.getActiveFile();
      if (activeFile != null) {
        if (file.path == activeFile.path) {
          await this.renderTwohopLinks();
        }
      }
    });
  }

  private async renderTwohopLinks() {
    const markdownView: MarkdownView =
      this.app.workspace.getActiveViewOfType(MarkdownView);
    if (markdownView == null) {
      return;
    }

    // Open the editing file
    const activeFile = markdownView.file;
    if (activeFile == null) {
      return; // Currently focusing window is not related to a file.
    }

    const activeFileCache: CachedMetadata =
      this.app.metadataCache.getFileCache(activeFile);

    // Aggregate links
    const twoHopLinks = this.getTwohopLinks(activeFile);
    const [connectedLinks, newLinks] = await this.getLinks(
      activeFile,
      activeFileCache,
      twoHopLinks
    );

    const tagLinksList = this.getTagLinksList(activeFile, activeFileCache);

    // insert links to the footer
    const markdownEditingEl = markdownView.containerEl.querySelector(
      ".markdown-source-view .CodeMirror-lines"
    );
    const previewEl = markdownView.containerEl.querySelector(
      ".markdown-preview-view"
    );
    await this.injectTwohopLinks(
      connectedLinks,
      newLinks,
      twoHopLinks,
      tagLinksList,
      markdownEditingEl
    );
    await this.injectTwohopLinks(
      connectedLinks,
      newLinks,
      twoHopLinks,
      tagLinksList,
      previewEl
    );
  }

  getTagLinksList(
    activeFile: TFile,
    activeFileCache: CachedMetadata
  ): TagLinks[] {
    if (activeFileCache.tags) {
      const activeFileTagSet = new Set(
        activeFileCache.tags.map((it) => it.tag)
      );
      const tagMap: Record<string, FileEntity[]> = {};
      const seen: Record<string, boolean> = {};
      for (const markdownFile of this.app.vault.getMarkdownFiles()) {
        if (markdownFile == activeFile) {
          continue;
        }
        const cachedMetadata =
          this.app.metadataCache.getFileCache(markdownFile);
        if (cachedMetadata && cachedMetadata.tags) {
          for (const tag of cachedMetadata.tags.filter((it) =>
            activeFileTagSet.has(it.tag)
          )) {
            if (!tagMap[tag.tag]) {
              tagMap[tag.tag] = [];
            }
            if (!seen[markdownFile.path]) {
              const linkText = path2linkText(markdownFile.path);
              tagMap[tag.tag].push(new FileEntity(activeFile.path, linkText));
              seen[markdownFile.path] = true;
            }
          }
        }
      }

      const tagLinksList: TagLinks[] = [];
      for (const tagMapKey of Object.keys(tagMap)) {
        tagLinksList.push(new TagLinks(tagMapKey, tagMap[tagMapKey]));
      }
      return tagLinksList;
    }
    return [];
  }

  private async injectTwohopLinks(
    connectedLinks: FileEntity[],
    newLinks: FileEntity[],
    twoHopLinks: TwohopLink[],
    tagLinksList: TagLinks[],
    el: Element
  ) {
    const containerClass = "twohop-links-container";
    const container: HTMLElement =
      el.querySelector("." + containerClass) ||
      el.createDiv({
        cls: containerClass,
      });
    ReactDOM.render(
      <TwohopLinksRootView
        connectedLinks={connectedLinks}
        newLinks={newLinks}
        twoHopLinks={twoHopLinks}
        tagLinksList={tagLinksList}
        onClick={this.openFile.bind(this)}
        getPreview={this.readPreview.bind(this)}
      />,
      container
    );
  }

  private async openFile(fileEntity: FileEntity) {
    if (fileEntity.sourcePath == null) {
      if (!confirm(`Create new file: ${fileEntity.linkText}?`)) {
        console.log("Canceled!!");
        return false;
      }
    }
    await this.app.workspace.openLinkText(
      fileEntity.linkText,
      fileEntity.sourcePath
    );
  }

  private getTwohopLinks(activeFile: TFile): TwohopLink[] {
    const twoHopLinks: Record<string, FileEntity[]> = {};
    // no unresolved links in this file
    if (this.app.metadataCache.unresolvedLinks[activeFile.path] == null) {
      return [];
    }
    const unresolved = this.aggregate2hopLinks(activeFile);
    if (unresolved == null) {
      return [];
    }
    for (const k of Object.keys(unresolved)) {
      if (unresolved[k].length > 0) {
        twoHopLinks[k] = unresolved[k].map((it) => {
          const linkText = path2linkText(it);
          return new FileEntity(activeFile.path, linkText);
        });
      }
    }

    return Object.keys(this.app.metadataCache.unresolvedLinks[activeFile.path])
      .map((path) => {
        return twoHopLinks[path]
          ? new TwohopLink(FileEntity.fromLink(path), twoHopLinks[path])
          : null;
      })
      .filter((it) => it);
  }

  private aggregate2hopLinks(activeFile: TFile): Record<string, string[]> {
    const links = this.app.metadataCache.unresolvedLinks;
    const result: Record<string, string[]> = {};
    const activeFileLinks = new Set(Object.keys(links[activeFile.path]));

    for (const src of Object.keys(links)) {
      if (src == activeFile.path) {
        continue;
      }
      if (links[src] == null) {
        continue;
      }
      for (const dest of Object.keys(links[src])) {
        if (activeFileLinks.has(dest)) {
          if (!result[dest]) {
            result[dest] = [];
          }
          result[dest].push(src);
        }
      }
    }
    return result;
  }

  private async getLinks(
    activeFile: TFile,
    activeFileCache: CachedMetadata,
    twoHopLinks: TwohopLink[]
  ): Promise<[FileEntity[], FileEntity[]]> {
    const forwardLinks: FileEntity[] = this.getForwardLinks(
      activeFile,
      activeFileCache
    );
    const backlinks: FileEntity[] = this.getBackLinks(activeFile);

    const links: FileEntity[] = forwardLinks.concat(backlinks);

    const connectedLinks: FileEntity[] = [];
    const newLinks: FileEntity[] = [];
    const seen: Record<string, boolean> = {};
    const twoHopLinkSets = new Set<string>(
      twoHopLinks.map((it) => it.link.linkText)
    );
    for (const link of links) {
      const key = link.key();
      if (seen[key]) {
        continue;
      }
      seen[key] = true;

      if (link.sourcePath) {
        connectedLinks.push(link);
      } else {
        // Exclude links, that are listed on two hop links
        if (!twoHopLinkSets.has(link.linkText)) {
          newLinks.push(link);
        }
      }
    }

    return [connectedLinks, newLinks];
  }

  private getForwardLinks(
    activeFile: TFile,
    activeFileCache: CachedMetadata
  ): FileEntity[] {
    if (activeFileCache == null) {
      // sometime, we can't get metadata cache from obsidian.
      console.log(`Missing activeFileCache '${activeFile.path}`);
    } else {
      if (activeFileCache.links != null) {
        return activeFileCache.links.map((it) => {
          const file = this.app.metadataCache.getFirstLinkpathDest(it.link, "");
          const path = file != null ? file.path : null; // null if the file doesn't created
          return new FileEntity(path, it.link);
        });
      }
    }
    return [];
  }

  private getBackLinks(activeFile: TFile): FileEntity[] {
    const name = activeFile.path;
    const resolvedLinks: Record<string, Record<string, number>> =
      this.app.metadataCache.resolvedLinks;
    const result: FileEntity[] = [];
    for (const src of Object.keys(resolvedLinks)) {
      for (const dest of Object.keys(resolvedLinks[src])) {
        if (dest == name) {
          const linkText = path2linkText(src);
          result.push(new FileEntity(activeFile.path, linkText));
        }
      }
    }
    return result;
  }

  private async readPreview(fileEntity: FileEntity) {
    const file = this.app.metadataCache.getFirstLinkpathDest(
      fileEntity.linkText,
      fileEntity.sourcePath
    );
    if (file == null) {
      return "";
    }
    const content = await this.app.vault.read(file);
    // Remove YFM
    const lines = content.replace(/.*^---$/gms, "").split(/\n/);
    return lines
      .filter((it) => {
        return (
          it.match(/\S/) &&
          !it.match(/^#/) && // Skip header line & tag only line.
          !it.match(/^https?:\/\//) // Skip URL only line.
        );
      })
      .first();
  }

  onunload(): void {
    console.log("unloading plugin");
  }
}
