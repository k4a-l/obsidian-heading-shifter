# Obsidian Heading Shifter

![github workflow](https://img.shields.io/github/workflow/status/k4a-dev/obsidian-heading-shifter/jest?style=for-the-badge)
![github release](https://img.shields.io/github/v/release/k4a-dev/obsidian-heading-shifter?style=for-the-badge)
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/kasahala)

Easily Shift and Change markdown headings.

## Demo

![Demo](https://raw.githubusercontent.com/k4a-dev/obsidian-heading-shifter/main/doc/attachment/shiftHeadings.gif)

## Why use this plugin

Obsidian links numerous markdown files to form knowledge. Daily rearrangement of links is important to create a good knowledge base.

The following situations often occur in this process.

1. Cut out A part of File 1 to an independent File 2 and linked.
    - Heading3 in file 1 is changed to Heading1 in file 2
2. Incorporated the content of File 3 into a part of File 4
    - Heading2 in file 3 is changed to Heading4 in file 4

With this plugin, you can change the Heading size (the number of `#`) in a batch instead of changing it manually.

## How to install

### From within Obsidian

You can activate this plugin within Obsidian by doing the following:

-   Open Settings > Community plugin
-   Make sure `Restricted mode` is off
-   Click Browse `community plugins`
-   Search for `Heading Shifter`
-   Click `Install` -> `Enable`

### Manual installation

Download directory(includes `main.js, manifest.json, styles.css`) from the latest release and put them into `<vault>/.obsidian/plugins/` folder.

## Features

### Applying Heading

![Applying Heading Demo](https://raw.githubusercontent.com/k4a-dev/obsidian-heading-shifter/main/doc/attachment/applyingHeading.gif)

#### Commands

\*All commands work when only one line is selected.

| Command           | Description                         | Hotkey |
| ----------------- | ----------------------------------- | ------ |
| Apply Heading 0   | Change Current line to no heading.  | -      |
| Apply Heading 1~6 | Change Current line to heading 1~6. | -      |

> It is useful to assign a hotkey such as `Ctrl + 0 ~ 6`

### Headings Shift

![Headings Shift Demo](https://raw.githubusercontent.com/k4a-dev/obsidian-heading-shifter/main/doc/attachment/shiftHeadings.gif)

#### Settings

| Setting                | Description                                                        | Value |
| ---------------------- | ------------------------------------------------------------------ | ----- |
| Lower limit of Heading | The lower Heading Size that will be decreased by the Heading Shift | 0~6   |

#### Commands

| Command           | Description                                      | Hotkey |
| ----------------- | ------------------------------------------------ | ------ |
| Increase Headings | Increase heading of selected lines(with heading) |        |
| Decrease Headings | Decrease heading of selected lines(with heading) |        |

> It is useful to assign a hotkey such as `Ctrl + Shift + Left/Right`

-   `Increase Headings` is ineffective if selected lines contains less than `Lower limit of Heading`.
-   `Decrease Headings` is ineffective if selected lines contains more than heading 6.

## Loadmap

Nothing specific at this time.

## Contribute

Feel free to report issues or request features.
