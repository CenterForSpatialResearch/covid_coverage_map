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
var pub = {
    strategy:"percentage_scenario_SVI_hotspot",
    coverage:"base_case_capacity_30",
    aiannh:false,
    prison:false,
    satellite:false,
    tract_svi:false,
    all:null,
    centroids:null,
    histo:null,
    states:null
}
var highlightColor = "#DF6D2A"
var bghighlightColor = "gold"
var outlineColor = "#DF6D2A"
var colors = {
hotspot:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
SVI:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
hotspotSVI:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
highDemand:["#A7DCDF","#6EAFC3","#3983A8","#02568B"]}


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
var colorGroups = [
    "rgba(0, 137, 84,1)","rgba(0, 137, 84,.7)","rgba(0, 137, 84,.4)",
   "rgba(128, 172, 42,1)", "rgba(128, 172, 42,.7)", "rgba(128, 172, 42,.4)",
    "rgba(255, 206, 0,1)","rgba(255, 206, 0,.7)","rgba(255, 206, 0,.4)"
]

var colorGroups =[
"rgba(255, 161, 0, .4)","rgba(255, 161, 0, .7)","rgba(255, 161, 0, 1)",
"rgba(244, 81, 128, .4)","rgba(244, 81, 128, .7)","rgba(244, 81, 128, 1)",
"rgba(234, 0, 255, .4)","rgba(234, 0, 255, .7)","rgba(234, 0, 255, 1)"

]


  var colorGroups =[
  "rgba(19,182,163, .4)","rgba(19,182,163, .7)","rgba(19,182,163, 1)",
  "rgba(162,211,82, .4)","rgba(162,211,82, .7)","rgba(162,211,82, 1)",
  "rgba(255, 241, 0, .4)","rgba(255, 241, 0, .7)","rgba(255, 241, 0, 1)"
 
  ]

