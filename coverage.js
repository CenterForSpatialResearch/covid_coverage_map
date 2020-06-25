

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
var pub = {
    strategy:null,
    coverage:null,
    aiannh:false,
    prison:false,
    satellite:false,
    tract_svi:false
}
var colors = {
hotspot:["#76272D","#B53B45","#F37985","#FBD3D6"],
SVI:["#141D45","#343466","#8B7FA0","#FBD3D6"],
hotspotSVI:["#02568B","#3983A8","#6EAFC3","#A7DCDF"],
    highDemand:["#2C4525","#5A7E5E","#8AB798","#BFE2CB"]}
function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var colorColumn = "_priority"
//var countySVI = d3.csv("SVI2018_US_COUNTY.csv")
//var tractSVI = d3.csv("SVI2018_TRACT.csv")
var countyCentroids = d3.json("county_centroids.geojson")
//var covid = d3.csv("https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv")
var root = "data_csv"
var highDemand=d3.csv(root+"/30_50_70_County_level_highdemand.csv")
var hotspot=d3.csv(root+"/30_50_70_County_level_hotspot.csv")
var SVI=d3.csv(root+"/30_50_70_County_level_SVI_pop.csv")
var hotspotSVI=d3.csv(root+"/30_50_70_hot_spot_SVI_county.csv")
var counties = d3.json("county_byState.geojson")
var aiannh = d3.json("indian_reservations.geojson")
var prison = d3.json("prisons_centroids.geojson")
var usOutline = d3.json("us_outline.geojson")
var normalizedPriority = d3.csv("priority_normalized_for_policies.csv")

Promise.all([highDemand,hotspot,SVI,hotspotSVI,counties,aiannh,prison,usOutline,normalizedPriority])
.then(function(data){
    ready(data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9])
})

var fillOpacity = {
    percentage_for_70:{property:"percentage_for_70",stops:[[0,0],[1,.8]]},
    percentage_for_50:{property:"percentage_for_50",stops:[[0,0],[1,.8]]},
    percentage_for_30:{property:"percentage_for_30",stops:[[0,0],[1,.8]]},
    show_all:.8
}

var fillColor = {
    SVI:{property:"SVI"+colorColumn,stops:[[0,"white"],[.33,"#8B7FA0"],[.66,"#343466"],[1,colors["SVI"]]]},
    hotspot:{property:"hotspot"+colorColumn,stops:[[0,"white"],[1,colors["hotspot"]]]},
    hotspotSVI:{property:"hotspotSVI"+colorColumn,stops:[[0,"white"],[1,colors["hotspotSVI"]]]},
    highDemand:{property:"highDemand"+colorColumn,stops:[[0,"white"],[1,colors["highDemand"]]]},
    normal:{}
}

/*
var fillColor = {
    SVI:{property:"normal_SVI_pop_priority",stops:[[0,"white"],[.33,"#8B7FA0"],[.66,"#343466"],[1,colors["SVI"]]]},
    hotspot:{property:"normal_hotspot_priority",stops:[[0,"white"],[1,colors["hotspot"]]]},
    hotspotSVI:{property:"normal_SVI_hotspot_priority",stops:[[0,"white"],[1,colors["hotspotSVI"]]]},
    highDemand:{property:"normal_high_demand_priority",stops:[[0,"white"],[1,colors["highDemand"]]]},
    normal:{}
}*/


var centroids = null
var latestDate = null

