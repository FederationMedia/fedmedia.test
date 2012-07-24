(function (document, window, $) {


$("input.input-date").Zebra_DatePicker({
	"inside" : false,
	"offset" : [25, 125]
});

$("div.input-fakecheckbox").each(function () {
	var psuedo = $(this),
		checkbox = $("input:first", psuedo),
		update = function () {
			psuedo[(checkbox.prop("checked") ? "add" : "remove")+"Class"]("checked");
			psuedo[(checkbox.prop("disabled") ? "add" : "remove")+"Class"]("disabled");
		};
	// update now
	update();
	// update again on window load
	$(window).load(function () {
		update();
	});
	// update when checkbox updates
	checkbox.on("change", function () {
		update();
	});
	// update and toggle on click
	psuedo.on("click", function () {
		var checked = checkbox.prop("checked"),
			disabled = checkbox.prop("disabled");
		if (disabled)
			return;
		checkbox.prop("checked", ! checked);
		update();
	});
	checkbox.on("click", function (event) {
		event.stopPropagation();
	});
});





































	
} (document, window, jQuery));