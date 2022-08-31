import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ConcreteImageManipulator } from './concrete-manipulator';
import { ImageManipulationModule } from 'image-manipulator';

@NgModule({
  declarations: [AppComponent],
  imports: [
    ImageManipulationModule.forRoot(
      () => new Worker(new URL('test.worker', import.meta.url)),
      ConcreteImageManipulator
    ),
    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
