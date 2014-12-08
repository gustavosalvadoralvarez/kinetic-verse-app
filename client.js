var async = require('async');
// Node.js module for async programming makes
// everything later on a lot easier...

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

// Define poem data structure-- one data struct for
// whole program to keep it simple
// In production it would be set by an ajax call to
// a simple json webservice.

var poem = {
  title: "Illusion and Reality",
  author: "kabir",
  lines: {                                //line value array holds image uri's when created
    "What is seen is not the Truth": [], //empty value indicates line
    "What is cannot be said": [],       //is up for grabs
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

// Render poem text

function render_poem(poem) {
  console.log("Rendering " + poem.title)
  document.getElementById('title').innerHTML = poem.title;
  document.getElementById('author').innerHTML = poem.author;
  document.getElementById('lines').innerHTML = Object.keys(poem.lines).map(render_line).join('\n');

  function render_line(line, i) {
    return '<li class="poem-line" id="line-' + i + '">' + line + '</li>';
  }
}

function mk_visualizer(ops) { // returns a function that creates an event handler for all divs matching
  console.log("Initializing vizualization for poem " + poem.title); // @param line_selector
  var self = this, count, interval, visualizer; //and attaches a listener that checks if image uri's
  count = ops.count;                           // are contained in poem data struct. If they are not, it
  interval = ops.interval;                    // snaps @param ops.count images with a @param ops.interval
  visualizer = function(poem, line_selector){ // ms break in between;
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

  function snap_frames(uris, callback) { //helper that actually snaps images
    var nxt;
    console.log("Snapping frames");
    Webcam.snap(function(data_uri) {
      uris.push(data_uri);
    });
    if (uris.length < count) {
      nxt = snap_frames.bind(null, uris, callback);
      setTimeout(nxt, interval);
    } else {
      callback(null, uris);
    }
  }

  return visualizer;
}

//Render poem images, if they exist

function mk_renderer(ops) { // returns a function that renders all the uri's contained in a single line
  var container, interval, render; // of the poem data struct asynchroneously to @param ops.container, ops.interval
  container = ops.container; // ms break inbetween each frame. If image uri's are not found, it returns an error to
  interval = ops.interval;   // to @param callback
  return function render(line, callback) {
    console.log("Rendering line " + line);
    document.getElementById("current-line").innerHTML = line;
    var self = this,
        uris, count, loop;
    console.log(line);
    uris = poem.lines[line];
    if (!uris) {
      return callback("uris not found");
    }
    async.eachSeries(uris, function set_img_render(uri, callback) {
      render_img(uri);
      setTimeout(callback, interval);
    }, callback)

    function render_img(uri) {
      console.log("Rendering img@" + uri);
      container.innerHTML = '<img src="' + uri + '"/>';
    }
  }
}

render_poem(poem);

//Init all the func(s) (HA!)

var visualize = mk_visualizer({
  count: 3,
  interval: 1000,
});

visualize(poem, '.poem-line');

var render = mk_renderer({
  container: document.getElementById('output-frames'),
  interval: 1000,
});

//And set "play" listener-- this is responsible for calling
//the poem image rendering function for each line, untill it
//finds a line that doesn have any images, in which case an error is
//passed down through the func stack and logged by the last callback

document.getElementById('play').addEventListener('click', function (evnt){
  var lines = Object.keys(poem.lines);
  async.eachSeries(lines, render, function(err){ if (err) { console.log(err); }});
});

