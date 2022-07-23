import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageManipulatorComponent } from './image-manipulator.component';
import { ImageManipulatorModule } from './image-manipulator.module';

describe('ImageManipulatorComponent', () => {
  let component: ImageManipulatorComponent;
  let fixture: ComponentFixture<ImageManipulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(
      ImageManipulatorModule.forRoot(() => new Worker(''))
    ).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageManipulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    component.postMessage();
  });
});
