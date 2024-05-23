# Obsidian Heading Shifter

![github workflow](https://img.shields.io/github/workflow/status/k4a-dev/obsidian-heading-shifter/jest?style=for-the-badge)
![github release](https://img.shields.io/github/v/release/k4a-dev/obsidian-heading-shifter?style=for-the-badge)
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/kasahala)

Easily Shift and Change markdown headings.

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

### Apply Headings

![Applying Heading Demo](https://raw.githubusercontent.com/k4a-dev/obsidian-heading-shifter/main/doc/attachment/applyingHeading.gif)

#### Commands

| Command           | Description                         | Hotkey |
| ----------------- | ----------------------------------- | ------ |
| Apply Heading 0   | Change Current line to no heading.  | -      |
| Apply Heading 1~6 | Change Current line to heading 1~6. | -      |

> It is useful to assign a hotkey such as `Ctrl + 0 ~ 6`

### Shift Headings

![Headings Shift Demo](https://raw.githubusercontent.com/k4a-dev/obsidian-heading-shifter/main/doc/attachment/shiftHeadings.gif)

#### Settings

| Setting                      | Description                                                                             | Value(Default) |
| ---------------------------- | --------------------------------------------------------------------------------------- | -------------- |
| Lower limit of Heading       | The lower Heading Size that will be decreased by the Heading Shift                      | 0~6(1)         |
| Enable override tab behavior | If true, Tab execute "Increase Headings" and Shift-Tab execute "Decrease Headings" [^2] | boolean(false) |

[^2]: May conflict with other plugin behavior

#### Commands

| Command           | Description                                      | Hotkey |
| ----------------- | ------------------------------------------------ | ------ |
| Increase Headings | Increase heading of selected lines(with heading) |        |
| Decrease Headings | Decrease heading of selected lines(with heading) |        |

> It is useful to assign a hotkey such as `Ctrl + Shift + Left/Right`

-   `Increase Headings` is ineffective if selected lines contains less than `Lower limit of Heading`.
-   `Decrease Headings` is ineffective if selected lines contains more than heading 6.

### Insert Headings

#### Commands

| Command                            | Description                                       | Hotkey |
| ---------------------------------- | ------------------------------------------------- | ------ |
| Insert Heading at current level    | Change current line headings to current level     |        |
| Insert Heading at one level deeper | Change current line headings to current level + 1 |        |
| Insert Heading at one level higher | Change current line headings to current level - 1 |        |

## Common Settings

| Setting         | Description                                                               | Value(Default)    |
| --------------- | ------------------------------------------------------------------------- | ----------------- |
| Style to remove | If this style is at the beginning of a line, remove it and make it Heading | boolean(All true) |

### Detailed Description
#### Style to remove

This is the toggle between removing or retaining the leading `-` or `1.`,`2.`,... when applying Heading in a "single" row.

before
```
- line
```

after (`True`)
```
## line
```

after (`False`)
```
## - line
```


#### Use Case

Operate headings like an outliner like the following,

```markdown
# The Festival Myster -> hit "Apply 1"

This is a great document.

## Chapter One -> hit "Insert deeper"

### Prologue -> hit "Insert deeper"

The sun was setting over the horizon...

### The Summer Festival -> hit "Insert current"

As the townspeople gathered in the town square...

## Chapter Two -> hit "Insert higher"

### The Mystery of the Missing Prize -> hit "Insert deeper"

As the summer festival came to a close...
```

If you want to make headings deeper or higher than 2, use "shift" or "apply".

## Loadmap

Nothing specific at this time.

## Contribute

Feel free to report issues or request features.
