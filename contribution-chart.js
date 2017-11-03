import _ from "lodash";
import {inf, gdpc, t30Rate} from "./data.js";
import raiseFunc from "./raise-func.js";

const currentYear = new Date().getFullYear();

const getRaiseFunction = form => {
  const key = _.toString($("#annual-raise", form).val());
  return  raiseFunc(key);
};

const calculateData = () => {
  const form = $("#contribution-calculator");
  const startYear = _.toInteger($("#starting-year", form).val());
  const endYear = currentYear;
  let income = _.toInteger($("#starting-income", form).val());
  let contributions = 0;
  let t30value = 0;
  let highYieldBondValue = 0;
  let fixed12ReturnValue = 0;
  const raiseFunc = getRaiseFunction(form);


  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Year');
  data.addColumn('number', 'Annual Income');
  data.addColumn('number', 'Total Contributions');
  data.addColumn('number', '30Y T-Bills Value');
  data.addColumn('number', 'High Yield Bonds Value');
  data.addColumn('number', '12% Return Value');
  _.range(startYear, endYear).forEach(year => {
    const originalIncome = income;
    income = year > endYear ? null : raiseFunc(income, startYear, year);
    const contribution = income ? income * 0.062 : 0;
    const t30coeff = 1.0 + t30Rate[year]/100.0;
    const originalT30value = t30value;
    t30value = contribution + originalT30value * t30coeff;
    highYieldBondValue = contribution + highYieldBondValue * (1.0 + 7.98/100.0);
    fixed12ReturnValue = contribution + fixed12ReturnValue * (1.0 + 12/100.0);
    contributions += contribution;

    const rowData = [year, income, contributions, t30value, highYieldBondValue, fixed12ReturnValue];
    data.addRow(rowData);
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
  const chart = new google.visualization.LineChart(document.getElementById("contribution-chart-canvas"));
  const options = {
    title: 'Social Security Contribution Values',
    legend: { position: 'bottom' },
    hAxis: { format:'####' },
    vAxis: { format:'$###,###,###' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
    explorer: false,
  };

  $("input,select", $("#contribution-calculator")).change(() => chart.draw(calculateData(), options));
  $(() => chart.draw(calculateData(), options));

}));
