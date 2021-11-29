import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ScrollToModule } from '@nicky-lenaers/ngx-scroll-to';

import { MintingComponent } from './minting/minting.component';
import { GalleryComponent } from './gallery/gallery.component';
import { FooterComponent } from './footer/footer.component';
import { ScrollspyDirective } from './scrollspy.directive';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MintingComponent, GalleryComponent, FooterComponent, ScrollspyDirective],
  imports: [
    CommonModule,
    CarouselModule,
    ReactiveFormsModule,
    ScrollToModule.forRoot()
  ],
  exports: [MintingComponent, GalleryComponent, FooterComponent, ScrollspyDirective]
})
export class SharedModule { }
