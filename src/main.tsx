import {
	App,
	CachedMetadata,
	ItemView,
	MarkdownPreviewView,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	WorkspaceLeaf
} from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom';
import CardView from "./ui/CardView";
import {FileEntity} from "./model/FileEntity";
import {path2title} from "./utils";

interface StructuredLinksPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: StructuredLinksPluginSettings = {
	mySetting: 'default'
}

const VIEW_TYPE_STRUCTURED_LINKS = 'tokuhirom.obsidian-structured-links-plugin';

export default class StructuredLinksPlugin extends Plugin {
	settings: StructuredLinksPluginSettings;

	async onload() {
		console.log('------ loading obsidian-structured-links plugin');

		await this.loadSettings();
		console.log(this.registerView);

		this.addSettingTab(new StructuredLinksSettingTab(this.app, this));

		console.log('loaded obsidian-structured-links plugin');

		this.app.workspace.on('file-open', this.renderBacklinks.bind(this))
		this.app.metadataCache.on("resolve", file => {
			let activeFile: TFile = this.app.workspace.getActiveFile();
			if (activeFile != null) {
				if (file.path == activeFile.path) {
					this.renderBacklinks()
				}
			}
		})
	}

	private renderBacklinks() {
		const activeLeaf = this.app.workspace.activeLeaf

		if (!activeLeaf) {
			return
		}

		const activeView = activeLeaf.view

		const isAllowedView = activeView instanceof MarkdownView || activeView instanceof MarkdownPreviewView

		if (!isAllowedView) {
			return
		}

		// activeView.containerEl.createDiv({
		// 	cls: 'structured-links-container'
		// }, el => {
		// 	el.textContent = 'hello'
		// })

		// if (!this.isPluginLeafExists) {
		// 	this.clear()
		// 	this.createPluginLeaf()
		// }
		//
		// const { prBacklinkLeaf, mdBacklinkLeaf } = this.data

		// const mdLeafEl = mdBacklinkLeaf.view.containerEl.parentNode as HTMLElement
		// const prLeafEl = prBacklinkLeaf.view.containerEl.parentNode as HTMLElement

		// markdown editing view element
		const mdEl =
				activeView.containerEl.querySelector('.mod-active .markdown-source-view .CodeMirror-lines')
				|| document.querySelector(".mod-active .markdown-source-view")
		// preview view element
		const prEl = activeView.containerEl.querySelector('.mod-active .markdown-preview-view')
		console.log(`prEl=${prEl}, mdEl=${mdEl}`)

		const backlinksContainer: HTMLElement = mdEl.querySelector('.backlinks') || mdEl.createDiv({
			cls: 'backlinks'
		})
		backlinksContainer.empty()

		// Open the editing file
		let activeFile: TFile = this.app.workspace.getActiveFile();
		if (activeFile == null) {
			return // Currently focusing window is not related to a file.
		}

		let activeFileCache: CachedMetadata = this.app.metadataCache.getFileCache(activeFile)

		backlinksContainer.createDiv({
			text: new Date() + activeFile.name
		});

		// forward links
		this.renderBasicCardsView(backlinksContainer, activeFile, activeFileCache);

		// 2hop links
		if (activeFileCache != null && activeFileCache.links != null) {
			this.render2hopLinks(activeFile, backlinksContainer, this.app.metadataCache.unresolvedLinks);
			this.render2hopLinks(activeFile, backlinksContainer, this.app.metadataCache.resolvedLinks);
		}

		// If preview element doesn't have a backlinks container, then add it.
		{
			const prElBackLinkEl = prEl.querySelector('.backlinks')
			if (prElBackLinkEl!=null){
				prElBackLinkEl.remove()
			}
			const cloned = backlinksContainer.cloneNode(true)
			prEl.appendChild(cloned)
		}

		// const prEl = activeView.containerEl.querySelector('.mod-active .markdown-preview-view')

		// mdEl?.appendChild(mdLeafEl)
		// prEl?.appendChild(prLeafEl)

		// await this.updateBacklinks(file)
		// @ts-ignore
		// await this.saveData({ ids: [mdBacklinkLeaf.id, prBacklinkLeaf.id] })
	}

