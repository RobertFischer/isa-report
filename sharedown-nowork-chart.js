import _ from "lodash";
import {inf, gdpc, t30Rate} from "./data.js";
import raiseFunc from "./raise-func.js";

const currentYear = new Date().getFullYear();

const calculateData = () => {
  const startYear = 1990;
  const retirementYear = startYear + 40;
  const yearsRetired = 60;
  const terminalYear = retirementYear + yearsRetired;
  let accountBalance = 0;
  let contributions = 0;

  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Year');
  data.addColumn('number', 'Annual Income');
  data.addColumn('number', 'Contributions');
  data.addColumn('number', 'Principal Withdrawl');
  data.addColumn('number', 'Interest Withdrawl');
  data.addColumn('number', 'Max Possible SS Payout');
  _.range(startYear, retirementYear).forEach(year => {
    const income = 0;
    const contribution = 1900;
    contributions += contribution;
    accountBalance = contribution + accountBalance * (1 + 12/100);

    const rowData = [year, income, contributions, null, null, null];
    data.addRow(rowData);
  });

  const ssAnnual = 2150 * 12;
  _.range(retirementYear, terminalYear).forEach(year => {
    const retirementStipend = accountBalance / (terminalYear - year + 1);
    const interestEarned = accountBalance * t30Rate[year] / 100.0;
    const cashedOutInterest = interestEarned / 2.0;
    const income = retirementStipend + cashedOutInterest;
    accountBalance -= retirementStipend
    accountBalance += interestEarned - cashedOutInterest;
    data.addRow([year, income, null, retirementStipend, cashedOutInterest, ssAnnual]);
  });

  const yearFormatter = new google.visualization.NumberFormat({ groupingSymbol:'', fractionDigits:0 });
  yearFormatter.format(data,0);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 0, prefix:'$' });
  dollarFormatter.format(data,1);
  dollarFormatter.format(data,2);
  dollarFormatter.format(data,3);
  dollarFormatter.format(data,4);
  dollarFormatter.format(data,5);

  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  const chart = new google.visualization.LineChart(document.getElementById("sharedown-nowork-canvas"));
  const options = {
    title: 'Retirement Account for Those who Never Work',
    legend: { position: 'bottom' },
    hAxis: { format:'####' },
    vAxis: { format:'$###,###,###' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
    explorer: false,
  };

  const redrawChart = () => chart.draw(calculateData(), options);
  $(redrawChart);

}));

