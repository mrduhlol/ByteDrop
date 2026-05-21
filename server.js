const express = require("express");
const multer = require("multer");
const QRCode = require("qrcode");
const os = require("os");
const fs = require("fs");

const app = express();
app.use(express.static("public"));

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  res.sendStatus(200);
});

app.get("/files", (req, res) => {
  res.json(fs.readdirSync("uploads"));
});

app.get("/download/:name", (req, res) => {
  res.download("uploads/" + req.params.name);
});

function getLocalIP() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
}

const PORT = 3000;
const IP = getLocalIP();
const URL = `http://${IP}:${PORT}`;

// QR route
app.get("/qr", async (req, res) => {
  const qr = await QRCode.toDataURL(URL);
  res.json({ url: URL, qr });
});

app.listen(PORT, () => {
  console.log(`Running on ${URL}`);
});

app.delete("/delete/:name", (req, res) => {
  const fs = require("fs");
  const path = `uploads/${req.params.name}`;

  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});