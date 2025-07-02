## Logo

The `logo` config field is a child of the `ui` field and is used to define whether a logo should be displayed on the map, and if so where the logo is situated.

If config file does not contain a `logo` field, by default no logo will be displayed on the map.

A new folder has been added `front-end/public/assets/logo` as a central store for logo images.

The `logo` has 4 subfields

- `showLogo` (required): this is a boolean, and it is necessary to set this to true if the.
- `largeLogo`: the location of the large logo image eg: `/assets/logos/cwm-logo.png`
- `smallLogo`: similar to above, the location of the small logo
- `altText`: any alt text to be associated with the logo

```
"ui": {
    "logo": {
      "showLogo": true,
      "largeLogo": "/assets/logos/cwm-logo.png",
      "smallLogo": "/assets/logos/cwm-logo-small.png",
      "altText": "Cooperative World Map"
    }
  },
```
