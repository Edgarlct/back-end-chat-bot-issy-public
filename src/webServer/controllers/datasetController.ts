import {FastifyInstance} from "fastify";
import {GlobalAccessor} from "../utils/GlobalAccessor";


/**
 * controllers have to be registered in server.ts
 * @param server
 */

/**
 * @param server
 * route insert fake data :
 * dataset:string
 * url:string
 * first_key:string -> category
 * second_key:string -> type
 * key_value:{
 *     first_key_value:[seconde_key_value...]
 *     ...
 * }
 *
 * route get :
 * - list dataset
 * - first key value dataset
 * - second key value de la first key value du dataset
 */
export function datasetController(server: FastifyInstance) {

    /**
     * This route return key value of the dataset
     */
    server.get("/dataset/key/value", async (request, reply) => {
        const params = request.query as {id: string};

        if (!params.id) {
            reply.code(400).send("id param is required");
            return;
        }

        const collection = GlobalAccessor.getDatasetCollection()

        // get dataset
        const keyValues = await collection.findOne({id: params.id}, {projection: {_id: 0, keyValues: 1, id: 1, firstKey: 1, secondKey: 1, name:1}});

        if (!keyValues) {
            reply.code(404).send("dataset not found");
            return;
        }

        reply.send(keyValues);
    });

    /**
     * this route return all datasets
     */
    server.get("/dataset", async (request, reply) => {
        const collection = GlobalAccessor.getDatasetCollection()

        const datasets = await collection.find({}, {projection: {_id: 0, id: 1, name: 1}}).toArray();

        reply.send(datasets);
    });
}
