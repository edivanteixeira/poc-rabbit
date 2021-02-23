const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const RabbitService = require("./RabbitService");
const DatabaseService = require("./DatabaseService");
const app = express();
const PORT = process.env.PORT;
const { Worker, isMainThread } = require("worker_threads");

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());

const rabbitService = new RabbitService();
const databaseService = new DatabaseService();

app.get("/", async (req, res) => {});

app.get("/batch", async (req, res) => {
  await rabbitService.init();
  await databaseService.init();
  const batchs = await databaseService.getAllBatchs();
  res.json(batchs);
});

app.get("/batch/:id", async (req, res) => {
  const batch = await databaseService.getBatch(req.params.id);
  if (batch) {
    res.status(200).json(batch);
  } else {
    res.status(404).json("404 - Not found");
  }
});

app.post("/batch", async (req, res) => {
  const data = req.body;
  const batch = await databaseService.createBatch(data.batchName);

  data.simulations.forEach(async (simulation) => {
    if (isMainThread) {
      const worker = new Worker("./sender.js", { env: { ...process.env } });
      worker.postMessage({
        simulation: simulation,
        batchId: batch.id,
      });
    }
  });

  if (batch) {
    res.status(200).json(batch);
  } else {
    res.status(404).json("404 - Not found");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

