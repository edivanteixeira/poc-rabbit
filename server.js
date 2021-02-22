const express = require("express");
const bodyParser = require("body-parser");
const amqp = require("amqplib");
const { v4: uuidv4 } = require("uuid");
const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.post("/process", async (req, res) => {
  const data = req.body;
  const queueName = "pix-queue";
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  channel.assertQueue(queueName, {
    durable: true,
  });
  channel.assertExchange("amq.direct", "direct");
  channel.bindQueue(queueName, "amq.direct", "pix-queue");
  const batchId = uuidv4();
  const timeName = `Send${data.totalMessages}MessagesToRabbit`;
  console.time(timeName);
  for (let i = 0; i < data.totalMessages; i++) {
    const dataToQueue = {
      createdAt: new Date(),
      percentError: data.percentError,
      payload: data.payload,
      processTime: data.processTime,
      batchId: batchId,
      requestId: uuidv4(),
      requestOrder: i,
      errors: [],
      onErrorQueue: "pix-error-queue",
      retry:0
    };
    channel.publish(
      "amq.direct",
      "pix-queue",
      Buffer.from(JSON.stringify(dataToQueue))
    );
  }
  console.timeEnd(timeName);
  res.send({
    ok: true,
  });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
