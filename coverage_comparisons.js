$(document).ready(function() {
    $('.js-example-basic-single').select2();
});

//"F_THEME1","F_THEME2", "F_THEME3", "F_THEME4"
var map;
var detailMap;
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
var currentCapacity = 30
var pub = {
    coverage:"base_case_capacity_"+currentCapacity,
    aiannh:false,
    prison:false,
    satellite:false,
    tract_svi:false,
    all:null,
    centroids:null,
    histo:null,
    pair:"SVI_popXXXSVI_hotspot"
}
var highlightColor = "#DF6D2A"
var bghighlightColor = "gold"
var outlineColor = "#DF6D2A"
var colors = {
hotspot:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
SVI:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
hotspotSVI:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
highDemand:["#A7DCDF","#6EAFC3","#3983A8","#02568B"]}

var minCoverage = 10
var maxCoverage = 80
var coverageInterval = 10

var colorEnd = "#6FAFC4"
var colorStart = "#E27C3B"
//var colorStart = "#FBD33C"
var colorStart = "#604F23"

//"priority_high_demand","priority_SVI_hotspot","priority_SVI_pop","priority_hotspot"

var keyColors = {high_demand:"#EA00FF",SVI_hotspot:"#F45180",SVI_pop:"#45B6A3",hotspot:"#7E6EFF",SVI_high_demand:"#71BF4D"}




var colorGroups = ["#8DC63F","#9FCF8B","#B2D8D6","#47823B","#5A8B71","#6C93A7","#003E38","#134658","#274F78"]

var colorGroups = ["#B2D8D6","#6C93A7","#274F78","#9FCF8B","#5A8B71","#134658","#8DC63F","#47823B","#003E38"]
var colorGroups = ["#003E38","#134658","#274F78","#47823B","#5A8B71","#6C93A7","#8DC63F","#9FCF8B","#B2D8D6"]

var colorGroups = ["#FF8608","#D8AF6F","#B2D8D6","#CA6C19","#9B8060","#6C93A7","#94512A","#5D5051","#274F78"]


var colorGroups = ["#DDDDD7","#91B3C4","#4488B2","#EED66C","#88B078","#228983","#FFCE00","#80AC2A","#008954"]

var colorGroups = ["#FDECB2","#CED9C4","#CFDEDF","#FCE477","#9EBD9C","#9FC6D2","#FADB3C","#6DA173","#6FAFC4"]
var colorGroups = ["rgba(250,219,60,.4)","rgba(136,176,120,.4)","rgba(75,142,191,.4)","rgba(250,219,60,.7)","rgba(136,176,120,.7)","rgba(75,142,191,.7)","rgba(250,219,60,1)","rgba(136,176,120,1)","rgba(75,142,191,1)"]
var colorGroups = [
"rgba(75,142,191,1)","rgba(75,142,191,.7)","rgba(75,142,191,.4)",
"rgba(136,176,120,1)","rgba(136,176,120,.7)","rgba(136,176,120,.4)",
"rgba(250,219,60,1)","rgba(250,219,60,.7)","rgba(250,219,60,.4)"
]
//var colorGroups = ["#FDD6B9","#DBCEC5","#B8C5D1","#FCAE74","#B79D8C","#718BA4","#F77A26","#91664E","#2A5176"]
//
// var pStops = [[0,.33],[.34,.66],[.67,1]]
// var cStops = [[0,33],[34,66],[67,100]]

    
var pStops = [[0,.34],[.34,.67],[.67,1]]
var cStops = [[0,34],[34,67],[67,100]]

var groupColorDict = []
for(var g =0; g<colorGroups.length; g++){
    groupColorDict.push("_"+String(g+1))
    groupColorDict.push(colorGroups[g])
}
groupColorDict.push("#eee")

function histo(){
var histo = d3.histogram()
    .value(function(d){
        if(d.properties[pub.strategy+"_"+pub.coverage+"_group"]==undefined){
            return 999
        }else{
            return d.properties[pub.strategy+"_"+pub.coverage+"_group"]//.replace("_","")
        }
    })
    .domain([1,10])
    .thresholds(9)
        
var bins = histo(pub.all.features)
    return bins
}

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var countyCentroids = d3.json("county_centroids.geojson")
var counties = d3.json("counties.geojson")
var aiannh = d3.json("indian_reservations.geojson")
var allData = d3.csv("County_level_coverage_for_all_policies_and_different_base_case_capacity_07152020.csv")
//var allData = d3.csv("https://media.githubusercontent.com/media/CenterForSpatialResearch/allocating_covid/master/Output/County_level_coverage_for_all_policies_and_different_base_case_capacity.csv")

