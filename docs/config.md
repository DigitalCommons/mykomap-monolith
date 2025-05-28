# Configuration Reference

Here is a reference for all the options in a map's `config.json` file, and what they are used for.

You can also find a working example in the [`back-end test data`](https://github.com/DigitalCommons/mykomap-monolith/tree/main/apps/back-end/test/data/).

TODO: Fill this out for all config options. We currently just have a reference for popup config (W.I.P.)

## Popup layout

The `popup` config field is used to define the layout of the popups, which are dislpayed when items
are clicked on the map. The layout config is declarative and designed to be as simple as possible,
with the front-end handling the conversion of the config into MUI React components.

There are 4 subfields:

- `titleProp` (required): The ID of the itemProp that should be used as the popup's title
- `left-pane`: a list of itemProps to be displayed in the popup's left pane, from top-to-bottom in the layout, including their style definition (see below for more details).
- `top-right-pane`: same as `left-pane` but for the top-right pane of the popup
- `bottom-right-pane`: same as `left-pane` but for the bottom-right pane of the popup

And these are the different options to define the style of an itemProp:

- `valueStyle` (defaults to `text`): This can be one of the following options:
  - `text`: The value(s) of the itemProp are displayed as plain text.
  - `address`: Used in the case of the itemProp value being an address with comma separators (it must be formatted like this upstream). Each address section is displayed on a new line.
  - `hyperlink`: The value(s) of the itemProp are displayed as clickable hyperlinks.
- `showBullets` (defaults to `false`): If an itemProp has multiple values, they are always displayed on multiple lines. If this is set option to true, bullet points will be shown before each value.
- `singleColumnLimit` (number): If specified, a list will split into 2 columns if the number of values is more than this.
- `showLabel` (defaults to `false`): If this is set to true, the label of the itemProp (taken from `titleUri` in the itemProp definition) is displayed as a heading above the value(s).
- `hyperlinkBaseUri` (defaults to None): If `valueStyle` is `hyperlink`, this base URI is prepended to the itemProp value, to form the href.

```
"popup": {
    "titleProp": "name",
    "left-pane": [
      {"itemProp": "category", "valueStyle": "text", "showLabel": true },
      {"itemProp": "description", "valueStyle": "text" }
    ],
    "top-right-pane": [
      {"itemProp": "address", "valueStyle": "address" },
      {"itemProp": "email", "valueStyle": "hyperlink", "baseUri": "mailto:" }
    ],
    "bottom-right-pane": []
  }
```
