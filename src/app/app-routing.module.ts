import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CountryComponent } from './country/country.component';
import { NewsComponent } from './news/news.component';
import { WorldComponent } from './world/world.component';

const routes: Routes = [
  { path: "world", component: WorldComponent},
  { path: "News/:id", component: NewsComponent},
  //canActivate: [SecurePagesGuard]},
  { path: ":id", component: CountryComponent}, 
  //canActivate: [AuthGuard]},
  { path: "", pathMatch: "full", redirectTo: "world"},
  { path: "**", redirectTo: "world"}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