// var colorGroups =[
// "rgba(113, 191, 77, .4)","rgba(113, 191, 77, .7)","rgba(113, 191, 77, 1)",
// "rgba(184, 216, 38, .4)","rgba(184, 216, 38, .7)","rgba(184, 216, 38, 1)",
// "rgba(255, 241, 0, .4)","rgba(255, 241, 0, .7)","rgba(255, 241, 0, 1)"
// ]
//
// var colorGroups =[
//     "rgba(23, 220, 255, .4)", "rgba(23, 220, 255, .7)", "rgba(23, 220, 255, 1)",
//     "rgba(126, 110, 255, .4)","rgba(126, 110, 255, .7)","rgba(126, 110, 255, 1)",v -ho
// ]
//
// var colorGroups = [
//     "rgba(72, 174, 237, .4)","rgba(72, 174, 237, .7)","rgba(72, 174, 237, 1)",
//     "rgba(255, 255, 255, 4)", "rgba(255, 255, 255, .7)", "rgba(255, 255, 255, 1)",
//     "rgba(255, 241, 0, .4)","rgba(255, 241, 0, .7)","rgba(255, 241, 0, 1)"
// ]
//var colorGroups = ["#FDD6B9","#DBCEC5",/-======p[,/]"#B8C5D1","#FCAE74","#B79D8C","#718BA4","#F77A26","#91664E","#2A5176"]
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
function loader(){
    function myFunction() {
      var myVar = setTimeout(showPage, 1000);
    }

    function showPage() {
      $("#loader_sec").css("display","none");
      $("#bodyloader").css("display","block");
    }
    
    if(!localStorage.getItem("visted")){
        console.log("first")
       myFunction();
       localStorage.setItem("visted",true);
    }else{
        console.log("not first")
        
    }

}
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
function drawGrid(map,data){
    d3.select("#colorGrid svg").remove()
    var currentFilter = null
    
    var domainC = []
    for(var g =0; g<colorGroups.length; g++){
        domainC.push("_"+g)
    }
        
    var histo = d3.histogram()
        .value(function(d){
            if(d.properties[pub.strategy+"_"+pub.coverage+"_group"]==undefined){
                return 999
            }else{
                return d.properties[pub.strategy+"_"+pub.coverage+"_group"].replace("_","")
            }
        })
        .domain([1,10])
        .thresholds(9)
            
     var bins = histo(data.features)
     pub.histo = bins
    
    var gridHeight = 250
    var gridWidth = 220
    var colorGridSvg = d3.select("#colorGrid").append("svg").attr("width",gridWidth).attr("height",gridHeight)
    var gridSize = 40
        
    var rScale = d3.scaleLinear().domain([0,800]).range([10,gridSize-5])
        
colorGridSvg.append("rect").attr("width",gridSize/2).attr("height",gridSize/2).attr("x",10).attr("y",230).attr("fill","#ddd")
colorGridSvg.append("text").attr("x",35).attr("y",244).text("Counties with no recorded cases")
        
        var clicked = false
        
    colorGridSvg
        .selectAll(".grid")
        .data(colorGroups)
        .enter()
        .append("rect")
        .attr("class",function(d,i){
            var cClass = i%3
            var mClass = Math.floor(i/3)
            return "c_"+cClass+" "+"m_"+mClass+" gridCell"
        })
        .attr("x",function(d,i){
            return i%3*(gridSize)
        })
        .attr("y",function(d,i){
            return 150-Math.floor(i/3+1)*(gridSize)//-rScale(bins[i].length)+gridSize/2
        })
         .attr("width",function(d,i){
             return gridSize//-20
         })
        .attr("height",function(d,i){
            return gridSize
           // console.log(rScale(bins[i].length))
            return rScale(bins[i].length)
        })
        .attr('fill',function(d){return d})
        .attr("transform","translate(80,0)")
        .attr("cursor","pointer")
        .on("mouseover",function(d,i){
            var groupName = "_"+(i+1)            
            var filter = ["==",pub.strategy+"_"+pub.coverage+"_group",groupName]
            map.setFilter("counties",filter)
                d3.selectAll(".gridCell").attr("opacity",.3)
                d3.select(this).attr("opacity",1)
            
            var x = event.clientX;     // Get the horizontal coordinate
            var y = event.clientY;             
             d3.select("#gridHover").style("visibility","visible")
             .style("left",(x+20)+"px")
             .style("top",y+"px") 
            
            
            var gP = ["low","med","high"][Math.floor((i)/3)]
            var gC = ["low","med","high"][i%3]
            d3.select("#gridHover").html(pub.histo[i].length+ " counties have "+ gP+" priority and "+gC+" unmet need")
         //   console.log("over")
        })
        .on("mouseout",function(d,i){
            //var filter = ["!=",pub.strategy+"_"+pub.coverage+"_group","blahblah"]
                d3.selectAll(".gridCell").attr("opacity",1)
                 d3.select("#gridHover").style("visibility","hidden")
            
            if(clicked == false){
                currentFilter = null
                map.setFilter("counties",currentFilter)
              //  console.log("clicked is flase,out ")
            }else{
                map.setFilter("counties",currentFilter)
              //  console.log("clicked is true,out ")
            }
           
            
        })
        .on("click",function(d,i){
            var groupName = "_"+(i+1)            
            var filter = ["==",pub.strategy+"_"+pub.coverage+"_group",groupName]

            if(JSON.stringify(filter) == JSON.stringify(currentFilter)){
                d3.select(this).attr("stroke","none")
                currentFilter = null
                map.setFilter("counties",currentFilter)
                clicked = false
               // console.log(clicked)
              //  console.log(currentFilter)
                
            }else{
                map.setFilter("counties",filter)
                currentFilter = filter
                d3.selectAll(".gridCell").attr("stroke","none")
                d3.select(this).attr("stroke","#000")
                clicked = true
              //  console.log(clicked)
              //  console.log(currentFilter)
                
                
            }
        })
  // colorGridSvg
  //         .selectAll(".gridText")
  //         .data(colorGroups)
  //         .enter()
  //         .append("text")
  //         .text(function(d,i){return i+1})
  //         .attr("x",function(d,i){
  //             return i%3*(gridSize+2)+20
  //         })
  //         .attr("y",function(d,i){
  //             return 150 -(Math.floor(i/3))*(gridSize+2)-10
  //         })
  //         .attr('fill',"#ffffff")
  //         .attr("text-anchor","middle")
  //         .attr("transform","translate(100,0)")
    
    colorGridSvg.append("text").text("% OF UNMET NEED").attr("x",75).attr("y",200).style("font-weight","bold").style("font-size","12px")
    colorGridSvg.append("text").text("less").attr("x",80).attr("y",180)
    colorGridSvg.append("text").text("more").attr("x",170).attr("y",180)
      
    colorGridSvg.append("text").text("high").attr("x",50).attr("y",40).attr("text-anchor","end")
    colorGridSvg.append("text").text("low").attr("x",50).attr("y",150).attr("text-anchor","end")
     
      var measureDisplayTextShort = {
          percentage_scenario_high_demand:"new cases",
          percentage_scenario_SVI_high_demand:"SVI*new cases",
          percentage_scenario_hotspot:"new cases/pop",
          percentage_scenario_SVI_pop:"SVI*pop",
          percentage_scenario_SVI_hotspot:"SVI*(new cases/pop)"
      }
     
    colorGridSvg.append("text").text(measureDisplayTextShort[pub.strategy].toUpperCase()).attr("x",10).attr("y",100).style("font-size","12px")
        .attr("transform","rotate(-90 10,100)").style("font-weight","bold")
          .attr("text-anchor","middle")
    colorGridSvg.append("text").text("PRIORITY SCORE").attr("x",25).attr("y",100).style("font-size","12px")
        .attr("transform","rotate(-90 25,100)").style("font-weight","bold")
          .attr("text-anchor","middle")
      
      
    var degree = ["low","med","high"]
    colorGridSvg
        .selectAll(".gridDegreeX")
        .data(degree)
        .enter()
        .append('text')
        .text(function(d,i){return cStops[i].join("-");})
        .attr("x",function(d,i){return i*gridSize+gridSize/2})
        .attr("y",160)
        .attr("column",function(d,i){return i})
        .attr("cursor","pointer")
        .attr("text-anchor","middle")
         .attr("text-decoration","underline")
        .attr("transform","translate(80,0)")
          .on("mouseover",function(d,i){
              var column = d3.select(this).attr("column")
              d3.selectAll(".gridCell").attr("opacity",.3)
              d3.selectAll(".c_"+column).attr("opacity",1)
              var groupName = "_"+i            
              var filter = ["==",pub.strategy+"_"+pub.coverage+"_coverage_group",groupName]
            map.setFilter("counties",filter)
              
            var ids = map.querySourceFeatures("counties",  { filter:filter} )
          })
          .on("mouseout",function(d,i){
              d3.selectAll(".gridCell").attr("opacity",1)
              if(clicked == false){
                  var filter = null
                  map.setFilter("counties",filter)
              }else{
                  map.setFilter("counties",currentFilter)
                  
              }
             
              
          })

    colorGridSvg
        .selectAll(".gridDegreeX")
        .data(degree)
        .enter()
        .append('text')
          .text(function(d,i){return pStops[i].join("-"); return d})
        .attr("y",function(d,i){return 130-i*gridSize+5})
         .attr("text-decoration","underline")
        .attr("x",0)
          .attr("row",function(d,i){
              return i
          })
        .attr("text-anchor","end")
        .attr("transform","translate(75,0)")
        .attr("cursor","pointer")
          .on("mouseover",function(d,i){
              var row = d3.select(this).attr('row')
              
              d3.selectAll(".gridCell").attr("opacity",.3)
              d3.selectAll(".m_"+row).attr("opacity",1)
          var groupName = "_"+i            
          var filter = ["==",pub.strategy.replace("percentage_scenario_","")+"_group",groupName]
        map.setFilter("counties",filter)
          
      })
      .on("mouseout",function(d,i){
          d3.selectAll(".gridCell").attr("opacity",1)
          if(clicked == false){
              var filter = null
              map.setFilter("counties",filter)
          }else{
              map.setFilter("counties",currentFilter)
              
          }
          
      })
}


