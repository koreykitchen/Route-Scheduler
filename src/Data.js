import React from 'react';

import XLSX from 'xlsx';

class Data extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = { storeListData: [], dataHasBeenLoaded: false, selectElementOptions: [] }; 

        this.callbackFunctionToStoreData = this.callbackFunctionToStoreData.bind(this);
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
                    
                      <p>Select a store to add to your route: </p>
            
                      <select id='locationSelectElement' style={{width:'75vw'}}>
            
                        {this.state.selectElementOptions}
            
                      </select>
            
                    </div>);
        }
    }

    getStoreListData(callbackFunction)
    {
        var request = new XMLHttpRequest();

        request.open("GET", "https://koreykitchen.github.io/Mileage-Calculator/SalesRoutesOcalaFL.xlsx", true);

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

        jsonStoreListData = jsonStoreListData.filter(storeObject => (storeObject.Name));

        jsonStoreListData = jsonStoreListData.sort((firstStore, secondStore) =>
                                    {
                                        var firstStoreName = firstStore.Name.toUpperCase();
                                        var secondStoreName = secondStore.Name.toUpperCase();

                                        var comparison = 0;

                                        if (firstStoreName > secondStoreName) 
                                        {
                                            comparison = 1;
                                        } 

                                        else if (firstStoreName < secondStoreName) 
                                        {
                                            comparison = -1;
                                        }

                                        return comparison;
                                    }
                                );

        this.setState({ storeListData: jsonStoreListData, dataHasBeenLoaded: true,
                         selectElementOptions: this.populateSelectElement()});
    }

    populateSelectElement()
    {
      return this.state.storeListData.map((storeObject, index) => 
                  {
                      if(storeObject.Name)
                      {
                        return (<option key={index} value={index}>
                                  {storeObject.Name + ' - ' + storeObject.Address +
                                    ' - ' + storeObject.City}
                                </option>);
                      }

                      else
                      {
                        return [];
                      }
                  });

    }

}

export default Data;

