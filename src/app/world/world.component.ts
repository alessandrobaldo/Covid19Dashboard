import { Component, OnInit } from '@angular/core';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { SingleDataSet, Color, Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import {Country} from 'src/app/country.model';
import { DatePipe } from '@angular/common';
import { faChartBar, faChartLine, faChartPie, faChevronCircleDown, faChevronCircleUp, faChevronDown, faChevronUp, faNewspaper, faPlusSquare, faTable, faUser } from '@fortawesome/free-solid-svg-icons';
import { CovidService } from '../covid.service';
import { News } from '../news.model';

@Component({
  selector: 'app-world',
  templateUrl: './world.component.html',
  styleUrls: ['../styleComponents.css']
})

export class WorldComponent implements OnInit {
  world: Country;
  countries: Country[] = [];
  news: News[] = [];
  data = {};
  sortNewsParam: string;



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
  public barChartColors: Color[] = [];
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [];
  
  //Line
  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: Label[];
  public lineChartOptions: (ChartOptions) = {
    responsive: true,
  };
  public lineChartColors: Color[] = [];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  arrowUpNotSel = faChevronUp;
  arrowDownNotSel = faChevronDown;
  arrowUpSel = faChevronCircleUp;
  arrowDownSel = faChevronCircleDown;
  userIcon = faUser;
  addNewsIcon = faPlusSquare;
  newsIcon = faNewspaper;
  tableIcon = faTable;
  pieChartIcon = faChartPie;
  barChartIcon = faChartBar;
  lineChartIcon = faChartLine;
  
  //Arrows sort
  headersTable = [
    {
      name: "Country",  up: this.arrowUpNotSel, down: this.arrowDownSel, comparator: this.CountryComp, class: "country"
    },
    {
      name: "New Cases",  up: this.arrowUpNotSel, down: this.arrowDownSel, comparator: this.NCComp, class: "cases"
    },
    {
      name: "Total Cases",  up: this.arrowUpNotSel, down: this.arrowDownSel, comparator: this.TCComp, class: "cases"
    },
    {
      name: "New Recoveries",  up: this.arrowUpNotSel, down: this.arrowDownSel, comparator: this.NRComp, class: "recoveries"
    },
    {
      name: "Total Recoveries",  up: this.arrowUpNotSel, down: this.arrowDownSel, comparator: this.TRComp, class: "recoveries"
    },
    {
      name: "New Deaths",  up: this.arrowUpNotSel, down: this.arrowDownSel, comparator: this.NDComp, class: "deaths"
    },
    {
      name: "Total Deaths",  up: this.arrowUpNotSel, down: this.arrowDownSel, comparator: this.TDComp, class: "deaths"
    }


  ]


  constructor(public covidService: CovidService, public datepipe: DatePipe) { 
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
    this.covidService.getCountriesMatching();
  }

  ngOnInit(): void {
    
  this.covidService.getAllDataWorld().then((dataWorld)=>{
    this.data = dataWorld;
    this.pieChartData = [this.data["summary"]["Global"].getTotalDeaths(), this.data["summary"]["Global"].getTotalRecoveries(), this.data["summary"]["Global"].getActiveCases()];
    this.countries = this.data["summary"]["Countries"];
    
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
  return newsA.date<=newsB.date;
}

countryNewsComparator(newsA: News, newsB: News){
  return newsA.countryName.localeCompare(newsB.countryName);
}


sortTable(elem: any, reversed: boolean){
  this.countries.sort(elem["comparator"]);

  for (let i in this.headersTable){
    this.headersTable[i]["up"] = this.arrowUpNotSel;
    this.headersTable[i]["down"] = this.arrowDownNotSel;
  }
  if (!reversed){

    elem["up"] = this.arrowUpNotSel;
    elem["down"] = this.arrowDownSel;
  }
  else{
    this.countries.reverse();
    elem["up"] = this.arrowUpSel;
    elem["down"] = this.arrowDownNotSel;
  }


  
}
  
CountryComp(countryA: Country,countryB: Country){
  return countryA.getName().localeCompare(countryB.getName());
}

NCComp(countryA: Country,countryB: Country){
  return countryA.getNewCases() - countryB.getNewCases();
}

TCComp(countryA: Country,countryB: Country){
  return countryA.getTotalCases() - countryB.getTotalCases();
}

NRComp(countryA: Country,countryB: Country){
  return countryA.getNewRecoveries() - countryB.getNewRecoveries();
}

TRComp(countryA: Country, countryB: Country){
  return countryA.getTotalRecoveries() - countryB.getTotalRecoveries();
}

NDComp(countryA: Country,countryB: Country){
  return countryA.getNewDeaths() - countryB.getNewDeaths();
}

TDComp(countryA: Country,countryB: Country){
  return countryA.getTotalDeaths() - countryB.getTotalDeaths();
}


}
