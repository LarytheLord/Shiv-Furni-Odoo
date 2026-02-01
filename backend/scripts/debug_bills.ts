import axios from "axios";

const API_URL = "http://localhost:5000/api";

async function debugBills() {
  try {
    // 1. Login
    console.log("Logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@shivfurniture.com",
      password: "admin",
    });

    const token = loginRes.data.token; // Or however it is returned.
    // Check if it's in cookie or body. Usually body for JWT or cookie.
    // Assuming body based on typical express apps here.
    // If cookie, axios might not save it easily without jar.

    // Let's assume Bearer token for now or check header.
    // Previous context mentioned "Authentication Header".

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    console.log("Login successful. Fetching bills...");

    // 2. Get Bills
    const billsRes = await axios.get(`${API_URL}/vendor-bills`, {
      headers,
      params: { page: 1, limit: 20 },
    });

    console.log("Status:", billsRes.status);
    console.log("Response config:", billsRes.headers);
    console.log("Response Body Structure:", Object.keys(billsRes.data));
    if (billsRes.data.data) {
      console.log("Data keys:", Object.keys(billsRes.data.data));
      if (Array.isArray(billsRes.data.data.bills)) {
        console.log("Bills count:", billsRes.data.data.bills.length);
        if (billsRes.data.data.bills.length > 0) {
          console.log(
            "First Bill Sample:",
            JSON.stringify(billsRes.data.data.bills[0], null, 2),
          );
        } else {
          console.log("Bills array is empty.");
        }
      } else {
        console.log(
          "billsRes.data.data.bills is NOT an array:",
          billsRes.data.data.bills,
        );
      }
    } else {
      console.log("No data property in response:", billsRes.data);
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios Error:", error.message);
      console.error("Response Data:", error.response?.data);
    } else {
      console.error("Error:", error);
    }
  }
}

debugBills();
