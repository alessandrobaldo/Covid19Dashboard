import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { Country } from './country.model';
import firebase from 'firebase/app';
import firestore from 'firebase/app';
import { AngularFireAuth} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AngularFirestore } from '@angular/fire/firestore';
import { User } from './user.model';
import { BindingFlags } from '@angular/compiler/src/core';
import { News } from './news.model';


@Injectable({
    providedIn: 'root'
  })
export class CovidService {

    countryClicked: string;
    user: User;
    news: News;
    newsList: News[] = [];
    dataCountry = {};
    countries = {};
    data = {}
    summaryCountries = [];
    

    constructor(private httpClient: HttpClient, private router: Router, private datepipe: DatePipe,
        private firestore: AngularFirestore, private afAuth: AngularFireAuth){}
        
    
    
    getCountriesMatching(){
        var url = 'https://api.covid19api.com/countries';
        var options : {
            observe: 'response',
            responseType: 'json'
        };

        this.httpClient.get(url,options).subscribe((data)=>{
            for (let i in data){
                this.countries[data[i]['Country']] = data[i]['Slug'];
            }
        });
    }
    // SUMMARY
    getSummary(){
        //if not updated, then do request and update
        var url = 'https://api.covid19api.com/summary';
        var options : {
            observe: 'response',
            responseType: 'json'
        };
        this.updateSummary(this.httpClient.get(url, options));
        return this.httpClient.get(url, options).toPromise();
    }

    
    getSummaryFromStorage(){
       return this.firestore.collection("summary").doc("Countries").get().toPromise();

    }
    

    updateSummary(promise){
        promise.subscribe((response)=>{
            let dict = response['Countries'];
            for (let i in dict){
                let data = {[i]: dict[i]}
            this.firestore.collection("summary").doc("Countries").set(data,{merge: true });
             }   
        });
    }
  
    
    //DAY ONE STATISTICS
    getDayOneStatistics(countryName: string){
        if (countryName!="world"){
            var url = "https://api.covid19api.com/total/dayone/country/"+this.countries[countryName];
            this.updateDayOneStatistics(countryName, this.httpClient.get(url,options));
        }
        else{
            let today = new Date();
            let todayString = this.datepipe.transform(today.setDate(today.getDate()), 'yyyy-MM-dd');
            var url = "https://api.covid19api.com/world?to="+todayString;
        }

        var options : {
            observe: 'response',
            responseType: 'json'
        };
        
        return this.httpClient.get(url,options).toPromise();
    }

    getDayOneStatisticsFromStorage(countryName: string){
        return this.firestore.collection("dayone").doc(countryName).get().toPromise();
    }

    updateDayOneStatistics(countryName: string, promise){
        promise.subscribe((response)=>{
            let data = {
                data: response
            }
            this.firestore.collection("dayone").doc(countryName).set(data,{merge: true });
        });
    }

   
    //LAST WEEK STATISTICS
    getLastWeekStatistics(countryName: string){
        let today = new Date();
        let oneWeekAgo = new Date();
        let todayString = this.datepipe.transform(today.setDate(today.getDate()), 'yyyy-MM-dd');
        if (countryName!="world"){
            oneWeekAgo.setDate(oneWeekAgo.getDate()-8);
            let oneWeekAgoString = this.datepipe.transform(oneWeekAgo, 'yyyy-MM-dd');
            var url = "https://api.covid19api.com/total/country/"+this.countries[countryName]+"?from="+oneWeekAgoString+"&to="+todayString;
            this.updateLastWeekStatistics(countryName, this.httpClient.get(url,options));  
        }
        else{
            oneWeekAgo.setDate(oneWeekAgo.getDate()-7);
            let oneWeekAgoString = this.datepipe.transform(oneWeekAgo, 'yyyy-MM-dd');
            var url = "https://api.covid19api.com/world?from="+oneWeekAgoString+"&to="+todayString;
        }
        var options : {
            observe: 'response',
            responseType: 'json'
        };
        
        return this.httpClient.get(url,options).toPromise();
    }

