export class Country{
    name: string;
    newCases: number;
    totalCases: number;
    newRecoveries: number;
    totalRecoveries: number;
    newDeaths: number;
    totalDeaths: number;

    constructor(  name: string,
        newCases: number,
        totalCases: number,
        newRecoveries: number,
        totalRecoveries: number,
        newDeaths: number,
        totalDeaths: number){
            this.name = name;
            this.newCases = newCases;
            this.totalCases = totalCases;
            this.newRecoveries = newRecoveries;
            this.totalRecoveries = totalRecoveries;
            this.newDeaths = newDeaths
            this.totalDeaths = totalDeaths;
        }
    getName(){
        return this.name;
    }
    getNewCases(){
        return this.newCases;
    }
    getTotalCases(){
        return this.totalCases
    }
    getNewRecoveries(){
        return this.newRecoveries;
    }
    getTotalRecoveries(){
        return this.totalRecoveries;
    }
    getNewDeaths(){
        return this.newDeaths;
    }
    getTotalDeaths(){
        return this.totalDeaths;
    }

    getMortalityRate(){
        return (this.totalDeaths/this.totalCases);
    }

    getRecoveryRate(){
        return (this.totalRecoveries/this.totalCases);
    }

    getActiveCases(){
        return (this.totalCases - this.totalRecoveries);
    }

    getTupleList(){
        return [
            ["Total Cases",this.getTotalCases().toLocaleString()],
            ["New Cases",this.getNewCases().toLocaleString()],
            ["Active Cases",this.getActiveCases().toLocaleString()],
            ["Total Recovered",this.getTotalRecoveries().toLocaleString()],
            ["New Recovered",this.getNewRecoveries().toLocaleString()],
            ["Recovery Rate",(Math.round(this.getRecoveryRate()*100)/100).toString()+"%"],
            ["Total Deaths",this.getTotalDeaths().toLocaleString()],
            ["New Deaths",this.getNewDeaths().toLocaleString()],
            ["Mortality Rate",(Math.round(this.getMortalityRate()*100)/100).toString()+"%"]
        ];
    }
    
    
}