import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ManipulationModule } from 'image-manipulator';
import { ConcreteImageManipulator } from './concrete-manipulator';
import { ImageManipulatorModule } from '../../../image-manipulator/src/lib/manipulation-component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    ManipulationModule.forRoot(
      () => new Worker(new URL('test.worker', import.meta.url)),
      ConcreteImageManipulator
    ),
    ImageManipulatorModule,

    BrowserModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
