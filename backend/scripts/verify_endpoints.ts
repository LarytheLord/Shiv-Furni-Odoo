import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
const ADMIN_EMAIL = "admin@shivfurniture.com";
const ADMIN_PASSWORD = "Admin@123";

const endpoints = [
  // Users
  { method: "GET", url: "/users", name: "Get All Users" },

  // Contacts
  { method: "GET", url: "/contacts", name: "Get All Contacts" },
  { method: "GET", url: "/contacts/vendors", name: "Get All Vendors" },
  { method: "GET", url: "/contacts/customers", name: "Get All Customers" },

  // Products
  { method: "GET", url: "/products", name: "Get All Products" },
  {
    method: "GET",
    url: "/products/categories",
    name: "Get Product Categories",
  },

  // Analytical Accounts
  {
    method: "GET",
    url: "/analytical-accounts",
    name: "Get Analytical Accounts",
  },

  // Auto Analytical Rules
  {
    method: "GET",
    url: "/auto-analytical-rules",
    name: "Get Auto Analytical Rules",
  },

  // Budgets
  { method: "GET", url: "/budgets", name: "Get All Budgets" },

  // Budget Revisions
  { method: "GET", url: "/budget-revisions", name: "Get All Budget Revisions" },

  // Budget Alerts
  { method: "GET", url: "/budget-alerts", name: "Get All Budget Alerts" },
  {
    method: "GET",
    url: "/budget-alerts/active",
    name: "Get Active Budget Alerts",
  },
  {
    method: "GET",
    url: "/budget-alerts/stats",
    name: "Get Budget Alert Stats",
  },

  // Purchase Orders
  { method: "GET", url: "/purchase-orders", name: "Get All Purchase Orders" },

  // Vendor Bills
  { method: "GET", url: "/vendor-bills", name: "Get All Vendor Bills" },

  // Bill Payments
  { method: "GET", url: "/bill-payments", name: "Get All Bill Payments" },

  // Sales Orders
  { method: "GET", url: "/sales-orders", name: "Get All Sales Orders" },

  // Customer Invoices
  {
    method: "GET",
    url: "/customer-invoices",
    name: "Get All Customer Invoices",
  },

  // Invoice Payments
  { method: "GET", url: "/invoice-payments", name: "Get All Invoice Payments" },

  // Dashboard
  { method: "GET", url: "/dashboard/summary", name: "Get Dashboard Summary" },
  { method: "GET", url: "/dashboard/stats", name: "Get Dashboard Stats" },
  { method: "GET", url: "/dashboard/activity", name: "Get Dashboard Activity" },

  // Analytics
  {
    method: "GET",
    url: "/analytics/budget-vs-actuals",
    name: "Get Budget vs Actuals",
  },
  { method: "GET", url: "/analytics/stats", name: "Get Analytics Stats" },
];

async function runTests() {
  console.log("🚀 Starting API Endpoint Verification...");
  console.log(`📡 Target: ${BASE_URL}`);

  let token = "";

  // 1. Authenticate
  try {
    console.log("\n🔑 Authenticating as Admin...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    if (loginResponse.status === 200 && loginResponse.data.token) {
      token = loginResponse.data.token;
      console.log("✅ Authentication successful! Token received.");
    } else {
      console.error("❌ Authentication failed:", loginResponse.data);
      process.exit(1);
    }
  } catch (error: any) {
    console.error("❌ Authentication failed:", error.message);
    if (error.response) {
      console.error("   Response data:", error.response.data);
    }
    process.exit(1);
  }

  // 2. Test Endpoints
  console.log("\n🧪 Testing Endpoints...");
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    process.stdout.write(
      `   👉 Checking ${endpoint.name} (${endpoint.url})... `,
    );
    try {
      const response = await axios.get(`${BASE_URL}${endpoint.url}`, config);
      if (response.status === 200) {
        console.log("✅ OK");
        passed++;
      } else {
        console.log(`⚠️ Status: ${response.status}`);
        failed++;
      }
    } catch (error: any) {
      console.log("❌ FAILED");
      console.error(`      Error: ${error.message}`);
      if (error.response) {
        console.error(`      Status: ${error.response.status}`);
        console.error(`      Data: ${JSON.stringify(error.response.data)}`);
      }
      failed++;
    }
  }

  // 3. Summary
  console.log("\n📊 Validation Summary");
  console.log("---------------------");
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Total: ${endpoints.length}`);

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
