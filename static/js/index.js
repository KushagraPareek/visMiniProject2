/* Index.js for fetching data from */


let margin = {top: 10, right: 30, bottom: 30, left: 90},
    width  = 500 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom;

//Main Svg on which each graph is displayed
let svg = d3.select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right+50)
    .attr("height", height + margin.top + margin.bottom+50)
    .attr("transform","translate(150,50)")
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    
 dArray = [] 

function getXscale(data){
 data.forEach(function(item,index){

     dArray.push(data[index][0])

 });

 return d3.scaleBand()
       .domain(dArray)
       .padding(0.1)
       .range([0, width]);
}


function getYscale(data){

return d3.scaleLinear()
         .domain([0, d3.max(data, function(d) {
	        return d;
	      })])
         .range([height, 0]);

}

function getXscaleNumeric(data){

return d3.scaleLinear()
         .domain([d3.min(data,function(d){return d})-2, d3.max(data, function(d) {
	        return d;
	      })])
         .range([0, width]);

}


function getYscaleNumeric(data){

return d3.scaleLinear()
         .domain([d3.min(data,function(d){return d})-2, d3.max(data, function(d) {
	        return d;
	      })])
         .range([height, 0]);

}




function appendXaxis(xScale,msg){

   svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));
   svg.append("text")
      .attr("transform","translate("+ (width/2) +" , "+
                                   (height+40)+")").text(msg)
}

function appendYaxis(yScale,msg){

   svg.append("g")
      .call(d3.axisLeft(yScale));

   svg.append("text")
       .attr("transform","rotate(-90)")
       .attr("y",-35)
       .attr("x",-(height/2))
       .text(msg)

}

function remover(){
   svg.selectAll("*").remove();
   d3.select("#removeMe").remove();
}

function plotScree(data){

      
      cumArr = []
      graph = JSON.parse(data);
      data  = graph.graph_data;
      adder = 0;
      data.forEach(function(item,index){
         
         adder += data[index][1];
         cumArr.push(adder);
      });
      let xScale  = getXscale(data);
      let yScale  = getYscale(cumArr);
      appendXaxis(xScale,"PCA");
      appendYaxis(yScale,"variance ratio");
 
      svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d){
            return xScale(d[0])
          })
        .attr("y",function(d){
            return yScale(d[1])
         })
        .attr("width",xScale.bandwidth())
        .attr("height", function(d) { return height - yScale(d[1]); })
        .style("fill", "#69b3a2")


        let valueline = d3.line()
	        .x(function(d) {
	          return xScale(d[0]);
	        })
	        .y(function(d) {
	          return yScale(cumArr[d[0]-1]);
	        });
       svg.append("path")
	        .attr("class", "line")
                .style("stroke","#69b3a2")
                .style("fill", "none")
                .style("stroke-width","1.5px")
	        .attr("d", valueline(data));

      svg.selectAll(".dot")
      .data(data)
      .enter().append("circle") 
      .attr("class", "dot") // Assign a class for styling
      .style("fill", function(d){
                      if(cumArr[d[0]-1] > 0.73 && cumArr[d[0]-1] <=0.78 )
                                  return "red"
                        else return "black";
                })
      .attr("cx", function(d, i) { return xScale(d[0]) })
      .attr("cy", function(d) { return yScale(cumArr[d[0]-1]) })
      .attr("r", 5)

      svg.append("g").selectAll("text")
      .data(data)
      .enter().append("text") 
      .attr("x", function(d, i) { return xScale(d[0])+ 8 })
      .attr("y", function(d) { return yScale(cumArr[d[0]-1])+8 })
      .text(function(d){ 
                        if(cumArr[d[0]-1] > 0.73 && cumArr[d[0]-1] <=0.78 )
                                  return "Intrinsic Dimension : "+ d[0]
                        else return "";
                         });

}


function plotScatter(data){

   graph = JSON.parse(data);
   data  = graph.graph_data;
   colors = graph.colors
   
   data.forEach(function(item,index){
          
            if(colors != null)
                data[index][2] = colors[index];
            else
                data[index][2] = 4;
      });
   xData = []
   yData = []
   data.forEach(function(item,index){
         xData.push(data[index][0]);
      });

   data.forEach(function(item,index){
         yData.push(data[index][1]);
      });

   let xScale  = getXscaleNumeric(xData);
   let yScale  = getYscaleNumeric(yData);
   appendXaxis(xScale,"PC1");
   appendYaxis(yScale,"PC2");


   svg.selectAll(".dot")
      .data(data)
      .enter().append("circle") 
      .attr("class", "dot")
      .style("fill",function(d){
                     if(d[2] == 0)return "red";
                     if(d[2] == 1)return "purple";
                     if(d[2] == 2)return "orange";
                     if(d[2] == 3)return "green";
                     return "purple";
            })
      .attr("cx", function(d, i) { return xScale(d[0]) })
      .attr("cy", function(d) { return yScale(d[1]) })
      .attr("r", 2)


}


