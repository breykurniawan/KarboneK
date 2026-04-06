import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import memberRoutes from "./routes/members.js";
import newsRoutes from "./routes/news.js";
import galleryRoutes from "./routes/gallery.js";
import bracketRoutes from "./routes/bracket.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"], credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/bracket", bracketRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok", message: "Server berjalan" }));

app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
