////////////////////////////////////////////////////////////////////////////////
// Project 1:  Airbrush                                                       //
// Your task is to complete the program as specified in the project           //
// description on Canvas (brush.pdf).                                         //
//                                                                            //
// This starter code was adapted from Chapter 19 of Eloquent JavaScript       //
// by Marijn Haverbeke.                                                       //
////////////////////////////////////////////////////////////////////////////////

// holds functions that initialize the various controls below the image
var controls = Object.create(null);
// associates the names of the tools with the function that should be called
// when they are selected and the canvas is clicked
var tools = Object.create(null);
var paintFlowRate = 0.5;  // stores the paint flow rate

// creates an element with the given name and attributes and appends all
// further arguments it gets as child nodes
function elt(name, attributes) {
  var node = document.createElement(name);
  if (attributes) {
    for (var attr in attributes)
      if (attributes.hasOwnProperty(attr))
        node.setAttribute(attr, attributes[attr]);
  }
  for (var i = 2; i < arguments.length; i++) {
    var child = arguments[i];
    if (typeof child == "string")
      child = document.createTextNode(child);
    node.appendChild(child);
  }
  return node;
}

// appends the paint interface to the DOM element it is given as an argument
function createPaint(parent) {
  var canvas = elt("canvas", {width: 640, height: 480});
  var cx = canvas.getContext("2d");
  var toolbar = elt("div", {class: "toolbar"});
  for (var name in controls)
    toolbar.appendChild(controls[name](cx));

  var panel = elt("div", {class: "picturepanel"}, canvas);
  parent.appendChild(elt("div", null, panel, toolbar));
}

// populates the tool field with <option> elements for all tools that have been
// defined, and a "mousedown" handler takes care of calling the function for
// the current tool
controls.tool = function(cx) {
  var select = elt("select");
  for (var name in tools)
    select.appendChild(elt("option", null, name));

  cx.canvas.addEventListener("mousedown", function(event) {
    if (event.which == 1) {
      tools[select.value](event, cx);
      event.preventDefault();
    }
  });

  return elt("span", null, "Tool: ", select);
};

// finds the canvas-relative coordinates
function relativePos(event, element) {
  var rect = element.getBoundingClientRect();
  return {x: Math.floor(event.clientX - rect.left),
          y: Math.floor(event.clientY - rect.top)};
}

// registers and unregisters events for drawing tools
function trackDrag(onMove, onEnd, onstart) {
  function end(event) {
    removeEventListener("mousedown", onstart);
    removeEventListener("mousemove", onMove);
    removeEventListener("mouseup", end);
    if (onEnd)
      onEnd(event);
  }
  addEventListener("mousedown", onstart);
  addEventListener("mousemove", onMove);
  addEventListener("mouseup", end);
}


// color picker -- updates fillStyle and strokeStyle with the selected color
controls.color = function(cx) {
  var input = elt("input", {type: "color"});
  input.addEventListener("change", function() {
    cx.fillStyle = input.value;
    cx.strokeStyle = input.value;
  });
  return elt("span", null, "Color: ", input);
};

// brush size selector -- updates lineWidth with the selected size
controls.brushSize = function(cx) {
  var select = elt("select");
  var sizes = [1, 2, 3, 5, 8, 12, 25, 35, 50, 75, 100];
  sizes.forEach(function(size) {
    select.appendChild(elt("option", {value: size},
                           size + " pixels"));
  });
  select.selectedIndex = 3;
  cx.lineWidth = 5;
  select.addEventListener("change", function() {
    cx.lineWidth = select.value;
  });
  return elt("span", null, "Brush size: ", select);
};


// paint flow rate selector
controls.paintFlow = function(cx) {
  var select = elt("select");
  var sizes = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  sizes.forEach(function(size) {
    select.appendChild(elt("option", {value: size},
                           size + ""));
  });
  select.selectedIndex = 5;
  select.addEventListener("change", function() {
    paintFlowRate = select.value;
  });
  return elt("span", null, "Paint flow: ", select);
};

// save link -- generates a data url
controls.save = function(cx) {
  var link = elt("a", {href: "/"}, "Save");
  function update() {
    try {
      link.href = cx.canvas.toDataURL();
    } catch (e) {
      if (e instanceof SecurityError)
        link.href = "javascript:alert(" +
          JSON.stringify("Can't save: " + e.toString()) + ")";
      else
        throw e;
    }
  }
  link.addEventListener("mouseover", update);
  link.addEventListener("focus", update);
  return link;
};

