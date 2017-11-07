import _ from "lodash";

$(() =>
  $("select[hit-year]").each(function() {
    const $this = $(this);
    [1,2,3,5,10,15,20,25,30,35,39].forEach(year => {
      $this.append($("<option>", {value:year,text:`Year ${year}`}));
    });
  })
);

