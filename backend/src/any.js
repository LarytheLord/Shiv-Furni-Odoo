import jsonwebtoken from "jsonwebtoken";

const token = jsonwebtoken.sign({ id: 1 }, "secret", { expiresIn: "1h" });
console.log(token);