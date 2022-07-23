import { InjectionToken } from '@angular/core';

export const IMAGEMANIPULATION_WEBWORKER_FACTORY = new InjectionToken<
  () => Worker
>('IMAGEMANIPULATION_WEBWORKER_FACTORY');
