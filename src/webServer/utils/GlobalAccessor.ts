import {Collection, MongoClient} from "mongodb";

export class GlobalAccessor {
  async init() {
    await this.initConnection()
    await this.initDatabase()
  }

  private async initConnection () {
    const conn = new MongoClient(process.env.MONGO_URL);
    await conn.connect();

    global.mongo = conn;
  }

  static async closeConnection () {
    if (!global.mongo) {
      return;
    }
    await global.mongo.close();
    delete global.mongo;
  }

  private async initDatabase () {
    if (!global.mongo) {
      await this.initConnection();
    }
    global.db = global.mongo.db(process.env.MONGO_DB);
  }

  static getDatasetCollection () {
    return global.db.collection(process.env.MONGO_DATASET_COLLECTION);
  }
}
