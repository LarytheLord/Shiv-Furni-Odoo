import { env } from "./config/env";
import dotenv from "dotenv";
import app from "./app";

dotenv.config();

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════════════╗
  ║                                                            ║
  ║   🪑  Shiv Furniture Budget Accounting System              ║
  ║                                                            ║
  ║   Server running on: http://localhost:${PORT}               ║
  ║   Environment: ${env.NODE_ENV.padEnd(40)}║
  ║                                                            ║
  ╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