// tries to load an image file from a URL
function loadImageURL(cx, url) {
  var image = document.createElement("img");
  image.addEventListener("load", function() {
    var color = cx.fillStyle, size = cx.lineWidth;
    cx.canvas.width = image.width;
    cx.canvas.height = image.height;
    cx.drawImage(image, 0, 0);
    cx.fillStyle = color;
    cx.strokeStyle = color;
    cx.lineWidth = size;
  });
  image.src = url;
}

// file chooser to load a local file
controls.openFile = function(cx) {
  var input = elt("input", {type: "file"});
  input.addEventListener("change", function() {
    if (input.files.length == 0) return;
    var reader = new FileReader();
    reader.addEventListener("load", function() {
      loadImageURL(cx, reader.result);
    });
    reader.readAsDataURL(input.files[0]);
  });
  return elt("div", null, "Open file: ", input);
};

// text field form for loading a file from a URL
controls.openURL = function(cx) {
  var input = elt("input", {type: "text"});
  var form = elt("form", null,
                 "Open URL: ", input,
                 elt("button", {type: "submit"}, "load"));
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    loadImageURL(cx, input.value);
  });
  return form;
};

tools.Constant = function(event, cx) {
// TODO
  var radius = cx.lineWidth/2;
  var r;
  var g;
  var b;
  //setup mask
  var m = [];
  trackDrag(function(event) {
      var currentPos = relativePos(event, cx.canvas);
      const imageData = cx.getImageData(currentPos.x - radius, currentPos.y - radius, 2*radius, 2*radius);
      const data = imageData.data;

      for (var i = 0; i < data.length; i += 4) {
        var canvascolor = [data[i], data[i + 1], data[i + 2]]; //canvas color into rgb vector
        if(data[i + 3] == 0){
          canvascolor = [255,255,255]; //set to white because it creates black borders when alpha is 0 and all others are 0, averaging the color to be black
        }
        var brushcolor = [r,g,b]; //brush color into rgb vector

        //adjusted for inherent squarerooting of the colors, creating dark blends
        //mask not adjusted for rgb, use i/4 to calibrate
        //pixelcolor = f * m * Cb + (1 - f * m) * Cc
        var pixelcolor = vectorAddVector(numMultVector(m[i/4], vectorPow(brushcolor,2)), numMultVector(1 - m[i/4], vectorPow(canvascolor,2)));
        //squared back
        pixelcolor = vectorPow(pixelcolor, 1/2);

        data[i]     = pixelcolor[0]; // red
        data[i + 1] = pixelcolor[1]; // green
        data[i + 2] = pixelcolor[2]; // blue
        data[i + 3] = 255; // alpha

      }
      cx.putImageData(imageData, currentPos.x - radius, currentPos.y - radius);
  },function(){},//mouseup
  function(event){ //onmousedown
    //rgb values from gui
    r = parseInt(cx.fillStyle.substring(1,3), 16);
    g = parseInt(cx.fillStyle.substring(3,5), 16);
    b = parseInt(cx.fillStyle.substring(5), 16);

    for (var i = 0; i < Math.pow(radius * 4, 2); i++) { //creates array 1/4 size of pixels
      var pixelPos = [i % (2 * radius), Math.floor(i / (2 * radius))]; //converts array into x and y
      var center = [radius, radius]; //establish center
      var distance = dist(center, pixelPos, radius); //distance from center to pixel excluding pixels outside radius
      var f = paintFlowRate;
      var mask = f * calcDistributionConstant(radius, distance); //change distribution for different brushes
      m[i] = mask; //add to mask
    }
  }
  );
};