var coverageSet = ["percentage_for_30","percentage_for_50","percentage_for_70","show_all"]
var demandSet = ["highDemand","hotspot","SVI","hotspotSVI"]
var startColor = "white"
function ready(highDemandData,hotspotData,SVIData,hotspotSVIData,counties,aiannh,prison,usOutline,normalizedPriority){
    //convert to geoid dict
    var highDemand=turnToDict(highDemandData,"County FIPS","highDemand")
    var hotspot=turnToDict(hotspotData,"County FIPS","hotspot")
    var SVI=turnToDict(SVIData,"County FIPS","SVI")
    var hotspotSVI=turnToDict(hotspotSVIData,"County FIPS","hotspotSVI")
    var normalizedP = turnToDict(normalizedPriority,"FIPS","normal")
    
    var all = {"highDemand":highDemand,"hotspot":hotspot,"SVI":SVI,"hotspotSVI":hotspotSVI,"normal":normalizedP}
   // centroids = formatCentroids(county_centroids.features)
    //add to geojson of counties
    var combinedGeojson = combineGeojson(all,counties)
    //console.log(combinedGeojson)
    //drawKey("none")
    drawMap(combinedGeojson,aiannh,prison,usOutline)
    
    var formattedData = []
    for(var i in combinedGeojson.features){
        formattedData.push(combinedGeojson.features[i].properties)
    }
    d3.select('#download')
        .attr("cursor","pointer")
        .on('click', function() {
            var data = formattedData
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = mm + '_' + dd + '_' + yyyy;
            
            var blob = new Blob([d3.csvFormat(data)], {type: "text/csv;charset=utf-8"});
            saveAs(blob, "politics_of_care_data_"+today+".csv");
        });
};
function turnToDict(data,keyColumn,prefix){
    var newDict = {}
    var maxPriority = 0
    for(var i in data){
        if(data[i][keyColumn]!=undefined){
            var key = data[i][keyColumn]
            if(key.length==4){
                key = "0"+key
            }
            var keys = Object.keys(data[i])
            var newEntry = {}
            if(data[i]["priority"]>maxPriority){
                maxPriority = parseFloat(data[i]["priority"])
            }
            for(var k in keys){
                //add underscore to connect column heading
                
                if(keys[k]=="County FIPS"){
                    var cKey = "County_FIPS"
                    var cValue = data[i][keys[k]]
                }
                //add type to coverage to differentiate when combined
                else {
                    var cKey = prefix+"_"+keys[k]
                    var cValue = data[i][keys[k]]
                    if(keys[k]=="priority"){
                        var cValue = parseFloat(data[i][keys[k]])
                    }
                }
                
                newEntry[cKey]=cValue
            }
            newDict[key]=newEntry
        }
    }
    if(prefix!="normal"){
    fillColor[prefix]["stops"] = [[0,colors[prefix][3]],
    [maxPriority*.33,colors[prefix][2]],
    [maxPriority*.67,colors[prefix][1]],
    [maxPriority,colors[prefix][0]]]
    }
   
    return newDict
}

