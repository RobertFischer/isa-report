import _ from "lodash";

const calculateData = () => {
  const form = $("#value-hit-calculator");
  const annualContribution = 40000.0 * 0.062;
  const growthCoefficient = 1.0 + 0.12;
  const lossCoefficient = 1.0 - 0.55;
  const person1Hit = _.toInteger($("#person-1-hit-year", form).val());
  const person2Hit = _.toInteger($("#person-2-hit-year", form).val());
  let person1Account = 0;
  let person2Account = 0;
  let noHitAccount = 0;

  const data = new google.visualization.DataTable();
  data.addColumn('number', 'Year');
  data.addColumn('number', 'Alice Balance');
  data.addColumn('number', 'Bob Balance');
  data.addColumn('number', 'No Hit Balance');
  _.range(1, 40+1).forEach(year => {
    person1Account *= person1Hit == year ? lossCoefficient : growthCoefficient;
    person1Account += annualContribution;

    person2Account *= person2Hit == year ? lossCoefficient : growthCoefficient;
    person2Account += annualContribution;

    noHitAccount *= growthCoefficient;
    noHitAccount += annualContribution;

    const rowData = [year, person1Account, person2Account, noHitAccount];
    data.addRow(rowData);
  });

  const yearFormatter = new google.visualization.NumberFormat({ groupingSymbol:'', fractionDigits:0, prefix:'Year ' });
  yearFormatter.format(data,0);

  const dollarFormatter = new google.visualization.NumberFormat({ fractionDigits: 0, prefix:'$' });
  dollarFormatter.format(data,1);
  dollarFormatter.format(data,2);
  dollarFormatter.format(data,3);

  return data;
};

$(() => google.charts.setOnLoadCallback(() => {
  const chart = new google.visualization.LineChart(document.getElementById("value-hit-canvas"));
  const options = {
    title: 'Impact of Value Hit',
    legend: { position: 'bottom' },
    hAxis: { format:'####' },
    vAxis: { format:'$###,###,###' },
    animation: { startup: true, duration: 1000, easing: 'inAndOut', },
    width: "100%",
    height: "20vh",
    explorer: false,
  };

  const form = $("#value-hit-calculator");

  $("select[hit-year]", form).each(function() {
    const $this = $(this);
    [1,2,3,5,10,15,20,25,30,35,39].forEach(year => {
      $this.append($("<option>", {value:year,text:`Year ${year}`}));
    });
  });

  const person1 = $("select#person-1-hit-year option[value=10]",form).attr("selected", true);
  const person2 = $("select#person-2-hit-year option[value=35]",form).attr("selected", true);
  console.info("Hit years", person1, person2);

  const redrawChart = () => chart.draw(calculateData(), options);
  $("input,select", form).change(redrawChart);
  $(redrawChart);
}));