function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var colorColumn = "_priority"
//var countySVI = d3.csv("SVI2018_US_COUNTY.csv")
//var tractSVI = d3.csv("SVI2018_TRACT.csv")
var countyCentroids = d3.json("county_centroids.geojson")
//var covid = d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
//var root = "data_csv"
// var highDemand=d3.csv(root+"/30_50_70_County_level_highdemand.csv")
// var hotspot=d3.csv(root+"/30_50_70_County_level_hotspot.csv")
// var SVI=d3.csv(root+"/30_50_70_County_level_SVI_pop.csv")
// var hotspotSVI=d3.csv(root+"/30_50_70_hot_spot_SVI_county.csv")
var counties = d3.json("counties.geojson")
//var aiannh = d3.json("indian_reservations.geojson")
//var prison = d3.json("prisons_centroids.geojson")
var usOutline = d3.json("simple_contiguous.geojson")
//var normalizedPriority = d3.csv("priority_normalized_for_policies.csv")

//var allData = d3.csv("County_level_coverage_for_all_policies_and_low_mid_high_base_case_capacity.csv")
//var allData = d3.csv("County_level_coverage_for_all_policies_and_different_base_case_capacity_07152020.csv")
var allData =d3.csv("https://raw.githubusercontent.com/CenterForSpatialResearch/allocation_chw/master/Output/County_level_coverage_for_all_policies_and_different_base_case_capacity.csv")
var timeStamp = d3.csv("https://raw.githubusercontent.com/CenterForSpatialResearch/allocation_chw/master/Output/time_stamp.csv")
var states = d3.json("simplestates.geojson")

var prioritySet = ["priority_high_demand","priority_SVI_hotspot","priority_SVI_pop","priority_hotspot","priority_SVI_high_demand"]
//var coverageSet = ["base_case_capacity_low","base_case_capacity_mid","base_case_capacity_high","show_all"]

var coverageSet = []
var coverageDisplayText = {show_all:"Hide Coverage Info"}
for(var c = 1; c<=8; c++){
    var setTerm = "base_case_capacity_"+c*10
     coverageSet.push(setTerm)
    coverageDisplayText[setTerm] = c*10+' CHW per 100,000 residents'
 }
// coverageSet.push("show_all")
// console.log(coverageSet)
//var coverageSet = ["base_case_capacity_10"]
// var coverageDisplayText = {
//     base_case_capacity_low:"30 CHW per 100,000",
//     base_case_capacity_mid:"50 CHW per 100,000",
//     base_case_capacity_high:"70 CHW per 100,000",
//     show_all:"Hide Coverage Info"
// }



var measureSet = [
    "percentage_scenario_SVI_pop",
"percentage_scenario_SVI_high_demand",
"percentage_scenario_SVI_hotspot",
"percentage_scenario_high_demand",
"percentage_scenario_hotspot"
]
var measureDisplayText = {
    percentage_scenario_high_demand:"New cases within the last 14 days",
    percentage_scenario_SVI_high_demand:"Socially vulnerable populations <span style=\"color:red; font-size:16px; font-weight:800;\"<strong>+</strong></span> new cases within the last 14 days",
    percentage_scenario_hotspot:"New cases within the last 14 days as % of population",
    percentage_scenario_SVI_pop:"Socially vulnerable populations",
    percentage_scenario_SVI_hotspot:"Socially vulnerable populations  <span style=\"color:red; font-size:16px; font-weight:800;\"<strong>+</strong></span> new cases within the last 14 days as % of population"
}

var measureDisplayText = {
    percentage_scenario_high_demand:"New cases within the last 14 days",
    percentage_scenario_SVI_high_demand:"SVI  <span style=\"color:red; font-size:16px; font-weight:800;\"<strong>+</strong></span> new cases within the last 14 days",
    percentage_scenario_hotspot:"New cases within the last 14 days as % of population",
    percentage_scenario_SVI_pop:"Social Vulnerability Index (SVI) * Population",
    percentage_scenario_SVI_hotspot:"SVI <span style=\"color:red; font-size:16px; font-weight:800;\"<strong>+</strong></span> new cases within the last 14 days as % of population"
}


Promise.all([counties,usOutline,countyCentroids,allData,timeStamp,states])
.then(function(data){
    ready(data[0],data[1],data[2],data[3],data[4],data[5])
})
var hoveredStateId = null;

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

