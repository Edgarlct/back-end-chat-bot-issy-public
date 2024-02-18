import {FastifyInstance} from "fastify";
import {Dataset} from "../utils/Dataset";
import {GlobalAccessor} from "../utils/GlobalAccessor";


/**
 * controllers have to be registered in server.ts
 * @param server
 */
export function mainController(server: FastifyInstance) {
  /**
   * This route reply the key of the dataset
   * the query params are: url
   */
    server.get("/dataset/key", async (request, reply) => {
    const params = request.query as {url: string};

    if (!params.url) {
      reply.code(400).send("url param is required");
      return;
    }

    const key = await Dataset.getDatasetKey(params.url);

    reply.send(key);
  });

  /**
   * This route save in database all data for first key and if exists for second key
   */
  server.post("/dataset/save", async (request, reply) => {
    const params = request.body as {url: string, name: string, key1: string, key2?: string};

    if (!params.url) {
      reply.code(400).send("url param is required");
      return;
    }

    if (!params.key1) {
      reply.code(400).send("key1 param is required");
      return;
    }

    const dataset = await Dataset.getDataset(params.url);
console.log(dataset)
    // check if the key1 exists
    const key1Exists = dataset.some((row) => row[params.key1] !== undefined);
    if (!key1Exists) {
      reply.code(400).send(`key1 ${params.key1} does not exist`);
      return;
    }

    let keyValues: { [key:string] : string[]} = {};

    for (const row of dataset) {
      if (row[params.key1] === undefined) {
        continue;
      }

      if (keyValues[row[params.key1]] === undefined) {
        keyValues[row[params.key1]] = [];
      }

      if (params.key2 && row[params.key2] !== undefined) {
        if (!keyValues[row[params.key1]].includes(row[params.key2])) {
          keyValues[row[params.key1]].push(row[params.key2]);
        }
      }
    }

    // insert in database
    const collection = GlobalAccessor.getDatasetCollection()
    const datasetId = Dataset.getDatasetId(params.url);

    // check if the dataset exists
    const datasetExists = await collection.findOne({id: datasetId});

    let set = {
      name: params.name,
      firstKey: params.key1,
      secondKey: params.key2 ?? null,
      keyValues: keyValues
    }

    if (datasetExists) {
      collection.updateOne({id: datasetId}, {$set: set});
    } else {
      set["id"] = datasetId
      collection.insertOne(set);
    }

    reply.send(keyValues);
  });
}