tools.Linear = function(event, cx) {
// TODO
  var radius = cx.lineWidth/2;
  var r;
  var g;
  var b;
  //setup mask
  var m = [];
  trackDrag(function(event) {
      var currentPos = relativePos(event, cx.canvas);
      const imageData = cx.getImageData(currentPos.x - radius, currentPos.y - radius, 2*radius, 2*radius);
      const data = imageData.data;

      for (var i = 0; i < data.length; i += 4) {
        var canvascolor = [data[i], data[i + 1], data[i + 2]]; //canvas color into rgb vector
        if(data[i + 3] == 0){
          canvascolor = [255,255,255]; //set to white because it creates black borders when alpha is 0 and all others are 0, averaging the color to be black
        }
        var brushcolor = [r,g,b]; //brush color into rgb vector

        //adjusted for inherent squarerooting of the colors, creating dark blends
        //mask not adjusted for rgb, use i/4 to calibrate
        //pixelcolor = f * m * Cb + (1 - f * m) * Cc
        var pixelcolor = vectorAddVector(numMultVector(m[i/4], vectorPow(brushcolor,2)), numMultVector(1 - m[i/4], vectorPow(canvascolor,2)));
        //squared back
        pixelcolor = vectorPow(pixelcolor, 1/2);

        data[i]     = pixelcolor[0]; // red
        data[i + 1] = pixelcolor[1]; // green
        data[i + 2] = pixelcolor[2]; // blue
        data[i + 3] = 255; // alpha

      }
      cx.putImageData(imageData, currentPos.x - radius, currentPos.y - radius);
  },function(){},//mouseup
  function(event){ //onmousedown
    //rgb values from gui
    r = parseInt(cx.fillStyle.substring(1,3), 16);
    g = parseInt(cx.fillStyle.substring(3,5), 16);
    b = parseInt(cx.fillStyle.substring(5), 16);

    for (var i = 0; i < Math.pow(radius * 4, 2); i++) { //creates array 1/4 size of pixels
      var pixelPos = [i % (2 * radius), Math.floor(i / (2 * radius))]; //converts array into x and y
      var center = [radius, radius]; //establish center
      var distance = dist(center, pixelPos, radius); //distance from center to pixel excluding pixels outside radius
      var f = paintFlowRate;
      var mask = f * calcDistributionLinear(radius, distance); //change distribution for different brushes
      m[i] = mask; //add to mask
    }
  }
  );
};

tools.Quadratic = function(event, cx) {
// TODO
  var radius = cx.lineWidth/2;
  var r;
  var g;
  var b;
  //setup mask
  var m = [];
  trackDrag(function(event) {
      var currentPos = relativePos(event, cx.canvas);
      const imageData = cx.getImageData(currentPos.x - radius, currentPos.y - radius, 2*radius, 2*radius);
      const data = imageData.data;

      for (var i = 0; i < data.length; i += 4) {
        var canvascolor = [data[i], data[i + 1], data[i + 2]]; //canvas color into rgb vector
        if(data[i + 3] == 0){
          canvascolor = [255,255,255]; //set to white because it creates black borders when alpha is 0 and all others are 0, averaging the color to be black
        }
        var brushcolor = [r,g,b]; //brush color into rgb vector

        //adjusted for inherent squarerooting of the colors, creating dark blends
        //mask not adjusted for rgb, use i/4 to calibrate
        //pixelcolor = f * m * Cb + (1 - f * m) * Cc
        var pixelcolor = vectorAddVector(numMultVector(m[i/4], vectorPow(brushcolor,2)), numMultVector(1 - m[i/4], vectorPow(canvascolor,2)));
        //squared back
        pixelcolor = vectorPow(pixelcolor, 1/2);

        data[i]     = pixelcolor[0]; // red
        data[i + 1] = pixelcolor[1]; // green
        data[i + 2] = pixelcolor[2]; // blue
        data[i + 3] = 255; // alpha

      }
      cx.putImageData(imageData, currentPos.x - radius, currentPos.y - radius);
  },function(){},//mouseup
  function(event){ //onmousedown
    //rgb values from gui
    r = parseInt(cx.fillStyle.substring(1,3), 16);
    g = parseInt(cx.fillStyle.substring(3,5), 16);
    b = parseInt(cx.fillStyle.substring(5), 16);

    for (var i = 0; i < Math.pow(radius * 4, 2); i++) { //creates array 1/4 size of pixels
      var pixelPos = [i % (2 * radius), Math.floor(i / (2 * radius))]; //converts array into x and y
      var center = [radius, radius]; //establish center
      var distance = dist(center, pixelPos, radius); //distance from center to pixel excluding pixels outside radius
      var f = paintFlowRate;
      var mask = f * calcDistributionQuadratic(radius, distance); //change distribution for different brushes
      m[i] = mask; //add to mask
    }
  }
  );
};

