import {App, ItemView, Plugin, PluginSettingTab, Setting, WorkspaceLeaf} from 'obsidian';

interface StructuredLinksPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: StructuredLinksPluginSettings = {
	mySetting: 'default'
}

const VIEW_TYPE_STRUCTURED_LINKS = 'tokuhirom.obsidian-structured-links-plugin';

export default class StructuredLinksPlugin extends Plugin {
	settings: StructuredLinksPluginSettings;
	view: StructuredLinksView;

	async onload() {
		console.log('------ loading obsidian-structured-links plugin');

		await this.loadSettings();
		console.log(this.registerView);

		this.addSettingTab(new StructuredLinksSettingTab(this.app, this));

		this.registerView(VIEW_TYPE_STRUCTURED_LINKS, (leaf) => {
			console.log("Creating StructuredLinksView~~")
			this.view = new StructuredLinksView(leaf);
			return this.view;
		});

		this.app.workspace.onLayoutReady(this.initLeaf.bind(this))
		console.log('loaded obsidian-structured-links plugin');
	}

	onunload() {
		console.log('unloading plugin');
	}

	initLeaf(): void {
		if (this.app.workspace.getLeavesOfType(VIEW_TYPE_STRUCTURED_LINKS).length) {
			let view = this.app.workspace.getLeavesOfType(VIEW_TYPE_STRUCTURED_LINKS)[0]
			this.view = (view.view as StructuredLinksView)
			this.view.render()
			return;
		}

		this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_STRUCTURED_LINKS,
		});
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

class StructuredLinksView extends ItemView {

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
		console.log("Created StructuredLinksView")
	}

	getDisplayText(): string {
		// console.log("StructuredLinksView.getDisplayText")
		return "Structured Links";
	}

	getViewType(): string {
		// console.log("StructuredLinksView.getViewType")
		return VIEW_TYPE_STRUCTURED_LINKS;
	}
	getIcon(): string {
		return 'search';
	}

	onClose(): Promise<void> {
		return Promise.resolve();
	}

	async onOpen(): Promise<void> {
		console.log('opening structured!')
		this.render()
	}

	public load(): void {
		super.load();
		console.log("StructuredLinksView.LOAD!")
		this.registerEvent(this.app.workspace.on('file-open', this.update.bind(this)));
	}

	render() {
		let activeFile = this.app.workspace.getActiveFile();
		if (activeFile == null) {
			return // Currently focusing window is not related to a file.
		}


		const dom = (this as any).contentEl as HTMLElement;
		dom.empty()

		console.log("HAHAHA?!?")
		console.log(`HAHAHA? this=${this}`)

		console.log(`activeFile`)
		console.log(activeFile)
		console.log(`activeFile.name=${activeFile.name}`)

		const container = dom.createDiv({
			cls: 'container'
		})

		container.createEl('div', {
			text: 'hahahahaha!!?? ' + new Date() + activeFile.name
		});

		// let fileCache = this.app.metadataCache.getFileCache(activeFile);
		// let p2 = this.app.metadataCache.getCache(activeFile.name)

		// show links
		const linksContainer = container.createDiv({
			'cls': 'links'
		});

		let p2 = this.app.metadataCache.getFileCache(activeFile)
		if (p2 == null) {
			console.log("Missing p2")
		} else {
			console.log(p2.links)
			p2.links.forEach(it => {
				console.log(it)
				this.createBox(linksContainer, it.displayText, 'b')
			})
		}

		container.appendChild(linksContainer)
		// console.log(`frontmatter={fileCache.frontmatter}`)
		// this.app.metadataCache.resolvedLinks
	}

	private createBox(container: HTMLElement, title: string, preview: string) {
		const box = container.createDiv({cls: 'box'})
		const titleEl = box.createDiv({cls: 'title'})
		titleEl.textContent = title
		const previewEl = box.createDiv({cls: 'preview'})
		previewEl.textContent = preview
		box.appendChild(titleEl)
		box.appendChild(previewEl)
		// preview に画像を対応させる like scrapbox
	}

	private update() {
		this.render()
	}
}
