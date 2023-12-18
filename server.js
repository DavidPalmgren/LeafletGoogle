const express = require("express");
const path = require("path");

const app = express();
const port = 3002;

app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")))

app.get('/*', (req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "index.html"))
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
