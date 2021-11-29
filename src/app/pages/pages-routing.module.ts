import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';


import { IndexComponent } from './index/index.component';


const routes: Routes = [

    {
        path: '',
        component: IndexComponent
    },
 
];

@NgModule({
    imports: [RouterModule.forChild(routes), ReactiveFormsModule],
    exports: [RouterModule]
})
export class PagesRoutingModule { }
