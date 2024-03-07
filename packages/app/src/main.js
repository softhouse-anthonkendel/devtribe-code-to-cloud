import "./main.scss";

const PROD = import.meta.env.PROD;
let appConfig = undefined;

const getAppConfig = async () => {
  if (appConfig) {
    return appConfig;
  }

  const response = await fetch("/config.json");
  const json = await response.json();

  appConfig = json;

  if (PROD) {
    appConfig.serverUrl = appConfig.serverUrlProduction;
  }

  return appConfig;
};

const getBurgers = async () => {
  const { serverUrl } = await getAppConfig();

  const response = await fetch(serverUrl + "/burgers");
  const json = response.json();

  return json;
};

const ids = {
  burgerList: "#burger-list",
};

window.addEventListener("DOMContentLoaded", onDOMContentLoaded);

async function onDOMContentLoaded() {
  const burgerList = document.querySelector(ids.burgerList);
  const burgers = await getBurgers();

  const burgerListItems = burgers.map(
    (burger) => `
  <li class="burger-list-item box">
    <div>
      <h2>${burger.name} from ${burger.restaurant}</h2>
      <p>${burger.description}</p>
      <p>${burger.ingredients.join(", ")}</p>
      <a href="${burger.web}" target="_blank" rel="noopener noreferrer">
      ${burger.restaurant}
      </a>
    </div>
  </li>
  `
  );
  burgerList.innerHTML = burgerListItems.join("\n");
}
