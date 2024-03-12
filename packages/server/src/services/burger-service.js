import { logger } from "../utils/logger-utils.js";
import burgers from "./burgers.json" assert { type: "json" };
import { dynamodbService } from "./dynamodb-service.js";

export const burgerService = {
  async getBurgers() {
    const dbBurgers = await dynamodbService.putAll('Burgers', burgers);
    logger.info(`Retrieved ${dbBurgers.length} records from dynamoDB`);
    return dbBurgers;
  },
};
