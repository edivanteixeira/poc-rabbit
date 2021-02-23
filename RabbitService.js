const amqp = require("amqplib");

class RabbitService {
  constructor() {
    this.queueName = "pix-queue";
    this.exchangeName = "pix.direct";
    this.topicKey = "pix-topic";
  }

  async init() {
    this.connection = await amqp.connect("amqp://rabbit");
    this.channel = await this.connection.createChannel();
    this.channel.assertQueue(this.queueName, {
      durable: true,
    });
    this.channel.assertExchange(this.exchangeName, "direct");
    this.channel.bindQueue(this.queueName, this.exchangeName, this.topicKey);
  }

  async publishMessage(data) {
    this.channel.publish(
      this.exchangeName,
      this.topicKey,
      Buffer.from(JSON.stringify(data))
    );
  }

  async consume(callback) {
    this.channel.consume(this.queueName, callback, {
      noAck: false,
    });
  }
}

module.exports = RabbitService;
