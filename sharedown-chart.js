import _ from "lodash";
import { incomePcts, workingAmericans, usPopulation } from "./data.js";

console.info("Initializing the sharedown chart");

const calculateData = () => {
  console.info("Calculating the sharedown chart", incomePcts);
  const countPerPct = _.toNumber(workingAmericans) / 100.0;
  const nonworkingAmericans = usPopulation - workingAmericans;
  const contribCoeff = 0.062;

  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Percentile');
  //data.addColumn('number', 'Sharedown (Workers Only)');
  //data.addColumn('number', 'Total (Workers Only)');
  data.addColumn('number', 'Sharedown');
  data.addColumn('number', 'Total Benefit');

  const benefits = {};
  _.range(99,0,-1).forEach(pct => {
    const minIncome = incomePcts[pct];
    if(_.isNil(minIncome)) {
      console.error("No minimimum income found for percentile", pct, incomePcts);
      throw new Error("No minimum income found for percentile: " + pct);
    }
    const perCapitaContribution = minIncome * contribCoeff;
    const totalContribution = perCapitaContribution * countPerPct;
    const [fromAbove,fromAboveAll] = benefits[pct] || [0,0];
    const spreadOver = pct * countPerPct;
    const spreadOverAll = spreadOver + nonworkingAmericans;

    const perCapitaBenefit = (totalContribution + fromAbove) / spreadOver;
    const perCapitaBenefitAll = (totalContribution + fromAboveAll) / spreadOverAll;
    data.addRow([pct/100.0
      //, perCapitaBenefit, perCapitaContribution + perCapitaBenefit
      , perCapitaBenefitAll, perCapitaContribution + perCapitaBenefitAll
    ]);

    _.range(pct,0,-1).forEach(lowerPct => {
      const [over,overAll] = benefits[lowerPct] || [0,0];
      benefits[lowerPct] =
        [ over + totalContribution - perCapitaBenefit * countPerPct
        , overAll + totalContribution - perCapitaBenefitAll * countPerPct
        ];
    });
  });

  const pctFormatter = new google.visualization.NumberFormat({ pattern:'##%' })
  pctFormatter.format(data,0);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 2, prefix:'$' });
  dollarFormatter.format(data,1);
  dollarFormatter.format(data,2);

  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  console.info("Loading the sharedown chart");
  const chart = new google.visualization.LineChart(document.getElementById("sharedown-canvas"));
  const options = {
    title: 'Annual Benefit with Sharedown (Per Capita)',
    legend: { position: 'bottom' },
    hAxis: { format:'##%' },
    vAxis: { format:'$###,###' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
    explorer: false,
  };

  const redrawChart = () => chart.draw(calculateData(), options);
  $(redrawChart);
}));

