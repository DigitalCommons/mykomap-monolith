# Client Specific Enhancements

Although we have endeavoured to make the code in this project client agnostic, restricting most configurable elements to the map's `config.json` file, this has not always been possible. For clarity, instances of client specific code have been documented below. 

## Cooperative World Map (CWM) / DotCooperation


### 1. DotCoop Tick Indicator Next to DotCoop Organisations in Search Results

`apps/front-end/src/app/configSlice.ts`
- `datasources` set when config is loaded
- Selector added to access this property

`apps/front-end/src/components/panel/panelSlice.ts`
- Includes an optional `datasources` array

`apps/front-end/src/components/panel/resultsPanel/results/dotCoopKey/DotCoopKey.tsx`
- Key to explain DotCoop tick

`apps/front-end/src/components/panel/resultsPanel/results/resultItem/ResultItem.tsx`
- Tick icon displayed beside DotCoop-verified results

`apps/front-end/src/components/panel/resultsPanel/results/Results.tsx`
- `DotCoopKey` component added to explain DotCoop tick

<br>

### 2. DotCoop Badge Displayed in the Pop-ups of Verified Organisations

`apps/front-end/src/components/popup/leftPane/dotCoop/dotCoopVerifiedBadge/DotCoopVerifiedBadge.tsx`
- Badge component 

`apps/front-end/src/components/popup/leftPane/LeftPane.tsx`
- `DotCoopVerifiedBadge` added to display conditionally

<br>

### 3. DotCoop Hyperlinked Ad in Pop-up

`apps/front-end/src/components/popup/leftPane/dotCoop/dotCoopAd/DotCoopAd.tsx`
- DotCoop ad that links to `https://identity.coop/register/`

`apps/front-end/src/components/popup/leftPane/LeftPane.tsx`
- `DotCoopAd` component added, to display dependant on map

<br>

### 4. DotCoop Map Key Label Override

`apps/front-end/src/components/map/mapKey/MapKey.tsx`

- Includes a client-specific map key label override for CWM
- Where the derived marker label is DotCooperation, the displayed text is **.coop verified**

<br>

> ### Note
> Powys specific code has not been documented here, as this will soon be deprecated and the specific options handle by the map's `config.json` file.
