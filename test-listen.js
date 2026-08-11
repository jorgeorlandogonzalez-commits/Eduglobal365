const express = require('express');
const app = express();
app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
  console.log("Listening...");
});
