import http from "node:http";
import { burgerService } from "./services/burger-service.js";
import { getJsonHeaders } from "./utils/header-utils.js";
import { logger } from "./utils/logger-utils.js";

const PORT = process.env.PORT ?? 9090;
const HOSTNAME = process.env.HOSTNAME ?? "localhost";

const buildResponse = (response, args = {}) => {
  response.writeHead(args?.status ?? 200, args?.headers ?? getJsonHeaders());
  response.end(JSON.stringify(args?.body ?? {}));
};

const server = http.createServer(async (request, response) => {
  logger.info("request: ", request);
  logger.info("response: ", response);

  const path = request.url;
  logger.info("path: ", path);

  switch (path) {
    case "/burgers":
      const burgers = await burgerService.getBurgers();
      return buildResponse(response, { body: burgers });

    default:
      return buildResponse(response, { body: { message: "SHMEBULOCK" } });
  }
});

server.listen(PORT, HOSTNAME, () => {
  console.info(`server listening on http://${HOSTNAME}:${PORT}`);
});
