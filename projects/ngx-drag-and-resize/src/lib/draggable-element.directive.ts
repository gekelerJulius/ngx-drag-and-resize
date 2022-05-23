import {Directive, ElementRef, EventEmitter, HostListener, Output, Renderer2} from '@angular/core';

@Directive({
  selector: '[draggableElement]',
})
export class DraggableElementDirective {
  private dragging = false;
  private mousePosition: { x: number; y: number } = { x: 0, y: 0 };

  @Output() ngxDragStart: EventEmitter<void> = new EventEmitter<void>();
  @Output() ngxDragging: EventEmitter<void> = new EventEmitter<void>();
  @Output() ngxDragEnd: EventEmitter<void> = new EventEmitter<void>();

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
    // this.renderer2.setStyle(this.elRef.nativeElement, 'cursor', 'move');

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
      const xDiff = ev.clientX - this.mousePosition.x;
      const yDiff = ev.clientY - this.mousePosition.y;
      const style = window.getComputedStyle(this.elRef.nativeElement);
      const matrix = new WebKitCSSMatrix(style.transform);
      const oldX = matrix.m41;
      const oldY = matrix.m42;

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
    this.dragging = false;
    this.ngxDragEnd.emit();
    this.renderer2.setStyle(this.elRef.nativeElement, 'z-index', 1);
  }

  asTranslateString(x: number, y: number): string {
    return `translate(${this.asPxString(x)},${this.asPxString(y)})`;
  }

  asPxString(num: number): string {
    return num.toString().concat('px');
  }
}
