import _ from "lodash";
import {inf, gdpc, t30Rate} from "./data.js";
import raiseFunc from "./raise-func.js";

const currentYear = new Date().getFullYear();

const getRaiseFunction = form => {
  const key = _.toString($("#cb-annual-raise", form).val());
  return  raiseFunc(key);
};


const calculateData = () => {
  const form = $("#cb-calculator");
  const startYear = 1990;
  const endYear = 2017;
  const raiseFunc = getRaiseFunction(form);
  let income1 = _.toInteger($("#cb-starting-income-1", form).val());
  let accountBalance1 = 0;
  let contributions1 = 0;
  let income2 = _.toInteger($("#cb-starting-income-2", form).val());
  let accountBalance2 = 0;
  let contributions2 = 0;

  let childAccountBalance = 0;
  let childContributions = 0;

  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Year');
  data.addColumn('number', 'Total Contributions to Child');
  data.addColumn('number', 'Child Account Balance');
  _.range(startYear, endYear).forEach(year => {
    income1 = raiseFunc(income1, startYear, year);
    const contribution1 = income1 * 0.062;
    accountBalance1 = contribution1 + accountBalance1 * (1 + 12/100);
    const toChild1 = accountBalance1 * 0.01/3;
    accountBalance1 = accountBalance1 - toChild1;
    contributions1 = contributions1 + toChild1;

    income2 = raiseFunc(income2, startYear, year);
    const contribution2 = income2 * 0.062;
    accountBalance2 = contribution2 + accountBalance2 * (1 + 12/100);
    const toChild2 = accountBalance2 * 0.01/3;
    accountBalance2 = accountBalance2 - toChild2;
    contributions2 = contributions2 + toChild2;

    accountBalance1 = accountBalance1 + toChild2;
    accountBalance2 = accountBalance2 + toChild1;

    childAccountBalance = childAccountBalance + toChild1 + toChild2 + childAccountBalance * t30Rate[year] / 100.0;
    childContributions = childContributions + toChild1 + toChild2;

    const rowData = [year, childContributions, childAccountBalance];
    data.addRow(rowData);
  });

  _.range(endYear, startYear+50).forEach(year => {
    childAccountBalance = childAccountBalance + childAccountBalance * 12.0 / 100.0;
    const rowData = [year, childContributions, childAccountBalance];
    data.addRow(rowData);
  });

  _.range(startYear+50, startYear+65).forEach(year => {
    childAccountBalance = childAccountBalance + childAccountBalance * t30Rate[year] / 100.0;
    const rowData = [year, childContributions, childAccountBalance];
    data.addRow(rowData);
  });

  const yearFormatter = new google.visualization.NumberFormat({ groupingSymbol:'', fractionDigits:0 });
  yearFormatter.format(data,0);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 0, prefix:'$' });
  dollarFormatter.format(data,1);
  dollarFormatter.format(data,2);

  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  const chart = new google.visualization.LineChart(document.getElementById("child-benefit-chart-canvas"));
  const options = {
    title: 'Child Benefit',
    legend: { position: 'bottom' },
    hAxis: { format:'####' },
    vAxis: { format:'$###,###,###' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
    explorer: false,
  };

  const form = $("#cb-calculator");
  const redrawChart = () => chart.draw(calculateData(), options);
  $("input,select", form).change(redrawChart);
  $(redrawChart);
}));

