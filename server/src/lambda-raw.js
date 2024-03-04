import { burgerService } from "./services/burger-service.js";
import { getJsonHeaders } from "./utils/header-utils.js";
import { logger } from "./utils/logger-utils.js";

const buildResponse = (args = {}) => ({
  statusCode: args?.status ?? 200,
  headers: args?.headers ?? getJsonHeaders(),
  body: JSON.stringify(args?.body ?? {}),
});

export const handler = async (event, context) => {
  logger.info("event: ", event);
  logger.info("context: ", context);

  const path = event.rawPath;
  logger.info("path: ", path);

  switch (path) {
    case "/burgers":
      const burgers = await burgerService.getBurgers();
      return buildResponse({ body: burgers });

    default:
      return buildResponse({ body: { message: "SHMEBULOCK" } });
  }
};
