import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[draggableElement]',
})
export class DraggableElementDirective {
  @Input() ngxBoundsContainerSelector: string | null = null;

  @Output() ngxDragStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() ngxDragging: EventEmitter<void> = new EventEmitter<void>();
  @Output() ngxDragEnd: EventEmitter<void> = new EventEmitter<void>();

  private dragging = false;
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

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

    this.elRef.nativeElement.addEventListener('mousedown', (ev) => {
      if (!ev.defaultPrevented && ev.returnValue) {
        this.dragging = true;
        this.ngxDragStart.emit();
        this.renderer2.setStyle(this.elRef.nativeElement, 'z-index', 999);
        ev.preventDefault();
      }
    });
  }

  @HostListener('window:mousemove', ['$event']) onMouseMove(ev: MouseEvent) {
    if (this.dragging && this.mousePosition && !ev.defaultPrevented && ev.returnValue) {
      ev.preventDefault();
      let xDiff = ev.clientX - this.mousePosition.x;
      let yDiff = ev.clientY - this.mousePosition.y;
      let style = window.getComputedStyle(this.elRef.nativeElement);
      let matrix = new WebKitCSSMatrix(style.transform);
      let oldX = matrix.m41;
      let oldY = matrix.m42;
      let rect = this.elRef?.nativeElement?.getBoundingClientRect();
      const boundsContainer =
        typeof this.ngxBoundsContainerSelector === 'string'
          ? document.querySelector(this.ngxBoundsContainerSelector)
          : null;

      if (boundsContainer) {
        if (oldX + xDiff < boundsContainer.getBoundingClientRect().x) {
          xDiff = boundsContainer.getBoundingClientRect().x - oldX;
        }
        if (
          oldX + xDiff + rect.width >
          boundsContainer.getBoundingClientRect().x + boundsContainer.getBoundingClientRect().width
        ) {
          xDiff =
            boundsContainer.getBoundingClientRect().x +
            boundsContainer.getBoundingClientRect().width -
            (oldX + rect.width);
        }

        if (oldY + yDiff < boundsContainer.getBoundingClientRect().y) {
          yDiff = boundsContainer.getBoundingClientRect().y - oldY;
        }
        if (
          oldY + yDiff + rect.height >
          boundsContainer.getBoundingClientRect().y + boundsContainer.getBoundingClientRect().height
        ) {
          yDiff =
            boundsContainer.getBoundingClientRect().y +
            boundsContainer.getBoundingClientRect().height -
            (oldY + rect.height);
        }
      }
      this.renderer2.setStyle(
        this.elRef.nativeElement,
        'transform',
        this.asTranslateString(oldX + xDiff, oldY + yDiff)
      );

      this.ngxDragging.emit();
    }
    this.mousePosition = { x: ev.clientX, y: ev.clientY };
  }

  @HostListener('window:mouseup', ['$event']) onMouseUp(ev: MouseEvent) {
    if (this.dragging) {
      this.ngxDragEnd?.emit();
      this.dragging = false;
      this.renderer2.setStyle(this.elRef.nativeElement, 'z-index', 1);
    }
  }

  asTranslateString(x: number, y: number): string {
    return `translate(${this.asPxString(x)},${this.asPxString(y)})`;
  }

  asPxString(num: number): string {
    return num.toString().concat('px');
  }
}
