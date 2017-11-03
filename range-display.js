$(() => $('input[type=range][range-display]:not([range-display=""])').each(function() {
  const $this = $(this);
  const doUpdate = () => {
    const $display = $(document.getElementById($this.attr("range-display")));
    const val = $this.val();
    $display.text(val);

    const label = $(`datalist#${$this.attr("list")} option[value=${val}]`).attr("label");
    if(label) {
      $display.text(val + " (" + label + ")");
    }
  };
  doUpdate();
  $this.change(doUpdate);
  setInterval(doUpdate, 1000);
}));