    getLastWeekStatisticsFromStorage(countryName: string){
       return this.firestore.collection("lastweek").doc(countryName).get().toPromise();
    }
    updateLastWeekStatistics(countryName: string, promise){
        promise.subscribe((response)=>{
            let data = {
                data: response
            }
            this.firestore.collection("lastweek").doc(countryName).set(data,{merge: true });
            
        });
    }


    isCached(countryName: string){
        let document = this.firestore.collection("lastupdate").doc(countryName).get().toPromise();
        return document
    }


    async getAllDataWorld(){
        this.data = {
            "summary":{},
            "lastWeek":{},
            "dayOne":{}
        };
        await this.getSummary().then((summary: any)=>{
            this.data["summary"]["Global"] = new Country("World",summary["Global"]['NewConfirmed'],summary["Global"]['TotalConfirmed'],
            summary["Global"]['NewRecovered'], summary["Global"]['TotalRecovered'],summary["Global"]['NewDeaths'],summary["Global"]['TotalDeaths']);

            this.data["summary"]["Countries"] = [];
            for (let i in summary["Countries"]){
                this.data["summary"]["Countries"].push(new Country(
                    summary["Countries"][i]["Country"],summary["Countries"][i]['NewConfirmed'],summary["Countries"][i]['TotalConfirmed'],
                    summary["Countries"][i]['NewRecovered'], summary["Countries"][i]['TotalRecovered'],summary["Countries"][i]['NewDeaths'],
                    summary["Countries"][i]['TotalDeaths']));
            }
            

         });

        await this.getLastWeekStatistics("world").then((lastWeek: any)=>{
            this.data["lastWeek"] = {
                "totConfirmed": [],
                "totRecovered": [],
                "totDeaths": [],
                "dates": []
            };

            for (let i in lastWeek){
                this.data["lastWeek"]["totConfirmed"].push(lastWeek[i]['NewConfirmed']);
                this.data["lastWeek"]["totRecovered"].push(lastWeek[i]['NewRecovered']);
                this.data["lastWeek"]["totDeaths"].push(lastWeek[i]['NewDeaths']);
                this.data["lastWeek"]["dates"].push(this.datepipe.transform(new Date().setDate(new Date().getDate()-6+parseInt(i)),'dd MMM'));
              }
            

        });

        await this.getDayOneStatistics("world").then((dayOne: any)=>{
            this.data["dayOne"] = {
                "totConfirmed": [],
                "totRecovered": [],
                "totDeaths": [],
                "dates": []
            };

            for (let i in dayOne){
                if (parseInt(i)>1){
                    this.data["dayOne"]["totConfirmed"].push(dayOne[i]['NewConfirmed']+this.data["dayOne"]["totConfirmed"][parseInt(i)-1]);
                    this.data["dayOne"]["totRecovered"].push(dayOne[i]['NewRecovered']+this.data["dayOne"]["totRecovered"][parseInt(i)-1]);
                    this.data["dayOne"]["totDeaths"].push(dayOne[i]['NewDeaths']+this.data["dayOne"]["totDeaths"][parseInt(i)-1]);
                    this.data["dayOne"]["dates"].push(this.datepipe.transform(new Date(),'dd MMM'));
                }
                else{
                    this.data["dayOne"]["totConfirmed"].push(dayOne[i]['NewConfirmed']);
                    this.data["dayOne"]["totRecovered"].push(dayOne[i]['NewRecovered']);
                    this.data["dayOne"]["totDeaths"].push(dayOne[i]['NewDeaths']);
                    this.data["dayOne"]["dates"].push(this.datepipe.transform(new Date(),'dd MMM'));
                }
            }
        
            for (let i=0; i<this.data["dayOne"]["dates"].length; i++){
                this.data["dayOne"]["dates"][this.data["dayOne"]["dates"].length-i-1] = this.datepipe.transform(new Date().setDate(new Date().getDate()-i), 'dd MMM');
              }
            
            
        });
        return this.data;
    }


