## Logo

The `logo` config field is a child of the `ui` field and is used to define whether a logo should be displayed on the map, and if so where the logo is situated. The optional `smallScreenPosition` and `largeScreenPosition` subfields also allow for fine tuning of the logo position. These values will override the default positioning.

If a config file does not contain a `logo` field, no logo will be displayed on the map.

A new folder has been added `front-end/public/assets/logo` as a central store for logo images.

The `logo` field has 6 subfields

- `largeLogo`: the location of the large logo image e.g.: `/assets/logos/cwm-logo.png`
- `smallLogo`: similar to above, the location of the small logo
- `altText`: any alt text to be associated with the logo
- `smallScreenPosition`: position of the logo on small screens, defined with CSS position properties (top, left)
- `largeScreenPosition`: position of the logo on large screens, defined with CSS position properties (bottom, right)

### Example of the `logo` config field for CWM

```
"ui": {
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
