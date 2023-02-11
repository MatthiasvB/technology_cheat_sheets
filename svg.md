# My `SVG` Summary

## The very basics
This is a simple sample `SVG` which we can extend: 
```svg
<svg version="1.1"
     width="300" height="200"
     xmlns="http://www.w3.org/2000/svg">

  <rect width="100%" height="100%" fill="red" />

  <circle cx="150" cy="100" r="80" fill="green" />

  <text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>

</svg>
```

### Basic shapes
Here are the basic shapes that can be used in an `SVG`:
- Rectangle  
`<rect x="60" y="10" rx="10" ry="10" width="30" height="30"/>`
  - `x`: X-position of the top-left corner
  - `y`: Y-position of the top-left corner
  - `width`: The width of the rectangle
  - `height`: The height of the rectangle
  - `rx`: The x-radius of the corner- (default: 0)
  - `ry`: The y-radius of the corners (default: 0)
- Circle  
`<circle cx="25" cy="75" r="20"/>`
  - `r`: The radius
  - `cx`: The x-position of the center of the circle
  - `cy`: The y-position of the center of the circle
- Ellipse  
`<ellipse cx="75" cy="75" rx="20" ry="5"/>`
  - `rx`: The x-radius
  - `ry`: The y-radius
  - `cx`: The x-position of the center of the circle
  - `cy`: The y-position of the center of the circle
- Line  
`<line x1="10" x2="50" y1="110" y2="150"/>`
  - `x1`: The x-position of point 1
  - `y1`: The y-position of point 1
  - `x2`: The x-position of point 2
  - `y2`: The y-position of point 2
- Polyline
`<polyline points="60, 110 65, 120 70, 115 75, 130 80, 125 85, 140 90, 135 95, 150 100, 145"/>`
  - `points`: A list of points. Each number must be separated by a space, comma, EOL, or a line feed character. Each point must contain two numbers: an x-coordinate and a y-coordinate. So, the list `(0,0)`, `(1,1)`, and `(2,2)` would be written as `0, 0 1, 1 2, 2`
- Polygon
`<polygon points="50, 160 55, 180 70, 180 60, 190 65, 205 50, 195 35, 205 40, 190 30, 180 45, 180"/>`  
This is similar to a Polyline, but the shape automatically closes, connecting the first and the last points
- Path  
`<path d="M20,230 Q40,205 50,230 T90,230"/>`  
This is the most general of all shapes and can be used to draw pretty much anything. It's also quite complex, though. It'll be described in more detail shortly

### Paths
It is not generally a good idea to generate paths using a text editor. However, it helps to trouble-shoot `SVG`s if one knows the mechanics.

Paths are drawn using a single parameter: `d`. It's basically a list of operations to be performed. Each command comes in an uppercase form, which takes absolute coordinates, and a lowercase form, wich move the cursor relative to it's last position. Here are the individual commands that can be used (only the uppercase versions are listed):
- Move  
`M x y`  
Moves the cursor without drawing a line, typically used at the start
- Line  
`L x y`
Draws a straight line to the given coordinates
- Shorthand horizontal line  
`H x`
- Shorthand vertical line  
`V y`
- Close path  
`Z`  
Closes the shape by connecting to the first drawn point
- Cubic Bézier Curve  
`C x1 y1, x2 x2, x y`  
  - `x1 y1`: First control point
  - `x2 y2`: Second control point
  - `x y`: Line end-point
- Shorthand for smooth cubic Bézier Curves  
`S x2 y2, x y`  
Assumes that the first control point is a reflection of the last control point of the previous command. If there is no previous control point, it's assumed to be identical to the cursor position
- Quadratic Bézier Curves  
`Q x1 y1, x y`  
These are simpler than cubic Bézier Curves and only require one control point
- Shorthand for smooth quadratic Bézier Curves  
`T x y`  
Same logic as for smooth cubic
- Arcs  
`A rx ry x-axis-rotation large-arc-flag sweep-flag x y`  
  - `rx`: Ellipse x-radius
  - `ry`: Ellipse y-radius
  - `x-axis-rotation`: Rotational angle (I think clockwise is positive)
  - `large-arc-flag`: Choose whether to travel more (1) or less (0) than 180° along the arc
  - `sweep-flag`: Given `large-arc-flag`, which ellipsis should be travelled along?: `<0|1>`
  - `x y` end point to travel to

