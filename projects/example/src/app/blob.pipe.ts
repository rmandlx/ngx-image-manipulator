import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'blobPipe',
  pure: true,
})
export class BlobPipe implements PipeTransform, OnDestroy {
  objectUrl: string | null = null;
  objectUrlTrusted: SafeUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: Blob | null): SafeUrl | null {
    this.cleanup();

    if (value == null) {
      return null;
    }
    this.objectUrl = URL.createObjectURL(value);
    this.objectUrlTrusted = this.sanitizer.bypassSecurityTrustUrl(
      this.objectUrl
    );
    return this.objectUrlTrusted;
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  cleanup(): void {
    if (this.objectUrl != null) {
      URL.revokeObjectURL(this.objectUrl);
    }
    this.objectUrlTrusted = null;
    this.objectUrl = null;
  }
}
