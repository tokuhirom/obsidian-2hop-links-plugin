# Obsidian 2Hop Links Plugin

This plugin will display the page linked 2hop ahead.
It displays the link at the bottom of the Markdown editor.
With this plugin, you can roam the digital garden freely.

## Show links under the editor.

<img src="https://raw.githubusercontent.com/tokuhirom/obsidian-2hop-links-plugin/master/docs/img.png" alt="links">

## Preview mode is also supported.

<img src="https://raw.githubusercontent.com/tokuhirom/obsidian-2hop-links-plugin/master/docs/preview.png" alt="preview">

## Commands

You can use following commands. You can bind these commands to a keyboard shortcut.

| Command            | Description                  |
| ------------------ | ---------------------------- |
| Enable 2hop links  | Enable 2hop links temporary  |
| Disable 2hop links | Disable 2hop links temporary |

## Thanks to

This plugin is inspired by [scrapbox](https://scrapbox.io/)
(See also [2 ホップリンクの考察(In Japanese)](https://scrapbox.io/masui/2%E3%83%9B%E3%83%83%E3%83%97%E3%83%AA%E3%83%B3%E3%82%AF%E3%81%AE%E8%80%83%E5%AF%9F)
)

[masui san, the inventor of 2hop link](https://twitter.com/masui/status/1035090656371175424)

This plugin was reviewed by [lishid](https://github.com/obsidianmd/obsidian-releases/pull/263)

## Changes

- 0.7.0 (2021-05-25)
  - Show images in 2hop link boxes.
    You can disable this feature via settings panel.
- 0.6.0 (2021-05-20)
  - Experimental feature: show two hop links on the top of pane. [#25](https://github.com/tokuhirom/obsidian-2hop-links-plugin/issues/25)
    (You can enable this feature by the setting panel)
    Requested by danraymond++
- 0.4.0 (2021-05-17)
  - no changes
- 0.3.0 (2021-05-17)
  - Seperate the out link the in link [#16](https://github.com/tokuhirom/obsidian-2hop-links-plugin/issues/16)
    Reported by gh16683170++
  - Fixed "The obsidian died when including pdf links #15
    "[#15](https://github.com/tokuhirom/obsidian-2hop-links-plugin/issues/15)
    Reported by gh16683170++
  - Do not eat mousedown event with non-primary mouse button. [#19](https://github.com/tokuhirom/obsidian-2hop-links-plugin/pull/19)
- 0.2.0 (2021-05-12)
  - Temporary enable/disable 2hop plugin view by command https://github.com/tokuhirom/obsidian-2hop-links-plugin/pull/13 (Requested by @autonomygaps)
- 0.1.0 (2021-05-12)
  - Fixed broken plugin installation https://github.com/tokuhirom/obsidian-2hop-links-plugin/pull/11 (Reported by gorilla, iiz)
  - Make box size configurable (Requested by iiz)
- 0.0.10 (2021-05-11)
  - Re-enable resolvable 2hop links https://github.com/tokuhirom/obsidian-2hop-links-plugin/pull/7 (Reported by @kdmsnr)

## LICENSE

The MIT License (MIT)

Copyright © 2021 Tokuhiro Matsuno, http://64p.org/ <tokuhirom@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the “Software”), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
