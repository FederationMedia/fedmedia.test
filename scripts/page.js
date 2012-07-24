/* Start PAYTODAY
 */

(function (document, window, $) {

$("input.input-date").Zebra_DatePicker({
	inside : false,
	offset : [25, 125],
    readonly_element: false,
    view:"years",
    format:"d-m-Y"
});

// fake checkbox
function do_fakecheckbox (context) {
	$("div.input-fakecheckbox", context || document).each(function () {
		var wrap = $(this),
			checkbox = $("input:first", wrap),
		update = function () {
				wrap[(checkbox.prop("checked") ? "add" : "remove")+"Class"]("checked");
				wrap[(checkbox.prop("disabled") ? "add" : "remove")+"Class"]("disabled");
		};
		// return if already faked
		if (wrap.hasClass("faked"))
			return;
	// update now
	update();
	// update again on window load
		$(window).load(update);
	// update when checkbox updates
		checkbox.change(update);
	// update and toggle on click
		wrap.click(function () {
		if (checkbox.prop("disabled"))
			return;
		checkbox.prop("checked", ! checkbox.prop("checked"));
		update();
	});
	// clicking checkbox (or label) doesn't run above event
		checkbox.click(function (event) { event.stopPropagation(); });
		wrap.addClass("faked");
});
}

do_fakecheckbox();

window.do_fakecheckbox = do_fakecheckbox;

// fake upload field

function do_fakeupload (context) {
	$("div.input-fakeupload", context || document).each(function () {
	var wrap = $(this),
		real = $("input:first", wrap);
		if (wrap.hasClass("faked"))
			return;
	real.change(function () {
			$(".input-fakeupload-text:first", wrap).text(real.val().split("\\").pop());
	});
		wrap.addClass("faked");
	});
}

do_fakeupload();
	
window.do_fakeupload = do_fakeupload;

// bank number fields
$("div.field-banknumber input").each(function () {
	var previous_val = "";
	$(this)
		.on("keydown", function (event) {
			var input = $(this);
			// backwards on backspace
			if (event.keyCode == 8 && ! input.val() && input.prev("input").length)
				input.prev("input").focus();
		})
		.on("keyup", function (event) {
			var input = $(this),
				input_size = input.attr("size") * 1, 
				input_val = input.val().replace(/[^0-9]/g,""),
				substr_index = 0,
				temp_val = input_val.substr(substr_index, input_size);
			// do nothing if no change in value
			if (previous_val === input.val())
				return false;
			// populate current field (if needed)
			if (temp_val != input.val())
				input.val(temp_val);
			// store previous value
			previous_val = input_val.substr(substr_index, input_size);
			// next set
			substr_index += input_size;
			// populate next fields if value overflows
			while (input_val.length > substr_index && input.next("input").length) {
				input = input.next("input");
				input_size = input.attr("size") * 1;
				input.focus().val(input_val.substr(substr_index, input_size));
				// store previous value
				previous_val = input_val.substr(substr_index, input_size);
				// next set
				substr_index += input_size;
			}
			// focus on next field
			if (input_val.length >= substr_index)
				input.next("input").focus();
		});
});

// touch stuff
if (Modernizr.touch) {
	$("div.tooltip").on("touchstart", function () {
		$("div.tooltip").not(this).removeClass("active");
		$(this).toggleClass("active");
	});

}

// toggle loan calculator 

$("#toggleloancalc").click(function () {
	$("#loancalc").animate({ "width" : 960 }, 350, function () {
		$("#loancalc").addClass("active");
		if ("myjumbotron" in window)
			myjumbotron.pause();
	});
	$("#toggleloancalc").val("Recalculate Loan");
	return false;
});


// input placeholder 

if (! Modernizr.input.placeholder) {
	$("input[placeholder], textarea[placeholder]").each(function(){
		var field = $(this),
			placeholder = field.attr("placeholder");
		if (! field.val() || field.val() == placeholder)
			field.val(placeholder).addClass("placeholder");
		field
			.focus(function () {
				if (field.val() == placeholder)
					field.val("").removeClass("placeholder");
			})
			.blur(function(){
				if (! field.val() || field.val() == placeholder)
					field.val(placeholder).addClass("placeholder");
			});
	});
}

// blockquote "s

if (! Modernizr.generatedcontent) {
	$(".blockquote").prepend($("<span>", {"class":"before"}).html("&ldquo;")).append($("<span>", {"class":"after"}).html("&rdquo;"));

}

// accordion

$(".accordion .title").click(function () {
	var item = $(this).parent(),
		reveal = $(".reveal", item);
	if (!reveal.is(":animated")) {
		reveal.stop().show().height("auto");
		if (item.hasClass("active")) {
			reveal.animate({ height: 0, opacity: 0 }, 300, function () {
				reveal.height("auto").hide();
			});
		} else {
			var reveal_height = reveal.height();
			reveal.css({ height: 0, opacity: 0 }).animate({ height: reveal_height, opacity: 1 }, 300, function () {
				reveal.height("auto");
			});
		}
		item.toggleClass("active");
	}
	return false;
});


} (document, window, jQuery));