var allData =d3.csv("https://raw.githubusercontent.com/CenterForSpatialResearch/allocation_chw/master/Output/County_level_coverage_for_all_policies_and_different_base_case_capacity.csv")
var timeStamp = d3.csv("https://raw.githubusercontent.com/CenterForSpatialResearch/allocation_chw/master/Output/time_stamp.csv")
//var prioritySet = ["priority_high_demand","priority_SVI_hotspot","priority_SVI_pop","priority_hotspot"]

var coverageSet = []
var coverageDisplayText = {show_all:"Hide Coverage Info"}
for(var c = 1; c<=8; c++){
    var setTerm = "base_case_capacity_"+c*10
     coverageSet.push(setTerm)
    coverageDisplayText[setTerm] = c*10+' CHW per 100,000 People'
 }

//var measureSet = ["percentage_scenario_SVI_pop","percentage_scenario_SVI_hotspot","percentage_scenario_hotspot","percentage_scenario_high_demand"]
 var measureSet = ["percentage_scenario_SVI_high_demand","percentage_scenario_SVI_pop","percentage_scenario_SVI_hotspot","percentage_scenario_hotspot","percentage_scenario_high_demand"]
 var measureDisplayText = {
     percentage_scenario_high_demand:"new cases",
     percentage_scenario_SVI_high_demand:"SVI + new cases",
     percentage_scenario_hotspot:"new cases per capita",
     percentage_scenario_SVI_pop:"SVI",
     percentage_scenario_SVI_hotspot:"SVI + new cases per capita"
 }
Promise.all([counties,aiannh,countyCentroids,allData,timeStamp])
.then(function(data){
    ready(data[0],data[1],data[2],data[3],data[4])
})

var lineOpacity = {stops:[[0,1],[100,0.3]]}
var lineWeight = {stops:[[-1,0],[-0.01,0],[0,2],[99,.5],[100,0]]}

var fillColor = {
        property:null,
        stops:[
            [0,"#A7DCDF"],
            [.005,"#6EAFC3"],
            [.03,"#3983A8"],
            [.1,"#02568B"]]
        }

var centroids = null
var latestDate = null

function ready(counties,aiannh,centroids,modelData,timeStamp){
    d3.select("#date").html("Model run as of "+timeStamp["columns"][1])
    var processed = turnToDictFIPS(modelData,"County_FIPS")
    var comparisonsKeys = processed[1]
   // console.log(comparisonsKeys)
    var dataByFIPS = processed[0]
    var combinedGeojson = combineGeojson(dataByFIPS,counties)
    pub.all = combinedGeojson
    drawMap(combinedGeojson,comparisonsKeys)
   
};


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
//var comparisonsSet = []
function turnToDictFIPS(data,keyColumn){
//var prioritySet = ["priority_high_demand","priority_SVI_hotspot","priority_SVI_pop","priority_hotspot"]
    
    var minCoverage = 10
    var maxCoverage = 80
    var coverageInterval = 10
    

    var newDict = {}
    var maxPriority = 0
    var keys = Object.keys(data[0])

    for(var i in data){
        var key = String(data[i][keyColumn])
        if(key.length==4){
            key= "0"+key
        }

        var newKeys = []

        newDict[key]={}
        
        for(var c = minCoverage; c<=maxCoverage; c+=coverageInterval){
         
            // var values = data[i]
            for(var j in measureSet){
                var k1 = (measureSet[j]+"_base_case_capacity_"+c)//.replace("percentage_scenario_","percentage_scenario_")
                var v1 = parseFloat(data[i][k1])
                newDict[key][k1]=v1
                for(var k in measureSet){
                    var k2 = (measureSet[k]+"_base_case_capacity_"+c)//.replace("percentage_scenario_","percentage_scenario_")
                    var v2 = parseFloat(data[i][k2])
                    var index1 = j
                    var index2 = k
                    if(index1!=index2){
                        if(index1<index2){
                                var compareKey = "compare_"+k1+"_"+k2
                                var trackingKey = measureSet[j].replace("percentage_scenario_","")
                                    +"XXX"+measureSet[k].replace("percentage_scenario_","")
                                    newDict[key][compareKey]=v1-v2
                            
                                if(newKeys.indexOf(trackingKey)==-1){
                                    newKeys.push(trackingKey)                            
                                }
                            }else{
                                var compareKey = "compare_"+k2+"_"+k1
                                var trackingKey = measureSet[k].replace("percentage_scenario_","")
                                    +"XXX"+measureSet[j].replace("percentage_scenario_","")
                                    newDict[key][compareKey]=v2-v1
                                
                                if(newKeys.indexOf(trackingKey)==-1){
                                    newKeys.push(trackingKey)                            
                                }
                            }
                    }
                }
            }
        }
    }
    var comparisonsSet = newKeys
    return [newDict,comparisonsSet]
}

