(function (document, window, $) {

var $jumbotron = $("#jumbotron");

window.myjumbotron = $(".slides", $jumbotron).cycle({
	"fx" : "scrollHorz",
	"pager" : $(".pager", $jumbotron),
	"pause" : true
});

} (document, window, jQuery));