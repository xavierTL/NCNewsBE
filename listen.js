const app = require("./app");
const { PORT } = require("./config").config;

app.listen(PORT, () => {
  console.log(`listening on port: ${PORT}`);
});
