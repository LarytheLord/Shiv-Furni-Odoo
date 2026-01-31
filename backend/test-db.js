const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const url = new URL(process.env.DATABASE_URL);
console.log("Password length:", url.password.length);
console.log(
  "Password codes:",
  url.password.split("").map((c) => c.charCodeAt(0)),
);
console.log(
  "Testing connection to:",
  process.env.DATABASE_URL.replace(/:[^:@]*@/, ":****@"),
); // Hide password in logs

client
  .connect()
  .then(() => {
    console.log("Connected successfully");
    return client.end();
  })
  .catch((err) => {
    console.error("Connection error:", err);
    client.end();
  });