function plotMds(data){

   graph = JSON.parse(data);
   data  = graph.graph_data;
   colors = graph.colors
   console.log(data);
   data.forEach(function(item,index){
          
            if(colors != null)
                data[index][2] = colors[index];
            else
                data[index][2] = 4;
      });
   xData = []
   yData = []
   data.forEach(function(item,index){
         xData.push(data[index][0]);
      });

   data.forEach(function(item,index){
         yData.push(data[index][1]);
      });

   let xScale  = getXscaleNumeric(xData);
   let yScale  = getYscaleNumeric(yData);
   appendXaxis(xScale,"MDS1");
   appendYaxis(yScale,"MDS2");


   svg.selectAll(".dot")
      .data(data)
      .enter().append("circle") 
      .attr("class", "dot")
      .style("fill",function(d){
                     if(d[2] == 0)return "red";
                     if(d[2] == 1)return "purple";
                     if(d[2] == 2)return "orange";
                     if(d[2] == 3)return "green";
                     return "purple";
            })
      .attr("cx", function(d, i) { return xScale(d[0]) })
      .attr("cy", function(d) { return yScale(d[1]) })
      .attr("r", 2)


}
//Plotting Scatter Matrix
function plotScatterMatrix(file){


let width = 900,
    size = 200,
    padding = 20;

let x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

let y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

let xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6);

let yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6);


  d3.csv("../static/data/"+file, function(error, data) {
  if (error) throw error;

  //Get domain of each feature and store in domainByTrait
  let domainByTrait = {},
      traits = d3.keys(data[0]).filter(function(d) { return d !== "Cluster"; }),
      n = traits.length;

  traits.forEach(function(trait) {
    domainByTrait[trait] = d3.extent(data, function(d) { return d[trait]; });
  });

  traits.forEach(function(trait) {
      
      domainByTrait[trait][0] = domainByTrait[trait][0] -4;
      domainByTrait[trait][1] = domainByTrait[trait][1] +4;
      console.log(domainByTrait[trait][0]);
  });

 
  console.log(domainByTrait)
  xAxis.tickSize(size * n);
  yAxis.tickSize(-size * n);

  let svg = d3.select("#graph1").append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
      .attr("id","removeMe")
    .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  svg.selectAll(".x.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * size + ",0)"; })
      .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

  svg.selectAll(".y.axis")
      .data(traits)
    .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
      .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

  let cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
    .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(plot);

  cell.filter(function(d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  

  function plot(p) {
    var cell = d3.select(this);

    console.log(p.x);
    x.domain(domainByTrait[String(p.x)]);
    y.domain(domainByTrait[String(p.y)]);

    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);

    cell.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("cx", function(d) { return x(d[String(p.x)]); })
        .attr("cy", function(d) { return y(d[String(p.y)]); })
        .attr("r", 2)
        .style("fill", function(d) { 
                     if(d["Cluster"] == 0)return "red";
                     if(d["Cluster"] == 1)return "purple";
                     if(d["Cluster"] == 2)return "orange";
                     if(d["Cluster"] == 3)return "green";
                     return "purple"; });
        
  }

});

function cross(a, b) {
  var c = [], n = a.length, m = b.length, i, j;
  for (i = -1; ++i < n;) {
       for (j = -1; ++j < m;) 
               c.push({x: a[i], i: i, y: b[j], j: j});
   }
  return c;
}
//Refrenced from D3.js website      


//end
}

function getPcaData(){
remover();
$.post("/getPcaData",function(data){
 
         plotScree(data)
 });
   
}

function getPcaRandom(){
remover();
$.post("/getPcaRandom",function(data){
 
         plotScree(data)
 });
   
}

function getPcaStratified(){
remover();
$.post("/getPcaStratified",function(data){
 
         plotScree(data)
 });
   
}


//PCA
function getScatterData(){
remover();
$.post("/getScatterData",function(data){
 
         plotScatter(data)
 });
   
}

function getScatterRandom(){
remover();
$.post("/getScatterRandom",function(data){
 
        plotScatter(data)
         
 });
   
}

function getScatterStratified(){
remover();
$.post("/getScatterStratified",function(data){
 
        plotScatter(data) 
 });
   
}

//MDSE
function getmdsEScatterData(){
remover();
$.post("/getmdsEScatterData",function(data){
 
         plotMds(data)
 });
   
}

function getmdsEScatterRandom(){
remover();
$.post("/getmdsEScatterRandom",function(data){
 
        plotMds(data)
         
 });
   
}

function getmdsEScatterStratified(){
remover();
$.post("/getmdsEScatterStratified",function(data){
 
        plotMds(data) 
 });
   
}


//MDSC
function getmdsCScatterData(){
remover();
$.post("/getmdsCScatterData",function(data){
 
         plotMds(data)
 });
   
}

function getmdsCScatterRandom(){
remover();
$.post("/getmdsCScatterRandom",function(data){
 
        plotMds(data)
         
 });
   
}

function getmdsCScatterStratified(){
remover();
$.post("/getmdsCScatterStratified",function(data){
 
        plotMds(data) 
 });
   
}


function scatterMatrixData(){
remover();
$.post("/scatterMatrixData",function(data){
 
    plotScatterMatrix(data)
        
 });
   
}

function scatterMatrixRandom(){
remover();
$.post("/scatterMatrixRandom",function(data){
 
    plotScatterMatrix(data)
        
 });
   
}


function scatterMatrixStratified(){
remover();
$.post("/scatterMatrixStratified",function(data){
 
    plotScatterMatrix(data)
        
 });
   
}

