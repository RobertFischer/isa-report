import {isNil,isNaN,range,toInteger} from "lodash";

const currentYear = new Date().getFullYear();

const toYear = (init, defaultValue) => {
  if(isNil(init) || isNaN(init)) {
    return defaultValue;
  } else {
    return toInteger(init);
  }
};

$(() => $("select[year-selector]").each(function() {
  const $this = $(this);
  const startYear = toYear($this.data("start"), 1990);
  const endYear = toYear($this.data("end"), 2070);
  console.info("Generating options for a year selector", startYear, endYear, $this);
  $this.append(`<option value="${startYear}" selected>${startYear}</option>`);
  range(startYear+1, endYear+1).forEach(year =>
    $this.append(`<option value="${year}">${year}</option>`)
  );
}));
