const dotenv = require("dotenv");
const fs = require("fs");
const mongoose = require("mongoose");
const Tour = require("./../../models/tourModal");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

async function dbConnect() {
  await mongoose.connect(DB);
}
dbConnect().catch((err) => console.log(err));

// Read Json file
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8")
);

// import Data to database
const importData = async function () {
  try {
    console.log(tours);
    await Tour.create(tours);
    console.log("Data successfully create");
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async function () {
  try {
    await Tour.deleteMany();
    console.log("Data successfully delete");
  } catch (err) {
    console.log(err);
  }
};
importData();
