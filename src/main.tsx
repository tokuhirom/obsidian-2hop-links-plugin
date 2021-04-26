import {
	CachedMetadata,
	MarkdownPreviewView,
	MarkdownView,
	Plugin,
	TFile
} from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom';
import {FileEntity} from "./model/FileEntity";
import {TwoHopLink} from "./model/TwoHopLink";
import AdvancedLinksView from "./ui/AdvancedLinksView";

export default class AdvancedLinksPlugin extends Plugin {

	async onload() {
		console.log('------ loading obsidian-structured-links plugin');

		console.log(this.registerView);

		console.log('loaded obsidian-structured-links plugin');

		this.app.workspace.on('file-open', this.renderAdvancedLinks.bind(this))
		this.app.metadataCache.on("resolve", async file => {
			let activeFile: TFile = this.app.workspace.getActiveFile();
			if (activeFile != null) {
				if (file.path == activeFile.path) {
					await this.renderAdvancedLinks()
				}
			}
		})
	}

	private async renderAdvancedLinks() {
		const activeLeaf = this.app.workspace.activeLeaf

		if (!activeLeaf) {
			return
		}

		const activeView = activeLeaf.view

		const isAllowedView = activeView instanceof MarkdownView || activeView instanceof MarkdownPreviewView
		if (!isAllowedView) {
			return
		}

		// Open the editing file
		let activeFile: TFile = this.app.workspace.getActiveFile();
		if (activeFile == null) {
			return // Currently focusing window is not related to a file.
		}

		let activeFileCache: CachedMetadata = this.app.metadataCache.getFileCache(activeFile)

		// Aggregate links
		const twoHopLinks = this.getTwoHopLinks(activeFile);
		const [connectedLinks, newLinks] = await this.getLinks(activeFile, activeFileCache, twoHopLinks);

		// insert links to the footer
		const markdownEditingEl =
				activeView.containerEl.querySelector('.mod-active .markdown-source-view .CodeMirror-lines')
				|| document.querySelector(".mod-active .markdown-source-view")
		const previewEl = activeView.containerEl.querySelector('.mod-active .markdown-preview-view')
		await this.injectAdvancedLinks(connectedLinks, newLinks, twoHopLinks, markdownEditingEl)
		await this.injectAdvancedLinks(connectedLinks, newLinks, twoHopLinks, previewEl)
	}

	private async injectAdvancedLinks(connectedLinks: FileEntity[], newLinks: FileEntity[], twoHopLinks: TwoHopLink[], el:Element) {
		const containerClass = 'advanced-links-container'
		const container: HTMLElement = el.querySelector('.' + containerClass) || el.createDiv({
			cls: containerClass
		})
		ReactDOM.render(<AdvancedLinksView
				connectedLinks={connectedLinks}
				newLinks={newLinks}
				twoHopLinks={twoHopLinks}
				onClick={this.openFile.bind(this)}
				getPreview={this.readPreview.bind(this)}
		/>, container);
	}

	private async openFile(fileEntry :FileEntity) {
		if (fileEntry.path == null) {
			if (!confirm(`Create new file: ${fileEntry.title}?`)) {
				console.log("Canceled!!")
				return false
			}
		}
		await this.app.workspace.openLinkText(fileEntry.title, fileEntry.path)
	}

	private getTwoHopLinks(activeFile: TFile) : TwoHopLink[] {
		const twoHopLinks: Record<string, FileEntity[]> = {}
		// no unresolved links in this file
		if (this.app.metadataCache.unresolvedLinks[activeFile.path] == null) {
			return []
		}
		let unresolved = this.aggregate2hopLinks(activeFile);
		if (unresolved == null) {
			return []
		}
		for (let k of Object.keys(unresolved)) {
			if (unresolved[k].length > 0) {
				twoHopLinks[k] = unresolved[k].map(it => FileEntity.fromPath(it))
			}
		}

		return Object.keys(
				this.app.metadataCache.unresolvedLinks[activeFile.path]
		).map(path => {
			return twoHopLinks[path] ? new TwoHopLink(FileEntity.fromLink(path), twoHopLinks[path]) : null
		}).filter(it => it);
	}

	private aggregate2hopLinks(activeFile: TFile): Record<string, string[]> {
		const links = this.app.metadataCache.unresolvedLinks
		const result: Record<string, string[]> = {}
		let activeFileLinks = new Set(Object.keys(links[activeFile.path]))

		for (let src of Object.keys(links)) {
			if (src == activeFile.path) {
				continue
			}
			if (links[src] == null) {
				continue
			}
			for (let dest of Object.keys(links[src])) {
				if (activeFileLinks.has(dest)) {
					if (!result[dest]) {
						result[dest] = []
					}
					result[dest].push(src)
				}
			}
		}
		return result
	}

	private async getLinks(activeFile: TFile, activeFileCache: CachedMetadata, twoHopLinks: TwoHopLink[]): Promise<[FileEntity[], FileEntity[]]> {
		const forwardLinks: FileEntity[] = this.getForwardLinks(activeFile, activeFileCache);
		const backlinks: FileEntity[] = this.getBackLinks(activeFile.path)

		const links: FileEntity[] = forwardLinks.concat(backlinks)

		let connectedLinks: FileEntity[] = []
		let newLinks: FileEntity[] = []
		let seen : Record<string, boolean> = {}
		const twoHopLinkSets = new Set<string>(twoHopLinks.map(it => it.link.title))
		for (let link of links) {
			const key = link.key()
			if (seen[key]) {
				continue
			}
			seen[key] = true

			if (link.path) {
				connectedLinks.push(link)
			} else {
				// Exclude links, that are listed on two hop links
				if (!twoHopLinkSets.has(link.title)) {
					newLinks.push(link)
				}
			}
		}

		return [connectedLinks, newLinks]
	}

	private getForwardLinks(activeFile: TFile, activeFileCache: CachedMetadata): FileEntity[] {
		if (activeFileCache == null) {
			// sometime, we can't get metadata cache from obsidian.
			console.log(`Missing activeFileCache '${activeFile.path}`)
		} else {
			if (activeFileCache.links != null) {
				return activeFileCache.links.map(it => {
					const file = this.app.metadataCache.getFirstLinkpathDest(it.link, '')
					const path = file != null ? file.path : null // null if the file doesn't created
					return new FileEntity(path, it.link)
				})
			}
		}
		return []
	}

	private getBackLinks(name: string):FileEntity[] {
		const resolvedLinks: Record<string, Record<string, number>> = this.app.metadataCache.resolvedLinks;
		const result: FileEntity[] = []
		for (let src of Object.keys(resolvedLinks)) {
			for (let dest of Object.keys(resolvedLinks[src])) {
				if (dest == name) {
					result.push(FileEntity.fromPath(src))
				}
			}
		}
		return result
	}



	private async readPreview(path: string) {
		let file: TFile| null =  this.app.vault.getFiles().filter(it => {
			return it.path == path
		}).first()
		if (path == null) {
			return ''
		}
		const content = await this.app.vault.read(file)
		// Remove YFM
		const lines = content.replace(/.*^---$/gms, '').split(/\n/)
		return lines.filter(it => {
			return (
					it.match(/\S/)
					&& !it.match(/^#/) // Skip header line & tag only line.
					&& !it.match(/^https?:\/\//) // Skip URL only line.
			)
		}).first()
	}

	onunload() {
		console.log('unloading plugin');
	}
}


