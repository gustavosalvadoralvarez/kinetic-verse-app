(function main() {
	console.log("Initializing...")
		// Initialize Webcam.js
	Webcam.set({
		width: 320,
		height: 240,
		image_format: 'jpeg',
		jpeg_quality: 90
	});
	Webcam.attach('#camera');
	console.log("Webcam Initialized")
		// Define poem data structure
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
		var self = this, count, interval, _visualize;
		count = ops.count;
		interval = ops.interval; 
		_visulizer = function(poem, line_selector){
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
		var container, interval, _render;
		container = ops.container;
		interval = ops.interval;
		_render = function _render(line, mode) {
			console.log("Rendering line " + line);
			var self = this,
				uris, count, loop;
			uris = poem.lines[line];
			count = uris.length;
			if (!uris) {
				return console.log("Image URIs not found for " + line);
			}
			uris.forEach(function set_img_render(uri, i) {
				var render = render_img.bind(null, uri),
					nxt;
				setTimeout(render, i * interval);
				if (++i === count) {
					if (mode === 'loop' && loop = true) {
						nxt = _render.bind(null, line);
					} else {
						nxt = clear;
					}
					setTimeout(nxt, i * interval);
				}
			})
			self.stop = function() {
				loop = false;
				return self;
			}
			self.re_start = function() {
				return _render(line, 'loop');
			}
			self.new_line = function(nline) {
				line = nline;
				return self;
			}

			function render_img(uri) {
				console.log("Rendering img@" + uri);
				container.innerHTML = '<img src="' + uri + '"/>';
			}

			function clear() {
				container.innerHTML = '';
			}
			return self;
		}
		return _render;
	}

	render_poem(poem);

	// Init Picture taking/saving/viewing funcs

	var visualize = mk_visualizer({
		count: 3,
		interval: 500,
	});

	visualize(poem, '.poem-line');

	var render = mk_renderer({
		container: document.getElementById('frames'),
		interval: 1000,
	});
})();