	private async renderBasicCardsView(backlinksContainer: HTMLElement, activeFile: TFile, activeFileCache: CachedMetadata) {
		const basicLinksContainer = backlinksContainer.createDiv({
			cls: ['structured-link-clearfix']
		})

		let forwardLinks: FileEntity[] = this.getForwardLinks(activeFile, activeFileCache);
		// forwardLinks.forEach(async it => {
		// 	await this.createBox(basicLinksContainer, it.path, it.title)
		// })

		// back links
		const backlinks: FileEntity[] = getBackLinks(this.app, activeFile.path)

		const links: FileEntity[] = forwardLinks.concat(backlinks)

		let seen : Record<string, boolean> = {}
		function onlyUnique(value: FileEntity) {
			const key = value.path != null ? value.path : value.title;
			if (seen[key]) {
				return false
			}
			seen[key] = true
			return true
		}

		const unique = links.filter(onlyUnique)

		console.log(`backlinks: ${backlinks.length}`)
		for (let i = 0; i < unique.length; i++) {
			const it = unique[i];
			await this.createBox(basicLinksContainer, it.path, it.title)
		}
	}

	private getForwardLinks(activeFile: TFile, activeFileCache: CachedMetadata): FileEntity[] {
		if (activeFileCache == null) {
			// sometime, we can't get metadata cache from obsidian.
			console.log(`Missing activeFileCache '${activeFile.path}`)
		} else {
			console.log(activeFileCache.links)
			if (activeFileCache.links != null) {
				return activeFileCache.links.map(it => {
					console.log(it)
					console.log(`CALC!!! link=${it.link} displayText=${it.displayText}`)
					const file = this.app.metadataCache.getFirstLinkpathDest(it.link, '')
					const path = file != null ? file.path : null // null if the file doesn't created
					return new FileEntity(path, it.displayText)
				})
			}
		}
		return []
	}

	private render2hopLinks(activeFile: TFile, backlinksContainer: HTMLElement, targetLinks: Record<string, Record<string, number>>) {
		const result = this.getThings(activeFile, targetLinks)
		const links = Object.keys(targetLinks[activeFile.path])
		backlinksContainer.createDiv({
			cls: ['structured-link-clearfix']
		}, async el => {
			for (const link of links) {
				if (!result[link]) {
					continue;
				}
				el.createEl('div', {
					text: path2title(link),
					cls: ['structured-link-header', 'structured-link-box']
				})
				for (const path of result[link]) {
					const title = path2title(path)
					await this.createBox(el, path, title)
				}
			}
		})
	}

	// Aggregate 2hop links
	private getThings(activeFile: TFile, links: Record<string, Record<string, number>>) {
		let activeFileLinks = new Set(Object.keys(links[activeFile.path]))
		const result: Record<string, string[]> = {}

		for (let src of Object.keys(links)) {
			if (src == activeFile.path) {
				continue
			}
			for (let dest of Object.keys(links[src])) {
				if (activeFileLinks.has(dest)) {
					if (!result[dest]) {
						result[dest] = []
					}
					result[dest].push(src)
				}
				// if (src.match(/Conn|Miss/) || dest.match(/Conn|Miss/)) { // debugging
				// 	console.log(`resolved ${src} => ${dest}`)
				// }
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

	private async createBox(container: HTMLElement, path: string, title: string) {
		// create preview.
		let preview = await this.readPreview(path)

		const box = container.createDiv({})

		const onclick = async (path: string, title:string) => {
			if (path == null || path == 'null') {
				if (!confirm(`Create new file: ${title}?`)) {
					console.log("Canceled!!")
					return false
				}
			}
			await this.app.workspace.openLinkText(title, path)
		};

		ReactDOM.render(<CardView path={path} title={title} preview={preview} onClick={onclick}/>, box);
		// TODO preview に画像を対応させる like scrapbox
	}

	onunload() {
		console.log('unloading plugin');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class StructuredLinksSettingTab extends PluginSettingTab {
	private plugin: StructuredLinksPlugin;

	constructor(app: App, plugin: StructuredLinksPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue('')
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}

function getBackLinks(app: App, name: string):FileEntity[] {
	const resolvedLinks: Record<string, Record<string, number>> = app.metadataCache.resolvedLinks;
	// this.app.metadataCache.resolvedLinks
	let backLinksDeduper: Record<string, boolean> = {} // use Record for de-dup
	console.log(`getBackLinksTarget=${name}`)
	let i= 0;
	for (let src of Object.keys(resolvedLinks)) {
		// console.log(`k=${k}`)
		for (let dest of Object.keys(resolvedLinks[src])) {
			i+=1
			if (dest.startsWith('アニメ')) {
				console.log(`HIT!! -- src=${src} dest=${dest}`)
			}
			// if (i>10) {
			// 	return [] //DEBUG
			// }
			if (dest == name) {
				console.log(`Backlinks HIT!: ${src}`)
				backLinksDeduper[src] = true
			}
		}
	}
	return Object.keys(backLinksDeduper).map(path => FileEntity.fromPath(path))
}

