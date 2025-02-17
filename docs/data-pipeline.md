# Mykomap Data

This aims to describe the Mykomap 4.x back-end data format, and the
process for generating it.

## Where is the data stored?

Mykomap's data is stored in JSON files below a designated directory on
the server.

The back-end application needs to be configured with the path to this
directory with an entry in `.env`:

    SERVER_DATA_ROOT=/some/path

If this is not set, the default is to use the data in the back-end
application's `test/data` directory - equivalent to setting:

    SERVER_DATA_ROOT=test/data

There should be a dataset in there which is used for unit
testing. Using this ad the default means the back-end has a dataset
available out of the box.

> [!NOTE]
> The `SERVER_DATA_ROOT` path can be relative, in which case it is
> relative to the current working directory of the
> application. Typically, when run from an `npm` run-script, this is
> the root back-end application directory.

## What format is the Mykomap data stored as?

The directory structure looks like this, in schematic form:

    <dataroot>/
               <dataset X>/
                           about.md
                           config.json
                           locations.json
                           searchable.json
                           items/
                                 0.json
                                 ... <more item files> ...
                                 <N>.json
               <dataset Y>/
                           ... <same files as above> ...
                           items/
                                 ... <item files> ...
               ... <more datasets> ...

> [!INFO]
> File names in the schematic above should be interpreted literally -
> except when enclosed in angle brackets, which means the name is
> symbolic.

A brief synopsis of these files' structure and purpose:

- `about.md`: A human readable description of the dataset, in [markdown]
  format. It gets shown in the "about" side-bar panel of the map.
- `config.json`: Meta-data for the dataset, such as property schema,
  vocabulary definitions, and map configuration parameters goes here.
- `locations.json`: An ordered list of longitude/latitude locations,
  one per data item.
- `searchable.json`: An ordered index of the searchable and filterable
  item properties.
- `items/*.json`: These files store the full information for each data
  item.