tools.Gaussian = function (event, cx){
  var radius = cx.lineWidth/2;
  var r;
  var g;
  var b;
  //setup mask
  var m = [];
  trackDrag(function(event) {
      var currentPos = relativePos(event, cx.canvas);
      const imageData = cx.getImageData(currentPos.x - radius, currentPos.y - radius, 2 * radius, 2 * radius);
      const data = imageData.data;

      for (var i = 0; i < data.length; i += 4) {
        var canvascolor = [data[i], data[i + 1], data[i + 2]]; //canvas color into rgb vector
        if(data[i + 3] == 0){
          canvascolor = [255,255,255]; //set to white because it creates black borders when alpha is 0 and all others are 0, averaging the color to be black
        }
        var brushcolor = [r,g,b]; //brush color into rgb vector

        //adjusted for inherent squarerooting of the colors, creating dark blends
        //mask not adjusted for rgb, use i/4 to calibrate
        //pixelcolor = f * m * Cb + (1 - f * m) * Cc
        var pixelcolor = vectorAddVector(numMultVector(m[i/4], vectorPow(brushcolor,2)), numMultVector(1 - m[i/4], vectorPow(canvascolor,2)));
        //squared back
        pixelcolor = vectorPow(pixelcolor, 1/2);

        data[i]     = pixelcolor[0]; // red
        data[i + 1] = pixelcolor[1]; // green
        data[i + 2] = pixelcolor[2]; // blue
        data[i + 3] = 255; // alpha

      }
      cx.putImageData(imageData, currentPos.x - radius, currentPos.y - radius);
  },function(){},//mouseup
  function(event){ //onmousedown
    //rgb values from gui
    r = parseInt(cx.fillStyle.substring(1,3), 16);
    g = parseInt(cx.fillStyle.substring(3,5), 16);
    b = parseInt(cx.fillStyle.substring(5), 16);


    for (var i = 0; i < Math.pow(radius * 4, 2); i++) { //creates array 1/4 size of pixels
      var pixelPos = [i % (2 * radius), Math.floor(i / (2 * radius))]; //converts array into x and y
      var center = [radius, radius]; //establish center
      var distance = dist(center, pixelPos, radius); //distance from center to pixel excluding pixels outside radius
      var f = paintFlowRate;
      var mask = f * calcDistributionGaussian(radius, distance); //change distribution for different brushes
      m[i] = mask; //add to mask
    }
  }
  );
}

tools.Ripple = function (event, cx){
  var radius = cx.lineWidth/2;
  var r;
  var g;
  var b;
  //setup mask
  var m = [];
  trackDrag(function(event) {
      var currentPos = relativePos(event, cx.canvas);
      const imageData = cx.getImageData(currentPos.x - radius, currentPos.y - radius, 2 * radius, 2 * radius);
      const data = imageData.data;

      for (var i = 0; i < data.length; i += 4) {
        var canvascolor = [data[i], data[i + 1], data[i + 2]]; //canvas color into rgb vector
        if(data[i + 3] == 0){
          canvascolor = [255,255,255]; //set to white because it creates black borders when alpha is 0 and all others are 0, averaging the color to be black
        }
        var brushcolor = [r,g,b]; //brush color into rgb vector

        //adjusted for inherent squarerooting of the colors, creating dark blends
        //mask not adjusted for rgb, use i/4 to calibrate
        //pixelcolor = f * m * Cb + (1 - f * m) * Cc
        var pixelcolor = vectorAddVector(numMultVector(m[i/4], vectorPow(brushcolor,2)), numMultVector(1 - m[i/4], vectorPow(canvascolor,2)));
        //squared back
        pixelcolor = vectorPow(pixelcolor, 1/2);

        data[i]     = pixelcolor[0]; // red
        data[i + 1] = pixelcolor[1]; // green
        data[i + 2] = pixelcolor[2]; // blue
        data[i + 3] = 255; // alpha

      }
      cx.putImageData(imageData, currentPos.x - radius, currentPos.y - radius);
  },function(){},//mouseup
  function(event){ //onmousedown
    //rgb values from gui
    r = parseInt(cx.fillStyle.substring(1,3), 16);
    g = parseInt(cx.fillStyle.substring(3,5), 16);
    b = parseInt(cx.fillStyle.substring(5), 16);


    for (var i = 0; i < Math.pow(radius * 4, 2); i++) { //creates array 1/4 size of pixels
      var pixelPos = [i % (2 * radius), Math.floor(i / (2 * radius))]; //converts array into x and y
      var center = [radius, radius]; //establish center
      var distance = dist(center, pixelPos, radius); //distance from center to pixel excluding pixels outside radius
      var f = paintFlowRate;
      var mask = f * calcDistributionRipple(radius, distance); //change distribution for different brushes
      m[i] = mask; //add to mask
    }
  }
  );
}

