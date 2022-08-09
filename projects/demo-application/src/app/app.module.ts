import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgxDragAndResizeModule } from "ngx-drag-and-resize";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, NgxDragAndResizeModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