    async getAllDataCountry(countryName: string){
        this.data = {
            "summary": undefined,
            "lastWeek": {},
            "dayOne": {}
        }
        await this.isCached(countryName).then(async (doc)=>{
            let today = this.datepipe.transform(new Date(),'yyyy-MM-dd');
            if ((doc.exists) && (doc.data()['lastupdate'] == today)){
                //STORAGE
                console.log("Call to the Storage");
                await this.getSummaryFromStorage().then((doc: any)=>{
                    let summary = doc.data();
                    console.log(summary);
                    for(let i in summary){
                        if(summary[i]["Country"] == countryName){
                            this.data["summary"] = new Country(countryName,summary[i]['NewConfirmed'],
                            summary[i]['TotalConfirmed'],summary[i]['NewRecovered'], summary[i]['TotalRecovered'],
                            summary[i]['NewDeaths'],summary[i]['TotalDeaths']);
                            break;
                        }
                    }
                });

                await this.getLastWeekStatisticsFromStorage(countryName).then((doc: any)=>{
                    let lastWeek = doc.data();
                    this.data["lastWeek"] = {
                        "totConfirmed": [],
                        "totRecovered": [],
                        "totDeaths": [],
                        "dates": []
                    };
                    for (let i in lastWeek['data']){
                        if (parseInt(i)>1){
                            this.data["lastWeek"]["totConfirmed"].push(lastWeek['data'][i]['Confirmed']-lastWeek['data'][parseInt(i)-1]['Confirmed']);
                            this.data["lastWeek"]["totRecovered"].push(lastWeek['data'][i]['Recovered']-lastWeek['data'][parseInt(i)-1]['Recovered']);
                            this.data["lastWeek"]["totDeaths"].push(lastWeek['data'][i]['Deaths']-lastWeek['data'][parseInt(i)-1]['Deaths']);
                            this.data["lastWeek"]["dates"].push(this.datepipe.transform(new Date(lastWeek['data'][i]['Date']),'dd MMM'));
                        }
                    }
                });

                await this.getDayOneStatisticsFromStorage(countryName).then((doc: any)=>{
                    let dayOne = doc.data();
                    this.data["dayOne"] = {
                        "totConfirmed": [],
                        "totRecovered": [],
                        "totDeaths": [],
                        "dates": []
                    };
                    for (let i in dayOne['data']){
                        this.data["dayOne"]["totConfirmed"].push(dayOne['data'][i]['Confirmed']);
                        this.data["dayOne"]["totRecovered"].push(dayOne['data'][i]['Recovered']);
                        this.data["dayOne"]["totDeaths"].push(dayOne['data'][i]['Deaths']);
                        this.data["dayOne"]["dates"].push(this.datepipe.transform(new Date(dayOne['data'][i]['Date']),'dd MMM'));
                    }
                });
            }
            else{
                //CALL TO API
                console.log("Call to the API");
                await this.getSummary().then((summary: any)=>{
                    for(let i in summary["Countries"]){
                        if(summary["Countries"][i]["Country"] == countryName){
                            this.data["summary"] = new Country(countryName,summary["Countries"][i]['NewConfirmed'],
                            summary["Countries"][i]['TotalConfirmed'],summary["Countries"][i]['NewRecovered'], 
                            summary["Countries"][i]['TotalRecovered'],summary["Countries"][i]['NewDeaths'],
                            summary["Countries"][i]['TotalDeaths']);
                            break;
                        }
                    }
                });

                await this.getLastWeekStatistics(countryName).then((lastWeek: any)=>{
                    this.data["lastWeek"] = {
                        "totConfirmed": [],
                        "totRecovered": [],
                        "totDeaths": [],
                        "dates": []
                    };
        
                    for (let i in lastWeek){
                        if (parseInt(i)>1){
                          this.data["lastWeek"]["totConfirmed"].push(lastWeek[i]['Confirmed']-lastWeek[parseInt(i)-1]['Confirmed']);
                          this.data["lastWeek"]["totRecovered"].push(lastWeek[i]['Recovered']-lastWeek[parseInt(i)-1]['Recovered']);
                          this.data["lastWeek"]["totDeaths"].push(lastWeek[i]['Deaths']-lastWeek[parseInt(i)-1]['Deaths']);
                          this.data["lastWeek"]["dates"].push(this.datepipe.transform(new Date(lastWeek[i]['Date']),'dd MMM'));
                        }
                    }
                });

                await this.getDayOneStatistics(countryName).then((dayOne)=>{
                    this.data["dayOne"] = {
                        "totConfirmed": [],
                        "totRecovered": [],
                        "totDeaths": [],
                        "dates": []
                    };
                    for (let i in dayOne){
                        this.data["dayOne"]["totConfirmed"].push(dayOne[i]['Confirmed']);
                        this.data["dayOne"]["totRecovered"].push(dayOne[i]['Recovered']);
                        this.data["dayOne"]["totDeaths"].push(dayOne[i]['Deaths']);
                        this.data["dayOne"]["dates"].push(this.datepipe.transform(new Date(dayOne[i]['Date']),'dd MMM'));
                    }
                });

                this.updateStorage(countryName);

            }
        });
        return this.data;
    }

