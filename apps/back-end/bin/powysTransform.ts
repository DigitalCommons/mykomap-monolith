import { promises as fs } from "fs";
import { parse } from "csv-parse/sync";

const { GEOCODE_TOKEN } = process.env;

const rawConfig = await fs.readFile(`./tmp/config.en.json`);
const config = JSON.parse(rawConfig.toString());

const rawCSV = await fs.readFile(`./tmp/2026.03.31.powys_food_systems.csv`);
const input = rawCSV.toString();

const rawAbout = await fs.readFile(`./tmp/about.en.md`);
const about = rawAbout.toString();



// output the csvs and the commands necessary to build the csvs into datasets such that both can be copied 
// and pasted immediately
