var async = require('async');

console.log("Initializing...")
var poem = {
	title: "Illusion and Reality",
	author: "kabir",
	lines: {
		"What is seen is not the Truth": [],
		"What is cannot be said": [],
		"Trust comes not without seeing": [],
		"Nor understanding without words": [],
		"The wise comprehends with knowledge": [],
		"To the ignorant it is but a wonder": [],
		"Some worship the formless God": [],
		"Some worship His various forms": [],
		"In what way He is beyond these attributes": [],
		"Only the Knower knows": [],
		"That music cannot be written": [],
		"How can then be the notes": [],
		"Says Kabir, awareness alone will overcome illusion": []
	}
}

render_poem(poem);

Webcam.set({
	width: 320,
	height: 240,
	image_format: 'jpeg',
	jpeg_quality: 90
});
Webcam.attach('#camera');
console.log("Webcam Initialized")

var visualize = mk_visualizer({
	count: 3,
	interval: 500,
});

var viz_poem = visualize(poem, '.poem-line');


function play_poem(poem) {
	var render, lines;
	render = mk_renderer({
		container: document.getElementById('frames'),
		interval: 1000,
	});
	lines = poem.lines;
	async.series(
		lines,
		function play(line, callback){
			var uris = lines[line];
			if (!uris){
				return callback();
			}
			render(uris, callback);
		}, function (err){

		})

}

// Render poem
function render_poem(poem) {
	console.log("Rendering " + poem.title)
	document.getElementById('title').innerHTML = poem.title;
	document.getElementById('author').innerHTML = poem.author;
	document.getElementById('text').innerHTML = Object.keys(poem.lines).map(render_line).join('\n');

	function render_line(line, i) {
		return '<li class="poem-line" id="line-' + i + '">' + line + '</li>';
	}
}

function mk_visualizer(ops) {
	console.log("Initializing vizualization for poem " + poem.title);
	var self = this,
		count, interval, _visualize;
	count = ops.count;
	interval = ops.interval;
	_visulizer = function(poem, line_selector) {
		Array.prototype.slice.call(document.querySelectorAll(line_selector)).forEach(function set_handler(line) {
			line.addEventListener('click', frame_handler);
		});

		function frame_handler(evnt) {
			console.log("Frame handler called")
			var line_img_uris = poem.lines[evnt.target.innerHTML];
			if (!line_img_uris.length) { // take snapshot and get image data
				snap_frames(line_img_uris, function(err, uris) {
					if (err) {
						return console.log(err)
					}
					console.log("Gathered images:" + JSON.stringify(uris));
				})
			}
		}
	}

	function snap_frames(uris, callback) {
		var nxt;
		console.log("Snapping frames");
		Webcam.snap(function(data_uri) {
			uris.push(data_uri);
		});
		if (uris.length < FRAME_COUNT) {
			nxt = snap_frames.bind(null, uris, callback);
			setTimeout(nxt, FRAME_INTERVAL);
		} else {
			callback(null, uris);
		}
	}

	return _visualizer;
}

function mk_renderer(ops) {
	var container, interval;
	container = ops.container;
	interval = ops.interval;
	return function _render(uris, callback) {
		console.log("Rendering images@ " + JSON.stringify(uris));
		async.series(
			uris,
			function set_img_render(uri, callback) {
				render_img(uri);
				setTimeout(callback, interval);
			},
			function(err) {
				clear();
				if (callback){
					callback();
				}
			})

		function render_img(uri) {
			console.log("Rendering img@" + uri);
			container.innerHTML = '<img src="' + uri + '"/>';
		}

		function clear() {
			container.innerHTML = '';
			return
		}
	}
}