tools.Blur = function(event, cx){
  var initPos;
  var finalPos;
  var width;
  var height;
  var matrix = [
    [ 0 , 0 , 1 , 2 , 1 , 0 , 0 ],
    [ 0 , 3 ,13 ,22 ,13 , 3 , 0 ],
    [ 1 ,13 ,59 ,97 ,59 ,13 , 1 ],
    [ 2 ,22 ,97 ,159,97 ,22 , 2 ],
    [ 1 ,13 ,59 ,97 ,59 ,13 , 1 ],
    [ 0 , 3 ,13 ,22 ,13 , 3 , 0 ],
    [ 0 , 0 , 1 , 2 , 1 , 0 , 0 ]
  ]
  var matrixRadius = Math.floor(matrix.length/2);
  var matrixSum = 1003;
  trackDrag(function(event) {
      finalPos = relativePos(event, cx.canvas);
  },
    function(event) { //on mouse leave
      width = finalPos.x - initPos.x;
      height = finalPos.y - initPos.y;
      const imageData = cx.getImageData(initPos.x, initPos.y, width, height);
      let data = imageData.data;
      let copy = clone(data);
      //only loop over parts where the matrix doesn't go out of the data[] slice of the image, s it creates a black border when finding average
      for (var i = width * 4 * matrixRadius; i < data.length - width * 4 * matrixRadius; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;
        if((i/4) % width > matrixRadius * 4 && (i/4) % width < width - (matrixRadius * 4)){
          for(var row = -matrixRadius; row <= matrixRadius; row++){
            for(var col = -matrixRadius; col <= matrixRadius; col++){
              var rowStep = width * 4;
              var colStep = 4;

              //get weight
              let weight = matrix[matrixRadius + col][matrixRadius + row] / matrixSum;
              //convert to x,y coordinates for pixel
              let pos = colStep * col + rowStep * row + i;

              if(copy[pos + 3] < 1){
                copy[pos] = 255;
                copy[pos + 1] = 255;
                copy[pos + 2] = 255;
              }
              r += Math.pow(copy[pos], 2) * weight;
              g += Math.pow(copy[pos + 1], 2) * weight;
              b += Math.pow(copy[pos + 2], 2) * weight;
            }
          }
          data[i]     = Math.pow(r, 1/2); // red
          data[i + 1] = Math.pow(g, 1/2); // green
          data[i + 2] = Math.pow(b, 1/2); // blue
          data[i + 3] = 255; // alpha
        }

      }
      cx.putImageData(imageData, initPos.x, initPos.y);
    },
    function(event) { // mousedown
      initPos = relativePos(event, cx.canvas);
    }
  );
}

