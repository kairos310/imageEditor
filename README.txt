Added functions
- vectorAddVector()
    - adds arrays together, each index adding to the other array's corresponding selectedIndex
- vectorPow()
    - squares each value in an array
- numMultVector()
    - multiplies one number by all numbers in an array
- dist()
    - distance formula, if more than radius = 0, don't want negative values
-calcDistribution...()
    - distribution formulas for all the types of brushes
- clone()
    - copies array



Encountered Bugs and their fixes

Initially was still a square
- had to use the distance formula from the center point, tried using pyramid but looked really ugly

Had black edge
- was averaging using (0,0,0,0) transparent black, messed up the distribution formula

Still had dark edge
- squared the value before doing multiplication then square root to fix the calibration error



Filter mouse down
- Added mousedown in the trackDrag cause I didn't know how to establish the origin point of the bounding box in drag function that's being continuously called.

Filter had black edges
- Filter summing pixels from outside the bounding box, creating black lines, just set the for loop to start and end from beyond the radius of the blur, also skipped over the pixels that were close to the edge within blur radius, used the remainder

Blur kinda weak
- Changed the blur radius by upscaling the matrix, found gaussian distribution for a 7x7, changed matrix radius, should be able to swap out anytime.

Blur also black when transparent
- did the same thing and set transparent to 255 white

Blur also had dark edges
- Squared before arithmetic, root after for more accurate colors.

Had to make a copy of the image as the edge filter wouldn't work
- created grid of pixels alternating black and white, didn't work because I was modifying the image as I calculated the new values, made a new copy, initially didn't work because copy = data would just reference data, made a clone function to copy all values over.


Biggest Challenge
 - using a linear row of pixels in two dimensional calculations, issues with calculating distance as well as defining the borders of the filter so there wouldn't be black edges.


Bugs that are still there
- Color doesn't change until you've painted twice



Mask
Notes:
- the biggest challenge with this step was to find a way to only call it once, I decided to just use the mousedown function instead of looking for a way to call it within mousemove, this way it calls at the beginning of the stroke and calculates the distribution and it repeats it with the other brush strokes
Implementation:
- All I did was create a for loop that simulated the data pixels, this loop is called at the beginning of a stroke, as it runs on the mousedown function. This allows it to only run once.
- The mask takes into account flow rate, distance and radius. It calculates the distribution for each pixel and is put into a 1 dimensional array, 4 x smaller than the pixel array as it doesn't account for rgb.
- To implement the mask we use the same i value for i, i + 1, i + 2 use the same for each color pixel.

Extra Credit
Blur Filter
- used a 7 x 7 matrix for a gaussian kernel, which was a list of weights, multiplied by the pixels that correspond to the distance from the center of the matrix, summed up and divided by the sum to normalize it to within the pixels values to get the average color for the current pixel
- done for all the pixels in the rectangle
- had to make a copy of the pixel array so that the filter would change the colors as it calculated the average

Drawing Routing
- Gaussian Brush
    - just a change of the distribution formula, found a bell curve where when radius = distance, distribution goes to 0, looks smaller than it is as the falloff is quite steep.
- Ripple Brush
    - same gaussian brush multiplied by a sin^2 wave


Citations
https://www.youtube.com/watch?v=LKnqECcg6Gw&vl=en
fixed black lines around blur

https://www.youtube.com/watch?v=nMUMZ5YRxHI
pixels array
