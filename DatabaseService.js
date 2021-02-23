const { Sequelize, DataTypes, Deferrable } = require("sequelize");

const sequelize = new Sequelize(
  process.env.POSTGRES_DATABASE,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    dialect: "postgres",
  }
);

const Batch = sequelize.define(
  "Batch",
  {
    batchName: DataTypes.STRING,
  },
  {}
);

const Transaction = sequelize.define(
  "Transaction",
  {
    clientIndex: DataTypes.INTEGER,
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    receivedAt: DataTypes.DATE,
    executedAt: DataTypes.DATE,
    executed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    percentFailure: DataTypes.INTEGER,
    initialDelay: DataTypes.INTEGER,
    processTime: DataTypes.INTEGER,
    consumerName: DataTypes.STRING,
    order: DataTypes.INTEGER,
    guid: DataTypes.STRING,
  },
  {}
);
Batch.hasMany(Transaction, {
  foreignKey: "batchId",
  //as: "transactions",
});
Transaction.belongsTo(Batch, {
  foreignKey: "batchId",
});
const TransactionError = sequelize.define("TransactionError", {
  errorMessage: DataTypes.STRING,
  consumerName: DataTypes.STRING,
});

TransactionError.belongsTo(Transaction);
Transaction.hasMany(TransactionError);

class DatabaseService {
  constructor() {}
  async init() {
    await sequelize.sync({ force: false });
  }

  async createBatch(batchName) {
    let batch = await Batch.create({
      batchName: batchName,
    });

    return batch;
  }

  async getAllBatchs() {
    return await Batch.findAll();
  }

  async getBatch(id) {
    return await Batch.findByPk(id, {
      include: [
        {
          model: Transaction,
          include: TransactionError,
        },
      ],
      order: [[Transaction, "receivedAt", "ASC"]],
    });
  }

  async addTransaction(data) {
    const transaction = Transaction.build(data);
    await transaction.save();
    return transaction;
  }

  async deleteTransaction(transactionId) {
    const transaction = await Transaction.findByPk(transactionId);
    transaction.destroy();
  }

  async updateExecuted(transactionId, consumerName) {
    const transaction = await Transaction.findByPk(transactionId);
    transaction.executed = true;
    transaction.executedAt = new Date();
    transaction.consumerName = consumerName;
    await transaction.update();
  }

  async addErrorToTransaction(transactionId, errorMessage, consumerName) {
    const transactionError = await TransactionError.build({
      TransactionId: transactionId,
      errorMessage: errorMessage,
      consumerName: consumerName,
    });
    await transactionError.save();
    return transactionError;
  }

  async getAllTransactionsByBatchId(batchId) {
    const transactions = await Transaction.findAll({
      where: {
        batch_id: batchId,
      },
    });
    return transactions;
  }

  async getAllTransactionsByBatchIdOrderBy(batchId, orderField) {
    const transactions = await Transaction.findAll({
      where: {
        batch_id: batchId,
      },
      order: [[orderField]],
    });
    return transactions;
  }

  async getAllTransactionsByBatchIdOrderByCreated(batchId) {
    return this.getAllTransactionsByBatchIdOrderBy(batchId, "receivedAt");
  }

  async getAllTransactionsByBatchIdOrderByExecuted(batchId) {
    return this.getAllTransactionsByBatchIdOrderBy(batchId, "executedAt");
  }
}

module.exports = DatabaseService;
