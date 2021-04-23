import {
	App,
	CachedMetadata,
	MarkdownPreviewView,
	MarkdownView,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile
} from 'obsidian';
import React from 'react';
import ReactDOM from 'react-dom';
import CardView from "./ui/CardView";
import {FileEntity} from "./model/FileEntity";
import {TwoHopLink} from "./model/TwoHopLink";
import AdvancedLinksView from "./ui/AdvancedLinksView";

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

		const basicCards = await this.getBasicCards(activeFile, activeFileCache);
		const twoHopLinks = this.getTwoHopLinks(activeFile);

		console.log("KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK")
		console.log(basicCards)

		await this.renderAdvancedLinks(basicCards, twoHopLinks, markdownEditingEl)
		await this.renderAdvancedLinks(basicCards, twoHopLinks, previewEl)
	}

	private async renderAdvancedLinks(basicCards: FileEntity[], twoHopLinks: TwoHopLink[], el:Element) {
		const container: HTMLElement = el.querySelector('.backlinks') || el.createDiv({
			cls: 'backlinks'
		})
		ReactDOM.render(<AdvancedLinksView
				basicCards={basicCards}
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

	private getTwoHopLinks(activeFile: TFile) {
		const unresolved = this.aggregate2hopLinks(activeFile, this.app.metadataCache.unresolvedLinks);
		const resolved: Record<string, string[]> = this.aggregate2hopLinks(activeFile, this.app.metadataCache.resolvedLinks)
		const twoHopLinks: Record<string, FileEntity[]> = {}
		for (let target of [unresolved, resolved]) {
			for (let k of Object.keys(target)) {
				if (target[k].length > 0) {
					twoHopLinks[k] = target[k].map(it => FileEntity.fromPath(it))
				}
			}
		}
		const twoHopLinks2: TwoHopLink[] = Object.keys(
				this.app.metadataCache.unresolvedLinks[activeFile.path]
		).concat(
				Object.keys(this.app.metadataCache.resolvedLinks[activeFile.path])
		).map(path => {
			return twoHopLinks[path] ? new TwoHopLink(path, twoHopLinks[path]) : null
		}).filter(it => it)
		return twoHopLinks2;
	}

	private async getBasicCards(activeFile: TFile, activeFileCache: CachedMetadata): Promise<FileEntity[]> {
		let forwardLinks: FileEntity[] = this.getForwardLinks(activeFile, activeFileCache);

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

		return links.filter(onlyUnique)
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
	private aggregate2hopLinks(activeFile: TFile, links: Record<string, Record<string, number>>) {
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

