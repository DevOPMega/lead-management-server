import development from "./development.log.js";
import production from "./production.log.js";

let log = null;

switch (process.env.NODE_ENV) {
    case "production": {
        log = production();
        break;
    }

    case "development": {
        log = development();
        break;
    }
}


export default log;