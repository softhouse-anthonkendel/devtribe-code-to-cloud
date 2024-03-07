import burgers from "./burgers.json" assert { type: "json" };

export const burgerService = {
  async getBurgers() {
    return burgers;
  },
};
