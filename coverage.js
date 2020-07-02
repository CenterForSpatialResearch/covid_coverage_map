

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
    strategy:null,
    coverage:null,
    aiannh:false,
    prison:false,
    satellite:false,
    tract_svi:false,
    all:null,
    centroids:null
}
var highlightColor = "#3983a8"
var bghighlightColor = "#ffcc67"
var outlineColor = "#ffcc67"
var colors = {
hotspot:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
SVI:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
hotspotSVI:["#A7DCDF","#6EAFC3","#3983A8","#02568B"],
    highDemand:["#A7DCDF","#6EAFC3","#3983A8","#02568B"]}
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

Promise.all([highDemand,hotspot,SVI,hotspotSVI,counties,aiannh,prison,usOutline,normalizedPriority,countyCentroids])
.then(function(data){
    ready(data[0],data[1],data[2],data[3],data[4],data[5],data[6],data[7],data[8],data[9],data[10])
})

var lineOpacity = {
    percentage_for_70:{property:"percentage_for_70",stops:[[0,1],[100,0.3]]},
    percentage_for_50:{property:"percentage_for_50",stops:[[0,1],[100,0.3]]},
    percentage_for_30:{property:"percentage_for_30",stops:[[0,1],[100,0.3]]},
    show_all:1
}
var lineWeight = {
    percentage_for_70:{property:"percentage_for_70",stops:[[0,2],[99,1],[100,0]]},
    percentage_for_50:{property:"percentage_for_50",stops:[[0,3],[99,1],[100,0]]},
    percentage_for_30:{property:"percentage_for_30",stops:[[0,3],[99,1],[100,0]]},
    show_all:1
}
var fillOpacity = {
    percentage_for_70:{property:"percentage_for_70",stops:[[0,0],[1,1]]},
    percentage_for_50:{property:"percentage_for_50",stops:[[0,0],[1,1]]},
    percentage_for_30:{property:"percentage_for_30",stops:[[0,0],[1,1]]},
    show_all:1
}
var gray = "#aaaaaa"
var fillColor = {
    SVI:{
        property:"SVI"+colorColumn,
        stops:[
            [0,colors["SVI"][0]],
            [16000,colors["SVI"][1]],
            [60000,colors["SVI"][2]],
            [240000,colors["SVI"][3]]]},
    hotspot:{
        property:"hotspot"+colorColumn,
        stops:[
            [0,colors["hotspot"][0]],
            [0.00018,colors["hotspot"][1]],
            [0.00065,colors["hotspot"][2]],
            [0.99205,colors["hotspot"][3]]
        ]
    },
    hotspotSVI:{
        property:"hotspotSVI"+colorColumn,
        stops:[
            [0,colors["hotspotSVI"][0]],
            [6.1,colors["hotspotSVI"][1]],
            [25.70,colors["hotspotSVI"][2]],
            [81.31,colors["hotspotSVI"][3]]
        ]},
    highDemand:{
        property:"highDemand"+colorColumn,
        stops:[
            [0,colors["highDemand"][0]],
            [50,colors["highDemand"][1]],
            [250,colors["highDemand"][2]],
            [1000,colors["highDemand"][3]]
        ]},
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
function ready(highDemandData,hotspotData,SVIData,hotspotSVIData,counties,aiannh,prison,usOutline,normalizedPriority,county_centroids){
    //convert to geoid dict
    
    var highDemand=turnToDict(highDemandData,"County FIPS","highDemand")
    var hotspot=turnToDict(hotspotData,"County FIPS","hotspot")
    var SVI=turnToDict(SVIData,"County FIPS","SVI")
    var hotspotSVI=turnToDict(hotspotSVIData,"County FIPS","hotspotSVI")
    var normalizedP = turnToDict(normalizedPriority,"FIPS","normal")
    
    pub.all = {"highDemand":highDemand,"hotspot":hotspot,"SVI":SVI,"hotspotSVI":hotspotSVI,"normal":normalizedP}
    pub.centroids = formatCentroids(county_centroids.features)
    //add to geojson of counties
    var combinedGeojson = combineGeojson(pub.all,counties)
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
        
        var noDemand = []
        
        // for(j in pub.all["highDemand"]){
 //            var actualDemand = pub.all["highDemand"][j]["SVI_total_demand_of_county"]
 //            if(actualDemand ==0){
 //                noDemand.push(pub.all["highDemand"][j]["County_FIPS"])
 //            }
 //        }
       // console.log(noDemand)
        
    //drawHistogram(pub.strategy,pub.coverage)
};
function turnToDict(data,keyColumn,prefix){
    var newDict = {}
    var maxPriority = 0
    var keys = Object.keys(data[0])
    //console.log(keys)
    var notBinaryCoverage = []
    for(var i in data){
        var actualDemand = parseInt(data[i]["total_demand_of_county"])
        
        if(data[i][keyColumn]!=undefined){
            var key = data[i][keyColumn]
            if(key.length==4){
                key = "0"+key
            }
            var newEntry = {}
            if(data[i]["priority"]>maxPriority){
                maxPriority = parseFloat(data[i]["priority"])
            }
            if(data[i]["percentage_for_30"]>0 &&data[i]["percentage_for_30"]<100){
               // console.log(data[i]["percentage_for_30"])
                notBinaryCoverage.push(data[i]["percentage_for_30"])
            }
            for(var k in keys){
                //add underscore to connect column heading
                
                if(keys[k]=="County FIPS"){
                    var cKey = "County_FIPS"
                    var cValue = data[i][keys[k]]
                }
                // else if(coverageSet.indexOf(keys[k])>-1){//keys[k]=="percent_for_30" ||keys[k]=="percent_for_50"||keys[k]=="percent_for_70")
//                     var cKey = prefix+"_"+keys[k]
//                     if(actualDemand == 0){
//                         var cValue = 1
//                     }else{
//                         var cValue = data[i][keys[k]]
//                     }
//                 }
               //add type to coverage to differentiate when combined
                else {
                    var cKey = prefix+"_"+keys[k]
                    var cValue = data[i][keys[k]]
                    if(keys[k]=="priority"){
                        var cValue = parseFloat(data[i][keys[k]])
                    }
                }
                if(isNaN(cValue)==false){
                    cValue = parseFloat(cValue)
                }
                
                newEntry[cKey]=cValue
            }
            newDict[key]=newEntry
        }
    }
   // console.log(notBinaryCoverage)
   /*
    if(prefix!="normal"){
       fillColor[prefix]["stops"] = [[0,colors[prefix][3]],
       [maxPriority*.33,colors[prefix][2]],
       [maxPriority*.67,colors[prefix][1]],
       [maxPriority,colors[prefix][0]]]
       }*/
 //  console.log(newDict)
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
                .attr("width",1200)
                .attr("height",100)
   
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
    
   // svg.append("text").text("priority value").attr("x",20).attr("y",30)
    svg.append("text").text("# of counties").attr("x",10).attr("y",45)
    svg.append("text").text("# of cases").attr("x",10).attr("y",75)


    for(var b in formattedBreaks){
        var bk = formattedBreaks[b]
        gradient.append("stop")
        .attr("offset",bk.sLength+"%")
        .style("stop-color",bk.color)
        
    }
    svg.append("rect")
    .attr("x",0)
    .attr("y",50)
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
        .text(bk.actualLength)
        .attr("x",xScale(bk.sLength+bk.length/2)-5)
        .attr("y",55)
        .attr("text-anchor","end")
        .style("writing-mode","vertical-rl")
        
        svg.append("text")
        .text(bk.cases)
        .attr("x",xScale(bk.sLength+bk.length/2)-5)
        .attr("y",65)
        .attr("text-anchor","start")
        .style("writing-mode","vertical-rl")
        
        svg.append("rect")
        .attr("width",2)
        .attr("height",10)
        .attr("x",xScale(bk.cLength)-2)
        .attr("y",50)
        .attr("fill","white")
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

function strategyMenu(map){
    var strategies = ["highDemand","hotspot","SVI","hotspotSVI"]
    var displayTextS = {highDemand:"Number of New COVID Cases",hotspot:"New Cases as % of Population",SVI:"Census Demographic Social Vulnerability",hotspotSVI:"Census Demographic Social Vulnerability and New Cases as % of Population "}
    var displayTextC = {percentage_for_30:"30 CHW per 100,000",percentage_for_50:"50 CHW per 100,000",percentage_for_70:"70 CHW per 100,000",show_all:"hide coverage info"}


    var buttons = d3.select("#strategiesMenu").append("div").attr("class",id)

    for (var i = 0; i < strategies.length; i++) {
        var id = strategies[i];
        var displayText = displayTextS[id]
        
        var row = d3.select("#strategiesMenu").append("div").attr("class",id+"_radialMenuS radialMenuS").attr("id",id).style("cursor","pointer")
        var radial = row.append("div")
            .style("width","9px").style("height","9px")
            .style("border","1px solid black")
            .style("margin","4px")
            .style("border-radius","5px").attr("class",id+"_radialS radialS "+id)
            .style("display","inline-block")
            .style("vertical-align","top")
        var label = row.append("div").html(displayText).attr("class",id+"_labelS labelS "+id).style("width","160px").style("display","inline-block")
             
         row.on("mouseover",function(){
             d3.select(this).style("background-color",bghighlightColor)
         })
         row.on("mouseout",function(){
             d3.select(this).style("background-color","rgba(0,0,0,0)")
         })
        row.on("click",function(){
            var clickedId = d3.select(this).attr("id")
            pub.strategy = clickedId
            if(pub.coverage==undefined){
                 pub.coverage = "show_all"
                 d3.select(".show_all_radialC").style("background-color",highlightColor).style("border","1px solid "+ highlightColor)
                d3.selectAll(".show_all").style("color",highlightColor)
             }
             
            
            d3.selectAll(".radialS").style("background-color","white").style("border","1px solid black")
            d3.selectAll(".labelS").style("color","black")
            
            d3.selectAll("."+clickedId).style("color",highlightColor)
            d3.selectAll("."+clickedId+"_radialS").style("background-color",highlightColor).style("border","1px solid "+ highlightColor)
           
              d3.select("#subtitle").html("Map showing percent coverage at " +displayTextC[pub.coverage]+" if "+displayTextS[pub.strategy]+ " is prioritized")
              
             lineOpacity[pub.coverage]["property"]=pub.strategy+"_"+pub.coverage
             lineWeight[pub.coverage]["property"]=pub.strategy+"_"+pub.coverage
             
              map.setPaintProperty("county_boundary", 'fill-opacity',1)
              map.setPaintProperty("county_boundary", 'fill-color',fillColor[pub.strategy])     
             
              if (pub.coverage=="show_all"){
                  map.setPaintProperty("county_outline", 'line-opacity',0)
                  map.setPaintProperty("county_outline", 'line-color',"#fff")
                  map.setPaintProperty("county_outline", 'line-width',1)
              }else{
                  map.setPaintProperty("county_outline", 'line-opacity',lineOpacity[pub.coverage])
                  map.setPaintProperty("county_outline", 'line-color',outlineColor)
                  map.setPaintProperty("county_outline", 'line-width',lineWeight[pub.coverage])
              }          
                 
              drawHistogram(pub.strategy)
        })
     }
}
function coverageMenu(map){
    var strategies = ["percentage_for_30","percentage_for_50","percentage_for_70","show_all"]
    var displayTextC = {percentage_for_30:"30 CHW per 100,000 Residents",percentage_for_50:"50 CHW per 100,000",
    percentage_for_70:"70 CHW per 100,000",show_all:"hide coverage info"}
    var displayTextS = {highDemand:"High Demand",hotspot:"Hotspot",SVI:"SVI*Population",hotspotSVI:"Hotspot & SVI"}

    for (var i = 0; i < strategies.length; i++) {
        var id = strategies[i];
        
        var id = strategies[i];
        var displayText = displayTextC[id]
        
       
        var row = d3.select("#coverageMenu").append("div").attr("class",id+"_radialMenuC radialMenuC").attr("id",id).style("cursor","pointer")
        var radial = row.append("div")
            .style("width","9px").style("height","9px")
            .style("border","1px solid black")
            .style("margin","4px")
            .style("border-radius","5px").attr("class",id+"_radialC radialC "+id)
            .style("display","inline-block")
            .style("vertical-align","top")
        var label = row.append("div").html(displayText).attr("class",id+"_labelC labelC "+id).style("width","160px").style("display","inline-block")
             
         row.on("mouseover",function(){
             d3.select(this).style("background-color",bghighlightColor)
         })
         row.on("mouseout",function(){
             d3.select(this).style("background-color","rgba(0,0,0,0)")
         })
         
         row.on("click",function(){
            var clickedId = d3.select(this).attr("id")
             
             pub.coverage = clickedId
             if(pub.strategy==undefined){
                  pub.strategy = "SVI"
                  d3.select(".SVI_radialS").style("background-color",highlightColor).style("border","1px solid "+ highlightColor)
                 d3.selectAll(".SVI").style("color",highlightColor)
              }
             
             d3.selectAll(".radialC").style("background-color","white").style("border","1px solid black")
             d3.selectAll(".labelC").style("color","black")
            
            
             d3.selectAll("."+clickedId).style("color",highlightColor)
             d3.selectAll("."+clickedId+"_radialC").style("background-color",highlightColor).style("border","1px solid "+ highlightColor)
           
             lineOpacity[pub.coverage]["property"]=pub.strategy+"_"+pub.coverage
             lineWeight[pub.coverage]["property"]=pub.strategy+"_"+pub.coverage
               d3.select("#subtitle").html("Map showing percent coverage at " +displayTextC[pub.coverage]+" if "+displayTextS[pub.strategy]+ " is prioritized")
              if (pub.coverage=="show_all"){
                  d3.select("#subtitle").html("Map showing "+displayTextS[pub.strategy]+ "")
                  map.setPaintProperty("county_outline", 'line-opacity',0)
                  map.setPaintProperty("county_outline", 'line-color',"#fff")
                  map.setPaintProperty("county_outline", 'line-width',1)
              }else{
                  map.setPaintProperty("county_outline", 'line-opacity',lineOpacity[pub.coverage])
                  map.setPaintProperty("county_outline", 'line-width',lineWeight[pub.coverage])
                  map.setPaintProperty("county_outline", 'line-color',outlineColor)
              }

              map.setPaintProperty("county_boundary", 'fill-opacity',1)
              map.setPaintProperty("county_boundary", 'fill-color',fillColor[pub.strategy])
              drawHistogram(pub.strategy)
         })
         
        // var link = document.createElement('a');
 //        link.href = '#';
 //        link.className = 'active';
 //        link.textContent = displayTextC[id]
 //        link.id = id;
 //        link.onclick = function(e){
 //            d3.selectAll("#coverageMenu a").style("background","#fff")
 //            d3.select(this).style("background","rgb(255,255,0)")
 //            var clickedId = d3.select(this).attr("id")
 //            pub.coverage = clickedId
 //           /*
 //            console.log(pub.coverage)
 //                       console.log(fillOpacity[pub.coverage])*/
 //
 //            if(pub.strategy==undefined){
 //                pub.strategy = "SVI"
 //                d3.select("#SVI").style("background","yellow")
 //            }
 //
 //            d3.select("#subtitle").html("Map showing percent coverage at " +displayTextC[pub.coverage]+" if "+displayTextS[pub.strategy]+ " is prioritized")
 //            if (pub.coverage=="show_all"){
 //                d3.select("#subtitle").html("Map showing "+displayTextS[pub.strategy]+ "")
 //            }
 //            fillOpacity[pub.coverage]["property"]=pub.strategy+"_"+pub.coverage
 //
 //            map.setPaintProperty("county_boundary", 'fill-color',fillColor[pub.strategy])
 //
 //            map.setPaintProperty("county_boundary", 'fill-opacity',fillOpacity[pub.coverage])
 //        }
 //        var layers = document.getElementById('coverageMenu');
 //        layers.appendChild(link);
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
               // map.setPaintProperty("county_boundary", 'line-opacity',fillOpacity[coverage])
                
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
 		center:[-93,37],
         zoom: 3.8,
         preserveDrawingBuffer: true,
        minZoom:3.5//,
       // maxBounds: bounds    
     });
     
     map.on("load",function(){         
         map.setLayoutProperty("aiannh-text", 'visibility', 'none');
         map.setLayoutProperty("mapbox-satellite", 'visibility', 'none');
         
      /*
        var geocoder = new MapboxGeocoder({
                       accessToken: mapboxgl.accessToken,
                       mapboxgl: mapboxgl
                   })*/
      
  
       //  document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
         
       // drawlayerControl(map)
         //zoomToBounds(map)
       //  d3.select("#hotspot_coverage30").attr("opacity",1)
      //   map.setLayoutProperty("counties", 'visibility', 'none')

//layer order https://docs.mapbox.com/mapbox-gl-js/example/geojson-layer-in-stack/
         
         map.addSource("counties_2",{
             "type":"geojson",
             "data":data
         })
         
         map.addLayer({
             'id': 'county_outline',
             'type': 'line',
             'source': 'counties_2',
             'paint': {
                 'line-color':"white",
                 'line-opacity':.3
             },
             'filter': ['==', '$type', 'Polygon']
         },"mapbox-satellite");
         
         
         
         map.addLayer({
             'id': 'county_boundary',
             'type': 'fill',
             'source': 'counties_2',
             'paint': {
             'fill-color': "white",
                 'fill-opacity':0
             },
             'filter': ['==', '$type', 'Polygon']
         },"county_outline");
         
        
         
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
          
         map.setLayoutProperty("mapbox-satellite", 'visibility', 'none');
         
         
         strategyMenu(map)
         coverageMenu(map)
         toggleLayers(map)
         placesMenus(map)
              d3.select("#mapbox-satellite").style("opacity",.3)
         /*paint code for masking - not in use, not tested
         'paint': 
                    {
                      'text-color': ['case', ['within', usOutline], 'black', 'red']
                    }
                  */       
         
    // console.log(map.getStyle().layers)
         
     })
    /*
     map.on("click","county_boundary",function(e){
             console.log(e.features[0].properties["SVI_total_demand_of_county"])
         })*/
    
     var popup = new mapboxgl.Popup({
         closeButton: false,
         closeOnClick: false
     });     
      var hoveredStateId = null;
     
     var firstMove = true
     map.on('mousemove', 'county_boundary', function(e) {
         var feature = e.features[0]
         map.getCanvas().style.cursor = 'pointer'; 
         if(feature["properties"].LOCATION!=undefined){
             var countyName = feature["properties"].LOCATION
             var population = feature["properties"]["E_TOTPOP"]
             var geometry = feature["geometry"]
             var countyId = feature["properties"]["FIPS"]
           //  var columnsToShow = ["hotspotSVI_priority","hotspot_priority","SVI_priority","highDemand_priority"]

                  var columnsToShow = ["RPL_THEMES","highDemand_priority"]
             var displayTextS = {highDemand_priority:"Number of New COVID Cases",hotspot_priority:"New Cases as % of Population",RPL_THEMES:"County Census Demographic Social Vulnerability Percentile",hotspotSVI_priority:"Census Demographic Social Vulnerability and New Cases as % of Population "}


             var displayString = "<span class=\"popupTitle\">"+countyName+"</span><br>"
                     +"Population: "+population+"<br>"
             
             for(var c in columnsToShow){
                 var label = displayTextS[columnsToShow[c]]
                 // console.log(columnsToShow[c]+"_priority")
                 var value = feature["properties"][columnsToShow[c]]
                 displayString+=label.split("_").join(" ")+ ": "+value+"<br>"                 
             }
           //  console.log(feature["properties"])
             if(pub.strategy!==null && pub.coverage!=null){
                 var coverage = feature["properties"][pub.strategy+"_"+pub.coverage]
             }
             
             displayString+="% of needs met: "+coverage+"<br>"
            // var coords = feature.geometry.coordinates[0][0]
             var coords = pub.centroids[feature.properties["FIPS"]]
             var formattedCoords =coords// {lat:coords[1],lng:coords[0]}

             while (Math.abs(e.lngLat.lng - formattedCoords[0]) > 180) {
                 formattedCoords[0] += e.lngLat.lng > formattedCoords[0] ? 360 : -360;
             }

             popup
             .setLngLat(formattedCoords)
             .setHTML(displayString)
             .addTo(map);

         }         
         
         d3.select(".mapboxgl-popup-content").style("background-color","rgba(255,255,255,.9)")
         d3.select(".mapboxgl-popup-content").append("div").attr("id","sMap").style("width","200px").style("height","200px")//.style('background-color',"red")
         
         subMap(firstMove,formattedCoords,geometry,countyId)
         firstMove=false

     });
 
      map.on('mouseleave','county_boundary', function(e) {
          d3.selectAll(".mapboxgl-popup").remove()
      })
    
      map.on("move",function(){
              var zoom = map.getZoom();
                  //showpopup(map)
            
              
              if(zoom<7){
                  d3.select("#mapbox-satellite").style("opacity",.3)
                  d3.select("#tract_svi").style("opacity",.3)
                  //document.getElementById("tract_svi").disabled = true;
                  document.getElementById("mapbox-satellite").disabled = true;
                  
                 // map.setLayoutProperty("county_boundary", 'visibility', 'none')
              }else{
                  d3.select("#mapbox-satellite").style("opacity",1)
                  //d3.select("#tract_svi").style("opacity",1)
              }
          })
    
}
function subMap(firstMove,center,geometry,countyId){
    var coordinates = geometry.coordinates[0]
    var bounds = coordinates.reduce(function(bounds, coord) {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
    
  //  console.log(center)
    if(firstMove == false){
        detailMap.remove()
    }
    detailMap = new mapboxgl.Map({
         container: 'sMap',
 		style: "mapbox://styles/sidl/ckc3ibioh0iza1iqiz0d3vnii",
 		center:[center.lng,center.lat],
         zoom: 8,
         preserveDrawingBuffer: true,
     });
     detailMap.fitBounds(bounds, {
         padding: 5
     });
/*
     var filter = ['in',["get",'FIPS'],["literal",[countyId]]];
     detailMap.setFilter("county",filter)*/

     
}

function placesMenus(map){
    var places = ["Contiguous 48","Alaska","Hawaii","Puerto_Rico"]
    var coords = {
        "Contiguous 48":{coord:[39,-96],zoom:4},
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
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
                d3.select(this).style("background-color","white")
                link.textContent = "Satellite Only"
                this.className = '';
            } else {
                this.className = 'active';
                map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
                    d3.select(this).style("background-color","yellow")
               link.textContent = "Hide Satellite"
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
