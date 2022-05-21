import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[resizableElement]',
})
export class ResizableElementDirective {
  @Input() handlerSize = '20px';

  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
  private currentResizingHandler: any = null;

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

    this.renderer2.setStyle(this.elRef.nativeElement, 'position', 'relative');
    // TopLeft TopRight BottomRight BottomLeft
    const handlers = [
      document.createElement('div') as HTMLDivElement,
      document.createElement('div') as HTMLDivElement,
      document.createElement('div') as HTMLDivElement,
      document.createElement('div') as HTMLDivElement,
    ];
    for (let i = 0; i < handlers.length; i++) {
      const handler = handlers[i];
      handler.id = `resizableElementResizeHandler${i}`;
      this.renderer2.appendChild(elRef.nativeElement, handler);

      this.renderer2.setStyle(handler, 'position', 'absolute');
      if (i === 0 || i === 3) {
        this.renderer2.setStyle(handler, 'left', this.asPxString(0));
      }
      if (i === 0 || i === 1) {
        this.renderer2.setStyle(handler, 'top', this.asPxString(0));
      }
      if (i === 1 || i === 2) {
        this.renderer2.setStyle(handler, 'right', this.asPxString(0));
      }
      if (i === 2 || i === 3) {
        this.renderer2.setStyle(handler, 'bottom', this.asPxString(0));
      }

      switch (i) {
        case 0:
          this.renderer2.setStyle(handler, 'cursor', 'nw-resize');
          this.renderer2.setStyle(handler, 'background-color', 'green');
          break;
        case 1:
          this.renderer2.setStyle(handler, 'cursor', 'ne-resize');
          this.renderer2.setStyle(handler, 'background-color', 'red');
          break;
        case 2:
          this.renderer2.setStyle(handler, 'cursor', 'se-resize');
          this.renderer2.setStyle(handler, 'background-color', 'blue');
          break;
        case 3:
          this.renderer2.setStyle(handler, 'cursor', 'sw-resize');
          this.renderer2.setStyle(handler, 'background-color', 'orange');
          break;
        default:
          break;
      }

      this.renderer2.setStyle(handler, 'width', this.handlerSize);
      this.renderer2.setStyle(handler, 'height', this.handlerSize);

      handler.addEventListener('mousedown', (ev) => {
        this.currentResizingHandler = handler;
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
      const style = window.getComputedStyle(this.elRef.nativeElement);
      const matrix = new WebKitCSSMatrix(style.transform);
      const oldX = matrix.m41;
      const oldY = matrix.m42;
      const rect: DOMRect = this.elRef.nativeElement.getBoundingClientRect();

      switch (this.currentResizingHandler.id) {
        case 'resizableElementResizeHandler0':
          this.renderer2.setStyle(this.elRef.nativeElement, 'width', this.asPxString(rect.width - xDiff));
          this.renderer2.setStyle(this.elRef.nativeElement, 'height', this.asPxString(rect.height - yDiff));
          this.renderer2.setStyle(
            this.elRef.nativeElement,
            'transform',
            this.asTransformString(oldX + xDiff, oldY + yDiff)
          );
          break;
        case 'resizableElementResizeHandler1':
          this.renderer2.setStyle(this.elRef.nativeElement, 'width', this.asPxString(rect.width + xDiff));
          this.renderer2.setStyle(this.elRef.nativeElement, 'height', this.asPxString(rect.height - yDiff));
          this.renderer2.setStyle(this.elRef.nativeElement, 'transform', this.asTransformString(oldX, oldY + yDiff));
          break;
        case 'resizableElementResizeHandler2':
          this.renderer2.setStyle(this.elRef.nativeElement, 'width', this.asPxString(rect.width + xDiff));
          this.renderer2.setStyle(this.elRef.nativeElement, 'height', this.asPxString(rect.height + yDiff));
          this.renderer2.setStyle(this.elRef.nativeElement, 'transform', this.asTransformString(oldX, oldY));
          break;
        case 'resizableElementResizeHandler3':
          this.renderer2.setStyle(this.elRef.nativeElement, 'width', this.asPxString(rect.width - xDiff));
          this.renderer2.setStyle(this.elRef.nativeElement, 'height', this.asPxString(rect.height + yDiff));
          this.renderer2.setStyle(this.elRef.nativeElement, 'transform', this.asTransformString(oldX + xDiff, oldY));
          break;
        default:
          break;
      }
    }
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }

  @HostListener('window:mouseup', ['$event']) onMouseUp(event: MouseEvent) {
    this.currentResizingHandler = null;
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
