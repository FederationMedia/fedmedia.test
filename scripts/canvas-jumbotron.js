/*!
* Tweenie - Copyright (c) 2012 Jacob Buck
* https://github.com/jacobbuck/tweenie.js
* Licensed under the terms of the MIT license.
*/
window.tweenie = function (win) {

	var request_frame = function () { // requestAnimationFrame polyfill - adapted from https://gist.github.com/1579671
		var lastTime = 0,
				vendors = ["r", "msR", "mozR", "webkitR", "oR"],
				i,
				val;
		for (; val = vendors[i] + "equestAnimationFrame", i < vendors.length; i++)
			if (val in win) return win[val];
		return function (callback, element) {
			var currTime = +new Date(),
					timeToCall = Math.max(0, 16 - (currTime - lastTime)),
					id = win.setTimeout(function () { callback(currTime + timeToCall); },
				  timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	} (),
		queue = [],
		render_queue = function (time) {
			for (var i = 0; i < queue.length; i++)
				queue[i](time);
			queue.length && request_frame(render_queue);
		},
		add_queue = function (fn) {
			queue.push(fn) === 1 && request_frame(render_queue);
		},
		rem_queue = function (fn) {
			for (var i = 0; i < queue.length; i++)
				fn === queue[i] && queue.splice(i, 1);
		},
		empty_queue = function () {
			queue = [];
		},
		tweenie = function (duration, fn, from, to, complete, easing) {
			var start,
				stop,
				easing = easing || function (t, b, c, d) { return c * Math.sin(t / d * (Math.PI / 2)) + b; }, // sine ease out
				run = function (time) {
					start = start || time;
					fn(stop || time > start + duration ? to : easing(time - start, 0, 1, duration) * (to - from) + from);
					if (stop || time > start + duration)
						rem_queue(run) || complete && complete();
				};
			add_queue(run);
			return {
				stop: function () { stop = 1; }
			};
		};

	tweenie.kill = empty_queue;

	return tweenie;

} (this);

(function (document, window, $) {

	var jumbotron = function () {
		var _parent,
		_canvas,
		_stage,
		_slides = [],
		_current_int = -1,
		_current_href,
		_timeout,
		_pause = false,
		animateto = function (number) {
			var back = _slides[number].back,
				front = _slides[number].front;
			_current_href = _slides[number].href;
			_canvas.css("cursor", _current_href ? "pointer" : "default");
			tweenie.kill();
			tweenie(
				1250,
				function (position) {
					_stage.globalAlpha = position;
					_stage.globalCompositeOperation = "source-over";
					_stage.drawImage(back, 2, 0);
					_stage.globalCompositeOperation = "destination-out";
					_stage.fillRect(0, 0, 2, 300);
				},
				0,
				1,
				function () {
					if (front) {
						tweenie(
							250,
							function (position) {
								_stage.globalAlpha = 1;
								_stage.globalCompositeOperation = "source-over";
								_stage.drawImage(front, position, 70);
							},
							-(front.naturalWidth || front.width),
							0
						);
					}
				}
			);
			$("ul.control li", _parent).removeClass("current")
			$("ul.control li[data-slide^='" + number + "']", _parent).addClass("current");

			$("ul.control li span", _parent).each(function () {
				$(this).css("background-color", $("ul.control li[data-slide^='" + number + "']", _parent).attr("data-colour"))
			});

		},
		settimer = function () {
			cleartimer();
			_timeout = setTimeout(function () {
				next();
			}, 6000);
		},
		cleartimer = function () {
			if (_timeout)
				clearTimeout(_timeout);
		},
		jump = function (new_int) {
			if (new_int != _current_int) {
				_current_int = new_int * 1;
				animateto(_current_int);
			}
			if (!_pause)
				settimer();
		},
		next = function () {
			jump(_current_int + 1 < _slides.length ? _current_int + 1 : 0);
		},
		prev = function () {
			jump(_current_int < 0 ? _slides.length - 1 : _current_int - 1);
		},
		pause = function () {
			_pause = true;
			cleartimer();
		},
		resume = function () {
			_pause = false;
			settimer();
		};
		return function (el) {
			_parent = $(el);
			_canvas = $("canvas", _parent);
			_stage = _canvas[0].getContext("2d");
			$("ul.slides li", _parent).each(function () {
				_slides.push({
					front: $("img.front", this)[0],
					back: $("img.back", this)[0],
					href: $("a", this).attr("href")
				});
			});
			_canvas
	 		.hover(pause, resume)
	 		.click(function () {
	 			if (_current_href) window.location = _current_href;
	 		});
			$("ul.control li", _parent).click(function () {
				jump($(this).attr("data-slide"));
			});
			jump(0);
			return {
				jump: jump,
				prev: prev,
				next: next,
				pause: pause,
				resume: resume
			};
		};
	} ();

	$(document).ready(function () {
		$("#jumbotron").imagesLoaded(function () {
			window.myjumbotron = jumbotron("#jumbotron");

		});
	});

} (document, window, jQuery));