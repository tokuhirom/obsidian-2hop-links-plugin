import { App, PluginSettingTab, Setting } from "obsidian";
import TwohopLinksPlugin from "./main";

export interface TwohopPluginSettings {
  boxWidth: string;
  boxHeight: string;
}

export const DEFAULT_SETTINGS: TwohopPluginSettings = {
  boxWidth: "162px",
  boxHeight: "178px",
};

export class TwohopSettingTab extends PluginSettingTab {
  plugin: TwohopLinksPlugin;

  constructor(app: App, plugin: TwohopLinksPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const containerEl = this.containerEl;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Box Width")
      .setDesc("Width of the boxes")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.boxWidth)
          .setValue(this.plugin.settings.boxWidth)
          .onChange(async (value) => {
            this.plugin.settings.boxWidth = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Box Height")
      .setDesc("Height of the boxes")
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.boxHeight)
          .setValue(this.plugin.settings.boxHeight)
          .onChange(async (value) => {
            this.plugin.settings.boxHeight = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
