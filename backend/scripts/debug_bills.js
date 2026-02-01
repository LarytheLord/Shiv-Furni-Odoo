const axios = require("axios");

const API_URL = "http://localhost:5000/api";

async function debugBills() {
  try {
    console.log("Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@shivfurniture.com",
      password: "admin",
    });

    const token = loginRes.data.data.token; // Check structure!
    // Often it is loginRes.data.token or loginRes.data.data.token
    // Based on UserRoutes, typically generic response format { status: 'success', data: { user, token } }

    // I'll check login output first if it fails.

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log("Login successful. Token:", token ? "Found" : "Missing");

    const billsRes = await axios.get(`${API_URL}/vendor-bills`, {
      headers,
      params: { page: 1, limit: 20 },
    });

    console.log("Status:", billsRes.status);
    console.log("Data Type:", typeof billsRes.data);
    console.log("Response Body:", JSON.stringify(billsRes.data, null, 2));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.message);
      if (error.response) {
        console.error("Response Status:", error.response.status);
        console.error(
          "Response Data:",
          JSON.stringify(error.response.data, null, 2),
        );
      }
    } else {
      console.error("Error:", error);
    }
  }
}

debugBills();
