const express = require("express");
require("dotenv").config();
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001; // BFF port number

app.use(cors());
app.use(express.json());

const backendBaseUrl = "https://in-cms-1.onrender.com"; // Your backend URL

// Middleware to add API key to backend requests
const addApiKey = async (req, res, next) => {
  req.headers["x-api-key"] = process.env.API_KEY;
  next();
};

// Function to proxy request
const proxyRequest = async (req, res, addApiKey = false) => {
  const apiKeyHeader = addApiKey ? { "x-api-key": process.env.API_KEY } : {};
  const url = `${backendBaseUrl}${req.originalUrl}`;
  try {
    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: { ...apiKeyHeader },
    });
    res.send(response.data);
  } catch (error) {
    res
      .status(error.response?.status || 500)
      .send(error.response?.data || "Error");
  }
};

// Routes that require API key
app.get('/api/v1/view/listp', (req, res) => proxyRequest(req, res, true));
app.get('/api/v1/view/listc', (req, res) => proxyRequest(req, res, true));
app.post('/api/v1/view/deletePolicies', (req, res) => proxyRequest(req, res, true));
app.post('/api/v1/view/selectPolicy', (req, res) => proxyRequest(req, res, true));

app.post('/api/v1/view/userPolicyList', (req, res) => proxyRequest(req, res, true));

app.post('/api/v1/view/claimPolicy', (req, res) => proxyRequest(req, res, true));
app.post('/api/v1/view/userClaimList', (req, res) => proxyRequest(req, res, true));
app.post('/api/v1/view/rejectClaim', (req, res) => proxyRequest(req, res, true));
app.post('/api/v1/view/addClaim', (req, res) => proxyRequest(req, res, true));
app.post('/api/v1/view/approveClaim', (req, res) => proxyRequest(req, res, true));


// Routes that do not require API key
app.post('/api/v1/auth/reg', (req, res) => proxyRequest(req, res));
app.post('/api/v1/auth/login', (req, res) => proxyRequest(req, res));

app.listen(PORT, () => {
  console.log(`BFF running on http://localhost:${PORT}`);
});