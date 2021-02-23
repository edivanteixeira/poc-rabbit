const RabbitService = require("./RabbitService");
const { parentPort } = require("worker_threads");
const uuid = require('uuid');
const rabbitService = new RabbitService();
parentPort.once("message",async (message) => {
  rabbitService.init();
  setTimeout(async () => {
    for (let i = 0; i < message.simulation.transactionsCount; i++) {
      const messageToRabbit = {
        batch_id: message.batchId,
        clientName: message.simulation.clientName,
        percentFailure: message.simulation.percentFailure,
        initialDelay: message.simulation.initialDelay,
        processTime: message.simulation.proccessTime,
        clientIndex : message.simulation.clientIndex,
        order: i,
        sendAt: new Date(),
        guid: uuid.v4()
      };
      await rabbitService.publishMessage(messageToRabbit);
    }
  }, message.simulation.initialDelay);
});
