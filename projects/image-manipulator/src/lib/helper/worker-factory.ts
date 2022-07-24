import { InjectionToken } from '@angular/core';

export type progressCallback = (progress: number) => void;

export const IMAGEMANIPULATION_WEBWORKER_FACTORY = new InjectionToken<
  () => Worker
>('IMAGEMANIPULATION_WEBWORKER_FACTORY');