function combineGeojson(all,counties){
    for(var c in counties.features){
        var countyFIPS = counties.features[c].properties.FIPS
        var data = all[countyFIPS]
       // console.log(data)
        
        counties.features[c]["id"]=countyFIPS
        
        if(data!=undefined){            
            var keys = Object.keys(data)
            for(var k in keys){
                var key = keys[k]
                if(isNaN(parseFloat(value))!=true && key!="County_FIPS"){
                     var value = parseFloat(data[key])
                 }else{
                     var value = data[key]
                 }
                counties.features[c].properties[key]=value
            }
        }
    }
    return counties
}

function drawGrid(map,comparisonsSet){
    var drawn = []
    var svg = d3.select("#comparisonGrid").append("svg").attr("width",250).attr("height",260)
    var gridSize = 18
    for(var i in measureSet){
        
            var x = i*gridSize+160
            var y = 130
        
                svg.append("text")
                .text(measureDisplayText[measureSet[i]])
                .attr("x",x)
                .attr("y",y)
                .attr("transform","rotate(-90 "+x+","+y+")")
        
        for(var j in measureSet){
            if(i==0){
                svg.append("text")
                .text(measureDisplayText[measureSet[j]])
                .attr("x",i)
                .attr("y",j*gridSize+gridSize/2)
                .attr("transform","translate(140,140)")
                .attr("text-anchor","end")
            }
            
            if(j!=i){
                if(i<j){
                    var key = measureSet[i].replace("percentage_scenario_","")
                    +"XXX"+measureSet[j].replace("percentage_scenario_","")
                }else{
                    var key = measureSet[j].replace("percentage_scenario_","")
                    +"XXX"+measureSet[i].replace("percentage_scenario_","")
                }
                if(comparisonsSet.indexOf(key)>-1 && drawn.indexOf(key)==-1){
                    svg.append("rect")
                        .attr("width",gridSize-4)
                        .attr("height",gridSize-4)
                        .attr("x",gridSize*j)
                        .attr("y",gridSize*i)
                        .attr("id",key)
                        .attr("class","grid")
                        .attr("transform","translate(150,140)")
                        .attr("cursor","pointer")
                        .on("click",function(){
                            var id = d3.select(this).attr("id")
                          //  var key = "compare_"+id.split("XXX")[0]+"_"+currentCapacity+"_"+id.split("XXX")[1]+"_"+currentCapacity
                            pub.pair = id
                            colorMap(map,id)
                            d3.selectAll(".grid").attr("fill","black")
                            d3.select(this).attr("fill","gold")
                            
                            drawKey(d3.select(this).attr("id"))
                        })
                        drawn.push(key)
                    }else{
                    svg.append("rect")
                        .attr("width",gridSize-6)
                        .attr("height",gridSize-6)
                        .attr("x",gridSize*j)
                        .attr("y",gridSize*i)
                        .attr("transform","translate(150,140)")
                        .attr("fill","none")
                        .attr("stroke","#ddd")
                    }
            }else{
                    svg.append("rect")
                        .attr("width",gridSize-6)
                        .attr("height",gridSize-6)
                        .attr("x",gridSize*j)
                        .attr("y",gridSize*i)
                        .attr("transform","translate(150,140)")
                        .attr("fill","none")
                        .attr("stroke","#ddd")
            }
        }
    }
}
function drawKey(key){
    d3.select("#comparisonKey svg").remove()
    // compare_percentage_scenario_
  //   high_demand
  //   _base_case_capacity_30_percentage_scenario_
  //   SVI_pop
  //   _base_case_capacity_30
    var k1 = key.split("XXX")[0]//.replace("_base_case_capacity_"+currentCapacity,"")
    var k2 = key.split("XXX")[1]//.replace("_base_case_capacity_"+currentCapacity,"")
   // console.log([k1,k2])
    var svg = d3.select("#comparisonKey").append("svg")
        .attr("width",750).attr('height',80)
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
       .attr("stop-color", keyColors[k1])
       .attr("stop-opacity", 1);

    gradient.append("stop")
       .attr('class', 'end')
       .attr("offset", "30%")
       .attr("stop-color", "white")
       .attr("stop-opacity", 1);
    gradient.append("stop")
       .attr('class', 'end')
       .attr("offset", "70%")
       .attr("stop-color", "white")
       .attr("stop-opacity", 1);
    gradient.append("stop")
       .attr('class', 'end')
       .attr("offset", "100%")
       .attr("stop-color", keyColors[k2])
       .attr("stop-opacity", 1);
    svg.append("text").text("Higher % of needs met when prioritizing by".toUpperCase()).attr("y",18).attr("x",20)
       .attr("fill","#000").style("font-size","12px").style("font-weight","bold")
       
    svg.append("text").text("Higher % of needs met when prioritizing by".toUpperCase()).attr("y",18).attr("x",720)
       .attr("fill","#000").style("font-size","12px").attr("text-anchor","end").style("font-weight","bold")

    svg.append("text").text(measureDisplayText["percentage_scenario_"+k1].toUpperCase()).attr("y",40).attr("x",20).style("font-size","12px").style("font-weight","bold")//.attr("fill",keyColors[k1])
    svg.append("text").text(measureDisplayText["percentage_scenario_"+k2].toUpperCase()).attr("y",40).attr("x",720).style("font-size","12px").style("font-weight","bold").attr("text-anchor","end")//.attr("fill",keyColors[k2])
    svg.append("text").text("no difference".toUpperCase()).attr("y",75).attr("x",370).attr("text-anchor","middle").style("font-size","12px").style("font-weight","bold")
    svg.append("rect")
    .attr("class","key")
    .attr('width',700)
    .attr('height',10)
    .attr("x",20)
    .attr("y",50)
    .attr("fill","url(#svgGradient)")
       .attr("stroke","rgba(0,0,0,.5)")
       .attr("stroke-width",.1)
    
    
}
function colorMap(map,key){
    //console.log(key)
   // console.log(currentCapacity)
    var measureStart = key.split("XXX")[0]
    var measureEnd = key.split("XXX")[1]
    var colorStart = keyColors[measureStart]
    var colorEnd = keyColors[measureEnd]
    var dataProperty = "compare_percentage_scenario_"+measureStart+"_base_case_capacity_"
    +currentCapacity+"_percentage_scenario_"+measureEnd+"_base_case_capacity_"+currentCapacity
    
   // console.log(dataProperty)
    var color = {property:dataProperty,stops:[[-1,colorEnd],[0,"#fff"],[1,colorStart]]}
    map.setPaintProperty("counties", 'fill-color', color)  
    
}
function drawMap(data,comparisonsKeys){
//	mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkbCIsImEiOiJkOGM1ZDc0ZTc5NGY0ZGM4MmNkNWIyMmIzNDBkMmZkNiJ9.Qn36nbIqgMc4V0KEhb4iEw';    
    mapboxgl.accessToken = "pk.eyJ1IjoiYzRzci1nc2FwcCIsImEiOiJja2J0ajRtNzMwOHBnMnNvNnM3Ymw5MnJzIn0.fsTNczOFZG8Ik3EtO9LdNQ"//new account
 var maxBounds = [
 [-190,8], // Southwest coordinates
 [-20, 74] // Northeast coordinates
 ];
var bounds = [[-130, 26], 
     [-40, 50]
 ]
 map = new mapboxgl.Map({
      container: 'map',
    // style:"mapbox://styles/c4sr-gsapp/ckcl1av4c083d1irpftb75l6j",//dare
     style:"mapbox://styles/c4sr-gsapp/ckcnnqpsa2rxx1hp4fhb1j357",//dare2
	//style: "mapbox://styles/sidl/ckbsbi96q3mta1hplaopbjt9s",
	//style:"mapbox://styles/c4sr-gsapp/ckc4s079z0z5q1ioiybc8u6zp",//new account
     //center:[-100,37],
     bounds:bounds,
      zoom: 3.8,
      preserveDrawingBuffer: true,
     minZoom:3.5,
    maxBounds: maxBounds    
  });
    
     map.on("load",function(){        
         zoomToBounds(map)
         //map.setLayoutProperty("mapbox-satellite", 'visibility', 'none');
         map.addSource("counties",{
             "type":"geojson",
             "data":data
         })
         
         map.addLayer({
             'id': 'county_outline',
             'type': 'line',
             'source': 'counties',
             'paint': {
                 'line-color':"#000",
                 'line-opacity':[
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    .05
                 ],
                 'line-width':[
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    2,
                    1
                 ]
             },
             'filter': ['==', '$type', 'Polygon']
         },"ST-OUTLINE");
               //    },"country-label");
         map.addLayer({
             'id': 'counties',
             'type': 'fill',
             'source': 'counties',
             'paint': {
             'fill-color': "#fff",
                 'fill-opacity':.05
             },
             'filter': ['==', '$type', 'Polygon']
         },"county_outline");
         
         
         drawGrid(map,comparisonsKeys)
         coverageMenu(map)
         colorMap(map,pub.pair)
         d3.select("#"+pub.pair).attr("fill","gold")
         drawKey(pub.pair)
         //var color = {property:"priority_high_demand",stops:[[-1,0],[0,1]]}
         
         //map.setPaintProperty("counties","fill-opacity",{property:"percentage_scenario_hotspot_base_case_capacity_30",stops:[[-1,0],[0,1]]})
         
         var filter = ["!=","percentage_scenario_SVI_hotspot_base_case_capacity_"+currentCapacity,-1]
         map.setFilter("counties",filter)
         
        //lineOpacity["property"]=pub.strategy+"_"+pub.coverage
       // lineWeight["property"]=pub.strategy+"_"+pub.coverage
        //fillColor["property"]=pub.pai
     
         map.setPaintProperty("counties", 'fill-opacity',1)
        // map.setPaintProperty("counties", 'fill-color',fillColor)
              var matchString = ["match",["get",pub.strategy+"_"+pub.coverage+"_group"]].concat(groupColorDict)
              //console.log(matchString)
              
             //  map.setPaintProperty("counties", 'fill-color', matchString)  
         
        d3.select("."+pub.coverage+"_radialC").style("background-color",highlightColor).style("border","1px solid "+ highlightColor)
        d3.selectAll("."+pub.coverage).style("color",highlightColor)
        d3.selectAll("."+pub.strategy).style("color",highlightColor)
        d3.selectAll("."+pub.strategy+"_radialS").style("background-color",highlightColor).style("border","1px solid "+ highlightColor)
          
     })

    
     var popup = new mapboxgl.Popup({
         closeButton: false,
         closeOnClick: false
     });     
      var hoveredStateId = null;
     
     var firstMove = true
                  
     map.on('mousemove', 'counties', function(e) {
         var feature = e.features[0]
         map.getCanvas().style.cursor = 'pointer'; 
         if(feature["properties"].FIPS!=undefined){
             
             if (hoveredStateId) {
             map.setFeatureState(
             { source: 'counties', id: hoveredStateId },
             { hover: false }
             );
             }
             hoveredStateId = e.features[0].id;
             map.setFeatureState(
             { source: 'counties', id: hoveredStateId },
             { hover: true }
             );
             
             
             var x = event.clientX;     // Get the horizontal coordinate
             var y = event.clientY;             
             
             var x = event.clientX+20;     // Get the horizontal coordinate
             var y = event.clientY+20;             
             var w = window.innerWidth;
             var h = window.innerHeight;
             if(x+200>w){
                 x = x-280
             }
             if(y+300>h){
                 y= y-320
             }
              d3.select("#mapPopup").style("visibility","visible")
              .style("left",x+"px")
              .style("top",(y+20)+"px") 
             
             var countyName = feature["properties"]["county"]+" County, "+feature["properties"]["stateAbbr"]
             var population = feature["properties"]["totalPopulation"]
             var geometry = feature["geometry"]
             var countyId = feature["properties"]["FIPS"]
             
             var displayString = countyName+"<br>Population: "+population
             
             var chartData = []
                         //
              for(var p in measureSet){
                  var pk = measureSet[p]+"_base_case_capacity_"+currentCapacity
                  var pv = feature["properties"][pk]
                 // displayString+=pk+": "+pv+"<br>"
                  chartData.push({axis:pk,value:pv})
              }
             d3.select("#mapPopup").html(displayString+"<br><br> % of needs met for each policy: ".toUpperCase())
             drawChart(chartData)
         }       
         
         map.on("mouseleave",'counties',function(){
             d3.select("#mapPopup").style("visibility","hidden")

         })  
     
         var coordinates = geometry.coordinates[0]
         
         var bounds = coordinates.reduce(function(bounds, coord) {
                 return bounds.extend(coord);
             }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      

     });
    
}
function drawChart(data){
    var xScale = d3.scaleLinear().domain([0,100]).range([2,180])
    var svg = d3.select("#mapPopup").append("svg").attr("class","chart").attr("width",200).attr("height",160)
    svg.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("width",function (d,i){
        return xScale(d.value)
    })
    .attr("height",10)
    .attr("x",10)
    .attr("y",function(d,i){return i*30+20})
    .attr("fill", function (d,i){
        return keyColors[d.axis.replace("percentage_scenario_","").replace("_base_case_capacity_"+currentCapacity,"")]
    })
    
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function (d,i){

            return measureDisplayText[d.axis.replace("_base_case_capacity_"+currentCapacity,"")]
        })
        .attr("x",10)
        .attr("y",function(d,i){return i*30+10})
    
    svg.selectAll(".textValue")
        .data(data)
        .enter()
        .append("text")
        .text(function (d,i){
            return Math.round(d.value)+"%"
        })
        .attr("x",10)
        .attr("y",function(d,i){return i*30+20})
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function coverageMenu(map){
    var w = 250
    var h = 200
    var svg = d3.select("#coverageMenu").append("svg").attr("width",w).attr("height",h)
    var startCoverage = pub.coverage.split("_")[3]
    var coverageDisplay = svg.append("text").text(startCoverage).style("font-size","70px").attr("x",40).attr("y",80)
    var plus = svg.append("text").text("+10").style("font-size","14px").attr("x",130).attr("y",40).style("font-weight","bold")
    .style('cursor',"pointer")
    
    .on("click",function(){
        var newCoverage = parseInt(pub.coverage.split("_")[3])+10
        if(newCoverage>80){
            newCoverage=80
        }
        currentCapacity = newCoverage
        if(newCoverage <=80){
            var key = pub.pair.split(parseInt(pub.coverage.split("_")[3])).join(newCoverage)
            pub.pair = key
            pub.coverage = pub.coverage.replace(pub.coverage.split("_")[3],newCoverage)
            coverageDisplay.text(newCoverage)
            minus.attr("fill","#000")
            colorMap(map,key)
        }
        if(newCoverage==80){
            d3.select(this).attr("fill","#aaa")
        }
        
    })
    
    var minus = svg.append("text").text("-10").style("font-size","14px").attr("x",130).attr("y",80).style("font-weight","bold")
    .style('cursor',"pointer")
        .on("click",function(){
            var newCoverage = parseInt(pub.coverage.split("_")[3])-10
            if(newCoverage<10){
                newCoverage=10
            }
        currentCapacity = newCoverage
            
            if(newCoverage >=10){
                var key = pub.pair
                
                pub.coverage = pub.coverage.replace(pub.coverage.split("_")[3],newCoverage)
                coverageDisplay.text(newCoverage)
                plus.attr("fill","#000")
                colorMap(map,key)
            }
            if(newCoverage==10){
                d3.select(this).attr("fill","#aaa")
            }
        })
    
    svg.append("text").text("CHW per 100,000 Residents").style("font-size","12px").attr("x",30).attr("y",120)
  
}
function zoomToBounds(mapS){
    //https://docs.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
    var bounds =  new mapboxgl.LngLatBounds([-130, 26.829656], 
        [-50, 49.500739]);
    map.fitBounds(bounds,{padding:20},{bearing:0})
}


//#### Version
//Determine the current version of dc with `dc.version`
d3.selectAll("#version").text(dc.version);