function combineGeojson(all,counties){
    for(var c in counties.features){
        var countyFIPS = counties.features[c].properties.FIPS
        var list = []
        for(var k in all){
            var entry = all[k][countyFIPS]
            list.push(entry)
        }
        var coverage = Object.assign(list[0],list[1],list[2],list[3],list[4])
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

function strategyMenu(map){
    var strategies = ["highDemand","hotspot","SVI","hotspotSVI"]
    var displayTextS = {highDemand:"High Demand",hotspot:"Hotspot",SVI:"SVI*Population",hotspotSVI:"Hotspot & SVI"}
    var displayTextC = {percentage_for_30:"30 CT per 100,000",percentage_for_50:"50 CT per 100,000",percentage_for_70:"70 CT per 100,000",show_all:"hide coverage info"}

    for (var i = 0; i < strategies.length; i++) {
        var id = strategies[i];

        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = displayTextS[id]
        link.id =id
        
        link.onclick = function(e){
            d3.selectAll("#strategiesMenu a").style("background","#fff")
            d3.select(this).style("background","rgb(255,255,0)")
            
            var clickedId = d3.select(this).attr("id")
            pub.strategy = clickedId
            if(pub.coverage==undefined){
                pub.coverage = "show_all"
                d3.select("#show_all").style("background","yellow")
            }
            fillOpacity[pub.coverage]["property"]=pub.strategy+"_"+pub.coverage
            d3.select("#subtitle").html("Map showing percent coverage at " +displayTextC[pub.coverage]+" if "+displayTextS[pub.strategy]+ " is prioritized")
            if (pub.coverage=="show_all"){
                d3.select("#subtitle").html("Map showing "+displayTextS[pub.strategy]+ "")
            }
            
            map.setPaintProperty("county_boundary", 'fill-color',fillColor[pub.strategy])
           
            map.setPaintProperty("county_boundary", 'fill-opacity',fillOpacity[pub.coverage])
        }
        var layers = document.getElementById('strategiesMenu');
        layers.appendChild(link);
    }
}
function coverageMenu(map){
    var strategies = ["percentage_for_30","percentage_for_50","percentage_for_70","show_all"]
    var displayTextC = {percentage_for_30:"30 CT per 100,000",percentage_for_50:"50 CT per 100,000",percentage_for_70:"70 CT per 100,000",show_all:"hide coverage info"}
    var displayTextS = {highDemand:"High Demand",hotspot:"Hotspot",SVI:"SVI*Population",hotspotSVI:"Hotspot & SVI"}

    for (var i = 0; i < strategies.length; i++) {
        var id = strategies[i];

        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = displayTextC[id]
        link.id = id;
        link.onclick = function(e){
            d3.selectAll("#coverageMenu a").style("background","#fff")
            d3.select(this).style("background","rgb(255,255,0)")
            var clickedId = d3.select(this).attr("id")
            pub.coverage = clickedId
           /*
            console.log(pub.coverage)
                       console.log(fillOpacity[pub.coverage])*/
           
            if(pub.strategy==undefined){
                pub.strategy = "SVI"
                d3.select("#SVI").style("background","yellow")
            }
            
            d3.select("#subtitle").html("Map showing percent coverage at " +displayTextC[pub.coverage]+" if "+displayTextS[pub.strategy]+ " is prioritized")
            if (pub.coverage=="show_all"){
                d3.select("#subtitle").html("Map showing "+displayTextS[pub.strategy]+ "")
            }
            fillOpacity[pub.coverage]["property"]=pub.strategy+"_"+pub.coverage
            
            map.setPaintProperty("county_boundary", 'fill-color',fillColor[pub.strategy])
           
            map.setPaintProperty("county_boundary", 'fill-opacity',fillOpacity[pub.coverage])
        }
        var layers = document.getElementById('coverageMenu');
        layers.appendChild(link);
    }
}
function drawlayerControl(map){

    var w = 60
    var h  =20
    var m = 120
    
    var svg = d3.select("#layerControl").append("svg").attr("width",500).attr("height",300)
    
    for(var i in coverageSet){
        svg.append("text")
              .text(coverageSet[i].split("_").join(" "))
              .attr("class",coverageSet[i])
              .attr("x",0).attr("y",i*h)
              .attr("transform","translate("+(m-10)+","+(m/2+h/2)+")")
              .attr("text-anchor","end")
      
        for(var j in demandSet){
            if(j==0){
                svg.append("text")
                .text(demandSet[i])
                .attr("class",demandSet[i])
                .attr("x",i*w).attr("y",20)
                .attr("transform","translate("+(m+w/2)+","+(m/2-30)+")")
                .attr("text-anchor","middle")
            }
            var id = demandSet[j]+"_"+coverageSet[i]
          //  console.log(id)
            svg.append("rect").attr("id",id)
            .attr("width",w-2).attr("height",h-2)
            .attr("x",j*w).attr("y",i*h)
                .attr("opacity",.4)
            .attr("transform","translate("+m+","+m/2+")")
            .style("cursor","pointer")
            .attr("stroke-width",2)
            .attr("stroke-color","black")
            .on("click",function(){                
                d3.selectAll("rect").attr("opacity",.4)
                d3.select(this).attr("opacity",1)
                var id = d3.select(this).attr("id")
                
                var demand = id.split("_")[0]
                var coverage = id.replace((demand+"_"),"")
             
                
                fillOpacity[coverage]["property"]=demand+"_"+coverage
                
                map.setPaintProperty("county_boundary", 'fill-color',fillColor[demand])
                map.setPaintProperty("county_boundary", 'fill-opacity',fillOpacity[coverage])
                
                //drawKey(demand)
            })
        }
    }
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

function drawMap(data,aiannh,prison){
	mapboxgl.accessToken = 'pk.eyJ1Ijoic2lkbCIsImEiOiJkOGM1ZDc0ZTc5NGY0ZGM4MmNkNWIyMmIzNDBkMmZkNiJ9.Qn36nbIqgMc4V0KEhb4iEw';    
    var bounds = [
    [-74.1, 40.6], // Southwest coordinates
    [-73.6, 40.9] // Northeast coordinates
    ];
   
    map = new mapboxgl.Map({
         container: 'map',
 		style: "mapbox://styles/sidl/ckbsbi96q3mta1hplaopbjt9s",
 		center:[-96,39],
         zoom: 4,
         preserveDrawingBuffer: true,
        minZoom:4//,
       // maxBounds: bounds    
     });
     map.on("load",function(){         
         
         map.addControl(
             new MapboxGeocoder({
                 accessToken: mapboxgl.accessToken,
                 mapboxgl: mapboxgl
             })
         );
  
       // drawlayerControl(map)
         //zoomToBounds(map)
       //  d3.select("#hotspot_coverage30").attr("opacity",1)
      //   map.setLayoutProperty("counties", 'visibility', 'none')

//layer order https://docs.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/
        map.setLayoutProperty("aiannh-text", 'visibility', 'none');
         
         map.addSource("counties_2",{
             "type":"geojson",
             "data":data
         })
         
         map.addLayer({
             'id': 'county_boundary',
             'type': 'fill',
             'source': 'counties_2',
             'paint': {
             'fill-color': "white",
             'fill-opacity':0
             },
             'filter': ['==', '$type', 'Polygon']
         },"admin");
         
         //for pattern: https://docs.mapbox.com/mapbox-gl-js/example/fill-pattern/
         map.addSource("aiannh",{
             "type":"geojson",
             "data":aiannh
         })
         
         
      
               // map.addLayer({
   //                       'id': 'aiannh',
   //                       'type': 'line',
   //                       'source': 'aiannh',
   //                         'layout': {
   //                         // make layer visible by default
   //                         'visibility': 'none'
   //                         },
   //                       'paint': {
   //                           "line-color":"black",
   //                           "line-opacity":1
   //                       },
   //                       'filter': ['==', '$type', 'Polygon']
   //                   });
   //
      
 
         map.loadImage(
                       'pattern_thin_2_t.png',
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
                                   'visibility': 'none'
                                },
                               'paint': {
                                   'fill-pattern': 'pattern'
                               }
                           });
                       }
                   );
          
 
         
         
         
         map.addSource("prisonData",{
             "type":"geojson",
             "data":prison
         })
         map.addLayer({
             'id': 'prison',
             'type': 'circle',
             'source': 'prisonData',
             'layout': {
             // make layer visible by default
             'visibility': 'none'
             },
             'paint': {
                 /*
                 "line-color":"blue",
                                  "line-opacity":1*/
                'circle-radius': 2,
                 'circle-opacity':.5,
                'circle-color': 'rgba(0,0,0,.4)'
             }
         });
         map.setLayoutProperty("tract_svi", 'visibility', 'none');
         map.setLayoutProperty("mapbox-satellite", 'visibility', 'none');
         
         
         strategyMenu(map)
         coverageMenu(map)
         toggleLayers(map)
         placesMenus(map)
              d3.select("#mapbox-satellite").style("opacity",.3)
              d3.select("#tract_svi").style("opacity",.3)
         /*paint code for masking - not in use, not tested
         'paint': 
                    {
                      'text-color': ['case', ['within', usOutline], 'black', 'red']
                    }
                  */       
         
    // console.log(map.getStyle().layers)
         
     })
     map.on("click","county_boundary",function(e){
         console.log(e)
     })
     
    /*
      map.on("move",function(){
              var zoom = map.getZoom();
              if(zoom >=5){
                  showpopup(map)
              }else{
                d3.selectAll(".mappopup").remove()
              }
              
              if(zoom<7){
                  d3.select("#mapbox-satellite").style("opacity",.3)
                  d3.select("#tract_svi").style("opacity",.3)
                  document.getElementById("tract_svi").disabled = true;
                  document.getElementById("mapbox-satellite").disabled = true;
                  
                 // map.setLayoutProperty("county_boundary", 'visibility', 'none')
              }else{
                  d3.select("#mapbox-satellite").style("opacity",1)
                  d3.select("#tract_svi").style("opacity",1)
              }
          })*/
    
}