tools.Edge = function(event, cx){
  var initPos;
  var finalPos;
  var width;
  var height;
  var matrix = [
    [-1 ,-1 ,-1 ],
    [-1 , 8 ,-1 ],
    [-1 ,-1 ,-1 ]
  ]
  var matrixRadius = Math.floor(matrix.length/2);
  trackDrag(function(event) {
      finalPos = relativePos(event, cx.canvas);
  },
    function(event) { //on mouse leave
      width = finalPos.x - initPos.x;
      height = finalPos.y - initPos.y;
      const imageData = cx.getImageData(initPos.x, initPos.y, width, height);
      let data = imageData.data;
      const copy = clone(data);
      //only loop over parts where the matrix doesn't go out of the data[] slice of the image, s it creates a black border when finding average
      for (var i = width * 4 * matrixRadius; i < data.length - width * 4 * matrixRadius; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;
        if((i/4) % width > matrixRadius * 4 && (i/4) % width < width - (matrixRadius * 4)){
          for(var row = -matrixRadius; row <= matrixRadius; row++){
            for(var col = -matrixRadius; col <= matrixRadius; col++){
              var rowStep = width * 4;
              var colStep = 4;

              //get weight
              let weight = matrix[matrixRadius + col][matrixRadius + row];
              //convert to x,y coordinates for pixel
              let pos = colStep * col + rowStep * row + i;

              if(copy[pos + 3] < 1){
                copy[pos] = 255;
                copy[pos + 1] = 255;
                copy[pos + 2] = 255;
              }
              r += Math.pow(copy[pos], 2) * weight;
              g += Math.pow(copy[pos + 1], 2) * weight;
              b += Math.pow(copy[pos + 2], 2) * weight;
            }
          }
          data[i]     = Math.pow(r, 1/2); // red
          data[i + 1] = Math.pow(g, 1/2); // green
          data[i + 2] = Math.pow(b, 1/2); // blue
          data[i + 3] = 255; // alpha
        }

      }
      cx.putImageData(imageData, initPos.x, initPos.y);
    },
    function(event) { // mousedown
      initPos = relativePos(event, cx.canvas);
    }
  );
}
tools.Sharpen = function(event, cx){
  var initPos;
  var finalPos;
  var width;
  var height;
  var matrix = [
    [ 0 ,-1 , 0 ],
    [-1 , 5 ,-1 ],
    [ 0 ,-1 , 0 ]
  ]
  var matrixRadius = Math.floor(matrix.length/2);
  trackDrag(function(event) {
      finalPos = relativePos(event, cx.canvas);
  },
    function(event) { //on mouse leave
      width = finalPos.x - initPos.x;
      height = finalPos.y - initPos.y;
      const imageData = cx.getImageData(initPos.x, initPos.y, width, height);
      let data = imageData.data;
      const copy = clone(data);
      //only loop over parts where the matrix doesn't go out of the data[] slice of the image, s it creates a black border when finding average
      for (var i = width * 4 * matrixRadius; i < data.length - width * 4 * matrixRadius; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;
        if((i/4) % width > matrixRadius * 4 && (i/4) % width < width - (matrixRadius * 4)){
          for(var row = -matrixRadius; row <= matrixRadius; row++){
            for(var col = -matrixRadius; col <= matrixRadius; col++){
              var rowStep = width * 4;
              var colStep = 4;

              //get weight
              let weight = matrix[matrixRadius + col][matrixRadius + row];
              //convert to x,y coordinates for pixel
              let pos = colStep * col + rowStep * row + i;

              if(copy[pos + 3] < 1){
                copy[pos] = 255;
                copy[pos + 1] = 255;
                copy[pos + 2] = 255;
              }
              r += Math.pow(copy[pos], 2) * weight;
              g += Math.pow(copy[pos + 1], 2) * weight;
              b += Math.pow(copy[pos + 2], 2) * weight;
            }
          }
          data[i]     = Math.pow(r, 1/2); // red
          data[i + 1] = Math.pow(g, 1/2); // green
          data[i + 2] = Math.pow(b, 1/2); // blue
          data[i + 3] = 255; // alpha
        }

      }
      cx.putImageData(imageData, initPos.x, initPos.y);
    },
    function(event) { // mousedown
      initPos = relativePos(event, cx.canvas);
    }
  );
}

