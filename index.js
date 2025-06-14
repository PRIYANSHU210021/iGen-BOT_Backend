import express from "express";
import cors from "cors";
import chat from "./src/controllers/chat.js";

const app = express();
app.use(cors());


// app.use(cors({
//   origin: "https://i-gen-bot-backend.vercel.app", // or "*" for testing only
//   methods: ["GET", "POST", "OPTIONS"],
//   allowedHeaders: ["Content-Type"],
// }));


app.use(express.json());
const PORT = process.env.PORT || 5000;


app.post("/api/chat", chat );  

app.listen(process.env.PORT, () => {
  console.log(`NegiBot backend running on port ${PORT}`);
});

