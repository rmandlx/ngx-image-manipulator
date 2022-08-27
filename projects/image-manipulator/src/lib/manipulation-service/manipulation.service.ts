import { Inject, Injectable, InjectionToken, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Class } from '../helper/class';
import { ImageManipulator } from './image-manipulator';
import { initLocal } from '../helper';
import { Remote } from 'comlink';

export const IMAGEMANIPULATION_WEBWORKER_FACTORY = new InjectionToken<
  () => Worker
>('IMAGEMANIPULATION_WEBWORKER_FACTORY');

export const MANIPULATOR_CLASS = new InjectionToken<ImageManipulator>(
  'MANIPULATOR_CLASS'
);

@Injectable()
export class ManipulationService<T extends ImageManipulator> implements OnInit {
  private progressSubject: Subject<number> = new Subject<number>();
  private remoteWorker: Remote<T> | null = null;

  constructor(
    @Inject(IMAGEMANIPULATION_WEBWORKER_FACTORY)
    private webworkerFactory: () => Worker,
    @Inject(MANIPULATOR_CLASS) private manipulatorClass: Class<T>
  ) {}

  async ngOnInit(): Promise<void> {}

  private async tryInit(): Promise<void> {
    if (this.remoteWorker == null) {
      this.remoteWorker = await initLocal(
        this.webworkerFactory,
        () => new this.manipulatorClass(),
        this.progressSubject
      );
    }

    // If the remoteWorker is still null, we could not successfully initialize it.
    if (this.remoteWorker == null) {
      throw new Error('Could not init remote worker.');
    }
  }

  async getWorker(): Promise<Remote<T>> {
    await this.tryInit();
    if (this.remoteWorker == null) {
      throw new Error('Could not init remote worker.');
    }
    return this.remoteWorker;
  }

  getProgress(): Observable<number> {
    return this.progressSubject.asObservable();
  }
}
