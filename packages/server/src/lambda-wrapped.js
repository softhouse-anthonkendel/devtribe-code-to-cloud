import serverlessHttp from "serverless-http";
import { server } from "./server.js";

export const handler = serverlessHttp(server);
