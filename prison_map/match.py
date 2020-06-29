##make dictionaries for all columns
import csv
import json
import collections
import operator
    
    
#SPL_THEMES,RPL_THEMES

#COUNTY,FIPS,
#COUNTY,FIPS,


##with open('/Users/Jia/Documents/map_corporations/data/temp/lazips_temp.csv', 'rb') as csvfile:
#with open('SVI2018_TRACT.csv', 'rb') as csvfile:
#    spamreader = csv.reader(csvfile)
#    
#    #for nycZip in nycZips_geo:
#        
#    for row in spamreader:
#        header = row
#        fipsI = header.index("FIPS")
#        splI = header.index("SPL_THEMES")
#        print row
#        break        
#    
stateCodes = {}
with open("state_fips.csv","rb")as stateFile:
    stateReader = csv.reader(stateFile)
    for s in stateReader:
        stateCode = s[2]
        stateName = s[0]
        stateCodes[stateName]=stateCode
print stateCodes

cases = []
with open("cases.csv","rb")as prisonCasesFile:
    casesReader = csv.reader(prisonCasesFile)
    for row in casesReader:
        print row
        header = row
        break
    for row in casesReader:
       # print row
        prisonNameList = row[3].split(" ")
        prisonNameClean = []
        for p in prisonNameList:
            
            newP = ''.join(e for e in p if e.isalnum())
            prisonNameClean.append(newP)
        prisonName = " ".join(prisonNameClean)
        state = row[2]
        date = row[0]
        #print date
        dictData = {}
        if date=="2020-06-17":
            for h in header:
                if unicode(row[header.index(h)],"utf-8").isnumeric():
                    dictData[h]=float(row[header.index(h)])
                else:
                    dictData[h]=row[header.index(h)]
            # print prisonName, state, stateCodes[state]
            cases.append([prisonName, state, stateCodes[state],dictData])
print "cases data", len(cases)


newCasesData = {}

outfile = open("no_match.csv","w")
noMatchWriter = csv.writer(outfile)



with open("prisons_centroids.geojson", "rb")as geojson:
    data = json.load(geojson)
    print data["features"][0]["properties"].keys()
  
    print len(data["features"])
    match = 0
    
    newCasesData = data
    newFeatures = []
    for c in cases:
        cName = c[0].lower().split(" ")
        cState = c[2]
        matched = False
        for i in data["features"]:
            #print i["properties"]
            fips = i["properties"]["COUNTYFIPS"]
            name = ''.join(e for e in i["properties"]["NAME"].lower().split(" ") if e.isalnum())
            
            
            state = fips[0:2]
            fId = ["FACILITYID"]
            cap = ["CAPACITY"]
        
            if len(cName)>1 and len(name)>1:
                if cName[0] in name and cName[1] in name and cState == state:
                    print cName, name
                    match+=1
                    matched = True
                    print match
                    newCaseEntry = i
                    newCaseEntry["properties"].update(c[3])
                    newFeatures.append(newCaseEntry)
                    break
        if matched == False:
             noMatchWriter.writerow(c)
    newCasesData["features"]=newFeatures
    
    with open('matches.geojson', 'w') as outfile:
        json.dump(newCasesData, outfile)