tools.Sobel = function(event, cx){
  var initPos;
  var finalPos;
  var width;
  var height;
  var matrixX = [
    [ 1 , 0 ,-1 ],
    [ 2 , 0 ,-2 ],
    [ 1 , 0 ,-1 ]
  ]

  var matrixY = [
    [ 1 , 2 , 1 ],
    [ 0 , 0 , 0 ],
    [-1 ,-2 ,-1 ]
  ]
  var matrixRadius = Math.floor(matrixX.length/2);
  trackDrag(function(event) {
      finalPos = relativePos(event, cx.canvas);
  },
    function(event) { //on mouse leave
      width = finalPos.x - initPos.x;
      height = finalPos.y - initPos.y;
      const imageData = cx.getImageData(initPos.x, initPos.y, width, height);
      let data = imageData.data;
      const copy = clone(data);
      //only loop over parts where the matrix doesn't go out of the data[] slice of the image, s it creates a black border when finding average
      for (var i = width * 4 * matrixRadius; i < data.length - width * 4 * matrixRadius; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

				var rx = 0;
				var gx = 0;
				var bx = 0;
				var ry = 0;
				var gy = 0;
				var by = 0;

        if((i/4) % width > matrixRadius * 4 && (i/4) % width < width - (matrixRadius * 4)){
          for(var row = -matrixRadius; row <= matrixRadius; row++){
            for(var col = -matrixRadius; col <= matrixRadius; col++){
              var rowStep = width * 4;
              var colStep = 4;

              //get weight

              let weightX = matrixX[matrixRadius + col][matrixRadius + row];
							let weightY = matrixY[matrixRadius + col][matrixRadius + row];
							//let weight = matrixX[matrixRadius + col][matrixRadius + row];
              //convert to x,y coordinates for pixel
              let pos = colStep * col + rowStep * row + i;

              if(copy[pos + 3] < 1){
                copy[pos] = 255;
                copy[pos + 1] = 255;
                copy[pos + 2] = 255;
              }
              rx += Math.pow(copy[pos], 2) * weightX;
              gx += Math.pow(copy[pos + 1], 2) * weightX;
              bx += Math.pow(copy[pos + 2], 2) * weightX;

              ry += Math.pow(copy[pos], 2) * weightY;
              gy += Math.pow(copy[pos + 1], 2) * weightY;
              by += Math.pow(copy[pos + 2], 2) * weightY;

            }
          }
					r = Math.sqrt(rx*rx + ry*ry);
					g = Math.sqrt(gx*gx + gy*gy);
					b = Math.sqrt(bx*bx + by*by);

          data[i]     = Math.pow(r, 1/2); // red
          data[i + 1] = Math.pow(g, 1/2); // green
          data[i + 2] = Math.pow(b, 1/2); // blue
          data[i + 3] = 255; // alpha
        }

      }
      cx.putImageData(imageData, initPos.x, initPos.y);
    },
    function(event) { // mousedown
      initPos = relativePos(event, cx.canvas);
    }
  );
}
tools.SobelDir = function(event, cx){
  var initPos;
  var finalPos;
  var width;
  var height;
  var matrixX = [
    [ 1 , 0 ,-1 ],
    [ 2 , 0 ,-2 ],
    [ 1 , 0 ,-1 ]
  ]

  var matrixY = [
    [ 1 , 2 , 1 ],
    [ 0 , 0 , 0 ],
    [-1 ,-2 ,-1 ]
  ]
  var matrixRadius = Math.floor(matrixX.length/2);
  trackDrag(function(event) {
      finalPos = relativePos(event, cx.canvas);
  },
    function(event) { //on mouse leave
      width = finalPos.x - initPos.x;
      height = finalPos.y - initPos.y;
      const imageData = cx.getImageData(initPos.x, initPos.y, width, height);
      let data = imageData.data;
      const copy = clone(data);
      //only loop over parts where the matrix doesn't go out of the data[] slice of the image, s it creates a black border when finding average
      for (var i = width * 4 * matrixRadius; i < data.length - width * 4 * matrixRadius; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

				var rx = 0;
				var gx = 0;
				var bx = 0;
				var ry = 0;
				var gy = 0;
				var by = 0;

        if((i/4) % width > matrixRadius * 4 && (i/4) % width < width - (matrixRadius * 4)){
          for(var row = -matrixRadius; row <= matrixRadius; row++){
            for(var col = -matrixRadius; col <= matrixRadius; col++){
              var rowStep = width * 4;
              var colStep = 4;

              //get weight

              let weightX = matrixX[matrixRadius + col][matrixRadius + row];
							let weightY = matrixY[matrixRadius + col][matrixRadius + row];
							//let weight = matrixX[matrixRadius + col][matrixRadius + row];
              //convert to x,y coordinates for pixel
              let pos = colStep * col + rowStep * row + i;

              if(copy[pos + 3] < 1){
                copy[pos] = 255;
                copy[pos + 1] = 255;
                copy[pos + 2] = 255;
              }
              rx += Math.pow(copy[pos], 2) * weightX;
              gx += Math.pow(copy[pos + 1], 2) * weightX;
              bx += Math.pow(copy[pos + 2], 2) * weightX;

              ry += Math.pow(copy[pos], 2) * weightY;
              gy += Math.pow(copy[pos + 1], 2) * weightY;
              by += Math.pow(copy[pos + 2], 2) * weightY;

            }
          }
					let gradangle = Math.atan(rx, ry)
					let dircolor = colorFromAngle(gradangle)

					r = dircolor[0];
					g = dircolor[1];
					b = dircolor[2];

          data[i]     = Math.pow(r, 1/2); // red
          data[i + 1] = Math.pow(g, 1/2); // green
          data[i + 2] = Math.pow(b, 1/2); // blue
          data[i + 3] = 255; // alpha
        }

      }
      cx.putImageData(imageData, initPos.x, initPos.y);
    },
    function(event) { // mousedown
      initPos = relativePos(event, cx.canvas);
    }
  );
}

