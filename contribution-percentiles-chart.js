import _ from "lodash";
import { incomePcts, workingAmericans } from "./data.js";

const calculateData = () => {
  const countPerPct = _.toNumber(workingAmericans) / 100.0;
  const contribCoeff = countPerPct * 0.062;
  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Percentile');
  data.addColumn('number', 'Contribution');
  _.each(incomePcts, (minIncome,pct) => {
    const contribution = minIncome * contribCoeff;
    const rowData = [ _.toNumber(pct)/100.0, contribution ];
    data.addRow(rowData);
  });

  const yearFormatter = new google.visualization.NumberFormat({ pattern:'##%' })
  yearFormatter.format(data,0);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 0, prefix:'$' });
  dollarFormatter.format(data,1);
  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  const chart = new google.visualization.LineChart(document.getElementById("contribution-percentiles-canvas"));
  const options = {
    title: 'Contribution by Income Percentile in the US (2016)',
    legend: { position: 'bottom' },
    hAxis: { format:'##%' },
    vAxis: { format:'$###,###,###' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
    explorer: false,
  };

  const redrawChart = () => chart.draw(calculateData(), options);
  $(redrawChart);
}));

