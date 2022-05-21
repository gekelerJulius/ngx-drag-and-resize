import { NgModule } from '@angular/core';
import { NgxDragAndResizeComponent } from './ngx-drag-and-resize.component';
import { DraggableElementDirective } from './draggable-element.directive';
import { ResizableElementDirective } from './resizable-element.directive';

@NgModule({
  declarations: [NgxDragAndResizeComponent, DraggableElementDirective, ResizableElementDirective],
  imports: [],
  exports: [NgxDragAndResizeComponent, DraggableElementDirective, ResizableElementDirective],
})
export class NgxDragAndResizeModule {}
