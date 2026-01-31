import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
const ADMIN_EMAIL = "admin@shivfurniture.com";
const ADMIN_PASSWORD = "Admin@123";

async function verifyAuthHeader() {
  console.log("🚀 Starting Auth Header Verification...");

  try {
    // 1. Login and check response header
    console.log("\n🔑 Logging in as Admin...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const tokenFromBody = loginResponse.data.data.token;
    const tokenFromHeader = loginResponse.headers["authentication"];

    console.log("   Checking response header...");
    if (tokenFromHeader === tokenFromBody) {
      console.log(
        "✅ 'Authentication' header present and correct.",
        tokenFromHeader,
      );
    } else {
      console.error("❌ 'Authentication' header missing or incorrect!");
      console.error("   Expected:", tokenFromBody);
      console.error("   Received:", tokenFromHeader);
      process.exit(1);
    }

    // 2. Test access using Authentication header (no Bearer)
    console.log(
      "\n🧪 Testing access with 'Authentication' header (no Bearer)...",
    );
    try {
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          authentication: tokenFromHeader,
        },
      });
      if (meResponse.status === 200) {
        console.log(
          "✅ Access granted with simple token in Authentication header.",
        );
      }
    } catch (error: any) {
      console.error("❌ Access failed with simple token:", error.message);
      if (error.response) console.error("   Status:", error.response.status);
      process.exit(1);
    }

    // 3. Test access using Authentication header (with Bearer)
    console.log(
      "\n🧪 Testing access with 'Authentication' header (with Bearer)...",
    );
    try {
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          authentication: `Bearer ${tokenFromHeader}`,
        },
      });
      if (meResponse.status === 200) {
        console.log(
          "✅ Access granted with Bearer token in Authentication header.",
        );
      }
    } catch (error: any) {
      console.error("❌ Access failed with Bearer token:", error.message);
      if (error.response) console.error("   Status:", error.response.status);
      process.exit(1);
    }

    // 4. Test normal Authorization header
    console.log("\n🧪 Testing access with standard 'Authorization' header...");
    try {
      const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenFromHeader}`,
        },
      });
      if (meResponse.status === 200) {
        console.log("✅ Access granted with standard Authorization header.");
      }
    } catch (error: any) {
      console.error(
        "❌ Access failed with Authorization header:",
        error.message,
      );
      process.exit(1);
    }

    console.log("\n🎉 All checks passed!");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Verification failed:", error.message);
    if (error.response) {
      console.error("   Response data:", error.response.data);
    }
    process.exit(1);
  }
}

verifyAuthHeader();