    //UPDATE
    updateStorage(countryName: string){
        this.firestore.collection("lastupdate").doc(countryName).set(
            {lastupdate:this.datepipe.transform(new Date(),'yyyy-MM-dd')},
            {merge: true });
    }
    


    //REDIRECTION
    redirectToCountry(countryName){
        this.countryClicked = countryName;
        console.log("Page "+countryName);
        this.router.navigate([countryName]);
        
    }

    redirectToWorld(){
        this.router.navigate(["world"]);
        this.countryClicked = "";
    }


    async signInWithGoogle(){
        const credientals = await this.afAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
        let doc = this.firestore.collection("superusers").doc(credientals.user.uid).get().toPromise();
        await doc.then((content)=>{
            if(content.exists){
                this.user = {
                    uid: credientals.user.uid,
                    displayName: credientals.user.displayName,
                    email: credientals.user.email,
                    superuser: true
                  };
            }
            else{
                this.user = {
                    uid: credientals.user.uid,
                    displayName: credientals.user.displayName,
                    email: credientals.user.email,
                    superuser: false
                  };
            }
        });
         
        localStorage.setItem("user", JSON.stringify(this.user));
        this.updateUserData(this.user);
        this.router.navigate(["/world"]);
       }
    
    updateUserData(user){
        this.firestore.collection("users").doc(user.uid).set({
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            superuser: user.superuser
          }, { merge: true});
     }
    
    userSignedIn(): boolean{
        return JSON.parse(localStorage.getItem("user")) != null;
      }
    
    getUser(){
        if(this.user == null && this.userSignedIn){
            this.user = JSON.parse(localStorage.getItem("user"));
        }
        return this.user;
    }

    getCountriesNames(){
        return Object.keys(this.countries).sort();
    }

    async logout() {
        localStorage.clear(); // Optional to clear localStorage
        await this.afAuth.signOut().then(() => {
          this.router.navigate(['world']);
        });
      }
    
    async addNews(countryName: string, description: string){
        //const admin = require('firebase-admin');
        let doc = this.firestore.collection("news").doc("news").get().toPromise();
        this.user = this.getUser();
        this.news = {
            countryName: countryName,
            author: this.user.displayName,
            email: this.user.email,
            description: description,
            date: new Date()
        }
        await doc.then((d)=>{
            if ((d.exists)){
                this.firestore.collection("news").doc("news").update({
                    content: firebase.firestore.FieldValue.arrayUnion(this.news)
                });
            }
            else{
                let now = this.datepipe.transform(new Date(),'yyyy-MM-dd h:mm:ss');
                this.firestore.collection("news").doc("news").set({
                    content: [this.news]
                }, {merge: true});
            }
        });

        
    }

    async getNews(){
        let doc = this.firestore.collection("news").doc("news").get().toPromise()
        await doc.then((d)=>{
            if (d.exists){
                this.newsList = d.data()['content'];
            }
        });
        return this.newsList;
    }

    transformDate(date: Date){
        return this.datepipe.transform(new Date(date['seconds']*1000), 'yyyy-MM-dd hh:mm');
    }

    

    
}