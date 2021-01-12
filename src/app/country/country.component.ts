import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { SingleDataSet, Color, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import {Country} from 'src/app/country.model';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { CovidService } from '../covid.service';
import { News } from '../news.model';
import { faChartBar, faChartLine, faChartPie, faNewspaper, faPlusSquare, faTable, faUser } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['../styleComponents.css']
})
export class CountryComponent implements OnInit {
  countryName: string;
  country: Country;
  data: any;
  news: News[] = [];
  sortNewsParam: string;
  userIcon = faUser;
  addNewsIcon = faPlusSquare;
  newsIcon = faNewspaper;
  tableIcon = faTable;
  pieChartIcon = faChartPie;
  barChartIcon = faChartBar;
  lineChartIcon = faChartLine;

  //Pie
  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = ['Dead Cases','Recovered Cases','Active Cases'];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];
  


  //Bars
 
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartData: ChartDataSets[] = [];

  //Line
  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[];
  public lineChartOptions: (ChartOptions) = {
    responsive: true,
  };
  public lineChartColors: Color[];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];
 

  constructor(public covidService: CovidService, private datepipe: DatePipe,private router: Router,
    private firestore: AngularFirestore) { 
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();

    if (!this.covidService.countryClicked || this.covidService.countryClicked==""){
      this.router.navigate(['world']);
    }else{
      this.countryName = this.covidService.countryClicked;
    }
    
   }

  ngOnInit(): void {  
    
  this.covidService.getAllDataCountry(this.countryName).then((dataCountry)=>{
      this.data = dataCountry;
      this.pieChartData = [this.data["summary"].getTotalDeaths(), this.data["summary"].getTotalRecoveries(), this.data["summary"].getActiveCases()];
      
      
      this.barChartLabels = this.data["lastWeek"]["dates"];
      this.barChartData = [
          { data: this.data["lastWeek"]["totDeaths"], label: 'Total Deaths'},
          { data: this.data["lastWeek"]["totRecovered"], label: 'Total Recovered'},
          { data: this.data["lastWeek"]["totConfirmed"], label: 'Total Cases'}
        ];
      
      this.lineChartData = [
        { data: this.data["dayOne"]["totDeaths"], label: 'Total Deaths'},
        { data: this.data["dayOne"]["totRecovered"], label: 'Total Recovered'},
        { data: this.data["dayOne"]["totConfirmed"], label: 'Total Cases'}
      ];
      this.lineChartLabels = this.data["dayOne"]["dates"];  
    });
     
    this.covidService.getNews().then((data)=>{
      this.news = data;
    });
    
  
  }
  
  sortNews(){
    let comparator = undefined;
    let reverse = false;
    if (this.sortNewsParam == "Most Recent"){
      comparator = this.dateNewsComparator;
      reverse = true;
    }
    else{
      comparator = this.countryNewsComparator;
    }
    this.news.sort(comparator);
    if (reverse){
      this.news.reverse();
    }
  }
  
  dateNewsComparator(newsA: News, newsB: News){
    return newsA.date>=newsB.date;
  }
  
  countryNewsComparator(newsA: News, newsB: News){
    return newsA.countryName.localeCompare(newsB.countryName);
  }
  
  
}
