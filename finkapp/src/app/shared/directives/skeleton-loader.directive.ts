import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appSkeletonLoader]',
})
export class SkeletonLoaderDirective implements OnInit, OnDestroy {
  private skeletonClass = 'skeleton-loader';
  @Input() appSkeletonLoader: boolean = true;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

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
      if (node.nodeType === 1) {
        // Node.ELEMENT_NODE
        this.renderer.addClass(node, this.skeletonClass);
      }
    }
  }

  private removeSkeletonClass() {
    const childNodes = this.el.nativeElement.childNodes;
    for (const node of childNodes) {
      if (node.nodeType === 1) {
        // Node.ELEMENT_NODE
        this.renderer.removeClass(node, this.skeletonClass);
      }
    }
  }
}
