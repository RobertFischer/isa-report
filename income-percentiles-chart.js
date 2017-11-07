import _ from "lodash";
import { incomePcts, workingAmericans } from "./data.js";

const calculateData = () => {
  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Percentile');
  data.addColumn('number', 'Annual Income');
  _.each(incomePcts, (minIncome,pct) => {
    const rowData = [ _.toNumber(pct)/100.0, minIncome ];
    data.addRow(rowData);
  });

  const yearFormatter = new google.visualization.NumberFormat({ pattern:'##%' })
  yearFormatter.format(data,0);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 0, prefix:'$' });
  dollarFormatter.format(data,1);
  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  const chart = new google.visualization.LineChart(document.getElementById("income-percentiles-canvas"));
  const options = {
    title: 'Income Percentiles in the US (2016)',
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

