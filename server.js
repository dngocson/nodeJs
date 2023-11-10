const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = require("./app");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

async function dbConnect() {
  await mongoose.connect(DB);
}
dbConnect().catch((err) => console.log(err));

const port = process.env.PORT || 3000;
app.listen(port);

//TEST