function showpopup(map){
    //popup
    var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
    });     
     var hoveredStateId = null;
     
    map.on('mousemove', 'county_boundary', function(e) {
        if(e.features.length>0){
             var feature = e.features[0].properties
            // TODO: Change the cursor style as a UI indicator.             
                         var countyName = feature.LOCATION
                         var population = feature["E_TOTPOP"]
                          var totalDemand = feature["SVI_total_demand_of_county"]
                   
                         var columnsToShow = ["hotspotSVI_priority","hotspot_priority","SVI_priority","highDemand_priority"]
           var displayString = "<strong>"+countyName+"</strong><br>"
                         +"<strong>Population:</strong> "+population+"<br>"
                         +"<strong>Demand:</strong> "+totalDemand+"<br>"
                   
            for(var c in columnsToShow){
                var label = columnsToShow[c]
                var value = feature[label]
                displayString+="<strong>"+label.split("_").join(" ")+ ": </strong>"+value+"<br>"                 
            }
       
       
            var x = event.clientX;     // Get the horizontal coordinate
            var y = event.clientY;     // Get the vertical coordinate
            d3.selectAll(".mappopup").remove()
              d3.select("body")
            .append("div")
            .attr("class","mappopup")
            .style("position","absolute")
            .style("background-color","rgba(255,255,255,.7)")
            .style("padding","10px")
            .style("left",x+10+"px").style("top",y+10+"px")
            .html(displayString)
        }
      
           if (e.features.length > 0) {
           if (hoveredStateId) {
           map.setFeatureState(
           { source: 'counties_2', id: "county_boundary" },
           { hover: false }
           );
           }
           hoveredStateId = e.features[0].id;
           map.setFeatureState(
           { source: 'counties_2', id: "county_boundary" },
           { hover: true }
           );
           }
       });
       map.on('mouseleave','county_boundary', function(e) {
            d3.selectAll(".mappopup").remove()
       })
}
function placesMenus(map){
    var places = ["Mainland","Alaska","Hawaii","Puerto_Rico"]
    var coords = {
        "Mainland":{coord:[39,-96],zoom:4},
        "Alaska":{coord:[63.739,-147.653],zoom:4},
        "Hawaii":{coord:[20.524,-157.063],zoom:7.1},
        "Puerto_Rico":{coord:[18.219,-66.338],zoom:8}
    }
    
    for (var i = 0; i < places.length; i++) {
        var id = places[i];
        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = id.split("_").join(" ");
        link.id =id;

        link.onclick = function(e) {
            var id = d3.select(this).attr("id")
            var coord = coords[id].coord
            var zoom = coords[id].zoom
            map.flyTo({
                zoom: zoom,
            center: [
           coord[1] ,
            coord[0]
            ],
            speed: 0.8, // make the flying slow
            curve: 1
            //essential: true // this animation is considered essential with respect to prefers-reduced-motion
            });
        };

        var layers = document.getElementById('placesMenu');
        layers.appendChild(link);
    }
}

function toggleLayers(map){
    // enumerate ids of the layers
    var toggleableLayerIds = ['aiannh', 'prison','mapbox-satellite',"tract_svi"];

    // set up the corresponding toggle button for each layer
    for (var i = 0; i < toggleableLayerIds.length; i++) {
        var id = toggleableLayerIds[i];

        var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
        link.textContent = id
        link.id = id;
        
        link.onclick = function(e) {//TODO toggle click 
         
            var clickedLayer = this.textContent;
            e.preventDefault();
            e.stopPropagation();

            var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

            // toggle layer visibility by changing the layout object's visibility property
            if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                d3.select(this).style("background-color","white")
                if(clickedLayer=="aiannh"){
                    map.setLayoutProperty("aiannh-text", 'visibility', 'none');
                }
                this.className = '';
            } else {
                this.className = 'active';
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                    d3.select(this).style("background-color","yellow")
                if(clickedLayer=="aiannh"){
                    map.setLayoutProperty("aiannh-text", 'visibility', 'visible');
                }
            }
        };

        var layers = document.getElementById('menu');
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
