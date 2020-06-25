var themes = ["SPL_THEME1","RPL_THEME1","SPL_THEME2","RPL_THEME2","SPL_THEME3","RPL_THEME3",
"SPL_THEME4", "RPL_THEME4", "SPL_THEMES", "RPL_THEMES"]

//"F_THEME1","F_THEME2", "F_THEME3", "F_THEME4"
var map;
var themesDefinitions ={
    "SPL_THEME1":"Sum of series for Socioeconomic",
    "RPL_THEME1":"Percentile ranking for Socioeconomic",
    "SPL_THEME2":"Sum of series for Household Composition",
    "RPL_THEME2":"Percentile ranking for Household Composition",
    "SPL_THEME3":"Sum of series for Minority Status/Language",
    "RPL_THEME3":"Percentile ranking for series for Minority Status/Language",
    "SPL_THEME4":"Sum of series for Housing Type/Transportation",
    "RPL_THEME4":"Percentile ranking for Housing Type/Transportation",
    "SPL_THEMES":"Sum of series themes", 
    "RPL_THEMES":"Overall percentile ranking for themes"
}

var colors = {
    "THEME1":"#3b4c22",
    "THEME2":"#8fa728",
    "THEME3":"#7a9263",
    "THEME4":"#4ba03d",
    "THEMES":"#000000",
    "publicTransit":"#000000"
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

//var countySVI = d3.csv("SVI2018_US_COUNTY.csv")
//var tractSVI = d3.csv("SVI2018_TRACT.csv")
var countyCentroids = d3.json("county_centroids.geojson")
//var covid = d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
var coverage30File=d3.csv("30_census_tract_hot_spot_and_SVI_for_county.csv")
var coverage50File=d3.csv("50_census_tract_hot_spot_and_SVI_for_county.csv")
var coverage70File=d3.csv("70_census_tract_hot_spot_and_SVI_for_county.csv")
var counties = d3.json("county_byState.geojson")

Promise.all([countyCentroids,coverage30File,coverage50File,coverage70File,counties])
.then(function(data){
    ready(data[0],data[1],data[2],data[3],data[4],data[5])
})


var centroids = null
var latestDate = null
var colors = {svi:"yellow",demand:"cyan",hotspot:"magenta"}
var coverageSet = ["coverage30","coverage50","coverage70","CoverageNotShown"]
var demandSet = ["svi","hotspot","demand"]

function ready(county_centroids,coverage30,coverage50,coverage70,counties){
    var coverage30Dict=turnToDict(coverage30,"County_FIPS")
    var coverage50Dict=turnToDict(coverage50,"County_FIPS")
    var coverage70Dict=turnToDict(coverage70,"County_FIPS")
    
   // centroids = formatCentroids(county_centroids.features)
    var combinedCoverage = combineCoverage(coverage30Dict,coverage50Dict,coverage70Dict)
    var combinedGeojson = combineGeojson(combinedCoverage,counties)
    drawKey("hotspot")
    drawMap(combinedGeojson)
};
function turnToDict(data,keyColumn){
    var newDict = {}
    for(var i in data){
        var key = data[i][keyColumn]
        var value = data[i]
        newDict[key]=value
    }
    return newDict
}
function combineCoverage(coverage30Dict,coverage50Dict,coverage70Dict){
    var newCoverageDict = {}
    var newCoverageArray = []
    for(var i in coverage30Dict){
        var countyFIPS = coverage30Dict[i]["County_FIPS"]
        var newEntry = coverage30Dict[i]
        newEntry["demand_covered_50"]=coverage50Dict[countyFIPS]["demand_covered_50"]
        newEntry["percentage_50"]=coverage50Dict[countyFIPS]["percentage_50"]
        newEntry["demand_covered_70"]=coverage70Dict[countyFIPS]["demand_covered_70"]
        newEntry["percentage_70"]=coverage70Dict[countyFIPS]["percentage_70"]
        newCoverageDict[countyFIPS]=newEntry
        newCoverageArray.push(newEntry)
    }
    //return newCoverageArray
    return newCoverageDict
}

function drawTable(ndx,svi){
    var table = new dc.DataTable('#table');
    var tDim = ndx.dimension(function(d){return d["covid_cases"]})
    table
        .dimension(tDim)
        .size(svi.length)
        .order(d3.descending)
        .sortBy(function(d) { return d["covid_cases"]; })
        .showSections(false)
    .columns([
                  {
                      label: 'FIPS',
                      format: function(d) {
                          return d["FIPS"];
                      }
                  },
                  {
                      label: 'STATE',
                      format: function(d) {
                          return d["STATE"];
                      }
                  },
                  {
                      label: 'COUNTY',
                      format: function(d) {
                          return d["COUNTY"];
                      }
                  },
                  {
                      label: 'CASES',
                      format: function(d) {
                          return d["covid_cases"];
                      }
                  },
                  {
                      label: '/100000',
                      format: function(d) {
                          return d["covid_deathsPer100000"];
                      }
                  },
                  {
                      label: 'SVI',
                      format: function(d) {
                          return d["SPL_THEMES"];
                      }
                  },
                  {
                      label: 'SVI%',
                      format: function(d) {
                          return d["RPL_THEMES"];
                      }
                  }
              ]);
          d3.select('#download')
              .attr("cursor","pointer")
              .on('click', function() {
                  console.log("download")
                  var data = tDim.top(Infinity);
                  if(d3.select('#download-type input:checked').node().value==='table') {
                      data = data.sort(function(a, b) {
                          return table.order()(table.sortBy()(a), table.sortBy()(b));
                      });
                      data = data.map(function(d) {
                          var row = {};
                          table.columns().forEach(function(c) {
                              row[table._doColumnHeaderFormat(c)] = table._doColumnValueFormat(c, d);
                          });
                          return row;
                      });
                  }
                  var blob = new Blob([d3.csvFormat(data)], {type: "text/csv;charset=utf-8"});
                  saveAs(blob, 'data.csv');
              });
}

function scatterPlot(ndx,w,h,x,y,xRange){
  
     d3.select("#scatter").append("div").attr("id",x)
    var scatter =  new dc.ScatterPlot("#"+x)
    var dimension = ndx.dimension(function(d){
        console.log(Object.keys(d))
        return [d[x],d[y]]
    })
    var group = dimension.group()
    scatter.width(w)
          .useCanvas(true)
        .height(h)
        .group(group)
        .dimension(dimension)
    .x(d3.scaleLinear().domain([-.01, xRange]))
    .y(d3.scaleLinear().domain([0, 35000]))
    .xAxisLabel(x)
    .yAxisLabel("Cases Per 100,000")
    .excludedOpacity(0.5)
    .colors(["#000000"])
    .on("filtered",function(){
        onFiltered(dimension.top(Infinity))
    })
}

function formatCovid(covid,svi){
   // console.log(covid)
    
    var covidByCounty = {}
    for (var i in svi){
        var gid = "_"+svi[i].FIPS
        covidByCounty[gid]=[]
    }
    var other = []
    for(var c in covid){
        var cases = covid[c].cases
        var fips = "_"+covid[c].fips
        var deaths = covid[c].deaths
        var date = covid[c].date
        if(fips==""||fips=="unkown"||covidByCounty[fips]==undefined){
            if(other.indexOf(covid[c].county)==-1){
                other.push(covid[c].county)
            }
        }else{
            covidByCounty[fips][date]={date:date,fips:fips,cases:cases,deaths:deaths}
        }
    }
    
    return covidByCounty
    
}
function formatCentroids(centroids){
    var formatted ={}
    for(var i in centroids){
        var geoid = centroids[i].properties.GEOID
        var coords = centroids[i].geometry.coordinates
        formatted[geoid]={lng:coords[0],lat:coords[1]}
    }
    return formatted
}
function formatDate(date){
            var d = new Date(date)
            var ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
            var mo = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(d)
            var da = ("0"+d.getUTCDate()).slice(-2)
    
            var formattedDate = ye+"-"+mo+"-"+da    
            return formattedDate
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function combineDatasets(svi,covid){
        
    var countiesWith = 0
    var countiesWithout = 0
    var formatted = {}
    for(var s in svi){
        var state = svi[s]["ST"]
        var county = "_"+String(svi[s].FIPS)
        var totalPop = parseInt(svi[s]["E_TOTPOP"])
        //console.log(covid[county])
        if(Object.keys(covid[county]).length==0 ){
            countiesWithout+=1
            svi[s]["covid_deaths"]=0
            svi[s]["covid_cases"]=0
            svi[s]["covid_deathsPer100000"]=0
            svi[s]["covid_casesPer100000"]=0
        }else{
            countiesWith+=1
            var countyEarliestDate = Object.keys(covid[county]).sort()[0]
            var countyLatestDate = Object.keys(covid[county]).sort()[Object.keys(covid[county]).length-1]
            
            var deaths = parseInt(covid[county][countyLatestDate].deaths)
            svi[s]["covid_deaths"]=deaths
            var cases = parseInt(covid[county][countyLatestDate].cases)
            svi[s]["covid_cases"]=cases
            svi[s]["population"]=totalPop
            svi[s]["covid_deathsPer100000"] = Math.round(deaths/(totalPop/100000)*10)/10
            svi[s]["covid_casesPer100000"] = Math.round(cases/(totalPop/100000))
            svi[s]["startDate"]
            svi[s]["endDate"]
            
        }
    }
    
    
    return svi
}
function onFiltered(data){
    var gids =[]
    var pop = 0
    var hu = 0
    var area = 0
    var deaths = 0
    var cases = 0
    
    for(var d in data){
        gids.push(data[d].FIPS)
        pop+=parseInt(data[d].E_TOTPOP)
        area+=parseInt(data[d].AREA_SQMI)
        hu+=parseInt(data[d].E_HU)
        cases+=parseInt(data[d]["covid_cases"])
        deaths+=parseInt(data[d]["covid_deaths"])
        
    }
    d3.select("#population").html("Containing "+numberWithCommas(pop)
        +" people <br>"+numberWithCommas(hu)+" households <br> in "+numberWithCommas(area)
        +" square miles <br>"
        +numberWithCommas(cases)+" cases <br>"
        +numberWithCommas(deaths)+" deaths")
    
    formatFilteredData(data)
    filterMap(gids)
}
function formatFilteredData(data){
    //console.log(data)
    var formatted = ""
    
}
function drawKey(demandType){
    
/*
  <defs><linearGradient id="Gradient1">
         <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1" />
               <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
             </linearGradient>
       </linearGradient>
     </defs>*/

    d3.selectAll("#keySvg").remove()
    var color = colors[demandType]
    console.log([demandType,color])
    var svg = d3.select("#key").append("svg").attr("width",300).attr("height",300).attr("id","keySvg")

    var defs = svg.append("defs");

    var gradient = defs.append("linearGradient")
       .attr("id", "svgGradient")
       .attr("x1", "0%")
       .attr("x2", "100%")
       .attr("y1", "0%")
       .attr("y2", "0%");

    gradient.append("stop")
       .attr('class', 'start')
       .attr("offset", "0%")
       .attr("stop-color", "white")
       .attr("stop-opacity", 1);

    gradient.append("stop")
       .attr('class', 'end')
       .attr("offset", "100%")
       .attr("stop-color", color)
       .attr("stop-opacity", 1);
   
    svg.append("rect")
    .attr("width",100)
    .attr("height",20)
    .attr("x",120)
    .attr("y",30)
    .attr("fill","url(#svgGradient)")
    
    svg.append("rect")
    .attr("width",100)
    .attr("height",20)
    .attr("x",120)
    .attr("y",60)
       .attr("opacity",.3)
    .attr("fill","url(#svgGradient)")
       
      svg.append("text").text("covered").attr("x",110).attr("y",40).attr("fill","white").attr("text-anchor","end")
      svg.append("text").text("notcovered").attr("x",110).attr("y",70).attr("fill","white").attr("text-anchor","end")
      svg.append("text").text("low").attr("x",120).attr("y",25).attr("fill","white")//.attr("text-anchor","end")
      svg.append("text").text("high").attr("x",220).attr("y",25).attr("fill","white").attr("text-anchor","end")

}
function drawlayerControl(map){

    var w = 50
    var h  =20
    var m = 120
    
    var fillOpacity = {
        coverage70:{property:"demand_covered_70",stops:[[0,0.3],[1,.7]]},
        coverage50:{property:"demand_covered_50",stops:[[0,0.3],[1,.7]]},
        coverage30:{property:"demand_covered_30",stops:[[0,0.3],[1,.7]]},
        CoverageNotShown:{property:"demand_covered_30",stops:[[0,.7],[1,.7]]}
    }
    var fillColor = {
        svi:{property:"RPL_THEMES_State",stops:[[0,"white"],[1,colors["svi"]]]},
        hotspot:{property:"hot_spot",stops:[[0,"white"],[.5,colors["hotspot"]]]},
        demand:{property:"total_demand_of_county",stops:[[0,"white"],[100,colors["demand"]]]}
    }
    
    
    var svg = d3.select("#layerControl").append("svg").attr("width",300).attr("height",300)
    for(var i in coverageSet){
        svg.append("text")
              .text(coverageSet[i].split("_").join(" "))
              .attr("class",coverageSet[i])
              .attr("x",0).attr("y",i*h)
              .attr("transform","translate("+(m-10)+","+(m/2+h/2)+")")
              .attr("text-anchor","end").attr("fill","rgba(255,255,255,.8)")
      
        for(var j in demandSet){
            if(j==0){
                svg.append("text")
                .text(demandSet[i])
                .attr("class",demandSet[i])
                .attr("x",i*w).attr("y",20)
                .attr("transform","translate("+(m+w/2)+","+(m/2-30)+")")
                .attr("fill","#fff")
                .attr("text-anchor","middle")
            }
            var id = demandSet[j]+"_"+coverageSet[i]
          //  console.log(id)
            svg.append("rect").attr("id",id)
            .attr("width",w-2).attr("height",h-2)
            .attr("x",j*w).attr("y",i*h)
                .attr("fill","#fff")
                .attr("opacity",.4)
            .attr("transform","translate("+m+","+m/2+")")
            .style("cursor","pointer")
            .on("click",function(){
                d3.selectAll("rect").attr("opacity",.4)
                d3.select(this).attr("opacity",1)
                var id = d3.select(this).attr("id")
                var demand = id.split("_")[0]
                var coverage = id.split("_")[1]
                map.setPaintProperty("county_boundary", 'fill-color',fillColor[demand])
                map.setPaintProperty("county_boundary", 'fill-opacity',fillOpacity[coverage])
                
                drawKey(demand)
            })
        }
    }
}

function combineGeojson(combinedCoverage,counties){
    for(var c in counties.features){
        var countyFIPS = counties.features[c].properties.FIPS
        var coverage = combinedCoverage[countyFIPS]
        
        for(var i in coverage){
            var key = i
            if(isNaN(parseFloat(value))!=true){
                var value = parseFloat(coverage[i])
            }else{
                var value = coverage[i]
            }
            counties.features[c].properties[key]=value
        }
    }
    return counties
}

function zoomToBounds(map){
    //https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
    //49.500739, -63.994022
    //26.829656, -123.232303

    var bounds =  new mapboxgl.LngLatBounds([-123.232303, 26.829656], 
[-63.994022, 49.500739]);
    map.fitBounds(bounds,{padding:20},{bearing:0})
  //  map.fitBounds(bounds,{padding:20})
	//zoomToBounds(map,boundary)
     
}

function drawMap(data){
	mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    
    
    var bounds = [
    [-74.1, 40.6], // Southwest coordinates
    [-73.6, 40.9] // Northeast coordinates
    ];
   
    map = new mapboxgl.Map({
         container: 'map',
 		style: "mapbox://styles/jjjiia123/ckbk129k80bdw1invwo4rmdx8",
 		center:[-96,39],
         zoom: 4,
         preserveDrawingBuffer: true,
        minZoom:3//,
       // maxBounds: bounds    
     });
     map.on("load",function(){
         drawlayerControl(map)
         zoomToBounds(map)
         d3.select("#hotspot_coverage30").attr("opacity",1)
        // console.log(map.getStyle().layers)
      //   map.setLayoutProperty("counties", 'visibility', 'none')
         
         map.addSource("counties_2",{
             "type":"geojson",
             "data":data
         })
         
         map.addLayer({
             'id': 'county_boundary',
             'type': 'fill',
             'source': 'counties_2',
             'paint': {
             'fill-color': {
                 property:"hot_spot",
                 stops:[[0,"white"],[.5,"magenta"]]
             },
             'fill-opacity':{
                 property:"demand_covered_30",
                 stops:[[0,0.3],[1,.7]]
             }
             },
             'filter': ['==', '$type', 'Polygon']
         });
    
         
     })
     
     //popup
     var popup = new mapboxgl.Popup({
     closeButton: false,
     closeOnClick: false
     });     
   /*
     map.on('mousemove', 'counties', function(e) {
            // Change the cursor style as a UI indicator.
            var countyCovidData = covid["_"+e.features[0].properties.FIPS]
          //  console.log(countyCovidData)
            var dates = Object.keys(countyCovidData)
            var countyLatestDate = dates.sort()[dates.length-1]
            var cases = countyCovidData[countyLatestDate].cases
            var deaths = countyCovidData[countyLatestDate].deaths
            
            map.getCanvas().style.cursor = 'pointer'; 
            var coordinates = e.features[0].geometry.coordinates.slice().slice();
            var description = e.features[0].properties.LOCATION+"<br>SVI: "
            +e.features[0].properties["SPL_THEMES"]+"<br>SVI PERCENTILE: "
            +e.features[0].properties["RPL_THEMES"]
            +"<br>"+cases+" total cases<br>last recorded on "+countyLatestDate; 
            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }
            var coordinatesFormatted = {lat:coordinates[0][0][1],lng:coordinates[0][0][0]}
            coordinatesFormatted = centroids[e.features[0].properties.FIPS]
            // Populate the popup and set its coordinates
            // based on the feature found.
            popup
            .setLngLat(coordinatesFormatted)
            .setHTML(description)
            .addTo(map);
        });
        map.on('mouseleave','counties', function(e) {
            popup.remove()
        })
   */
   
}

function filterMap(gids){
  //  console.log(gids)
  var filter = ['in',["get",'FIPS'],["literal",gids]];
	map.setFilter("counties",filter)
}

function covidBarChart(column,ndx,height,width){
    var max = 0
    var min = 0

    var columnDimension = ndx.dimension(function (d) {
        if(parseFloat(d[column])>max){
            max = d[column]
        }
        if(column=="covid_casesPer100000"){
            return d[column]
        }
         if(d[column]!=-999){
            return Math.round(d[column]*100)/100;
        }    
    });
  

    var columnGroup = columnDimension.group();
        
    var divName = column.split("_")[1]
    
    var color = colors[divName]
    
    var barDiv = d3.select("#"+divName).append("div").attr("id",column).style("width",width+"px").style("height",(height+30)+"px")
    
    d3.select("#"+column).append("text").attr("class","reset")
        .on("click",function(){
            chart.filterAll();
            dc.redrawAll();
        })
        .style("display","none")
        .text("reset")
        .attr("cursor","pointer")
    
    barDiv.append("span").attr("class","reset")
    barDiv.append("span").attr("class","filter")

    var chart = dc.barChart("#"+column);
    chart.on("filtered",function(){
        onFiltered(columnDimension.top(Infinity))
    })
    
    d3.select("#"+column).append("div").attr("class","chartName").html(themesDefinitions[column]).style("color",color)
    d3.select("#"+divName).style("color",color)
    max = max+1
    chart.elasticY(false)
    chart.y(d3.scale.pow().domain([0,100]))
    
    chart.width(width)
            .height(height)
            .margins({top: 10, right: 20, bottom: 30, left: 40})
            .dimension(columnDimension)
            .group(columnGroup)
          // .centerBar(true)
            .gap(0)
            //.elasticY(true)
            .xUnits(function(){return Math.abs(Math.round(max-min))*100;})
            .x(d3.scale.linear().domain([min,max]))
            .xAxis()
            .ticks(10)

            chart.colorAccessor(function (d, i){return d.value;})
            .colors(d3.scale.linear().domain([0,10]).range(["rgba(255,0,0,.1)",'rgba(255,0,0,.5)']))
      
        
        chart.yAxis()
            .ticks(0);
      chart.on("preRedraw", function (chart) {
          chart.rescale();
      });
      chart.on("preRender", function (chart) {
          chart.rescale();
      });		
}


function barChart(divName, column,ndx,height,width){
    var max = 0
    var min = 0

    var columnDimension = ndx.dimension(function (d) {
        if(parseFloat(d[column])>max){
            max = parseFloat(d[column])
        } 
        return parseFloat(d[column])
    });
  
      console.log([max,min])

    var columnGroup = columnDimension.group();
        
    //var divName = column.split("_")[1]
    
    var color = colors[divName]
    
    var barDiv = d3.select("#"+divName).append("div").attr("id",column).style("width",width+"px").style("height",(height+30)+"px")
    
    d3.select("#"+column).append("text").attr("class","reset")
        .on("click",function(){
            chart.filterAll();
            dc.redrawAll();
        })
        .style("display","none")
        .text("reset")
        .attr("cursor","pointer")
    
    barDiv.append("span").attr("class","reset")
    barDiv.append("span").attr("class","filter")

    var chart = dc.barChart("#"+column);
    chart.on("filtered",function(){
        onFiltered(columnDimension.top(Infinity))
    })
    
    d3.select("#"+column).append("div").attr("class","chartName").html(themesDefinitions[column]).style("color",color)
        d3.select("#"+divName).style("color",color)
    
    chart.width(width)
            .height(height)
            .margins({top: 10, right: 20, bottom: 30, left: 40})
            .dimension(columnDimension)
            .group(columnGroup)
          // .centerBar(true)
            .gap(0)
            .elasticY(true)
            .xUnits(function(){return Math.abs(Math.round(max-min))*100;})
            .x(d3.scaleLinear().domain([min,max]))
            .xAxis()
            .ticks(10)
        
        chart.yAxis()
            .ticks(2);
      chart.on("preRedraw", function (chart) {
          chart.rescale();
      });
      chart.on("preRender", function (chart) {
          chart.rescale();
      });		
}
function rowChart(divName,column, ndx,height,width,topQ,color){
    d3.select("#"+divName).style("width",width+"px").style("height",height+"px")
    var chart = dc.rowChart("#"+divName);

    var columnDimension = ndx.dimension(function (d) {
        return d[column];
    });
    var columnGroup = columnDimension.group();
    chart.on("filtered",function(){
        onFiltered(columnDimension.top(Infinity))
       // moveMap(columnDimension.top(Infinity))
    })
    chart.width(width)
        .height(height)
        .margins({top: 0, left: 250, right: 10, bottom: 20})
        .group(columnGroup)
        .dimension(columnDimension)
    	.labelOffsetX(-240)
    	.labelOffsetY(12)
    	//.data(function(agencyGroup){return columnGroup.top(topQ)})
    	.ordering(function(d){ return -d.value })
        .ordinalColors([color])
        .label(function (d) {
            return d.key+": "+ d.value+ " counties";
        })
        // title sets the row text
        .title(function (d) {
            return d.value;
        })
        .gap(2)
        .elasticX(true)
        .xAxis().ticks(4)
}
function dataCount(dimension,group){
    dc.dataCount(".dc-data-count")
        .dimension(dimension)
        .group(group)
        // (optional) html, for setting different html for some records and all records.
        // .html replaces everything in the anchor with the html given using the following function.
        // %filter-count and %total-count are replaced with the values obtained.
        .html({
            some:"%filter-count selected out of <strong>%total-count</strong> counties | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
            all:"All  %total-count counties selected."
        })
        
}

//#### Version
//Determine the current version of dc with `dc.version`
d3.selectAll("#version").text(dc.version);
