require('dotenv').config();
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('PetBot API is running');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
