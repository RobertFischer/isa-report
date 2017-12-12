import _ from "lodash";

const csvToObj = ([rawYears,rawValues]) => {
  const years = _.map(rawYears, _.toInteger);
  const values = _.map(rawValues, _.toNumber);
  const obj = _.zipObject(years, values);
  const maxYear = _.max(years);
  const minYear = _.min(years);
  const meanVal = _.mean(values);
  _.range(minYear, maxYear+200).forEach(year =>
    obj[year] = obj[year] || meanVal
  );
  return obj;
}

const incomePctsToObj = ([rawPcts,rawDollars]) => {
  const pcts = _.map(rawPcts, it => _.toNumber(it.replace(/%$/,"")));
  const dollars = _.map(rawDollars, it => _.toNumber(it.replace(/^\$/,"").replace(/,/,"")));
  const toReturn = _.zipObject(pcts, dollars);
  return toReturn;
};

module.exports = {
  inf: csvToObj(require("./data/inflation.csv")),
  gdpc: csvToObj(require("./data/gdp-per-capita.csv")),
  t30Rate: csvToObj(require("./data/tbill30rates.csv")),
  incomePcts: incomePctsToObj(require("./data/incomePercentiles.csv")),
  workingAmericans: 167736100,
  usPopulation: 325227328,
};

