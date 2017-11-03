import _ from "lodash";
import {inf, gdpc} from "./data.js";

module.exports = (key="fix3") => {
  if(_.startsWith(key, "fix")) {
    const fixedAmount = _.toNumber(_.replace(key, /^fix/, ""));
    const coefficient = 1.0 + (fixedAmount/100.0);
    return (prev) => prev * coefficient;
  } else if (_.startsWith(key, "exp")) {
    const experienceFactor = _.toNumber(_.replace(key, /^exp/, ""));
    return (prev,startYear,currentYear) => {
      const coefficient = 1.0 + (currentYear-startYear)/experienceFactor/100;
      return prev * coefficient;
    };
  } else if (key == "gdpc") {
    return (prev,_,currentYear) => prev * (1.0 + gdpc[currentYear]/100.0);
  } else if (key == "inf") {
    return (prev,_,currentYear) => prev * (1.0 + inf[currentYear]/100.0);
  } else {
    throw new Error("Do not know the specified raise function: " + key);
  }
};

