import _ from "lodash";

const csvToObj = ([rawYears,rawValues]) => {
  const years = _.map(rawYears, _.toInteger);
  const values = _.map(rawValues, _.toNumber);
  const obj = _.zipObject(years, values);
  const maxYear = _.max(years);
  const meanVal = _.mean(values);
  _.range(maxYear, maxYear+100).forEach(year => {
    obj[year] = meanVal;
  });
  return obj;
}

module.exports = {
  inf: csvToObj(require("./data/inflation.csv")),
  gdpc: csvToObj(require("./data/gdp-per-capita.csv")),
  t30Rate: csvToObj(require("./data/tbill30rates.csv")),
}

