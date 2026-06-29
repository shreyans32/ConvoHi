import mongoose from "mongoose";

const uri = "PASTE_YOUR_MONGODB_URI_HERE";

try {
  await mongoose.connect(uri);
  console.log("Connected!");
  process.exit(0);
} catch (err) {
  console.error(err);
}