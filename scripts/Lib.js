var Lib = function () {
	return {
		ShowMessage: function (msg) {
			alert(msg);
		},
		OnRequestComplete: function () {
			$('.loading').removeClass('loading');
		},
		Init: function () {
			// Tooltip creating
			$('.tooltip').each(function () {
				var $tooltip = $(this);
				var desc = $tooltip.attr('data-text');
				if (desc == undefined || desc == '') return;

				// Create supporting HTML
				$tooltip.append($('<div></div>').addClass('tooltip-toggle').html('?'));
				$tooltip.append($('<div></div>').addClass('tooltip-popup').html(desc));
			});
		}
	}
} ();

$(function() {
	Lib.Init();
});

/*
Client-side validation/usability for calculator
*/
var CalculatorValidator = function (calculatorContainerID, borrowPercentage) {
    var that = this;
    this.CalculatorContainerID = calculatorContainerID;
    this.MonthlyIncomeID = this.CalculatorContainerID + ' .input-monthly-pay';
    this.DrpNumberOfRepaymentsID = this.CalculatorContainerID + ' .input-repayments';
    this.DrpPayFrequencyID = this.CalculatorContainerID + ' .input-pay-freq';
    this.DrpBorrowAmountID = this.CalculatorContainerID + ' .input-borrow-amt';
    this.MaxRepayments = 0;
    this.BorrowAmounts = [];
    this.BorrowPercentage = borrowPercentage;

    this.BindRepayments = function () {
        var $drpRepayments = $('#' + that.DrpNumberOfRepaymentsID);
        var $drpFreq = $('#' + that.DrpPayFrequencyID);

        // Get max repayments.
        var maxRepayments = 0;
        switch (parseInt($drpFreq.val())) {
            case 22: // Weekly
                maxRepayments = 4;
                break;
            case 23: // Fortnight
                maxRepayments = 2;
                break;
            case 24: // Monthly
                maxRepayments = 1;
                break;
        }

        // Unbind while we are mucking around with it
        $drpFreq.unbind('change.calcval');

        // Add items to drop down list
        $drpRepayments.empty();
        if (maxRepayments == 0) {
            $drpRepayments.attr('disabled', 'true');
        } else {
            $drpRepayments.removeAttr('disabled');
            maxRepayments = Math.min(maxRepayments, that.MaxRepayments);
            for (var i = 1; i <= maxRepayments; i++) {
                var $opt = $('<option></option>').val(i).html(i);
                $drpRepayments.append($opt);
            }

            // Set to the max repayments, probably the default choice and also shows UI feedback cos the number will change each time
            $drpRepayments.val(maxRepayments);
        }

        // Rebind
        $drpFreq.bind('change.calcval', function () {
            that.BindRepayments();
            that.BindBorrowAmounts(); // bind borrow amounts as tax pay now changes on frequency
        });
    }

    this.BindBorrowAmounts = function () {
        var $drpBorrowAmounts = $('#' + that.DrpBorrowAmountID);
        var $txtIncome = $('#' + that.MonthlyIncomeID);
        var $drpFreq = $('#' + that.DrpPayFrequencyID);
        $drpBorrowAmounts.empty();

        // Get the income they have entered
        var income = $txtIncome.val().replace('$', '').replace(',', '').replace(' ', '');
        income = parseFloat(income);

        // Disable if invalid
        if (isNaN(income) || income <= 0) {
            $drpBorrowAmounts.attr('disabled', 'true');
            return;
        }

        // convert income to monthly for calculations
        switch (parseInt($drpFreq.val())) {
            case 22: // Weekly
                income = income * 52 / 12;
                break;
            case 23: // Fortnight
                income = income * 26 / 12;
                break;
            case 24: // Monthly
                break;
        }

        console.log("Income is " + income);


        // Add the options back in according to what they have entered
        var maxAmount = income * that.BorrowPercentage / 100;
        var currentAmount = 0;
        $drpBorrowAmounts.removeAttr('disabled');
        $.map(that.BorrowAmounts, function (item) {
            var amt = parseFloat(item);
            if (amt <= maxAmount) {
                currentAmount = amt;
                var $opt = $('<option></option>').val(amt).html('$' + amt);
                $drpBorrowAmounts.append($opt);
            }
        });

        // Set to the last option
        $drpBorrowAmounts.val(currentAmount);
    }

    this.IsValid = function () {
        var income = parseInt($('#' + that.MonthlyIncomeID).val());
        if (isNaN(income) || income <= 0) return false;
        if ($('#' + that.CalculatorContainerID + ' .input-date').val() == '') return false;
        return true;
    }

    this.OnSubmitDetails = function () {
        // Validate
        if (!that.IsValid()) {
            console.log("Calculator is not valid");
            return false;
        }

        // Animate
        var $con = $("#" + that.CalculatorContainerID);
        $con.animate({ "width": 960 }, 350, function () {
            $con.addClass("active");
            myjumbotron.pause();
        });
        $con.find(".button-calculate").val("Recalculate Loan");
    }

    this.Init = function () {
        // Record all the payment amounts, because these are variably set
        $('#' + that.DrpNumberOfRepaymentsID + ' option').each(function (index, option) {
            var num = parseInt($(option).val());
            if (!isNaN(num)) {
                that.MaxRepayments = Math.max(that.MaxRepayments, num);
            }
        });

        // Record the borrow amounts because we'll clear/add them later as required
        $('#' + that.DrpBorrowAmountID + ' option').each(function (index, option) {
            var num = parseInt($(option).val());
            that.BorrowAmounts.push(num);
        });

        // Monthly income affects how much you can borrow
        $('#' + that.MonthlyIncomeID).bind('blur', function () {
            that.BindBorrowAmounts();
        });

        // Animate when button clicked
        $('#' + that.CalculatorContainerID + " .button-calculate").bind('click', that.OnSubmitDetails);

        // Initialize according to default values
        that.BindRepayments();
        that.BindBorrowAmounts();
    }

    return {
        Init: that.Init
    }
};


var Data = function() {
	return {
		CallJSON: function(query, params, callback) {
			var triggerName = new Date().getTime().toString();
			var url = "/AjaxHandler.ashx";
			url += url.indexOf('?') > -1 ? '&' : '?';

			// Add route
			url += 'query=' + query + '&';

			// Encode parameters
			var paramUrl = "";
			for (var param in params) {
				paramUrl = paramUrl + param + "=" + params[param] + "&";
			}
			url += paramUrl + '&';

			// Do this for JSONP to allow cross-site callbacks
			url += 'state=\"' + triggerName + '\"&callback=' + 'Data.JSONPCallback' + '&';

			// Kill caching
			url += new Date().getTime().toString();

			// Setup the callback handler
			if (callback != undefined) $("body").bind(triggerName, function(e, result) { callback(result); });

			// Dynamically inject script element, allowing cross-domain scripting
			var script = document.createElement('script');
			script.setAttribute('src', url);
			script.setAttribute('type', 'text/javascript');
			if (document.body) {
				document.body.appendChild(script);
			} else {
				document.documentElement.appendChild(script);
			}

		},

		JSONPCallback: function(result, trigger) {
			$("body").trigger(trigger, result);
			$("body").unbind(trigger);
		}
	}
}();