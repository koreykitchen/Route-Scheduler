import React from 'react';

import XLSX from 'xlsx';

class Data extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = { storeListData: [], dataHasBeenLoaded: false, daysArray364: [], weekData: [],
                        stopCount: 0, selectElementOptions: this.populateSelectElement(), 
                        selectElementIndex: 0 }; 

        this.callbackFunctionToStoreData = this.callbackFunctionToStoreData.bind(this);
        this.getSelectedIndex = this.getSelectedIndex.bind(this);
    }

    componentDidMount()
    {
        this.getStoreListData(this.callbackFunctionToStoreData);
    }

    render()
    {
        if(!this.state.dataHasBeenLoaded)
        {
            return (<h1 style={{textAlign: 'center', padding: '100px'}}>LOADING...</h1>);
        }

        else
        {
            return (<div>

                        <h1>Route Scheduler</h1>

                        <p>A Note Before Using:</p>
                        
                        <p>Route scheduler is still in development, and therefore may be prone to bugs and crashes...</p>

                        <p>Some functionality may be missing or incomplete...</p>

                        <br/>

                        <select id='daySelectElement' onChange={this.getSelectedIndex} style={{width:'75vw'}}>
                
                            {this.state.selectElementOptions}
                
                        </select>

                        <br/>

                        {this.state.weekData}

                        <p>Total Stops: {this.state.stopCount}</p> 
            
                    </div>);
        }
    }

    getStoreListData(callbackFunction)
    {
        var request = new XMLHttpRequest();

        request.open("GET", "https://koreykitchen.github.io/Route-Scheduler/Rt366.xlsx", true);

        request.responseType = "arraybuffer";

        request.onload = function() 
        {
            callbackFunction(request.response);
        };

        request.send();
    }

    callbackFunctionToStoreData(dataToStore)
    {
        var rawData = new Uint8Array(dataToStore);

        var workbook = XLSX.read(rawData, {type:"array"});

        var worksheet = workbook.Sheets[workbook.SheetNames[0]];

        var jsonStoreListData = XLSX.utils.sheet_to_json(worksheet, {blankrows:false});

        jsonStoreListData = jsonStoreListData.filter(storeObject => 
            ((storeObject["New Route"] === 366)));

        this.setState({ storeListData: jsonStoreListData, dataHasBeenLoaded: true });  
        
        this.setState({ selectElementOptions: this.populateSelectElement() });

        this.setState({ daysArray364: this.setYearlySchedule() });

        this.setState({ weekData: this.formatWeeklyOutput(0)});

        this.setState({ stopCount: this.state.daysArray364[this.state.selectElementIndex].split('\n').length - 1});
    }

    setYearlySchedule()
    {
        var weekDays = "MTWRF";
        var yearArray = [];
        var dayOfMonth = 0;

        for(let i = 0; i < 364; i++)
        {
            yearArray[i] = "";
        }

        this.state.storeListData.forEach((storeObject) =>
            {
                if(storeObject.Name)
                {
                    //Monthly
                    if(storeObject.Frequency === 'M')
                    {
                        dayOfMonth = 0;

                        dayOfMonth += ((storeObject.Weeks - 1)*7);

                        dayOfMonth += weekDays.indexOf(storeObject.Days);

                        dayOfMonth += 1;

                        for(let j = 0; j < (52/4); j++)
                        {
                            yearArray[dayOfMonth+(j*(7*4))] += storeObject.Name;

                            yearArray[dayOfMonth+(j*(7*4))] += ' - Monthly\n';
                        }
                    }

                    //3 Weeks
                    else if(storeObject.Frequency === "3W")
                    {
                        dayOfMonth = 0;

                        dayOfMonth += ((storeObject.Weeks - 1)*7);

                        dayOfMonth += weekDays.indexOf(storeObject.Days);

                        dayOfMonth += 1;

                        for(let j = 0; j < (52/3); j++)
                        {
                            yearArray[dayOfMonth+(j*(7*3))] += storeObject.Name;

                            yearArray[dayOfMonth+(j*(7*3))] += ' - Every 3 Weeks\n';
                        }
                    }

                    //2 Weeks
                    else if(storeObject.Frequency === "B")
                    {
                        if(storeObject.Weeks === "EVEN")
                        {
                            dayOfMonth = 0;

                            dayOfMonth += weekDays.indexOf(storeObject.Days);

                            dayOfMonth += 1;
                        }

                        else if(storeObject.Weeks === "ODD")
                        {
                            dayOfMonth = 7;

                            dayOfMonth += weekDays.indexOf(storeObject.Days);

                            dayOfMonth += 1;
                        }

                        for(let j = 0; j < (52/2); j++)
                        {
                            yearArray[dayOfMonth+(j*(7*2))] += storeObject.Name;

                            yearArray[dayOfMonth+(j*(7*2))] += ' - Every Other Week\n';
                        }
                    }

                    //Weekly
                    else if(storeObject.Frequency === "W")
                    {
                        for(let k = 0; k < 5; k++)
                        {
                            if(storeObject.Days.indexOf(weekDays.charAt(k)) > -1)
                            {
                                dayOfMonth = 0;

                                dayOfMonth += k;

                                dayOfMonth += 1;

                                for(let j = 0; j < (52/1); j++)
                                {
                                    yearArray[dayOfMonth+(j*(7*1))] += storeObject.Name;

                                    var timesAWeek = ''; //Default

                                    if(storeObject.Days.length === 1)
                                    {
                                        timesAWeek = "Once a week";
                                    }

                                    else
                                    {
                                        var WeekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

                                        switch(storeObject.Days.at(0))
                                        {
                                            case 'M':
                                                timesAWeek += WeekDays[0];
                                                break;
                                            case 'T':
                                                timesAWeek += WeekDays[1];
                                                break;
                                            case 'W':
                                                timesAWeek += WeekDays[2];
                                                break;
                                            case 'R':
                                                timesAWeek += WeekDays[3];
                                                break;
                                            case 'F':
                                                timesAWeek += WeekDays[4];
                                                break;
                                            default:
                                                timesAWeek += '';
                                                break;
                                        }

                                        for(let n = 1; n < storeObject.Days.length; n++)
                                        {
                                            timesAWeek += '/';

                                            switch(storeObject.Days.at(n))
                                            {
                                                case 'M':
                                                    timesAWeek += WeekDays[0];
                                                    break;
                                                case 'T':
                                                    timesAWeek += WeekDays[1];
                                                    break;
                                                case 'W':
                                                    timesAWeek += WeekDays[2];
                                                    break;
                                                case 'R':
                                                    timesAWeek += WeekDays[3];
                                                    break;
                                                case 'F':
                                                    timesAWeek += WeekDays[4];
                                                    break;
                                                default:
                                                    timesAWeek += '';
                                                    break;
                                            }
                                        }
                                        
                                    }

                                    yearArray[dayOfMonth+(j*(7*1))] += ' - ';

                                    yearArray[dayOfMonth+(j*(7*1))] += timesAWeek;

                                    yearArray[dayOfMonth+(j*(7*1))] += '\n';
                                }
                            }
                        }
                    }
                    
                }
            });

        return yearArray;
    }

    formatWeeklyOutput(index)
    {
        return (

            <div>
       
                {(this.state.daysArray364[index].split('\n')).map((store, index) => {return <p key={index}>{store}</p>})}

            </div>

        );
    }

    populateSelectElement()
    {
        return Array(364).fill().map((_, index) =>
        {
            var WeekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            var specificDay = WeekDays[index%7];

            return (<option key={index} value ={index} >Day #{index} - {specificDay}</option>);
        });
    }

    getSelectedIndex()
    {
        var selectElement = document.getElementById("daySelectElement");

        if(selectElement)
        {   
            var index = selectElement.options[selectElement.selectedIndex].value;
            
            this.setState({ selectElementIndex: index});
            this.setState({ weekData: this.formatWeeklyOutput(index)});
            this.setState({ stopCount: this.state.daysArray364[index].split('\n').length - 1});
        }

        else
        {
            this.setState({ selectElementIndex: 0});
        }
    }

}

export default Data;

