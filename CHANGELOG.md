# v4.2.0 - 2026-10-01

## What's Changed
* Submap support
* Custom logo and marker support in a dataset
* Docker containerisation
* Package for Coolify
* Package for Cloudron

## Notable PRs
* change zoom to be initialised from maxZoom by @King-Mob in https://github.com/DigitalCommons/mykomap-monolith/pull/151
* [CWM] 241 / 243 DotCoop search results tick and verified pop-up badge by @ms0ur1s in https://github.com/DigitalCommons/mykomap-monolith/pull/250
* 180 Pan to filter results by @rogup in https://github.com/DigitalCommons/mykomap-monolith/pull/247
* 182 Add marker tooltips by @rogup in https://github.com/DigitalCommons/mykomap-monolith/pull/246
* Containerisation by @wu-lee in https://github.com/DigitalCommons/mykomap-monolith/pull/280
* Remove feature branch from map-gl-js-spiderfy import by @King-Mob in https://github.com/DigitalCommons/mykomap-monolith/pull/302
* 85 About Box supports multiple languages by @codev in https://github.com/DigitalCommons/mykomap-monolith/pull/289
* docs/versioning-and-releases.md - reviewed, added minor edits by @wu-lee in https://github.com/DigitalCommons/mykomap-monolith/pull/307
* 281 powys csv transform by @King-Mob in https://github.com/DigitalCommons/mykomap-monolith/pull/282
* 321 submap urls by @codev in https://github.com/DigitalCommons/mykomap-monolith/pull/329
* Package MM for Coolify by @codev in https://github.com/DigitalCommons/mykomap-monolith/pull/337

**Full Changelog**: https://github.com/DigitalCommons/mykomap-monolith/compare/v4.1.0...v4.2.0

# v4.1.0 - 2025-04-03

* directory panel lists number of co-ops in each country, greyed out if zero
* pagination added to search results panel
* text search across website and domain names
* pop-up can display co-ops with a large number of associated .coop domains
* markers for co-oops at the same location now appear separately
* search panel works on mobile
* migrated to new servers

# v4.0.0 - 2024-11-01

* Rewrite, support 100k+ markers on the map
* Vite, React and Redux front-end
* MapLibre, Fastify back-end with ts-rest contract

# v3.0.0 - 2022-11-15

* Renamed from sea-map
* Moved to TypeScript

# v2.0.0 - 2022-07-22

* Internationalisation for the ICA map: translated vocabularies and popups
* Countries directory
* Sidebar opening behaviour from config

# v1.0.0 - 2021-05-17

* Webpack bundle
* Vocabularies fetched from the SPARQL store through a PHP vocab service
* Prefixes configured in config.json
