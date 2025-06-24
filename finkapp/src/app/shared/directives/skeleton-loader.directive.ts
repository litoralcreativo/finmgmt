import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appSkeletonLoader]',
})
export class SkeletonLoaderDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private skeletonClass = 'skeleton-loader';
  @Input() appSkeletonLoader = true;

  ngOnInit() {
    this.addSkeletonClass();
  }

  ngOnChanges() {
    if (this.appSkeletonLoader) {
      this.addSkeletonClass();
    } else {
      this.removeSkeletonClass();
    }
  }

  ngOnDestroy() {
    this.removeSkeletonClass();
  }

  private addSkeletonClass() {
    const childNodes = this.el.nativeElement.childNodes;
    for (const node of childNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.renderer.addClass(node, this.skeletonClass);
      }
    }
  }

  private removeSkeletonClass() {
    const childNodes = this.el.nativeElement.childNodes;
    for (const node of childNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        this.renderer.removeClass(node, this.skeletonClass);
      }
    }
  }
}
