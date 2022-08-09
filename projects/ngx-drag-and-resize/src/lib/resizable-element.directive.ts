import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from "@angular/core";

@Directive({
  selector: '[resizableElement]',
})
export class ResizableElementDirective {
  @Input() handlerSize = 20;
  @Input() ngxBoundsContainerSelector: string | null = null;

  @Output() ngxResizeStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() ngxResizing: EventEmitter<void> = new EventEmitter<void>();
  @Output() ngxResizeEnd: EventEmitter<void> = new EventEmitter<void>();

  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private currentResizingHandler: any;

  constructor(private elRef: ElementRef<HTMLElement>, private renderer2: Renderer2) {
    if (this.elRef.nativeElement.parentElement) {
      let parentStyle = window.getComputedStyle(this.elRef.nativeElement.parentElement);
      if (
        (parentStyle.alignItems && parentStyle.alignItems !== 'normal') ||
        (parentStyle.justifyContent && parentStyle.justifyContent !== 'normal')
      ) {
        this.renderer2.setStyle(this.elRef.nativeElement.parentElement, 'alignItems', 'unset');
        this.renderer2.setStyle(this.elRef.nativeElement.parentElement, 'justifyContent', 'unset');
      }
    }

    if (
      elRef?.nativeElement?.style?.position !== 'absolute' &&
      elRef?.nativeElement?.style?.position !== 'relative' &&
      elRef?.nativeElement?.style?.position !== 'fixed'
    ) {
      console.warn(
        'Element set to position: relative to position resize Handlers. A resizable Element should be positioned absolute or relative'
      );
      this.renderer2.setStyle(this.elRef.nativeElement, 'position', 'relative');
    }

    const handlers: HTMLDivElement[] = [];

    const resizeHandleTypes = ['TopLeft', 'Top', 'TopRight', 'Right', 'BottomRight', 'Bottom', 'BottomLeft', 'Left'];
    for (let i = 0; i < 8; i++) {
      const handle = document.createElement('div') as HTMLDivElement;
      this.renderer2.setStyle(
        handle,
        'width',
        i === 1 || i === 5 ? `calc(100% - ${this.asPxString(this.handlerSize)})` : this.asPxString(this.handlerSize)
      );
      this.renderer2.setStyle(
        handle,
        'height',
        i === 3 || i === 7 ? `calc(100% - ${this.asPxString(this.handlerSize)})` : this.asPxString(this.handlerSize)
      );
      handle.id = `resizableElementResizeHandler${resizeHandleTypes[i]}`;
      handle.classList.add('resizableElementResizeHandler');
      handlers.push(handle);
    }

    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      this.renderer2.appendChild(elRef.nativeElement, handler);

      this.renderer2.setStyle(handler, 'z-index', 10);
      this.renderer2.setStyle(handler, 'position', 'absolute');
      switch (i) {
        case 0:
          this.renderer2.setStyle(handler, 'cursor', 'nw-resize');
          // this.renderer2.setStyle(handler, 'background-color', 'green');
          this.renderer2.setStyle(handler, 'left', this.asPxString(-this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'top', this.asPxString(-this.handlerSize / 2));
          break;
        case 1:
          this.renderer2.setStyle(handler, 'cursor', 'n-resize');
          // this.renderer2.setStyle(handler, 'background-color', 'lightgreen');
          this.renderer2.setStyle(handler, 'left', this.asPxString(this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'right', this.asPxString(this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'top', this.asPxString(-this.handlerSize / 2));
          break;
        case 2:
          this.renderer2.setStyle(handler, 'cursor', 'ne-resize');
          // this.renderer2.setStyle(handler, 'background-color', 'red');
          this.renderer2.setStyle(handler, 'right', this.asPxString(-this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'top', this.asPxString(-this.handlerSize / 2));
          break;
        case 3:
          this.renderer2.setStyle(handler, 'cursor', 'e-resize');
          // this.renderer2.setStyle(handler, 'background-color', 'pink');
          this.renderer2.setStyle(handler, 'top', this.asPxString(this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'bottom', this.asPxString(this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'right', this.asPxString(-this.handlerSize / 2));
          break;
        case 4:
          this.renderer2.setStyle(handler, 'cursor', 'se-resize');
          // this.renderer2.setStyle(handler, 'background-color', 'darkblue');
          this.renderer2.setStyle(handler, 'right', this.asPxString(-this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'bottom', this.asPxString(-this.handlerSize / 2));
          break;
        case 5:
          this.renderer2.setStyle(handler, 'cursor', 's-resize');
          // this.renderer2.setStyle(handler, 'background-color', 'black');
          this.renderer2.setStyle(handler, 'right', this.asPxString(this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'left', this.asPxString(this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'bottom', this.asPxString(-this.handlerSize / 2));
          break;
        case 6:
          this.renderer2.setStyle(handler, 'cursor', 'sw-resize');
          // this.renderer2.setStyle(handler, 'background-color', 'orange');
          this.renderer2.setStyle(handler, 'left', this.asPxString(-this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'bottom', this.asPxString(-this.handlerSize / 2));
          break;
        case 7:
          this.renderer2.setStyle(handler, 'cursor', 'w-resize');
          // this.renderer2.setStyle(handler, 'background-color', 'yellow');
          this.renderer2.setStyle(handler, 'top', this.asPxString(this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'bottom', this.asPxString(this.handlerSize / 2));
          this.renderer2.setStyle(handler, 'left', this.asPxString(-this.handlerSize / 2));

          break;
        default:
          break;
      }
      handler.addEventListener('mousedown', (ev: MouseEvent) => {
        this.currentResizingHandler = handler;
        this.ngxResizeStart.emit();
        ev.stopPropagation();
      });
    }
  }

  @HostListener('window:mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    if (this.currentResizingHandler && this.mousePosition) {
      this.unFocus();
      event.preventDefault();
      event.cancelBubble = true;
      const xDiff = event.clientX - this.mousePosition.x;
      const yDiff = event.clientY - this.mousePosition.y;
      let style = window.getComputedStyle(this.elRef.nativeElement);
      let matrix = new WebKitCSSMatrix(style.transform);
      let oldX = matrix.m41;
      let oldY = matrix.m42;
      let boundingElement;

      if (typeof this.ngxBoundsContainerSelector === 'string') {
        boundingElement = document.querySelector(this.ngxBoundsContainerSelector);
        if (!boundingElement) {
          console.warn(`Bounding Element not found with selector ${this.ngxBoundsContainerSelector} \n
          Check your input and DOM for the Element`);
        }
      }

      switch (this.currentResizingHandler.id) {
        case 'resizableElementResizeHandlerTopLeft':
          this.resizeLeft(boundingElement, oldX, oldY, xDiff);
          style = window.getComputedStyle(this.elRef.nativeElement);
          matrix = new WebKitCSSMatrix(style.transform);
          oldX = matrix.m41;
          oldY = matrix.m42;
          this.resizeTop(boundingElement, oldX, oldY, yDiff);
          break;
        case 'resizableElementResizeHandlerTop':
          this.resizeTop(boundingElement, oldX, oldY, yDiff);
          break;
        case 'resizableElementResizeHandlerTopRight':
          this.resizeRight(boundingElement, oldX, oldY, xDiff);
          this.resizeTop(boundingElement, oldX, oldY, yDiff);
          break;
        case 'resizableElementResizeHandlerRight':
          this.resizeRight(boundingElement, oldX, oldY, xDiff);
          break;
        case 'resizableElementResizeHandlerBottomRight':
          this.resizeRight(boundingElement, oldX, oldY, xDiff);
          this.resizeBottom(boundingElement, oldX, oldY, yDiff);
          break;
        case 'resizableElementResizeHandlerBottom':
          this.resizeBottom(boundingElement, oldX, oldY, yDiff);
          break;
        case 'resizableElementResizeHandlerBottomLeft':
          this.resizeLeft(boundingElement, oldX, oldY, xDiff);
          this.resizeBottom(boundingElement, oldX, oldY, yDiff);
          break;
        case 'resizableElementResizeHandlerLeft':
          this.resizeLeft(boundingElement, oldX, oldY, xDiff);
          break;
        default:
          break;
      }
      this.ngxResizing.emit();
    }
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }

  resizeLeft(boundingElement: Element | null | undefined, oldX: number, oldY: number, xDiff: number): void {
    if (
      !boundingElement ||
      this.currentResizingHandler?.getBoundingClientRect()?.x - xDiff > boundingElement.getBoundingClientRect().x
    ) {
      this.renderer2.setStyle(
        this.elRef.nativeElement,
        'width',
        this.asPxString(this.elRef.nativeElement.getBoundingClientRect().width - xDiff)
      );
      this.renderer2.setStyle(this.elRef.nativeElement, 'transform', this.asTransformString(oldX + xDiff, oldY));
    }
  }

  resizeTop(boundingElement: Element | null | undefined, oldX: number, oldY: number, yDiff: number): void {
    if (
      !boundingElement ||
      this.currentResizingHandler?.getBoundingClientRect()?.y - yDiff > boundingElement.getBoundingClientRect().y
    ) {
      this.renderer2.setStyle(
        this.elRef.nativeElement,
        'height',
        this.asPxString(this.elRef.nativeElement.getBoundingClientRect().height - yDiff)
      );
      this.renderer2.setStyle(this.elRef.nativeElement, 'transform', this.asTransformString(oldX, oldY + yDiff));
    }
  }

  resizeRight(boundingElement: Element | null | undefined, oldX: number, oldY: number, xDiff: number): void {
    if (
      !boundingElement ||
      this.currentResizingHandler?.getBoundingClientRect()?.x + xDiff <
        boundingElement.getBoundingClientRect().x + boundingElement.getBoundingClientRect().width
    ) {
      this.renderer2.setStyle(
        this.elRef.nativeElement,
        'width',
        this.asPxString(this.elRef.nativeElement.getBoundingClientRect().width + xDiff)
      );
    }
  }

  resizeBottom(boundingElement: Element | null | undefined, oldX: number, oldY: number, yDiff: number): void {
    if (
      !boundingElement ||
      this.currentResizingHandler?.getBoundingClientRect()?.y + yDiff <
        boundingElement.getBoundingClientRect().y + boundingElement.getBoundingClientRect().height
    ) {
      this.renderer2.setStyle(
        this.elRef.nativeElement,
        'height',
        this.asPxString(this.elRef.nativeElement.getBoundingClientRect().height + yDiff)
      );
    }
  }

  @HostListener('window:mouseup', ['$event']) onMouseUp(ev: MouseEvent) {
    this.currentResizingHandler = null;
    const ele: HTMLElement = this.elRef?.nativeElement;
    const eleRect = ele?.getBoundingClientRect();
    if (
      eleRect &&
      ev.clientX > eleRect.x &&
      ev.clientX < eleRect.x + eleRect.width &&
      ev.clientY > eleRect.y &&
      ev.clientY < eleRect.y + eleRect.height
    ) {
      this.ngxResizeEnd?.emit();
    }
    this.unFocus();
  }

  asTransformString(x: number, y: number, xScale = 1, yScale = 1): string {
    return `translate(${this.asPxString(x)},${this.asPxString(y)}) scale(${xScale}, ${yScale})`;
  }

  asPxString(num: number): string {
    return num.toString().concat('px');
  }

  parsePxString(pxStr: string): number {
    const numberPattern = /\d+/g;
    pxStr ??= '';
    if (!pxStr?.includes('px')) {
      console.warn('Tried to parse non px String!');
      return NaN;
    } else {
      return Number.parseFloat(pxStr?.match(numberPattern)?.join('') ?? '');
    }
  }

  unFocus() {
    if (document.getSelection()) {
      document.getSelection()?.empty();
    } else {
      window.getSelection()?.removeAllRanges();
    }
  }
}