More details of these files can be found in the section below, under
[More Details](#more-details).

## Why is the format like this?

The aims of this format's design are to:

- Support very large dataset sizes, of approaching 500 thousand items.
- Allow maximally fast responses to browsers loading and querying
  these datasets via the API, by storing data in a form identical to
  that being served to API clients.
- Leverage JSON where possible. This format has highly optimised
  native support on browser platforms, whereas other formats such as
  [CSV][csv] usually cannot compete because they need to be parsed in
  JavaScript - this usually results in more memory use and slower
  parsing speeds.
- Avoid the need for a relational or triple-store database, which
  comes with some overhead, both in resources and cognition.
- Minimise the verbosity of data so far as possible, such that file
  sizes are not too large.
- "Keep It Simple" so far as possible, we want a format which is easy
  to understand and work with - when it does not affect the above
  goals.
- Build on the concepts and precedents of earlier Mykomap data. For
  instance, we utilise [SKOS][skos] vocabularies and [QNames][qnames],
  and we use more or less the same property definition and vocabulary
  schema.

In the first instance, when a map is loaded, we want to minimise the
delay between opening a map link and the user seeing pins appear on
the map. With a large number of pins, some sort of clustering of item
locations is needed, and the clustering algorithm contributes the
largest amount to that delay.

We use [MapLibre][maplibre] to do this clustering, which uses a
well-optimised algorithm. This library is based on the open source
version of the commercial [MapBox][mapbox] library, and is much faster
than [Leaflet][leaflet] with the
[Leaflet.markercluster][markercluster] plug-in that was used for
earlier versions of Mykomap. Nevertheless, it can take a small number
of seconds to load a file with half a million locations and then
cluster them, yet alone when extra data is added.

As main information needed up-front when loading a map are the pin
locations, these are stored by themselves in a file `locations.json`
as a minimised JSON array of coordinate pairs, without white-space and
with a restricted number of decimal places. This can be sent verbatim
as soon as the dataset ID is known.

Item IDs are omitted from this `locations.json` file, which further
minimises the size of the data. Instead of using IDs, dataset items
are loaded in a predefined order and then identified within the
context of the dataset by their index number. This has some
consequences, however, described later.

As most of the other information about the items will not be needed
until a user starts to browse the pins on the map, loading this
information is deferred. The full information for each dataset item is
stored in a separate file for it, with a name constructed from the
item index number (not the item ID - a consequence of the locations
not having IDs included). JSON is also used here, but since these
files are relatively small, they are indented for readability. A
dataset item's ID can be found by looking in these files.

After the locations, something which is also needed early on loading a map,

Although typically much smaller and less urgently required than
locations data, what's needed next when loading a map are the
following:

- Vocabulary definitions, which is shown in the side-bar filters;
- The item property schema, which dictates how items should be
  interpreted, searched, and displayed; and
- The map configuration settings, which dictate how the map is rendered.

These are all stored as JSON and indented for readability in `config.json`.

Finally, there needs to be an index for filtering by category and text
searches. This is stored as JSON in `searchable.json`.

As this file can be a lot of items, this file can become quite large
and we need to be parsimonious with formatting characters. Therefore
is not indented, and uses arrays rather than objects, to avoid
repeating the keys for every item. However, for the sake of human
readability and inspection, it is broken up such that headers are
defined on the first line, and each subsequent line is data for one
item, in the defined order. The result reads somewhat like a CSV file.

## How to create a dataset.

Typically, the data for datasets is supplied in some format defined by
the supplier. Common examples are spreadsheets; CSV or TSV files; and
JSON, possibly via some API over the web; or in some cases sent
manually by email.

In addition to the data itself, we need definitions of the semantics
and syntax within the data - such as the taxonomies, any mark-up or
encoding schemes, and identifiers used. These are typically sent by
email... or, in the worst case, we must try to infer them from the
data.

It is a requirement that the data is logically tabular - a sequence of
items sharing the same set of properties - and that each dataset item
representing an entry in the map or directory has a unique identifier
within the dataset.

We then need to transform this into the prerequisites for the `dataset
import` tool, which generates Mykomap datasets.

### Prerequisites and process

There are two specific files needed as prerequisites for `dataset import`.

- A CSV file with a compatible suitable schema, including a row for
  each dataset item.
- A `config.json` file containing all the required metadata.

More about these below, but the latter is typically the same one used
in the dataset - in fact the `dataset` tool copies it into place in
the output folder.

The output is a new folder, containing the dataset files. The name of
this folder is interpreted as the ([URI-component encoded][uri-component-encoding])
dataset ID when it is written or copied into the root data directory
(set by `SERVER_DATA_ROOT` in the back-end's `.env` file.)

> [!INFO]
> The `dataset` command will not write the data if the output
> directory already exists. It is up to you to delete a directory
> first if you want to overwrite it - this to make it harder to
> accidentally overwrite something else with the data.

The `dataset` tool is part of the `back-end` application, and can be
run from the `apps/back-end` project directory using `npm`. The
commands supports various subcommands, and the relevant one for
importing data is `import`.

It can be used like this:

    npm run dataset import $CONFIG $CSV $OUTPUT_DIR

Where:

- `$CONFIG` should be the path to the `config.json` file,
- `$CSV` should be the path to the CSV file,
- `$OUTPUT_DIR` should be the path to write the output dataset files to.

> [!INFO]
> More details can be obtained by running the command
>
>     npm run dataset -- import --help

#### `config.json`

The full schema of this file is outside the scope of this document,
for the sake of keeping it fairly short. It's also likely to evolve
from the exact schema at the time of writing.

For now I will just note that some of the information needed for
`config.json` must be composed manually; and some, those parts
describing the vocabularies, can be obtained from the `open-data`
pipeline's output file, `vocabs.json`.

> [!NOTE]
> Beware that the name of this file is configurable and may
> vary from case to case, although the default is `vocabs.json`.

> [!INFO]
> The format of `vocabs.json` files are very similar (if historically
> not quite identical) to `config.json`'s `vocabs` attribute. The
> information is composed from one or more existing [SKOS][skos]
> vocabularies.

Another important function of the `config.json` file is to describe
the properties of the dataset items, which is done in the `itemProps`
attribute.

And finally, these descriptions include an attribute `from` which
identifies which CSV header to source the property value from. This is
for the benefit of the `dataset` command.

#### The CSV file

The format of this file is essentially dictated by `config.json`'s
`itemProps.<item>.from` attribute, as described above. The CSV may
have more headers than this - these will be ignored.

CSV fields are interpreted depending on the other attributes of the
`itemProps` property descriptions. See [More Details][#more-details]
below.

#### `standard.csv`

Each of the datasets in the [open-data] project output a CSV file
containing the data in a normalised form, with added or refined
information (typically geocoded locations). This is typically what we
use as input to the `dataset import` command.

This CSV file has a set of standard headers. It can also have any
number of arbitrary optional extras. For historical reasons this
schema is called the "Standard CSV format", and the file is called
`standard.csv`

Optionally [RDF][rdf] data can also be generated by [open-data]
datasets, but this is not useful for `dataset import`.

> [!INFO]
> This step is performed by code in the [open-data] and [se-open-data]
> projects, and typically published on http://data.digitalcommons.coop/

In the current incarnation of the schema, the standard headers are:

- Identifier
- Name
- Description
- Organisational Structure
- Primary Activity
- Activities
- Street Address
- Locality
- Region
- Postcode
- Country ID
- Territory ID
- Website
- Phone
- Email
- Twitter
- Facebook
- Companies House Number
- Qualifiers
- Membership Type
- Latitude
- Longitude
- Geo Container
- Geo Container Confidence
- Geo Container Latitude
- Geo Container Longitude
- Geocoded Address

However, any given dataset can have arbitrary additional headers added
when convenient.

> [!INFO]
> More of the gory details of the semantics are embedded as comments in the code and data
> [here][seopendata-csv-schemas].

Many of these headers are in fact somewhat specific to the ICA and
Co-ops UK datasets, and often left blank. The key ones for most
purposes are:

- _Identifier_: an arbitrary but unique (to the dataset) string.
- _Name_: an arbitrary short string; displayed as pin names.
- _Street Address_: an arbitrary string which can be combined into an
  address for geocoding, if necessary, and/or displayed on pin pop-ups.
- _Locality_: ditto; combined into the address.
- _Region_: ditto; combined into the address.
- _Postcode_: ditto; combined into the address, and/or used as for geocoding.
- _Country ID_: ditto; combined into the address, and/or used as a filter category.
- _Latitude_: a decimal number; indicates a manually supplied location.
- _Longitude_: a decimal number; indicates a manually supplied location.
- _Geo Container_: a unique URI representing the location; typically
  an open-street-map location URL.
- _Geo Container Confidence_: a decimal; interpreted as a percentage
  that indicates the geocoding confidence.
- _Geo Container Latitude_: a decimal number; indicates a geocoded
  location.
- _Geo Container Longitude_: a decimal number; indicates a geocoded location.
- _Geocoded Address_: an arbitrary string which records the (typically
  cleaned up) address which was actually passed to the geocoder; used
  for diagnosing problems with geocoded locations.

The only strictly mandatory one is _Identifier_. Location coordinates
of some sort is obviously needed for a marker to appear on the map,
and a _Name_ is needed for it to be identifiable.

### Example

Here's a specific example of the process just described. It's based on
the dataset currently in the back-end test data.

First, the CSV data:

```
Identifier,Name,Desc,Address,Websites,Activity,Other Activities,Latitude,Longitude,Geocoded Latitude,Geocoded Longitude,Validated
aaa,"Apple Co-op",We grow fruit.","1 Apple Way, Appleton",http://apple.coop,AM130,,0,0,51.6084367,-3.6547778,true
bbb,"Banana Co","We straighten bananas.","1 Banana Boulevard, Skinningdale",http://banana.com,AM60,AM70;AM120,0,0,55.9646979,-3.1733052,false
ccc,"The Cabbage Collective","We are artists.","2 Cabbage Close, Caulfield",http://cabbage.coop;http://cabbage.com,AM60,AM130,,,54.9744687,-1.6108945,true
ddd,"The Chateau","The Chateau is not a place, it is a state of mind.",,,,,,,,,
```

Or in a more readable table format:

| Identifier | Name                     | Desc                                                 | Address                      | Websites                               | Activity                          | Other Activities | Latitude | Longitude  | Geocoded Latitude | Geocoded Longitude | Validated |
| ---------- | ------------------------ | ---------------------------------------------------- | ---------------------------- | -------------------------------------- | --------------------------------- | ---------------- | -------- | ---------- | ----------------- | ------------------ | --------- |
| aaa        | Apple Co-op            | We grow fruit.                                      | 1 Apple Way, Appleton      | http://apple.coop                      | AM130                             |                  | 0        | 0          | 51.6084367        | -3.6547778         | true      |
| bbb        | Banana Co              | We straighten bananas.                             | 1 Banana Boulevard, Skinningdale                          | http://banana.com | AM60 | AM70;AM120 | 0                | 0        | 55.9646979 | -3.1733052        | false              |
| ccc        | The Cabbage Collective | We are artists.                                    | 2 Cabbage Close, Caulfield | http://cabbage.coop;http://cabbage.com | AM60                              | AM130            |          |            | 54.9744687        | -1.6108945         | true      |
| ddd        | The Chateau            | The Chateau is not a place, it is a state of mind. |                              |                                        |                                   |                  |          |            |                   |                    |

Now, the `config.json`. We can bend the strict JSON format here to use
comments to annotate it, but in the real one comments would upset the
JSON parser, so omit them.

```
{
  "prefixes": {
    // There's just one prefix defined here, because just one vocabulary
    "https://dev.lod.coop/essglobal/2.1/standard/activities-modified/": "am"
  },
  "languages": ["en"], // Only one language supported: English
  "ui": { "directory_panel_field": "activity" }, // Sets the default panel to show
  "vocabs": {
    "am": { // This is the Activities vocabulary
      "en": { // The English title and term definitions follow
        "title": "Activities (Modified)",
        "terms": {
          "AM10": "Arts, Media, Culture & Leisure",
          "AM20": "Campaigning, Activism & Advocacy",
          "AM30": "Community & Collective Spaces",
          "AM40": "Education",
          "AM50": "Energy",
          "AM60": "Food",
          "AM70": "Goods & Services",
          "AM80": "Health, Social Care & Wellbeing",
          "AM90": "Housing",
          "AM100": "Money & Finance",
          "AM110": "Nature, Conservation & Environment",
          "AM120": "Reduce, Reuse, Repair & Recycle",
          "AM130": "Agriculture",
          "AM140": "Industry",
          "AM150": "Utilities",
          "AM160": "Transport"
        }
      }
      // ... similar definitions for other languages would go here,
      // using the same structure.
    }
  },
  "itemProps": { // This defines the properties dataset items should have
    "id": { // A unique identifier. Mandatory for the dataset to be usable.
      "type": "value",      // Single valued
      "from": "Identifier", // Which CSV field to read it from
      "strict": true        // Don't tolerate nulls or blanks.
                            // Format is "string" by default.
    },
    "name": { // The name of the item
      "type": "value",
      "search": true, // we want this to be text-searchable
      "from": "Name"
    },
    "manlat": {
      "type": "value",
      "as": "number",    // Convert these values into numbers when loading CSV
      "nullable": true,  // Allow nulls
      "from": "Latitude"
    },
    "manlng": {
      "type": "value",
      "as": "number",
      "nullable": true,
      "from": "Longitude"
    },
    "lat": {
      "type": "value",
      "as": "number",
      "nullable": true,
      "from": "Geocoded Latitude"
    },
    "lng": {
      "type": "value",
      "as": "number",
      "nullable": true,
      "from": "Geocoded Longitude"
    },
    "address": {
      "type": "value",
      "filter": true,
      "from": "Address"
    },
    "activity": {
      "type": "vocab",   // A single-valued identifier from a vocabulary
      "uri": "am:",      // Specifically, this vocabulary
      "from": "Activity"
    },
    "otherActivities": {
      "type": "multi",   // Multi-valued
      "of": {
        "type": "vocab", // Values are identifiers from a vocabulary
        "uri": "am:"     // Specifically, this one
      },
      "from": "Other Activities" // When interpreting CSV, by default a
                                 // semi-colon is used as a delimiter.
                                 // Literal semi-colons need to be escaped
                                 // with a backslash.
    },
    "websites": {
      "type": "multi",   // Multi-valued
      "of": {
        "type": "value"  // Values are strings
      },
      "from": "Websites"
    },
    "validated": {
      "type": "value",    // Single valued
      "as": "boolean",    // Convert values to booleans, or null if they're too "weird".
                          // Non-weird means: "true", "yes", "y", "t" or "1" count as true,
                          // and "false", "no", "n", "f" or "0" as false. (Ignoring case
                          // in both cases.)
      "from": "Validated"
    }
  }
}
```

Given these files as inputs, `data.csv` and `config.json`, and assuming:

- these files are in `/tmp/`, which is writable
- there is no dierctory `/tmp/out` existing
- the current directory is `apps/back-end/`

...we can then run the following to generate a dataset in `/tmp/out/`:

    npm run dataset import /tmp/config.json /tmp/data.csv /tmp/out

We should then get a dataset written to `/tmp/out/`.

Listing that would get:

```
$ find /tmp/out -type f

 /tmp/out/config.json
 /tmp/out/items
 /tmp/out/items/0.json
 /tmp/out/items/1.json
 /tmp/out/items/2.json
 /tmp/out/items/3.json
 /tmp/out/locations.json
 /tmp/out/searchable.json
```

...where `config.json` should be identical to the above. The other files' contents would be as below....

#### `locations.json`

```
[[-3.65478,51.60844],[-3.17331,55.9647],[-1.61089,54.97447],null]
```

#### `searchable.json`

```
{   "itemProps":
["name","address","searchString"],
    "values":[
["Apple Co-op","1 Apple Way, Appleton","apple co op"],
["Banana Co","1 Banana Boulevard, Skinningdale","banana co"],
["The Cabbage Collective","2 Cabbage Close, Caulfield","the cabbage collective"],
["The Chateau","","the chateau"]
]}
```

#### `items/0.json`

```
{
  "id": "aaa",
  "name": "Apple Co-op",
  "manlat": 0,
  "manlng": 0,
  "lat": 51.60844,
  "lng": -3.65478,
  "address": "1 Apple Way, Appleton",
  "activity": "AM130",
  "otherActivities": [],
  "websites": [
    "http://apple.coop"
  ],
  "validated": true
}
```

#### `items/1.json`

```
{
  "id": "bbb",
  "name": "Banana Co",
  "manlat": 0,
  "manlng": 0,
  "lat": 55.9647,
  "lng": -3.17331,
  "address": "1 Banana Boulevard, Skinningdale",
  "activity": "AM60",
  "otherActivities": [
    "AM70",
    "AM120"
  ],
  "websites": [
    "http://banana.com"
  ],
  "validated": false
}
```

#### `items/2.json`

```
{
  "id": "ccc",
  "name": "The Cabbage Collective",
  "manlat": null,
  "manlng": null,
  "lat": 54.97447,
  "lng": -1.61089,
  "address": "2 Cabbage Close, Caulfield",
  "activity": "AM60",
  "otherActivities": [
    "AM130"
  ],
  "websites": [
    "http://cabbage.coop",
    "http://cabbage.com"
  ],
  "validated": true
}
```

#### `items/3.json`

```
{
  "id": "ddd",
  "name": "The Chateau",
  "manlat": null,
  "manlng": null,
  "lat": null,
  "lng": null,
  "address": "",
  "activity": null,
  "otherActivities": [],
  "websites": [],
  "validated": false
}
```

## More details

Here we go into more detail about the dataset files and their structure.

### Datasets

At the top level below `<dataroot>`, which is whatever
`SERVER_DATA_ROOT` has been configured with, there are zero or more
directories: one for each dataset. All the data for a dataset is
contained within its dataset directory.

The names of the directories are intepreted as the dataset IDs,
[URI-component encoded][uri-component-encoding] to ensure that they
are well-formed directory names: characters like "/" are encoded as
"%2F", for instance.

> [!NOTE]
> The data inside a dataset directory does not refer to its own ID, so
> the directory can be renamed freely without breaking the data
> structure within.

Inside these top-level directories are a number of mandatory data
files, and a sub-directory named `items` which contains a data file
for each of the dataset's items.

### `about.md` (mandatory)

This file contains a free-form human-readable description of the
dataset in Markdown format.

It will be shown in the "about" panel of the map when this dataset is
selected. You can put anything you like in here, but you should keep
this viewing context in mind.

> [!WARNING] Currently there is no localisation support for this file,
> this should be added in future.

### `config.json` (mandatory)

This is a JSON data file that describes:

- the properties shared by dataset item, and the mapping to this from
  CSV columns,
- vocabularies and localisations thereof used in the data (AKA taxonomies),
- and map configuration details.

The schema and semantics of this file is more complex than the other
files. The formal specification is defined by the `ConfigData` type
contract in [`contract.ts`][contract] - refer to that for the full
details of nested properties.

Here we list the top-level elements and their purpose.

> [!WARNING] Although correct at the time of writing, this is subject
> to change.

- `prefixes`: An object mapping [SKOS][skos] vocabulary URIs to the
  abbreviations used in [QNames][qnames] ("qualified names") in the
  rest of the file. QNames are a mechanism used in both
  [RDF/XML][rdf-xml] and [Turtle][ttl] file formats for encoding
  [RDF][rdf] linked data
- `languages`: An array of two-character [ISO-639-1][iso-639] codes.
  It enumerates the languages that are supported by the vocabularies,
  defined in the `vocabs` property. There should be at least one
  element. The first element is assumed to be the default language to use.
- `ui`: A collection of user-interface settings for the map when
  showing this dataset. For example: the side panel to show by
  default. These are likely to change, and not strictly necessary for
  generating a dataset.
- `itemProps`: An object defining the properties required for each
  data item. The keys define the property IDs, and the values their
  definitions, which are sub-objects. A non-exhaustive list of the
  most important properties of dataset-item property definitions are:

  - `type`: Required, indicates the basic property type, and can be one of the following:
    - `"value"`, this property represents a single literal strings;
    - `"vocab"`, this property represents a single identifier from a
      specific vocabulary defined in this file;
    - `"multi"`, this property represents a multi-valued property,
      containing instances of either `vocab` or `value`.
  - `of`: Required for `"multi"` properties - defines the type of
    the multiple values. Can be `"value"` or `"vocab"`.
  - `filter`: Optional, indicates if the property should be
    filterable; boolean, defaults to false.
  - `search`: Optional, indicates if the property should be
    text-searchable; boolean, defaults to false.
  - `from`: Optional, used when importing datasets from CSV. It
    indicates the name of a CSV column header to use as the source for
    this field. If absent, this field will not get populated by the importer.
  - `nullable`: Optional, indicates whether null values are permitted
    in the data without triggering an error. (Note that for CSV data,
    an empty field counts as null.) Boolean, defaults to true.
  - `strict`: Optional, indicates whether to be sloppy or strict when interpreting CSV data.
  - `as`: Optional, hints on the interpretation of data when converting from CSV.
    Can be one of:
    - `"string"`: interpret as a string.
    - `"boolean"`: interpret as a boolean.
    - `"number"`: interpret as a number.

- `vocabs`: An object defining the vocabularies used in the vocab
  properties of dataset items. Keys are vocabulary abbreviations as
  defined in `prefixes`. They map to a vocabulary definition for each
  language - keyed by a language code defined in `languages`. Each
  vocabulary definition is in the context of that language, and has a
  title for the vocabulary and a mapping from term IDs to term labels
  for that language. All this is to allow identifiers representing
  vocabulary terms (typically IDs, [QNames][qnames], or full URIs)
  into localised labels. This useful both for interpreting dataset item
  properties, but also localisation of the user interface.

### `locations.json` (mandatory)

This is a JSON data file that contains an array of locations, one for
each item in the dataset.

The order of this array is significant. The Nth item in the locations
array represents the location of the Nth item in the dataset. There
must be one item in the array for each item in the dataset.

Each location is represented by an array of two floating point
coordinates:

    [<longitude>, <latitude>],

Or, if there is no location for that item, just a null as a
placeholder:

    null,

> [!NOTE]
> Typically, the coordinates stored in the array only use just enough
> decimal places to identify a street address on the map uniquely
> throughout the world and no more: five. This is avoid the file from
> becoming unnecessarily big; JSON floating point representations can
> be quite long.
>
> For similar reasons, all white-space and newlines are omitted. This
> will make human inspection of very large files somewhat awkward but
> this is considered worth the inconvenience. If necessary the file
> can be piped through a tool like `jq` or `sed` to unpack it for
> inspection.

### `searchable.json`

This is a JSON data file that contains an index of the searchable
properties of the dataset items.

The formal specification of this file, such that it exists, is defined
in the source code currently.

In brief: it is a JSON object with two properties:

- `itemProps`, a list of property IDs, and
- `values`, a list of property value arrays.

Like this:

```
{
  "itemProps": [
    ...
  ],
  "values": [
    ...
  ]
}
```

> [!INFO]
> Note, this example is indented for readability, but the actual file is
> somewhat minimised and omits superfluous white-space. `itemProps` is
> inserted on the first line, and subsequent lines define items in the
> values array, one per line in the predefined order.

### `itemProps`

`itemProps` defines how to interpret the value arrays. For example:

    "itemProps": [
      "country_id",
      "primary_activity",
      "typology",
      "data_sources",
      "searchString"
    ],
    ...

The elements refer to the property IDs defined in `config.json`.

In this case, this indicates that there are four properties which can
be searched by drop-down filter.

The fifth element `searchString` is special: it's not a real property
of the dataset item, but synthesised from them; and is always present
(if only as an empty string). It represents the text-searchable
content of the dataset item, normalised to punctuation-free lower case
words.

#### `values`

The `values` array must contain one element for each of the dataset
items.

The order of the `values` array is significant: the Nth item of the
`values` array corresponds to the Nth dataset item.

Each element of `values` is an array of property values the same size
as the `itemProps` array. For instance:

    ...
    "values": [
      [
        "GB",
        "ICA210",
        "BMT20",
        ["DC", "CUK"],
        "housing 1 west street sheffield s1 2ab uk apples coop"
      ],
      ...

    ]

In this example, the first dataset item has a `country_id` of `"GB"`,
a `primary_activity` of `"ICA212"`, and so on.

The `searchString` text is the last element.

#### `searchString` construction

To illustrate where `searchString` comes from, consider an example
case where text-searchable properties have been configured in
`config.json` to be:

- `activities`,
- `address` and
- `name`.

These must be valid dataset item properties of course, but don't
necessarily need to be properties listed in `itemProps`.

Let's say the values of those properties are:

- `"ICA210"` - an activity ID which would be expanded to "Housing" in English;
- `"1 West Street, Sheffield S1 2AB, UK"` (an address), and
- `"Apples Co-op"` (the organisation name).

The `searchString` value will be those values concatenated, with
punctuation removed and text down-cased, like this:

> housing 1 west street sheffield s1 2ab uk apples coop

This means that a search for "housing" or "west street" will match.

> [!WARNING]
> This illustration assumes vocab term ID are expanded into English,
> which a) may not be implemented yet, and b) obviously won't support
> multi-lingual text searches. This may be addressed in future. Also,
> the type of matching for multiple words may be adjusted.

### `items/`

This directory contains one file for each dataset item. The files are
named according to the item index, with a `.json` suffix. Their base
names are decimal integers, starting with zero. Therefore `0.json` is
the file for the first dataset item, `1.json` the second, and so on.

Each file contains a JSON object mapping all of the defined dataset
item property IDs to values.

There must be an `id` property, which is the ID of the item, whose
format is determined by the dataset - it must be unique to the
dataset.

There should be a `name` property, which is a short human-readable
name for the item. This is not mandated, but is advisable.

And there should be `latitude` and `longitude` properties, which are
decimal latitude/longitude coordinates of the item, if it has one. If
absent, then the item will be included in search results, but will not
have a pin on the map.

These and all other fields must be as defined by the `itemProps` field
in `config.json`.

Absent values should be `null`, or `[]` if the property is a
multi-valued property.

Vocabulary properties should be a bare valid vocab term identifier,
without any prefix or URI.

For example:

```
{
  "id": "test/cuk/R000001",
  "name": "Apples Co-op",
  "description": "We sell apples",
  "website": ["https://apples.coop", "https://orchards.coop"],
  "dc_domains": ["apples.coop", "orchards.coop"],
  "country_id": "GB",
  "primary_activity": "ICA210",
  "organisational_structure": "OS60",
  "typology": "BMT20",
  "latitude": 51.507476,
  "longitude": -0.127825,
  "geocontainer_lat": 51.50747643,
  "geocontainer_lon": -0.12782464,
  "address": "1 West Street, Sheffield, S1 2AB, UK",
  "data_sources": ["DC", "CUK"]
}
```

## Glossary

- _category_: when used here, loosely means the same as _vocabulary_.
- _CSV_: "comma-separated values" - a common format for storing
  tabular data in text files. See [Wikipedia][csv]. Or CSV files begin
  with a line which contain the _headers_ which define names for the
  fields found in the following rows. Note that a CSV row _may_ span
  more than one line, as it can contain embedded newlines.
- _data root_: the root directory in which to find Mykomap dataset files.
- _dataset_: a collection of information for use in a Mykomap;
  typically consists of an ordered collection of items with some metadata
  describing the properties and types of those properties.
- _dataset ID_: a unique identifier for a dataset.
- _dataset item_: represents a single entry in a dataset, typically
  representing an organisation, usually with an associated location
  and various other properties.
- _dataset item ID_: a unique identifier for a dataset item.
- _dataset item index_: a unique zero-based index number for a dataset
  item.
- _dataset item property_: a named attribute of a dataset item, which
  can have one of a number of pre-defined values and types.
- _field_: one of the components of a data record, such as in a CSV
  file or a database table. Often used to refer to a JSON or
  JavaScript _property_. We try to consistently use it to mean
  elements of a CSV row in the context of Mykomap.
- _property_: one of the components of a JSON or JavaScript object;
  sometimes also referred to as a _field_ or an _attribute_. We try
  and refer consistently to _properties_ in the context of Mykomap.
- _QName_: a scheme for representing URIs in a more succinct form within
  contexts where brevity and readability is useful. See [Wikipedia][qname] for more information.
- _RDF_: "Resource Description Format": a formal scheme for representing semantic descriptions of concepts and their relationships as subject-predicate-object triplets in a machine-readable way. See [Wikipedia][rdf].
- _RDF/XML_: a file encoding for RDF based on XML. See [Wikipedia][rdf-xml].
- _SKOS_: a linked-data standard for describing a collection of terms,
  representing concepts, identified by a URI. Terms are also
  identified by URIs sharing the same stem as the vocabulary's URI,
  followed by a unique identifier. The vocabulary has a localised
  title, and each term can have one or more localised labels. More
  properties can be ascribed to terms and the vocabulary, but see the
  definition on [Wikipedia][skos] for more details.
- _taxonomy_: when used here, loosely means the same as _vocabulary_.
- _Turtle_: a more succinct and readable file encoding for RDF than RDF/XML. See [Wikipedia][ttl].
- _vocabulary_: a set of pre-defined labels for some set of concepts,
  in this context usually a _SKOS_ vocabulary.
- _vocabulary term_: a concept from a _vocabulary_.
- _vocabulary URI_: a unique identifier and namespace for a _vocabulary_.
- _vocabulary prefix_: a short locally-defined identifier representing
  a full URI for the sake of brevity - the first half of a _QName_

[contract]: ../libs/common/src/api/contract.ts
[csv]: https://en.wikipedia.org/wiki/Comma-separated_values
[iso-639]: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
[markdown]: https://en.wikipedia.org/wiki/Markdown
[markercluster]: https://github.com/Leaflet/Leaflet.markercluster
[open-data]: https://github.com/DigitalCommons/open-data/
[openapi-spec]: ../libs/common/src/api/mykomap-openapi.json
[qname]: https://en.wikipedia.org/wiki/QName
[rdf-xml]: https://en.wikipedia.org/wiki/RDF/XML
[rdf]: https://en.wikipedia.org/wiki/Resource_Description_Framework
[se-open-data]: https://github.com/DigitalCommons/se-open-data/
[seopendata-csv-schemas]: https://github.com/DigitalCommons/se-open-data/blob/master/lib/se_open_data/csv/schemas.rb
[skos]: https://en.wikipedia.org/wiki/Simple_Knowledge_Organization_System
[ttl]: https://en.wikipedia.org/wiki/Turtle_(syntax)
[uri-component-encoding]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