function ready(counties,outline,centroids,modelData,timeStamp,states){
    pub.states = states
   loader()
     d3.select("#date").html("Model run as of "+timeStamp["columns"][1])
    //convert to geoid dict
    var dataByFIPS = turnToDictFIPS(modelData,"County_FIPS")
    
    //pub.all = {"highDemand":highDemand,"hotspot":hotspot,"SVI":SVI,"hotspotSVI":hotspotSVI,"normal":normalizedP}
    pub.centroids = formatCentroids(centroids.features)
    //add to geojson of counties
    var combinedGeojson = combineGeojson(dataByFIPS,counties)
    pub.all = combinedGeojson
    
//    console.log(combinedGeojson)
    
    drawMap(combinedGeojson,outline)
    
   // drawReservations(aiannh)
    
    var formattedData = []
    for(var i in combinedGeojson.features){
        formattedData.push(combinedGeojson.features[i].properties)
    }
    // d3.select('#download')
//         .attr("cursor","pointer")
//         .on('click', function() {
//             var data = formattedData
//             var today = new Date();
//             var dd = String(today.getDate()).padStart(2, '0');
//             var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
//             var yyyy = today.getFullYear();
//
//             today = mm + '_' + dd + '_' + yyyy;
//
//             var blob = new Blob([d3.csvFormat(data)], {type: "text/csv;charset=utf-8"});
//             saveAs(blob, "politics_of_care_data_"+today+".csv");
//         });
//
//    
    //drawHistogram(pub.strategy,pub.coverage)
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function turnToDictFIPS(data,keyColumn){
    
    var newDict = {}
    var maxPriority = 0
    var keys = Object.keys(data[0])
    //console.log(keys)
    var notBinaryCoverage = []
    for(var i in data){
        var key = String(data[i][keyColumn])
        if(key.length==4){
            key= "0"+key
        }
        var values = data[i]
        for(var j in measureSet){
            var measureKey = measureSet[j].replace("percentage_scenario_","")
            var priorityKey = "priority_"+measureKey
            var priority = parseFloat(data[i][priorityKey])
           // console.log(data[i][priorityKey])
            for(var ps in pStops){
                var pStop = pStops[ps]
                if(priority>=pStop[0] && priority<=pStop[1]){
                    var pGroup = ps
                    break
                }                
            }
            
            for(var k in coverageSet){
                var coverageKey = "percentage_scenario_"+measureKey+"_"+coverageSet[k]
                var coverage = 100-parseFloat(data[i][coverageKey])
                if(coverage==-1){
                    var cGroup = "none"
                }else{
                    for(var cs in cStops){
                        var cStop = cStops[cs]
                        if(coverage>=cStop[0] && coverage<=cStop[1]){
                            var cGroup = cs
                            break
                        }
                    }
                }
                
                
                var combinedGroup = "_"+(parseInt(parseInt(pGroup)*3)+parseInt(parseInt(cGroup)+1))
                var combinedHeader = coverageKey+"_group"
                //console.log([cGroup,pGroup,combinedGroup,combinedHeader])
                values[combinedHeader]=combinedGroup
                values[measureKey+"_group"]="_"+pGroup
                values[coverageKey+"_coverage_group"]="_"+cGroup
            }
            
        }
        //console.log(values)
       // console.log(values)
       // break
        newDict[key]=values
    }
    return newDict
}
function combineGeojson(all,counties){
    for(var c in counties.features){
        var countyFIPS = counties.features[c].properties.FIPS
        var data = all[countyFIPS]
       // console.log(data)
        counties.features[c]["id"]=countyFIPS
        //for now PR is undefined
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
function drawReservations(data,map){
    //for pattern: https://docs.mapbox.com/mapbox-gl-js/example/fill-pattern/
    map.addSource("aiannh",{
        "type":"geojson",
        "data":aiannh
    })

    map.loadImage(
                  'pattern_transparent.png',
                  function(err, image) {
                  // Throw an error if something went wrong
                      if (err) throw err;
      
                      // Declare the image
                      map.addImage('pattern', image);
      
                      // Use it
                      map.addLayer({
                          'id': 'aiannh',
                          'type': 'fill',
                          'source': 'aiannh',
                          'layout': {
                              'visibility': 'visible'
                           },
                          'paint': {
                              'fill-pattern': 'pattern'
                          }
                      });
                  }
              );
}

function drawMap(data,outline){
    d3.select("#map").style("width",window.innerWidth-250+"px")
          .style("height",window.innerHeight-120+"px")
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
        //style:"mapbox://styles/c4sr-gsapp/ckcnnqpsa2rxx1hp4fhb1j357",//dare2
        style:"mapbox://styles/c4sr-gsapp/ckcnnqpsa2rxx1hp4fhb1j357",//newest
       //style:"mapbox://styles/mapbox/satellite-v9",//mapbox default
      //style: "mapbox://styles/sidl/ckctaoqfq1mwr1imlq4snjvgw",
 		//style:"mapbox://styles/c4sr-gsapp/ckc4s079z0z5q1ioiybc8u6zp",//new account
        //center:[-100,37],
        bounds:bounds,
        maxZoom:10,
         zoom: 3.8,
         preserveDrawingBuffer: true,
        minZoom:3.5,
       maxBounds: maxBounds    
     });
     
     //us-outline
  

     map.on("load",function(){
         // map.addControl(
//          new mapboxgl.GeolocateControl({
//          positionOptions: {
//          enableHighAccuracy: true
//          },
//          trackUserLocation: true
//          })
//          );
$('#map').show();

map.resize();


var geocoder = new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl
});
//document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

    map.addControl(new mapboxgl.NavigationControl(),'top-left');
    map.dragRotate.disable();
         
         
         drawGrid(map,data) 
         //map.setLayoutProperty("mapbox-satellite", 'visibility', 'none');
         
         map.addSource("counties",{
             "type":"geojson",
             "data":data
         })
         
                  
         map.addLayer({
             'id': 'counties',
             'type': 'fill',
             'source': 'counties',
             'paint': {
             'fill-color': "white",
                 'fill-opacity':0
             },
             'filter': ['==', '$type', 'Polygon']
         },"ST-OUTLINE");
         
         map.addLayer({
             'id': 'county_outline',
             'type': 'line',
             'source': 'counties',
             'paint': {
                 //'line-color':"#000",
                 'line-opacity':[
                    'case',
                    ['boolean', ['feature-state', 'hover'], false],
                    1,
                    .15
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
        // },"county_outline");
         
         var filter = ["!=","percentage_scenario_SVI_hotspot_base_case_capacity_30",-1]
         map.setFilter("counties",filter)
    //     console.log(map.getStyle().layers)        
         zoomToBounds(map)
         strategyMenu(map,data)
         coverageMenu(map)
         //toggleLayers(map)
         placesMenus(map)
         
        lineOpacity["property"]=pub.strategy+"_"+pub.coverage
        lineWeight["property"]=pub.strategy+"_"+pub.coverage
        fillColor["property"]="priority_"+pub.strategy.replace("percentage_scenario_","")
     
//map.setPaintProperty("us_background","fill-color","#ffffff")     
         map.setPaintProperty("counties", 'fill-opacity',1)
        // map.setPaintProperty("counties", 'fill-color',fillColor)
              var matchString = ["match",["get",pub.strategy+"_"+pub.coverage+"_group"]].concat(groupColorDict)
              //console.log(matchString)
              
               map.setPaintProperty("counties", 'fill-color', matchString)    
         // map.setPaintProperty("county_outline", 'line-opacity',lineOpacity)
        //  map.setPaintProperty("county_outline", 'line-color',outlineColor)
        //  map.setPaintProperty("county_outline", 'line-width',lineWeight)
        //
         
        d3.select("."+pub.coverage+"_radialC")//.style("border","1px solid "+ highlightColor)
        d3.selectAll("."+pub.coverage).style("background-color","#000").style("color","#fff")
        d3.selectAll("."+pub.strategy).style("background-color","#000").style("color","#fff")
        d3.selectAll("."+pub.strategy+"_radialS")//.style("background-color","#000").style("color","#fff")//.style("border","1px solid "+ highlightColor)
          
     })

    
     var popup = new mapboxgl.Popup({
         closeButton: false,
         closeOnClick: false
     });     
      var hoveredStateId = null;
     
     var firstMove = true
         d3.select("#mapPopup").append("div").attr("id","popLabel")//.style("width","200px").style("height","200px")//.style('background-color',"red")
         d3.select("#mapPopup").append("div").attr("id","popMap")//.style("width","200px").style("height","400px")//.style('background-color',"red")
   
    
     map.on('mousemove', 'counties', function(e) {
         var feature = e.features[0]
        console.log(map.getZoom())
         
       //  console.log(feature["properties"])
         //console.log(feature)
         map.getCanvas().style.cursor = 'pointer'; 
        // console.log(feature)
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
             
             
             var x = event.clientX+20;     // Get the horizontal coordinate
             var y = event.clientY+20;             
             var w = window.innerWidth;
             var h = window.innerHeight;
             if(x+200>w){
                 x = x-280
             }
             if(y+400>h){
                 y= y-320
             }
             
              d3.select("#mapPopup").style("visibility","visible")
              .style("left",x+"px")
              .style("top",y+"px") 
             
             var countyName = feature["properties"]["county"]+" County, "+feature["properties"]["stateAbbr"]
             var population = feature["properties"]["totalPopulation"]
             var geometry = feature["geometry"]
             var chwNeed = feature["properties"]["CHW_need"]
             var cases = feature["properties"]["Covid_cases"]             
             var countyId = feature["properties"]["FIPS"]
             var SVI = Math.round(feature["properties"]["SVI_county"]*100)/100
           //  var columnsToShow = ["hotspotSVI_priority","hotspot_priority","SVI_priority","highDemand_priority"]       
             
            var currentSelection = pub.strategy+"_"+pub.coverage
             
             
             var currentSelectionCoverage = Math.round(feature["properties"][currentSelection]*100)/100
             
             var chwAssigned = Math.round(chwNeed*(feature["properties"][currentSelection]/100))
             
             
             
             if(currentSelectionCoverage==-1){
             var displayString = "<span class=\"popupTitle\">"+countyName+"</span><br>"
                     +"Population: "+numberWithCommas(population)+"<br>"
                     +"There are no cases for this county in this dataset currently."
             }else{
                 var displayString = "<span class=\"popupTitle\">"+countyName+"</span><br>"
                         +"Population: "+numberWithCommas(population)+"<br>"
                         +"Social Vulnerability Index: "+SVI+"<br>"
                         +"New cases in the past 14 days: "+cases+"<br>"
                         +"Total number of CHWs needed: "+chwNeed+"<br>"
                         +"Total number of CHWs allocated: "+chwAssigned+"<br>"
                         +"Percent of need <u>unmet</u> with current allocation options: "+(100-currentSelectionCoverage)+"% "
                     
             }
             var needsMetString = currentSelectionCoverage+"% of needs met</strong>"
             
             if(currentSelectionCoverage ==-1){
                 needsMetString = "Currently No Cases Reported"
             }
            
             
           
          
             d3.select("#popLabel").html(displayString)
            var gradientSVG = d3.select("#popLabel").append("svg")
        .attr("width",180).attr('height',40)
             drawSmallMapKey(gradientSVG)
             
            // var coords = feature.geometry.coordinates[0][0]
              var coords = pub.centroids[feature.properties["FIPS"]]
              var formattedCoords =coords// {lat:coords[1],lng:coords[0]}
     //
     //         while (Math.abs(e.lngLat.lng - formattedCoords[0]) > 180) {
     //             formattedCoords[0] += e.lngLat.lng > formattedCoords[0] ? 360 : -360;
     //         }

/*
             popup
             .setLngLat(formattedCoords)
             .setHTML(displayString)
             .addTo(map);
*/

         }       
         
         map.on("mouseleave",'counties',function(){
             d3.select("#mapPopup").style("visibility","hidden")
             
             
         })  
         
         
       //  console.log(countyId)
        // console.log([formattedCoords.lat,formattedCoords.lng])
         var coordinates = geometry.coordinates[0]
         
         // var bounds = coordinates.reduce(function(bounds, coord) {
 //                 return bounds.extend(coord);
 //             }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
             
         if(firstMove==true){
             //d3.select(".mapboxgl-popup-content").append("div").attr("id","sMap").style("width","200px").style("height","200px")
//             	mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkbCIsImEiOiJkOGM1ZDc0ZTc5NGY0ZGM4MmNkNWIyMmIzNDBkMmZkNiJ9.Qn36nbIqgMc4V0KEhb4iEw';    
             
             detailMap = new mapboxgl.Map({
                        container: 'popMap',
                		style: "mapbox://styles/c4sr-gsapp/ckc94kpjp37181iqfpnnowouc",
                		//style:"mapbox://styles/sidl/ckc4m2i9b0t931jl6o2wahxrp",                      
                        preserveDrawingBuffer: true,
                        interactive: false
                        
                    });
                             detailMap.fitBounds(bounds, {
                                 padding: 5,
                                 animate: false
                             })
                     firstMove=false
d3.select("#popMap").selectAll(".mapboxgl-control-container").remove()
                             
         }else{
                    
             detailMap.fitBounds(bounds, {
                 padding: 5,
                 animate: false
             })
                    
                     subMap(detailMap,formattedCoords,geometry,countyId)
         }
         
      

     });
 
           
      map.on("move",function(){
              var zoom = map.getZoom();
              if(zoom<7){
                  d3.select("#layersMenu").style("display","none")
                  d3.select("#mapbox-satellite").style("opacity",.3)
                  //document.getElementById("tract_svi").disabled = true;
                  //document.getElementById("mapbox-satellite").disabled = true;
              }else{
                  d3.select("#layersMenu").style("display","block")
                  d3.select("#mapbox-satellite").style("opacity",1)
              }
          })    
}
function drawSmallMapKey(svg){
    
    var defs = svg.append("defs");
    var gradient = defs.append("linearGradient")
       .attr("id", "svgGradient")
       .attr("x1", "0%")
       .attr("x2", "100%")
       .attr("y1", "0%")
       .attr("y2", "0%");

    gradient.append("stop")
       .attr('class', 'end')
       .attr("offset", "0%")
       .attr("stop-color", "#e1e0e0")
       .attr("stop-opacity", 1);
    gradient.append("stop")
       .attr('class', 'start')
       .attr("offset", "100%")
       .attr("stop-color", "#525252")
       .attr("stop-opacity", 1);

   
       
    svg.append("rect")
    .attr("class","key")
    .attr('width',160)
    .attr('height',10)
    .attr("x",20)
    .attr("y",10)
    //   .attr("fill","red")
    .attr("fill","url(#svgGradient)")
       .attr("stroke","rgba(0,0,0,.5)")
       .attr("stroke-width",.1)
       
      svg.append("text").text("High SVI: 1").attr("x",180).attr("y",32).attr("text-anchor","end")
      svg.append("text").text("Low SVI: 0").attr("x",20).attr("y",32)//.attr("text-anchor","end")
}
function subMap(detailMap, center,geometry,countyId){    
    var coordinates = geometry.coordinates[0]
    var bounds = coordinates.reduce(function(bounds, coord) {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        
        // detailMap.flyTo(
   //          {
   //
   //              center:[center.lat,center.lng],
   //              curve: 0,
   //             // zoom: 9,
   //              speed:10
   //
   //          }
   //      )
             detailMap.fitBounds(bounds, {
                 padding: 5,
                 animate: false
             })
         
 
    
     
     // var filter = ['!=',["get",'FIPS'],["literal",[countyId]]];
   //   detailMap.setFilter("county-small-4yr1gy",filter)

     
}


function sumProperty(prop,list){
     var total = 0
    for ( var i = 0, _len = list.length; i < _len; i++ ) {
        total += parseFloat(list[i][prop])
    }
    return total
}

function drawHistogram(strategy){
  //  var strategy = "SVI"
    var priority = strategy+"_priority"
    d3.select("#histogram svg").remove()
   var svg = d3.select("#histogram")
                .append("svg")
                .attr("width",800)
                .attr("height",140)
   
    var height = 80
    var width = 700
    var barWidth = 650
    var activeData = Object.values(pub.all[strategy])
    
    var breaks = fillColor[strategy]["stops"]

    var max = Math.max.apply(Math, activeData.map(function(o) { return o[priority]; }))
    
    var totalCounties = activeData.length
    
    var formattedBreaks = []
    var cLength = 0    
    
    for(var i in breaks){
        if(i==breaks.length-1){
            var endValue = max
            var startValue = breaks[i][0]

        }else{
            var startValue = breaks[i][0]
            var endValue = breaks[parseInt(i)+1][0]
        }
        
        var group =activeData.filter(function(d){
            return d[priority]>=startValue && d[priority]<=endValue
        })        
        var sum = sumProperty(strategy+"_total_demand_of_county",group)
        
        var startX = cLength
        cLength+=Math.round((group.length/totalCounties)*10000)/100
        actualLength = group.length
        var color = colors[strategy][i]
        formattedBreaks.push({cases:sum,color:color,cLength:cLength, sLength:startX,actualLength:actualLength,length:Math.round((group.length/totalCounties)*10000)/100})
    }
    var xScale = d3.scaleLinear().domain([0,100]).range([0, barWidth])
    
    var gradient = svg.append("defs").append("linearGradient")
        .attr("id","test")
        .attr("x1","0%")
        .attr("y1","0%")
        .attr("x2","100%")
        .attr("y2","0%")
    
    var y1 = 100
    var y2 = 20
    
   // svg.append("text").text("priority value").attr("x",20).attr("y",30)
    svg.append("text").text("# of counties").attr("x",0).attr("y",y1)
    svg.append("text").text("# of cases").attr("x",0).attr("y",y1+30)


    for(var b in formattedBreaks){
        var bk = formattedBreaks[b]
        gradient.append("stop")
        .attr("offset",bk.sLength+"%")
        .style("stop-color",bk.color)
        
    }
    svg.append("rect")
    .attr("x",0)
    .attr("y",y1+5)
    .attr("width", barWidth)
    .attr("height",10)
    .attr("fill","url(#test)")
    .attr("stroke","#fff")
    .attr("stroke-width","2px")
    
    for(var b in formattedBreaks){
        var bk = formattedBreaks[b]
        // svg.append("text")
 //        .text(bk.endV)
 //        .attr("x",xScale(bk.cLength)-5)
 //        .attr("y",55)
 //        .style("writing-mode","vertical-rl")
 //        .attr("text-anchor","end")
        
        
        // svg.append("rect")
      //       .attr("x",xScale(bk.sLength))
      //       .attr("y",20)
      //       .attr("width", xScale(bk.length))
      //       .attr("height",10)
      //       .attr("fill",bk.color)
        
        svg.append("text")
        .text(numberWithCommas(bk.actualLength))
        .attr("x",xScale(bk.sLength+bk.length/2)-5)
        .attr("y",y1+10)
        .attr("text-anchor","end")
        .style("writing-mode","vertical-rl")
        
        svg.append("text")
        .text(numberWithCommas(bk.cases))
        .attr("x",xScale(bk.sLength+bk.length/2)-5)
        .attr("y",y1+20)
        .attr("text-anchor","start")
        .style("writing-mode","vertical-rl")
        
        svg.append("rect")
        .attr("width",2)
        .attr("height",10)
        .attr("x",xScale(bk.cLength)-2)
        .attr("y",y1+5)
        .attr("fill","white")
    }
    
    
    if(pub.coverage !="show_all"){
        var cBreaks = 10
        var cmax = 100
        var cmin = 0
        var formattedCBreaks = []
    
        var cGroup = activeData.filter(function(d){
                var cKey = pub.strategy+"_"+pub.coverage
                return d[cKey]==0
            }) 
        var cummulativeLength =Math.round(cGroup.length/totalCounties*10000)/100
        formattedCBreaks.push({minValue:0,maxValue:0,length:cGroup.length,lengthP:Math.round(cGroup.length/totalCounties*10000)/100,start:0})
        
        
        
        for(var c = 0; c<10; c++){
             var cBreakStart = (cmax-cmin)/cBreaks*c
             var cBreakEnd = (cmax-cmin)/cBreaks*(c+1)
            if(cBreakStart==0){
                cBreakStart = 1
            }
            var cGroup =activeData.filter(function(d){
                var cKey = pub.strategy+"_"+pub.coverage
                return d[cKey]>=cBreakStart && d[cKey]<cBreakEnd
            }) 
            formattedCBreaks.push({minValue:cBreakStart,maxValue:cBreakEnd-1,length:cGroup.length,lengthP:Math.round(cGroup.length/totalCounties*10000)/100,start:cummulativeLength})
            cummulativeLength+=Math.round(cGroup.length/totalCounties*10000)/100
        }
    
        var oScale = d3.scaleLinear().domain([0,99.9]).range([1,0])
        var sScale = d3.scaleLinear().domain([0,99.9]).range([2,1])
        for(var i in formattedCBreaks){
            var fcb = formattedCBreaks[i]
            svg.append("rect")
            .attr("y",y2)
            .attr("x",xScale(fcb.start)+i*2)
            .attr("height",10)
            .attr("width",xScale(fcb.lengthP))
            .attr("fill","none")
            .attr("stroke",outlineColor)
            .attr("opacity",oScale(fcb.minValue))
            .attr("stroke-width",sScale(fcb.minValue))
            break
        }
    
        svg.append("text").text(numberWithCommas(formattedCBreaks[0].length)+" ("+formattedCBreaks[0].lengthP+"%)"+" counties with 0% coverage")
        .attr("y",y2+25).attr("x",0).attr("fill","black")
    }
}

function drawKey(demandType){
    
    d3.selectAll("#keySvg").remove()
    var color = colors[demandType]
    var svg = d3.select("#key").append("svg").attr("width",350).attr("height",300).attr("id","keySvg")

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
   
   var w = 200
       var h = 10
       var l = 120
       var t = 30
    svg.append("rect")
    .attr("width",w)
    .attr("height",h)
    .attr("x",l)
    .attr("y",t)
    .attr("fill","url(#svgGradient)")
    
    svg.append("rect")
    .attr("width",w)
    .attr("height",h)
    .attr("x",l)
    .attr("y",t*2)
       .attr("opacity",.3)
    .attr("fill","url(#svgGradient)")
       
      svg.append("text").text("covered").attr("x",l-10).attr("y",t+10).attr("text-anchor","end")
      svg.append("text").text("notcovered").attr("x",l-10).attr("y",t*2+10).attr("text-anchor","end")
      svg.append("text").text("low priority").attr("x",l).attr("y",t-10)//.attr("text-anchor","end")
      svg.append("text").text("high prioirty").attr("x",w+l).attr("y",t-10).attr("text-anchor","end")

}

function strategyMenu(map,data){

 var clickedId = "percentage_scenario_SVI_hotspot"
    
     for (var i = 0; i < measureSet.length; i++) {
         var id = measureSet[i];
         var displayText = measureDisplayText[id]
         
         var row = d3.select("#strategiesMenu").append("div").attr("class",id+"_radialMenuS radialMenuS").attr("id",id).style("cursor","pointer")
 
         var label = row.append("div").html(displayText).attr("class",id+"_labelS labelS "+id).style("display","inline-block")//.style("width","200px")
         label.on('mouseover',function(){onLabel=true})              
                .on('mouseout',function(){onLabel=false})   
         
          row.on("mouseover",function(){
              var outId = d3.select(this).attr("class").split(" ")[0].replace("_radialMenuS","")
              if(outId!=clickedId){
              d3.select(this).select(".labelS").style("color","#000")
    
              d3.select(this).select(".labelS").style("background-color",bghighlightColor)
              }
              onMenuItem=true
          })
          row.on("mouseout",function(){
              var outId = d3.select(this).attr("class").split(" ")[0].replace("_radialMenuS","")
              if(outId!=clickedId){
                  d3.select(this).select(".labelS").style("background-color","rgba(0,0,0,0)")
              }
                  onMenuItem=false
          })
         
        row.on("click",function(){
            
            clickedId = d3.select(this).attr("id")
            pub.strategy = clickedId
    console.log(clickedId)
            drawGrid(map,data)
            if(pub.coverage==undefined){
                 pub.coverage = "show_all"
                 d3.select(".show_all_radialC").style("background-color",highlightColor).style("border","1px solid "+ highlightColor)
                d3.selectAll(".show_all").style("color",highlightColor)
             }
             
            
            //d3.selectAll(".radialS").style("background-color","white").style("border","1px solid black")
            d3.selectAll(".labelS").style("background-color","white").style("color","#000")
            
            d3.selectAll("."+clickedId).style("color","#fff").style("background-color","#000")
            d3.selectAll("."+clickedId+"_radialS").style("background-color",highlightColor)//.style("border","1px solid "+ highlightColor)
          
              
             lineOpacity["property"]=pub.strategy+"_"+pub.coverage
             lineWeight["property"]=pub.strategy+"_"+pub.coverage
             fillColor["property"]="priority_"+pub.strategy.replace("percentage_scenario_","")
             
              map.setPaintProperty("counties", 'fill-opacity',1)
              var matchString = ["match",["get",pub.strategy+"_"+pub.coverage+"_group"]].concat(groupColorDict)              
               map.setPaintProperty("counties", 'fill-color', matchString)             
                 
                pub.histo = histo(pub.all)
                 
        })
     }
}
function formatSearch(item) {
    var selectionText = item.text.split("|");
    var $returnString = $('<span>' + selectionText[0] + '</br><b>' + selectionText[1] + '</b></br>' + selectionText[2] +'</span>');
    return $returnString;
};
function formatSelected(item) {
    var selectionText = item.text.split("|");
    var $returnString = $('<span>' + selectionText[0].substring(0, 21) +'</span>');
    return $returnString;
};
function coverageMenu(map){
    var w = 250
    var h = 140
    var svg = d3.select("#coverageMenu").append("svg").attr("width",w).attr("height",h)
    var startCoverage = pub.coverage.split("_")[3]
    var coverageDisplay = svg.append("text").text(startCoverage).style("font-size","70px").attr("x",40).attr("y",80)
    var plus = svg.append("text").text("+10").style("font-size","14px").attr("x",130).attr("y",40).style("font-weight","bold")
    .style('cursor',"pointer")
    
    .on("click",function(){
        var newCoverage = parseInt(pub.coverage.split("_")[3])+10
        if(newCoverage <=80){
            pub.coverage = pub.coverage.replace(pub.coverage.split("_")[3],newCoverage)
            coverageDisplay.text(newCoverage)
            minus.attr("fill","#000")
              map.setPaintProperty("counties", 'fill-opacity',1)
              
              var matchString = ["match",["get",pub.strategy+"_"+pub.coverage+"_group"]].concat(groupColorDict)
              //console.log(matchString)
              
               map.setPaintProperty("counties", 'fill-color', matchString)
            //  drawHistogram(pub.strategy)
                pub.histo = histo(pub.all)
        }
        if(newCoverage==80){
            d3.select(this).attr("fill","#aaa")
        }
    })
    
    var minus = svg.append("text").text("-10").style("font-size","14px").attr("x",130).attr("y",80).style("font-weight","bold")
    .style('cursor',"pointer")
        .on("click",function(){
            var newCoverage = parseInt(pub.coverage.split("_")[3])-10
            if(newCoverage >=10){
                pub.coverage = pub.coverage.replace(pub.coverage.split("_")[3],newCoverage)
                coverageDisplay.text(newCoverage)
                plus.attr("fill","#000")
              map.setPaintProperty("counties", 'fill-opacity',1)
              
              var matchString = ["match",["get",pub.strategy+"_"+pub.coverage+"_group"]].concat(groupColorDict)
              //console.log(matchString)
              
               map.setPaintProperty("counties", 'fill-color', matchString)
            //  drawHistogram(pub.strategy)
                pub.histo = histo(pub.all)
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

function getMaxMin(coords){
    var maxLat = -999
    var minLat = 0
    var maxLng = 0
    var minLng = 999
    for(var i in coords){
        var coord = coords[i]
        if(coord<0){
            if(coord<minLat){
                minLat = coord
            }else if(coord>maxLat){
                maxLat = coord
            }
        }else{
            if(coord>maxLng){
                maxLng = coord
            }else if(coord<minLng){
                minLng = coord
            }
        }
    }
    var bounds = [
    [minLat,minLng], // Southwest coordinates
    [maxLat, maxLng] // Northeast coordinates
    ];
    return bounds
    
   // console.log([minLat,maxLat,minLng,maxLng])
}
function flatDeep(arr, d = 1) {
   return d > 0 ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatDeep(val, d - 1) : val), [])
                : arr.slice();
};
function PopulateDropDownList(features,map) {
           //Build an array containing Customer records.
    console.log(features)
    var sorted =features.sort(function(a,b){
        return parseInt(a.properties.GEOID) - parseInt(b.properties["GEOID"]);
        
    })          
    var ddlCustomers = document.getElementById("ddlCustomers");
 
    var option = document.createElement("OPTION");
    option.innerHTML = "Contiguous 48"
    option.value = "-93,37,4";
    ddlCustomers.options.add(option);
    //Add the Options to the DropDownList.
    var boundsDict = {}
    
    for (var i = 0; i < sorted .length; i++) {
        var option = document.createElement("OPTION");

        //Set Customer Name in Text part.
        option.innerHTML = sorted[i].properties.NAME;
        
        var coordinates = flatDeep(features[i].geometry.coordinates,Infinity)
        //console.log(coordinates)
       boundsDict[sorted[i].properties.GEOID]=getMaxMin(coordinates)
        //Set CustomerId in Value part.
        option.value = sorted[i].properties["GEOID"]
        //Add the Option element to DropDownList.
        if(sorted[i].properties.NAME!="United States Virgin Islands"&& sorted[i].properties.NAME!="American Samoa"&& sorted[i].properties.NAME!="Commonwealth of the Northern Mariana Islands"&& sorted[i].properties.NAME!="Guam"){
          ddlCustomers.options.add(option);
      }
    }
   $('select').on("change",function(){
       if(this.innerHTML=="Contiguous 48"){
           map.flyTo({
               zoom:4,
               center: [-93,37],
               speed: 0.8, // make the flying slow
               curve: 1
               //essential: true // this animation is considered essential with respect to prefers-reduced-motion
           });
       }else{
           var coords = boundsDict[this.value]
           console.log(coords)
           var bounds =  new mapboxgl.LngLatBounds(coords);
           map.fitBounds(bounds,{padding:20},{bearing:0})
       }
    })
}

function placesMenus(map){
    PopulateDropDownList(pub.states.features,map)
   // var places = ["Contiguous 48","Alaska","Hawaii","Puerto_Rico"]
    // var places = ["Contiguous 48"]
 //    var coords = {
 //        "Contiguous 48":{coord:[37,-93],zoom:4},
 //        "Alaska":{coord:[63.739,-147.653],zoom:4},
 //        "Hawaii":{coord:[20.524,-157.063],zoom:7.1},
 //        "Puerto_Rico":{coord:[18.219,-66.338],zoom:8}
 //    }
 //
 //    for (var i = 0; i < places.length; i++) {
 //        var id = places[i];
 //        var link = document.createElement('a');
 //        link.href = '#';
 //        link.className = 'placesLink';
 //        link.textContent = id.split("_").join(" ");
 //        link.id =id;
 //
 //        link.onclick = function(e) {
 //            var id = d3.select(this).attr("id")
 //            var coord = coords[id].coord
 //            var zoom = coords[id].zoom
 //            map.flyTo({
 //                zoom: zoom,
 //            center: [
 //           coord[1] ,
 //            coord[0]
 //            ],
 //            speed: 0.8, // make the flying slow
 //            curve: 1
 //            //essential: true // this animation is considered essential with respect to prefers-reduced-motion
 //            });
 //        };
 //
 //        var layers = document.getElementById('placesMenu');
 //        layers.appendChild(link);
 //    }
}

function toggleLayers(map){
    // enumerate ids of the layers
   // var toggleableLayerIds = ['aiannh', 'prison','mapbox-satellite',"tract_svi"];
    var toggleableLayerIds = ['mapbox-satellite'];

    // set up the corresponding toggle button for each layer
    for (var i = 0; i < toggleableLayerIds.length; i++) {
        var id = toggleableLayerIds[i];

        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = "Satellite Only"
        link.id = id;
        
        link.onclick = function(e) {//TODO toggle click 
              
              
         
            var clickedLayer = this.id;
            e.preventDefault();
            e.stopPropagation();

            var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

            // toggle layer visibility by changing the layout object's visibility property
            if (visibility === 'visible') {
              map.setPaintProperty("county-centroids-dnxdon", 'text-color',"#000000")
                map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                d3.select(this).style("background-color","white")
                link.textContent = "Satellite Only"
                this.className = '';
            } else {
              map.setPaintProperty("county-centroids-dnxdon", 'text-color',"#ffffff")
                this.className = 'active';
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                    d3.select(this).style("background-color","yellow")
               link.textContent = "Hide Satellite"
            }
        };

        var layers = document.getElementById('layersMenu');
        layers.appendChild(link);
    }
}
//for crossfilter
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
