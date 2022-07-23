import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ImageManipulatorModule } from 'image-manipulator';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    ImageManipulatorModule.forRoot(
      () => new Worker(new URL('test.worker', import.meta.url))
    ),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
