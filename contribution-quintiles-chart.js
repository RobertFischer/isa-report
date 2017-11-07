import _ from "lodash";
import { incomePcts, workingAmericans } from "./data.js";

const calculateData = () => {
  const countPerPct = _.toNumber(workingAmericans) / 100.0;
  const contribCoeff = countPerPct * 0.062;
  const data = new google.visualization.DataTable();
  data.addColumn('string', 'Quintile');
  data.addColumn('number', 'Contribution');

  const q0 = _.sum(_.map(_.range(0,20),   it => (incomePcts[it] || 0))) * contribCoeff;
  const q1 = _.sum(_.map(_.range(20,40),  it => incomePcts[it])) * contribCoeff;
  const q2 = _.sum(_.map(_.range(40,60),  it => incomePcts[it])) * contribCoeff;
  const q3 = _.sum(_.map(_.range(60,80),  it => incomePcts[it])) * contribCoeff;
  const q4 = _.sum(_.map(_.range(80,100), it => incomePcts[it])) * contribCoeff;

  data.addRow(["Bottom", q0]);
  data.addRow(["Bottom-Middle", q1]);
  data.addRow(["Median", q2]);
  data.addRow(["Middle-Top", q3]);
  data.addRow(["Top", q4]);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 0, prefix:'$' });
  dollarFormatter.format(data,1);

  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  const chart = new google.visualization.PieChart(document.getElementById("contribution-quintiles-canvas"));
  const options = {
    title: 'Contribution by Income Quintile in the US (2016)',
    legend: { position: 'bottom' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
  };

  const redrawChart = () => chart.draw(calculateData(), options);
  $(redrawChart);
}));