tools.Gradient = function(event, cx){
  var initPos;
  var finalPos;
  var width;
  var height;
  var matrixX = [
    [ 1 , 0 ,-1 ],
    [ 1 , 0 ,-1 ],
    [ 1 , 0 ,-1 ]
  ]

  var matrixY = [
    [ 1 , 1 , 1 ],
    [ 0 , 0 , 0 ],
    [-1 ,-1 ,-1 ]
  ]
  var matrixRadius = Math.floor(matrixX.length/2);
  trackDrag(function(event) {
      finalPos = relativePos(event, cx.canvas);
  },
    function(event) { //on mouse leave
      width = finalPos.x - initPos.x;
      height = finalPos.y - initPos.y;
      const imageData = cx.getImageData(initPos.x, initPos.y, width, height);
      let data = imageData.data;
      const copy = clone(data);
      //only loop over parts where the matrix doesn't go out of the data[] slice of the image, s it creates a black border when finding average
      for (var i = width * 4 * matrixRadius; i < data.length - width * 4 * matrixRadius; i += 4) {
        var r = 0;
        var g = 0;
        var b = 0;

				var rx = 127;
				var gx = 127;
				var bx = 127;
				var ry = 127;
				var gy = 127;
				var by = 127;

        if((i/4) % width > matrixRadius * 4 && (i/4) % width < width - (matrixRadius * 4)){
          for(var row = -matrixRadius; row <= matrixRadius; row++){
            for(var col = -matrixRadius; col <= matrixRadius; col++){
              var rowStep = width * 4;
              var colStep = 4;

              //get weight

              let weightX = matrixX[matrixRadius + col][matrixRadius + row];
							let weightY = matrixY[matrixRadius + col][matrixRadius + row];
							//let weight = matrixX[matrixRadius + col][matrixRadius + row];
              //convert to x,y coordinates for pixel
              let pos = colStep * col + rowStep * row + i;

							//handle transparency
              if(copy[pos + 3] < 1){
                copy[pos] = 255;
                copy[pos + 1] = 255;
                copy[pos + 2] = 255;
              }

              rx += copy[pos] * weightX;
              gx += copy[pos] * weightX;
              bx += copy[pos] * weightX;

              ry += copy[pos] * weightY;
              gy += copy[pos] * weightY;
              by += copy[pos] * weightY;

            }
          }
					r = Math.sqrt(rx*rx + ry*ry);
					g = Math.sqrt(gx*gx + gy*gy);
					b = Math.sqrt(bx*bx + by*by);

          data[i]     = r; // red
          data[i + 1] = g; // green
          data[i + 2] = b; // blue
          data[i + 3] = 255; // alpha
        }

      }
      cx.putImageData(imageData, initPos.x, initPos.y);
    },
    function(event) { // mousedown
      initPos = relativePos(event, cx.canvas);
    }
  );
}

function colorFromAngle(a){
	return [Math.sin(a)*255, Math.sin(a)*255,255]
}

function vectorAddVector(a,b){
  //assuming same size vector
  var c = [];
  for(let i = 0; i < a.length; i++){
    c[i] = a[i] + b[i];
  }
  return c;
}

function numMultVector(a,b){
  var c = [];
  for(let i = 0; i < b.length; i++){
    c[i] = a * b[i];
  }
  return c;
}

function dist(a,b, max){
  var x = 0;
  var y = 1;
  var c = Math.sqrt(Math.pow((b[x] - a[x]), 2) + Math.pow((b[y] - a[y]), 2))
  //corners of the box turning white i think maing m negative
  if(c > max){
    c = max;
  }
  return c;
}

//fixinig dark corners
function vectorPow(v, pow){
  let c = [];
  for(let i = 0; i < v.length; i++){
    c[i] = Math.pow(v[i], pow);
  }
  return c
}

function calcDistributionConstant(radius, distance){
  if(distance >= radius){
    return 0;
  }
  return 1
}

function calcDistributionLinear(radius, distance){
  var y = -(distance / radius) + 1;
  return y;
}

function calcDistributionQuadratic(radius, distance){
  var y = 1 - Math.pow((distance/radius), 2)
  return y;
}

function calcDistributionGaussian(radius, distance){
  //-10 arbitrary number that didn't leave a square border surrounding the brush when values were close to 0 but not there
  var y = Math.pow(2.718, -10 * (Math.pow(distance/radius,2)))
  return y;
}

function calcDistributionRipple(radius, distance){
  var y = Math.pow(2.718, -10 * (Math.pow(distance/radius,2))) * Math.pow(Math.sin((distance/radius) * paintFlowRate * 10 * Math.PI + Math.PI / 2), 2)
  return y;
}

//clones array without reference
function clone(a){
  let res = [];
  for(let i = 0; i < a.length; i ++){
    res[i] = a[i];
  }
  return res;
}