Arcs are really quite complex, yet also powerful when a path should follow a circle or an ellipsis. If you need more details on them, google.

### Fill and stroke
Up until now, we have defined the outline of our shapes, but they are all pretty much invisible, since we have not specified how they should be displayed. There are several ways to specify these things, like attributes, inline-CSS, an embedded CSS section, or external CSS files. This means that you have a lot of freedom here. I'll list a few essentials attributes here:
- `stroke="<colorspec>"`  
Sets the color of the outline of the shape. You can use all the color formats you are used to from HTML
- `fill="<colorspec>"`  
Sets the fill color of the shape
- `stroke-width="<length>"`  
- `stroke-linecap="<butt|square|round>"`  
How line-endings should look
- `stroke-linejoin="<miter|round|bevel>"`  
Controls how line segments should be joined together. `miter` is analogous to `square` linecaps, `round` is analogous to `round`, and `bevel` is kinda like `butt`, but "makes it pretty"
- `stroke-dasharray="<filled>, <empty>, <filled>, <empty>, ..."`  
Specify a pattern that is used to draw dashed lines. First specify a length of the visible part of the pattern, then a length for the invisible, and so on, as many as you'd like (at least 2, probably). This pattern will be looped over to create the line. If you have high demands, also google `stroke-miterlimit` and `stroke-dashoffset`

### Using CSS
You can use inline CSS just the way you are used to from HTML (using a `style` tag) for many, but not all, attributes. You can also specify CSS in it's own section of the SVG. I'll just copy the example from the MDN:
```svg
<svg width="200" height="200">
  <defs>
    <style>
       #MyRect {
         stroke: black;
         fill: red;
       }
    </style>
  </defs>
  <rect x="10" height="180" y="10" width="180" id="MyRect"/>
</svg>
```
You can even use pseudo-classes like `:hover` here!

Just as well, you can specify an external style-sheet:
```svg
<?xml-stylesheet type="text/css" href="style.css"?>

<svg width="200" height="150">
  <rect height="10" width="10" id="MyRect"/>
</svg>
```

## Gradients
Other than just specifying color for fills and strokes, you can also specify gradients. There are two types of gradients available (according to MDN), the linear and the radial gradient.

Gradients are always defined in a separate `defs` sections to improve reusability.

### Linear Gradient
A linear gradient needs a direction, which is specified by a start and an end point (defaults to horizontal), and several color stops. Again, this is fairly self-explanatory, so I'll copy the code from MDN again:
```svg
<svg width="120" height="240" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
      <linearGradient id="Gradient1">
        <stop class="stop1" offset="0%"/>
        <stop class="stop2" offset="50%"/>
        <stop class="stop3" offset="100%"/>
      </linearGradient>
      <linearGradient id="Gradient2" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="red"/>
        <stop offset="50%" stop-color="black" stop-opacity="0"/>
        <stop offset="100%" stop-color="blue"/>
      </linearGradient>
      <style><
        #rect1 { fill: url(#Gradient1); }
        .stop1 { stop-color: red; }
        .stop2 { stop-color: black; stop-opacity: 0; }
        .stop3 { stop-color: blue; }
      ></style>
  </defs>

  <rect id="rect1" x="10" y="10" rx="15" ry="15" width="100" height="100"/>
  <rect x="10" y="120" rx="15" ry="15" width="100" height="100" fill="url(#Gradient2)"/>

</svg>
```

