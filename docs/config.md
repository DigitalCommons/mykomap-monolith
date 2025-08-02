# Configuration Reference

Here is a reference for all the options in a map's `config.json` file, and what they are used for.

You can also find a working example in the [`back-end test data`](https://github.com/DigitalCommons/mykomap-monolith/tree/main/apps/back-end/test/data/).

TODO: Fill this out for all config options. We currently just have a reference for popup config (W.I.P.)

## Popup layout

The `popup` config field is used to define the layout of the popups, which are displayed when items
are clicked on the map. The layout config is declarative and designed to be as simple as possible,
with the front-end handling the conversion of the config into MUI React components.

There are 4 subfields:

- `titleProp` (required): The ID of the itemProp that should be used as the popup's title
- `leftPane`: a list of itemProps to be displayed in the popup's left pane, from top-to-bottom in the layout, including their style definition (see below for more details).
- `topRightPane`: same as `leftPane` but for the top-right pane of the popup
- `bottomRightPane`: same as `leftPane` but for the bottom-right pane of the popup

And these are the different options to define the style of an itemProp:

- `valueStyle` (defaults to `text`): This can be one of the following options:
  - `text`: The value(s) of the itemProp are displayed as plain text.
  - `address`: Used in the case of the itemProp value being an address with comma separators (it must be formatted like this upstream). Each address section is displayed on a new line.
  - `hyperlink`: The value(s) of the itemProp are displayed as clickable hyperlinks.
- `showBullets` (defaults to `false`): If an itemProp has multiple values, they are always displayed on multiple lines. If this is set option to true, bullet points will be shown before each value.
- `singleColumnLimit` (number): If specified, a list will split into 2 columns if the number of values is more than this.
- `showLabel` (defaults to `false`): If this is set to true, the label of the itemProp (taken from `titleUri` in the itemProp definition) is displayed as a heading above the value(s).
- `hyperlinkBaseUri` (defaults to None): If `valueStyle` is `hyperlink`, this base URI is prepended to the itemProp value, to form the href.
- `displayText` (defaults to None): If `valueStyle` is `hyperlink`, this sets the display text of the hyperlink.
- `multiple` (defaults to false): If this is true, the value is an array.

```
"popup": {
    "titleProp": "name",
    "leftPane": [
      {"itemProp": "category", "valueStyle": "text", "showLabel": true },
      {"itemProp": "description", "valueStyle": "text" },
      {"itemProp": "website", "valueStyle": "hyperlink", "displayText": "Website",  }
    ],
    "topRightPane": [
      {"itemProp": "address", "valueStyle": "address" },
      {"itemProp": "email", "valueStyle": "hyperlink", "baseUri": "mailto:" }
    ],
    "bottomRightPane": []
  }
```

<br />

---

<br />

## Logo

The `logo` config field is a child of the `ui` field and is used to define logo display and position on the map. The optional `smallScreenPosition` and `largeScreenPosition` subfields also allow for fine tuning of the logo position. These values will override the default positioning.

If a config file does not contain a `logo` field, no logo will be displayed on the map.

A new folder has been added `front-end/public/assets/logo` as a central store for logo images.

The `logo` field has 6 subfields

- `largeLogo`: the location of the large logo image e.g.: `/assets/logos/cwm-logo.png`
- `smallLogo`: similar to above, the location of the small logo
- `altText`: any alt text to be associated with the logo
- `smallScreenPosition`: position of the logo on small screens, defined with CSS position properties (top, left)
- `largeScreenPosition`: position of the logo on large screens, defined with CSS position properties (bottom, right)

### Example of the `logo` config field for **CWM**

```
"ui": {
  "logo": {
    "largeLogo": "./assets/logos/cwm-logo.png",
    "smallLogo": "./assets/logos/cwm-logo-small.png",
    "altText": "Cooperative World Map",
    "smallScreenPosition": {
      "top": "0",
      "left": "5px"
    },
    "largeScreenPosition": {
      "bottom": "-25px",
      "right": "-5px"
    }
  }
},
```

<br />

---

<br />

## Map

The `map` config field is also a child of the `ui` field and is used to define the boundaries of a map. If a config contains no `map` field, the whole of the world map will be displayed by default, à la the **CWM**.

The `map` field has 1 subfield

- `mapBounds`: an array the countains the longitude and latitude of the map's boundaries

### The `map` config object including the **Powys** map boundaries

```
"ui": {
  "map": {
    "mapBounds": [
      [-5.5, 51.3],
      [-2.5, 53.5]
    ]
  }
},
```

### The `ui` field including the `directory_panel_field`, `filterableFields`, `map` and `logo` child fields

```
"ui": {
  "directory_panel_field": "country_id",
  "filterableFields": [
    "country_id",
    "primary_activity",
    "organisational_structure",
    "typology"
  ],
  "map": {
    "mapBounds": [
      [-5.5, 51.3],
      [-2.5, 53.5]
    ]
  },
  "logo": {
    "largeLogo": "/assets/logos/cwm-logo.png",
    "smallLogo": "/assets/logos/cwm-logo-small.png",
    "altText": "Cooperative World Map",
    "smallScreenPosition": {
      "top": "0",
      "left": "5px"
    },
    "largeScreenPosition": {
      "bottom": "-25px",
      "right": "-5px"
    }
  }
},
```

<br />

---

<br />

## Pluralisation

Pluralisation rules can differ per language, requiring the use of extra suffixes. `zero`, `one` and `other` are sufficient for English, Spanish, French and Hindi, and fine for our current instance of CWM. However, Welsh and Arabic have six categories according to **[CLDR ](https://cldr.unicode.org/index/cldr-spec/plural-rules)** and **[i18next](https://www.i18next.com/translation-function/plurals)** follows this: 
   - `zero` (when n = 0)
   - `one` (when n = 10)
   - `two` (when n = 2)
   - `few` (when n= 3)
   - `many` (when n = 6)
   - `other` (everything else)

Omission of the required plural forms will cause the translation to fallback to the default language. [This tool](https://jsfiddle.net/6bpxsgd4) can be used to determine the necessary plural suffixes, and list of the two letter ISO language codes can be found [here](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes).
<br>

### Welsh UI translations including `two`, `few` and `many`

```
"ui": {
      "cy": {
        "title": "Cyfieithiadau",
        "terms": {
          "directory": "Cyfeiriadur",
          "food_system_categories": "Categori",
          "primary_food_system_category": "Categori",
          "locality": "Tref",
          "matching_results_zero": "Dim canlyniadau cyfatebol",
          "matching_results_one": "{{count}} canlyniad cyfatebol",
          "matching_results_two": "{{count}} canlyniadau cyfatebol",
          "matching_results_few": "{{count}} canlyniadau cyfatebol",
          "matching_results_many": "{{count}} canlyniadau cyfatebol",
          "matching_results_other": "{{count}} canlyniadau cyfatebol",
          "directory_entries_zero": "Dim cofnodion cyfeiriadur",
          "directory_entries_one": "{{count}} cofnod cyfeiriadur",
          "directory_entries_two": "{{count}} gofnodion cyfeiriadur",
          "directory_entries_few": "{{count}} gofnodion cyfeiriadur",
          "directory_entries_many": "{{count}} gofnodion cyfeiriadur",
          "directory_entries_other": "{{count}} cofnodion cyfeiriadur",
          "search": "Chwilio",
          "clear_search": "Clirio'r chwiliad",
          "any": "Unrhyw",
          "map": "Map",
          "about": "Ynghylch",
          "no_location_available": "Dim lleoliad ar gael"
        }
      }
    }
```
