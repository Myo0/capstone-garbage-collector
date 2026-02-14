import express, { json } from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow requests from react side
app.use(json()); // Parse JSON bodies


app.get("/", (req, res) => {
  res.send("Backend server is running");
});

// placeholder API that will be changed later
app.get("/api", (req, res) => {
  res.json({
    message: "API is working",
    status: "OK"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});