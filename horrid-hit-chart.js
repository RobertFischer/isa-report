import _ from "lodash";
import { t30Rate } from "./data.js";

console.info("Loading horrid hit chart code");

const calculateData = () => {
  console.info("Calculating the horrid hit chart.");
  const form = $("#horrid-hit-calculator");
  const annualContribution = 40000.0 * 0.062;
  const growthCoefficient = 1.0 + 0.12;
  const tbillCoefficient = 1.0 + (_.mean(_.values(t30Rate)))/100.0;
  const lossCoefficient = 1.0 - 0.82;
  const person1Hit = _.toInteger($("#alice-bad-hit-year", form).val());
  const person2Hit = _.toInteger($("#bob-bad-hit-year", form).val());

  console.info("Generating insured hit chart",
    { annualContribution, growthCoefficient, tbillCoefficient, lossCoefficient, person1Hit, person2Hit, t30Rate });

  let person1AccountNoIns = 0.0;
  let person1AccountTBill = 0.0;
  let person2AccountNoIns = 0.0;
  let person2AccountTBill = 0.0;
  let noHitAccountNoIns = 0.0;
  let noHitAccountTBill = 0.0;

  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Year');
  data.addColumn('number', 'Alice Balance (Uninsured)');
  data.addColumn('number', 'Alice Balance (Insured)');
  data.addColumn('number', 'Bob Balance (Uninsured)');
  data.addColumn('number', 'Bob Balance (Insured)');
  _.range(1, 40+1).forEach(year => {
    const agePct = (19.0+year)/100.0;
    const tBillPct = _.min([1.0, agePct]);
    const marketPct = 1.0 - tBillPct;

    person1AccountNoIns *= (person1Hit == year ? lossCoefficient : growthCoefficient);
    person1AccountNoIns += annualContribution;

    const person1Coeff =
        (marketPct * (person1Hit == year ? lossCoefficient : growthCoefficient))
      + (tBillPct * tbillCoefficient)
    ;

    person1AccountTBill *= person1Coeff;
    person1AccountTBill += annualContribution;

    person2AccountNoIns *= (person2Hit == year ? lossCoefficient : growthCoefficient);
    person2AccountNoIns += annualContribution;

    const person2Coeff =
        (marketPct * (person2Hit == year ? lossCoefficient : growthCoefficient))
      + (tBillPct * tbillCoefficient)
    ;

    person2AccountTBill *= person2Coeff;
    person2AccountTBill += annualContribution;

    noHitAccountNoIns *= growthCoefficient;
    noHitAccountNoIns += annualContribution;

    const noHitCoeff =
        (marketPct * growthCoefficient)
      + (tBillPct * tbillCoefficient)
    ;

    noHitAccountTBill *= noHitCoeff;
    noHitAccountTBill += annualContribution;

    const rowData =
        [ year
        , person1AccountNoIns, person1AccountTBill
        , person2AccountNoIns, person2AccountTBill
        ]

    data.addRow(rowData);
  });

  const yearFormatter = new google.visualization.NumberFormat({ groupingSymbol:'', fractionDigits:0, prefix:'Year ' });
  yearFormatter.format(data,0);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 0, prefix:'$' });
  dollarFormatter.format(data,1);
  dollarFormatter.format(data,2);
  dollarFormatter.format(data,3);
  dollarFormatter.format(data,4);
  //dollarFormatter.format(data,5);
  //dollarFormatter.format(data,6);

  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  console.info("Initializing horrid hit chart");

  const chart = new google.visualization.LineChart(document.getElementById("horrid-hit-canvas"));
  const options = {
    title: 'Impact of Severe Value Hit',
    legend: { position: 'bottom' },
    hAxis: { format:'####' },
    vAxis: { format:'$###,###,###' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
    explorer: false,
  };

  const form = $("#horrid-hit-calculator");

  const person1 = $("select#alice-bad-hit-year option[value=10]",form).attr("selected", true);
  const person2 = $("select#bob-bad-hit-year option[value=35]",form).attr("selected", true);
  console.info("Horrid Hit Years", person1, person2);

  const redrawChart = () => chart.draw(calculateData(), options);
  $("input,select", form).change(redrawChart);
  $(redrawChart);
}));

