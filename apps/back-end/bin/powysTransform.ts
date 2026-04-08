import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";
import { json2csv } from 'json-2-csv';

const { GEOCODE_TOKEN } = process.env;

const engAbout = (await fs.readFile(`./tmp/about.en.md`)).toString();
const cymAbout = (await fs.readFile(`./tmp/about.en.md`)).toString();

const rawEngConfig = await fs.readFile(`./tmp/config.en.json`);
const rawCymConfig = await fs.readFile(`./tmp/config.cym.json`);
const engConfig = JSON.parse(rawEngConfig.toString());
const cymConfig = JSON.parse(rawCymConfig.toString());

// download this data as csv from the google sheet here: 
// https://docs.google.com/spreadsheets/d/1C8SgDAv0axnivbBoXTPEmqJvoudp4L8F2y5Jaoj7wkw/edit?gid=0#gid=0
// and name after the date of download
const rawCSV = (await fs.readFile(`./tmp/2026.04.07_raw_powys.csv`)).toString();

const firstLineEnd = rawCSV.indexOf("\r\n")
const input = rawCSV.slice(firstLineEnd);

const items = parse(input, {
  columns: true,
  skip_empty_lines: true,
})
  .filter((item: any) => item.ID);

const categorisedItems = items.map(item => {
    const foodCategories = engConfig.vocabs.fsc.en.terms; //the spreadsheet has these in English so we use the English categories

    const primary_food_system_category = Object.keys(foodCategories).find(
    (key) => foodCategories[key] === item.Category,
  );

  const food_system_categories = [
    primary_food_system_category,
    Object.keys(foodCategories).find(
      (key) => foodCategories[key] === " - " + item.Subcategory,
    ),
  ].join(";");

  const localities = engConfig.vocabs.loc.en.terms;
      
      const locality =  Object.keys(localities).find(
    (key) => localities[key] === item.Town);

    return {
        ...item,
        primary_food_system_category,
        food_system_categories,
        locality
    }
})

let i = 0;
let fails = [];
const geocodedItems = [];
for(let item of categorisedItems){
    console.log("item ", i++);

    const itemOutput = {...item};

    if (item.Geocode) {
      const [lat, lng] = item.Geocode.split(", ");
      itemOutput.lat = parseFloat(lat);
      itemOutput.lng = parseFloat(lng);
  } else {
    const cleanAddress = `${itemOutput.Address.replaceAll("\n", ", ")}, ${item.Postcode}, GB`;

    const geocodeResponse = await fetch(
      `https://api.mapbox.com/search/geocode/v6/forward?q=${cleanAddress}&access_token=${GEOCODE_TOKEN}&bbox=-5.4,51.35,-2.6,53.53`,
    );
    const geocodeResult = await geocodeResponse.json();

    const location = geocodeResult.features[0];

    if (location) {
      itemOutput.lng = location.geometry.coordinates[0];
      itemOutput.lat = location.geometry.coordinates[1];
      itemOutput.geocoded_address = location.properties.full_address;
    } else {
      console.log(geocodeResult);
      fails.push(item.Title_Eng);
      console.log("fails", fails);
    }    
  }

  geocodedItems.push(itemOutput);
}

const engItems = geocodedItems.map(
    item => ({
        id: item.ID,
    name: item.Title_Eng.replaceAll("\r", "").replaceAll("\n", ""),
    description: item["Text for popup"].replaceAll("\r", ""),
    address: item.Address.replaceAll("\r", ""),
    website: item.Link,
    primary_food_system_category: item.primary_food_system_category,
    food_system_categories: item.food_system_categories,
    locality: item.locality,
    lat: item.lat,
    lng: item.lng,
    geocoder_confidence: 51,
    geocoded_address: item.geocoded_address,
    contact_name: item["Contact name"],
    email: item["Email address"],
    phone: item["Phone number"],
    })
).sort((a: any, b: any) => (a.name < b.name ? -1 : 1));

const cymItems = geocodedItems.map(
    item => ({
        id: item.ID,
    name: item.Title_Cym.replaceAll("\r", "").replaceAll("\n", ""),
    description: item["Text for popup_Cym"].replaceAll("\r", ""),
    address: item.Address.replaceAll("\r", ""),
    website: item.Link,
    primary_food_system_category: item.primary_food_system_category,
    food_system_categories: item.food_system_categories,
    locality: item.locality,
    lat: item.lat,
    lng: item.lng,
    geocoder_confidence: 51,
    geocoded_address: item.geocoded_address,
    contact_name: item["Contact name"],
    email: item["Email address"],
    phone: item["Phone number"],
    })
).sort((a: any, b: any) => (a.name < b.name ? -1 : 1));

await fs.mkdir("./tmp/out");
await fs.mkdir("./tmp/out/predataset");
await fs.mkdir("./tmp/out/predataset/powys-eng");
await fs.mkdir("./tmp/out/predataset/powys-cym");

const engOutputCsv = await json2csv(engItems);
const cymOutputCsv = await json2csv(cymItems);

const now = new Date();
const date = `${now.getFullYear()}.${now.getMonth()+1}.${now.getDate()}`;
const csvFileName = `${date}.powys_food_systems.csv`;

await fs.writeFile(
  `./tmp/out/predataset/powys-eng/${csvFileName}`,
  engOutputCsv,
);

await fs.writeFile(
  `./tmp/out/predataset/powys-cym/${csvFileName}`,
  cymOutputCsv,
);

await fs.writeFile(
  "./tmp/out/predataset/powys-eng/about.md",
  engAbout,
);

await fs.writeFile(
  "./tmp/out/predataset/powys-cym/about.md",
  cymAbout,
);

await fs.writeFile(
  "./tmp/out/predataset/powys-eng/config.json",
  JSON.stringify(engConfig),
);

await fs.writeFile(
  "./tmp/out/predataset/powys-cym/config.json",
  JSON.stringify(cymConfig),
);

console.log("Powys eng and cym csv and config have been generated.")
console.log("To generate datasets use:")
console.log(`npm run dataset import ./tmp/out/predataset/powys-eng/config.json ./tmp/out/predataset/powys-eng/${csvFileName} ./tmp/out/datasets/powys-eng`)
console.log(`npm run dataset import ./tmp/out/predataset/powys-cym/config.json ./tmp/out/predataset/powys-cym/${csvFileName} ./tmp/out/datasets/powys-cym`)
