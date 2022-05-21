import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[draggableElement]',
})
export class DraggableElementDirective {
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

    this.renderer2.setStyle(this.elRef.nativeElement, 'position', 'relative');
    this.renderer2.setStyle(this.elRef.nativeElement, 'cursor', 'move');

    this.elRef.nativeElement.addEventListener('mousedown', (ev) => {
      this.dragging = true;
      ev.preventDefault();
    });
  }

  @HostListener('window:mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    if (this.dragging && this.mousePosition) {
      event.preventDefault();
      const xDiff = event.clientX - this.mousePosition.x;
      const yDiff = event.clientY - this.mousePosition.y;
      const style = window.getComputedStyle(this.elRef.nativeElement);
      const matrix = new WebKitCSSMatrix(style.transform);
      const oldX = matrix.m41;
      const oldY = matrix.m42;

      this.renderer2.setStyle(
        this.elRef.nativeElement,
        'transform',
        this.asTranslateString(oldX + xDiff, oldY + yDiff)
      );
    }
    this.mousePosition = { x: event.clientX, y: event.clientY };
  }

  @HostListener('window:mouseup', ['$event']) onMouseUp(event: MouseEvent) {
    this.dragging = false;
  }

  asTranslateString(x: number, y: number): string {
    return `translate(${this.asPxString(x)},${this.asPxString(y)})`;
  }

  asPxString(num: number): string {
    return num.toString().concat('px');
  }
}
