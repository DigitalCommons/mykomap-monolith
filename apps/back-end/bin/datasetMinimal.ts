import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";

const { GEOCODE_TOKEN } = process.env;

const rawConfig = await fs.readFile(`./tmp/config.json`);
const config = JSON.parse(rawConfig.toString());

const rawCSV = await fs.readFile(`./tmp/powys-eng.csv`);
const input = rawCSV.toString();

const rawAbout = await fs.readFile(`./tmp/about.md`);
const about = rawAbout.toString();

const items = parse(input, {
  columns: true,
  skip_empty_lines: true,
})
  .filter((item) => item.ID)
  .sort((a, b) => (a.Title_Eng < b.Title_Eng ? -1 : 1));

await fs.mkdir("./tmp/out");
await fs.mkdir("./tmp/out/datasets");
await fs.mkdir("./tmp/out/datasets/powys-eng");
await fs.mkdir("./tmp/out/datasets/powys-eng/items");

const locations: [number, number, number][] = [];
const searchable: {
  itemProps: string[];
  values: [(string | undefined)[], string | undefined, string | undefined][];
} = {
  itemProps: ["food_system_categories", "locality", "searchString"],
  values: [],
};

const foodCategories = config.vocabs.fsc.en.terms;
const localities = config.vocabs.loc.en.terms;

let i = 0;
for (let item of items) {
  console.log("item ", i);

  const primary_food_system_category = Object.keys(foodCategories).find(
    (key) => foodCategories[key] === item.Category,
  );
  const food_system_categories = [
    primary_food_system_category,
    Object.keys(foodCategories).find(
      (key) => foodCategories[key] === " - " + item.Subcategory,
    ),
  ];
  const locality = Object.keys(localities).find(
    (key) => localities[key] === item.Town,
  );

  const itemOutput = {
    id: item.ID,
    name: item.Title_Eng,
    description: item["Text for popup"].replaceAll("\r", ""),
    address: item.Address.replaceAll("\r", ""),
    website: [item.Link],
    primary_food_system_category,
    food_system_categories,
    locality,
    lat: 0,
    lng: 0,
    geocoder_confidence: 51,
    geocoded_address: "",
    contact_name: item["Contact name"],
    email: item["Email address"],
    phone: item["Phone number"],
  };

  if (item.Geocode) {
    const [lat, lng] = item.Geocode.split(", ");
    itemOutput.lat = parseFloat(lat);
    itemOutput.lng = parseFloat(lng);
  } else {
    const cleanAddress = `${itemOutput.address.replaceAll("\n", ", ")}, ${item.Postcode}, GB`;

    const geocodeResponse = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${cleanAddress}&access_token=${GEOCODE_TOKEN}&bbox=-5.4,51.35,-2.6,53.53`,
    );
    const geocodeResult = await geocodeResponse.json();

    const location = geocodeResult.features[0];

    itemOutput.lng = location.geometry.coordinates[0];
    itemOutput.lat = location.geometry.coordinates[1];
    itemOutput.geocoded_address = location.properties.full_address;
  }

  const markerIndex = Object.keys(foodCategories).findIndex(
    (category) => category === primary_food_system_category,
  );

  locations.push([itemOutput.lng, itemOutput.lat, markerIndex]);
  searchable.values.push([
    itemOutput.food_system_categories,
    itemOutput.locality,
    `${itemOutput.name} ${itemOutput.address}`.toLowerCase(),
  ]);

  await fs.writeFile(
    `./tmp/out/datasets/powys-eng/items/${i}.json`,
    JSON.stringify(itemOutput),
  );

  i++;
}

await fs.writeFile(
  "./tmp/out/datasets/powys-eng/locations.json",
  JSON.stringify(locations),
);
await fs.writeFile(
  "./tmp/out/datasets/powys-eng/searchable.json",
  JSON.stringify(searchable),
);
await fs.writeFile(
  "./tmp/out/datasets/powys-eng/config.json",
  JSON.stringify(config),
);
await fs.writeFile(
  "./tmp/out/datasets/powys-eng/about.md",
  JSON.stringify(about),
);
