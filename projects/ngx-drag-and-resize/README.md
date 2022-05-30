# Drag and Resize

This project contains the drag-and-resize Directive Library for Angular.

## Installation

Run `npm install ngx-drag-and-resize`

## Usage

Use the Directive `draggableElement`
and/or the directive `resizableElement` in your HTML.

With the Events `ngxDragStart` `ngxDragging` `ngxDragEnd`
for `draggableElement` and
the Events `ngxResizeStart` `ngxResizing` `ngxResizeEnd`
for `resizableElement` you can respond to user actions.

To limit dragging and resizing to an element in your project,
pass a valid CSS Selector to the `ngxBoundsContainerSelector`