### Radial gradients
This is easy enough if you understood linear gradients. So more code from MDN:
```svg
<svg width="120" height="240" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <defs>
      <radialGradient id="RadialGradient1">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
      <radialGradient id="RadialGradient2" cx="0.25" cy="0.25" r="0.25">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
  </defs>

  <rect x="10" y="10" rx="15" ry="15" width="100" height="100" fill="url(#RadialGradient1)"/>
  <rect x="10" y="120" rx="15" ry="15" width="100" height="100" fill="url(#RadialGradient2)"/>

</svg>
```
Actually, this is the simple example. But radial gradients support a focal point, like 
```svg
<svg width="120" height="120">
  <defs>
      <radialGradient id="Gradient"
            cx="0.5" cy="0.5" r="0.5" fx="0.25" fy="0.25">
        <stop offset="0%" stop-color="red"/>
        <stop offset="100%" stop-color="blue"/>
      </radialGradient>
  </defs>

  <rect x="10" y="10" rx="15" ry="15" width="100" height="100"
        fill="url(#Gradient)" stroke="black" stroke-width="2"/>

  <circle cx="60" cy="60" r="50" fill="transparent" stroke="white" stroke-width="2"/>
  <circle cx="35" cy="35" r="2" fill="white" stroke="white"/>
  <circle cx="60" cy="60" r="2" fill="white" stroke="white"/>
  <text x="38" y="40" fill="white" font-family="sans-serif" font-size="10pt">(fx,fy)</text>
  <text x="63" y="63" fill="white" font-family="sans-serif" font-size="10pt">(cx,cy)</text>

</svg>
```

These are the essentials about gradients, but not everything. Read on [here](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Gradients).

## Patterns
They are powerful tools to describe repeating, well, _patterns_, but quite fucked up to use, so [read this](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Patterns).

## Text
You can add text to your `SVG`s using `<text x="10" y="10">Hello World!</text>` and then modify it to your liking with
- `font-family`
- `font-style`
- `font-weight`
- `font-variant`
- `font-stretch`
- `font-size`
- `font-size-adjust`
- `kerning`
- `letter-spacing`
- `word-spacing`
- `text-decoration`

You can nest `tspan` elements inside `text` or other `tspan`s to apply different styling.

You can also change the anchor point of text (but this isn't mentioned in the MDN tutorial) and apply even more modifications to text, like have it align along a path, but this is too complicated to cover here.

## Basic transformations
Transformations can be applied by specifying them in an element's `transform` attribute. They can be chained by separating them with whitespace. An example:
```svg
<svg width="40" height="50" style="background-color:#bff;">
    <rect x="0" y="0" width="10" height="10" transform="translate(30,40) rotate(45)" />
</svg>
```

Here's a list of possible transformations
- `transform(<x>, <y>)  `  
Move an element
- `rotate(<degrees>)`  
Rotate an element (direction??)
- `scale(<factor>)`  
Scale an element
- `skewX(<angle>)`  
`skewY(<angle>)`  
Skew an element. Not a very good explanation on MDN
- `matrix(a, b, c, d, e, f)`  
The arguments to this command specify a transformation matrix and a vector offset. Works this way:  
`xNew = a*xOld + c*yOld + e`  
`yNew = b*xOld + d*yOld + f`

It's not exactly a transformation (so I'm not sure why it's explained there in the MDN), but `SVG`s can actually be nested, which can be handy.

## Clipping
If you want only part of your shape to be visible, you can specify a `clip-path` that leads to a shape which determines which parts of your shape will actually be shown. If you don't want the clipping element itself to be visible, put it into a `defs` section, like here:
```svg
<svg>
  <defs>
    <clipPath id="cut-off-bottom">
      <rect x="0" y="0" width="200" height="100" />
    </clipPath>
  </defs>

  <circle cx="100" cy="100" r="100" clip-path="url(#cut-off-bottom)" />
</svg>
```

## Masking
Clipping is pretty absolute, stuff will either show or not show. A mask gives you more control, as its luminance value will translate to the underlying shape's opacity:
```svg
<svg width="200" height="200">
  <defs>
    <linearGradient id="Gradient">
      <stop offset="0" stop-color="black" />
      <stop offset="1" stop-color="white" />
    </linearGradient>
    <mask id="Mask">
      <rect x="0" y="0" width="200" height="200" fill="url(#Gradient)"  />
    </mask>
  </defs>

  <rect x="0" y="0" width="200" height="200" fill="green" />
  <rect x="0" y="0" width="200" height="200" fill="red" mask="url(#Mask)" />
</svg>
```
This will give a square with a left-to-right green-to-red gradient.

## Filter effects
Some things, e.g. drop shadows, are simply not possible to implement with reasonable effort using the tools that were shown so far. Filter effects are the way to go for elaborate stuff.

This is really advanced, you can do crazy stuff here. I'll not be able to cover this here. Check out this [crazy example](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Filter_effects).