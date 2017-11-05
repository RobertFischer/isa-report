import _ from "lodash";

const calculateData = () => {
  const form = $("#behindhand-son-form");
  const startYear = 0;
  const retirementYear = startYear + 40;
  const sonStart = _.toInteger($("#son-delay", form).val());
  const sonContribution = _.toNumber($("#son-contribution", form).val());
  const growthRate = 1 + _.toNumber($("#behindhand-son-growth-rate", form).val())/100.0;
  let daughterBalance = _.toNumber($("#daughter-contribution", form).val());
  let sonBalance = 0;
  console.info("Calculating behindhand son", {sonStart,sonContribution,daughterBalance,growthRate});


  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Year');
  data.addColumn('number', "Daughter's Balance");
  data.addColumn('number', "Son's Balance");
  _.range(startYear, retirementYear).forEach(year => {
    daughterBalance *= growthRate;
    if(year < sonStart) {
      sonBalance = 0;
    } else {
      sonBalance *= growthRate;
      sonBalance += sonContribution;
    }

    const rowData = [year, daughterBalance, sonBalance];
    data.addRow(rowData);
  });

  const yearFormatter = new google.visualization.NumberFormat({ groupingSymbol:'', fractionDigits:0, prefix:'Year ' });
  yearFormatter.format(data,0);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 0, prefix:'$' });
  dollarFormatter.format(data,1);
  dollarFormatter.format(data,2);

  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  const chart = new google.visualization.LineChart(document.getElementById("behindhand-son-canvas"));
  const options = {
    title: 'Retirement Account Values',
    legend: { position: 'bottom' },
    hAxis: { format:'Year #' },
    vAxis: { format:'$###,###,###' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
    explorer: false,
  };

  const form = $("#behindhand-son-form");
  const redrawChart = () => chart.draw(calculateData(), options);
  $("input,select", form).change(redrawChart);
  $(redrawChart);
}));

