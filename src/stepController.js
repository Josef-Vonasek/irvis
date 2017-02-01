(function () {

  var init = function (controls, steps, graphCtrl) {
    var stepsTotal = steps.length;
    var current    = null;
    var prevBtn    = controls.find("#prev-step-btn");
    var nextBtn    = controls.find("#next-step-btn");
    var stepSelect = controls.find("#step-select");
    var stepName   = controls.find("#step-name");
    graphCtrl.setStep(0);

    var initSelect = function () {
      console.log(stepSelect);
      console.log(steps);
      steps.forEach(function (s, index) {
        var el = $('<li class="mdl-menu__item"></li>').val(index).html(s.name);
        stepSelect.append(el);
      });

      stepSelect.find('li').click(function () {
        console.log(this.value);
        setStep(parseInt(this.value, 10));
      });
    };

    var setStep = function (s) {
      current = s;
      graphCtrl.setStep(s);
      var label = (s + 1) + " / " + stepsTotal;
      controls.find("#step-display").text(label);

      if (current == 0)
        prevBtn.prop("disabled", true);
      else
        prevBtn.prop("disabled", false);

      if (current == stepsTotal - 1)
        nextBtn.prop("disabled", true);
      else
        nextBtn.prop("disabled", false);

      stepName.text(steps[current].name);
    }

    prevBtn.click(function () { setStep(current - 1); });
    nextBtn.click(function () { setStep(current + 1); });
    window.onkeydown = function (e) {
      if (e.keyCode == 37 && current > 0) setStep(current - 1);
      if (e.keyCode == 39 && current < stepsTotal - 1) setStep(current + 1);
    };
    initSelect();

    setStep(0);

  }

  if (!window.IRVis) window.IRVis = {};
  window.IRVis.stepController = init;
})();
