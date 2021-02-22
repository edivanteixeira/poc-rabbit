const amqp = require('amqplib');
const Chance = require('chance');
const chalk = require('chalk');
const mongo = require('mongodb');

const run = async () => {
  const queueName = 'pix-queue';
  const consumerName = process.env.CONSUMER_NAME;
  const mongoClient =mongo.MongoClient;
  
  const connection = await amqp.connect('amqp://localhost');
  const channel = await connection.createChannel();
  channel.assertQueue(queueName, {
    durable: true,
    
  });
  const dbo = await mongoClient.connect('mongodb://mongouser:MongoExpress2021!@localhost:27017/?authSource=admin');
  channel.consume(
    queueName,
    (message) => {
      let data = JSON.parse(message.content.toString());
      const chance = new Chance();
      const hasError = chance.bool({ likelihood: data.percentError });
      const processTime = data.processTime;
      const receivedAt = new Date();
      setTimeout(async() => {
        if (hasError) {
          channel.reject(message);
          console.log(chalk.green.bold(`Rejected message ${data.requestOrder} in ${consumerName}`));
        }else{
            data.receivedAt = receivedAt;
            data.consumer = consumerName;
            const db = dbo.db('messages');
            await db.collection('success').insertOne(data);
            channel.ack(message);              
            console.log(chalk.green.bold(`Success processing message ${data.requestOrder} in ${consumerName}`));
        }
      }, processTime);

    },
    {
      noAck: false
    }
  );
};
run();