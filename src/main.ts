import * as path from "path";
import {server} from "./webServer/server";
import {GlobalAccessor} from "./webServer/utils/GlobalAccessor";

require('source-map-support').install(); //Required to get the typescript stack traces instead of the JS ones.
require('dotenv').config({
    path: process.env.NODE_ENV === "production" ? path.join(__dirname, '../.prod.env'): path.join(__dirname, '../.dev.env')
}); //With this you can use the process.env.<variable> syntax from the .env file


/**
 * This is the main function of the application.
 *
 * No core functionality should be added here, it is only the place to start items.
 */
const globalAccessor = new GlobalAccessor();
globalAccessor.init().then(async () => {
    await server();
});

process.on("SIGINT", () => {
    GlobalAccessor.closeConnection().then(() => {
        console.log("MongoDB connection closed.");
        process.exit(0);
    });
});



