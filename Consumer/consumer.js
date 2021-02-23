const DatabaseService = require("./DatabaseService");
const RabbitService = require("./RabbitService");
const Chance = require("chance");
const chalk = require("chalk");

async function run() {
  const databaseService = new DatabaseService();
  const rabbitService = new RabbitService();
  await databaseService.init();
  await rabbitService.init();
  const chance = new Chance();
  const consumerName = process.env.CONSUMER_NAME;
  await rabbitService.consume(async (message) => {
    const data = JSON.parse(message.content.toString());
    const failure = chance.bool({ likelihood: data.percentFailure });
    //create a transaction
    const transaction = await databaseService.addTransaction({
      batchId: data.batch_id,
      clientName: data.clientName,
      percentFailure: data.percentFailure,
      initialDelay: data.initialDelay,
      processTime: data.processTime,
      receivedAt: new Date(),
      executed: false,
      order: data.order,
      clientIndex: data.clientIndex,
      consumerName: consumerName,
      guid: data.guid,
      createdAt: data.sendAt,
    });
    if (failure && !message.fields.redelivered) {
      //Simulate await
      setTimeout(async () => {
        console.log(
          chalk.red.bold(
            `Transaction from ${data.clientName} and id:${data.id} has failure, send to retry`
          )
        );

        await databaseService.addErrorToTransaction(
          transaction.id,
          "Generic error",
          consumerName
        );

        rabbitService.channel.reject(message);
      }, data.processTime);
    } else {
      //Simulate await
      setTimeout(async () => {
        console.log(
          chalk.green.bold(
            `Transaction from ${data.clientName} and id:${transaction.id} has success`
          )
        );
        transaction.executed = true;
        transaction.executedAt = new Date();
        await transaction.save();
        rabbitService.channel.ack(message);
      }, data.processTime);
    }
  });
}

run();
