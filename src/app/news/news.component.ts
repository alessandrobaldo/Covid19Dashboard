import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CovidService } from '../covid.service';
import { User } from '../user.model';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit {


  countrySelected: any;
  description: any;
  user: User;

  constructor(public covidService: CovidService, private router: Router) { 
    if (!this.covidService.userSignedIn()){
      this.router.navigate(['world']);
    }
    else{
      this.user = this.covidService.getUser()
    }
  }

  ngOnInit(): void {

  }

  addNews(){
    this.covidService.addNews(this.countrySelected, this.description);
  }

  signOut(){
    this.covidService.logout();
  }

}
