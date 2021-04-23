import {
	App,
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

export default class StructuredLinksPlugin extends Plugin {

	async onload() {
		console.log('------ loading obsidian-structured-links plugin');

		console.log(this.registerView);

		console.log('loaded obsidian-structured-links plugin');

		this.app.workspace.on('file-open', this.renderBacklinks.bind(this))
		this.app.metadataCache.on("resolve", async file => {
			let activeFile: TFile = this.app.workspace.getActiveFile();
			if (activeFile != null) {
				if (file.path == activeFile.path) {
					await this.renderBacklinks()
				}
			}
		})
	}

	private async renderBacklinks() {
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

		// markdown editing view element
		const markdownEditingEl =
				activeView.containerEl.querySelector('.mod-active .markdown-source-view .CodeMirror-lines')
				|| document.querySelector(".mod-active .markdown-source-view")
		// preview view element
		const previewEl = activeView.containerEl.querySelector('.mod-active .markdown-preview-view')

		const twoHopLinks = this.getTwoHopLinks(activeFile);
		const [connectedLinks, newLinks] = await this.getBasicCards(activeFile, activeFileCache, twoHopLinks);

		await this.renderAdvancedLinks(connectedLinks, newLinks, twoHopLinks, markdownEditingEl)
		await this.renderAdvancedLinks(connectedLinks, newLinks, twoHopLinks, previewEl)
	}

	private async renderAdvancedLinks(connectedLinks: FileEntity[], newLinks: FileEntity[], twoHopLinks: TwoHopLink[], el:Element) {
		const container: HTMLElement = el.querySelector('.advanced-links-container') || el.createDiv({
			cls: 'advanced-links-container'
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
		if (fileEntry.path == null || fileEntry.path == 'null') {
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
		let unresolved = this.aggregate2hopLinks(activeFile, this.app.metadataCache.unresolvedLinks);
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
			return twoHopLinks[path] ? new TwoHopLink(path, twoHopLinks[path]) : null
		}).filter(it => it);
	}

	private async getBasicCards(activeFile: TFile, activeFileCache: CachedMetadata, twoHopLinks: TwoHopLink[]): Promise<[FileEntity[], FileEntity[]]> {
		const forwardLinks: FileEntity[] = this.getForwardLinks(activeFile, activeFileCache);
		const backlinks: FileEntity[] = getBackLinks(this.app, activeFile.path)

		const links: FileEntity[] = forwardLinks.concat(backlinks)

		let connectedLinks: FileEntity[] = []
		let newLinks: FileEntity[] = []
		let seen : Record<string, boolean> = {}
		const twoHopLinkSets = new Set<string>(twoHopLinks.map(it => it.link))
		for (let link of links) {
			const key = link.key()
			if (seen[key]) {
				continue
			}
			seen[key] = true

			if (link.path) {
				connectedLinks.push(link)
			} else {
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
			console.log(activeFileCache.links)
			if (activeFileCache.links != null) {
				return activeFileCache.links.map(it => {
					console.log(`CALC!!! link=${it.link} displayText=${it.displayText} original=${it.original}`)
					const file = this.app.metadataCache.getFirstLinkpathDest(it.link, '')
					const path = file != null ? file.path : null // null if the file doesn't created
					return new FileEntity(path, it.link)
				})
			}
		}
		return []
	}

	// Aggregate 2hop links
	private aggregate2hopLinks(activeFile: TFile, links: Record<string, Record<string, number>>): Record<string, string[]> {
		const result: Record<string, string[]> = {}
		if (links[activeFile.path] == null) {
			return result
		}
		let activeFileLinks = new Set(Object.keys(links[activeFile.path]))
		if (links == null) {
			return result
		}

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
			return it.match(/\S/) && !it.match(/^#[a-zA-Z]+\s*$/)
		}).first()
	}

	onunload() {
		console.log('unloading plugin');
	}
}


function getBackLinks(app: App, name: string):FileEntity[] {
	const resolvedLinks: Record<string, Record<string, number>> = app.metadataCache.resolvedLinks;
	let backLinksDeduper: Record<string, boolean> = {} // use Record for de-dup
	console.log(`getBackLinksTarget=${name}`)
	let i= 0;
	for (let src of Object.keys(resolvedLinks)) {
		for (let dest of Object.keys(resolvedLinks[src])) {
			i+=1
			if (dest == name) {
				console.log(`Backlinks HIT!: ${src}`)
				backLinksDeduper[src] = true
			}
		}
	}
	return Object.keys(backLinksDeduper).map(path => FileEntity.fromPath(path))
}

