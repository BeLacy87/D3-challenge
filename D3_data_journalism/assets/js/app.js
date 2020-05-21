function makeResponsive() {

  var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
      svgArea.remove();
    }
  
  var svgWidth = 960;
  var svgHeight = 500;
  var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
  };
  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;
  
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  
  
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  var chosenXAxis = "poverty";
  var chosenYAxis = "obesity";
  
  function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
    return xLinearScale;
  }
  function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
    return yLinearScale;
  }
  function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
    return xAxis;
  }
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
    return yAxis;
  }
  function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))   
    return circlesGroup;
  }
  function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]))   
    return circlesGroup;
  }
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;
    if (chosenXAxis === "poverty") {
      xlabel = "% in poverty: ";
    }
    else if (chosenXAxis === "age"){
      xlabel = "median age: "
    }
    else  {
      xlabel = "household income: ";
    }
    var ylabel;
    if (chosenYAxis === "obesity") {
      ylabel = "% obesity: ";
    }
    else if (chosenYAxis === "smokes"){
      ylabel = "% smokers: "
    }
    else  {
      ylabel = "% lacking healthcare: ";
    }
    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`);
    });

    circlesGroup.call(toolTip);
      circlesGroup
      .on("mouseover", function(data) {
          toolTip.show(data);
        })
      .on("mouseout", function(data) {
            toolTip.hide(data);
          });
    return circlesGroup;
  ;
  }
  
  d3.csv("./assets/data/data.csv").then(function(healthData, err) {
    if (err) throw err;
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .attr("transform", `translate(0, 0)`)
      .call(leftAxis);
   
    var circlesGroup = chartGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)    
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r",10)
      .attr("opacity", ".5")
      .append("text")
      .text(function(d){return d.abbr})
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis]))
      
      // .text(function(d){return d.abbr})

    // chartGroup.selectAll("text")
    //   .data(healthData)
    //   .enter()
    //   .append("text")
    //   .text(function(d) {
    //     return d.abbr;
    //   })
    //   .attr("x", function(d) {
    //   return d[0];
    //   })
    //   .attr("y", function(d) {
    //   return d[1];
    //   })
    //   .attr("font-family", "sans-serif")
    //   .attr("font-size", "11px")
    //   .attr("fill", "red");

      // chartGroup.selectAll("text")
      // .data(healthData)
      // .enter()
      // .append("text")
      // .text(function(d){return d.abbr})
      // .attr("dx", d => xLinearScale(d[chosenXAxis]))
      // .attr("dy", d => yLinearScale(d[chosenYAxis]))  

    
  
   //labels for X axis  
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`).classed("aText",true);
      var povertyLabel = labelsGroup.append("text")
          .attr("x", 0).attr("y", 20).attr("value", "poverty")
          .classed("active", true)
          .text("In Poverty (%)");
      var ageLabel = labelsGroup.append("text")
          .attr("x", 0).attr("y", 40).attr("value", "age") 
          .classed("inactive", true)
          .text("Age (median)");
      var incomeLabel = labelsGroup.append("text")
          .attr("x", 0).attr("y", 60).attr("value", "income") 
          .classed("inactive", true)
          .text("Household Income (median)");
  
   //labels for y axis
   var labelsGroupY = chartGroup.append("g")
      .attr("transform", `rotate(-90), translate(-${height/2},-${margin.left})`)
    // .attr("y", 0 - margin.left)
    // .attr("x", 0-(height / 2))
      .attr("dy", "1em")
      .classed("aText", true)
      var obesityLabel = labelsGroupY.append("text")
          .attr("x", 0).attr("y", 20).attr("value", "obesity") 
          .classed("active", true)
          .text("Obesity (%)");
      var smokesLabel = labelsGroupY.append("text")
          .attr("x", 0).attr("y", 40).attr("value", "smokes") 
          .classed("inactive", true)
          .text("Smokers (%)");
      var healthCareLabel = labelsGroupY.append("text")
          .attr("x", 0).attr("y", 60).attr("value", "healthcare") 
          .classed("inactive", true)
          .text("Lacks Healthcare (%)");
      var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
      function use_x(value) {
          chosenXAxis = value;
          xLinearScale = xScale(healthData, chosenXAxis);
          xAxis = renderAxes(xLinearScale, xAxis);
          circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
          circlesGroup= updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true).classed("inactive", false);
            ageLabel
              .classed("active", false).classed("inactive", true);
            incomeLabel
              .classed("active", false).classed("inactive", true);
          }
          else if (chosenXAxis === "age"){
            povertyLabel
              .classed("active", false).classed("inactive", true);
            ageLabel
              .classed("active", true).classed("inactive", false);
            incomeLabel
              .classed("active", false).classed("inactive", true);
          }else {
            povertyLabel
              .classed("active", false).classed("inactive", true);
            ageLabel
              .classed("active", false).classed("inactive", true);
            incomeLabel
              .classed("active", true).classed("inactive", false);
          }      
      }
  
      function use_y(value) {
    chosenYAxis = value;
          yLinearScale = yScale(healthData, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          if (chosenYAxis === "obesity") {
            obesityLabel
              .classed("active", true).classed("inactive", false);
            smokesLabel
              .classed("active", false).classed("inactive", true);
            healthCareLabel
              .classed("active", false).classed("inactive", true);
          }
          else if (chosenYAxis === "smokes"){
            obesityLabel
              .classed("active", false).classed("inactive", true);
            smokesLabel
              .classed("active", true).classed("inactive", false);
            healthCareLabel
              .classed("active", false).classed("inactive", true);
          }else {
            obesityLabel
              .classed("active", false).classed("inactive", true);
            smokesLabel
              .classed("active", false).classed("inactive", true);
            healthCareLabel
              .classed("active", true).classed("inactive", false);
          }
      }
  
      labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        console.log(value)
        console.log(chosenXAxis);
        switch (value){
          case "poverty":
            use_x(value);
            break;
          case "age":
            use_x(value);
            break;
          case "income":
            use_x(value);
            break;
          }
      });
      labelsGroupY.selectAll("text")
      .on("click", function() {
         // get value of selection
         var value = d3.select(this).attr("value");
         console.log(value);
         switch (value){
          case "obesity":
             use_y(value);
             break;
           case "smokes":
             use_y(value);
             break;
           case "healthcare":
             use_y(value);
             break;
         }
      });
   
      var xlabel;
    if (chosenXAxis === "poverty") {
      xlabel = "% in poverty: ";
    }
    else if (chosenXAxis === "age"){
      xlabel = "median age: "
    }
    else  {
      xlabel = "household income: ";
    }
    var ylabel;
    if (chosenYAxis === "obesity") {
      ylabel = "% obesity: ";
    }
    else if (chosenYAxis === "smokes"){
      ylabel = "% smokers: "
    }
    else  {
      ylabel = "% lacking healthcare: ";
    }
    
      
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${ylabel}${d[chosenYAxis]}<br>${xlabel}${d[chosenXAxis]}`);
      });
      circlesGroup.call(toolTip);
      circlesGroup
      .on("mouseover", function(data) {
          toolTip.show(data);
        })
      .on("mouseout", function(data) {
            toolTip.hide(data);
          });
  
  
  //event listener to expand circle on click, interrupts mouseout:tooltip
      // chartGroup.selectAll("circle")
      //   .on("click", function(){
      //     d3.select(this)
      //       .transition().duration(250)
      //       .attr("opacity", ".9").attr('r',40)
      //     console.log(this);
      //   })
      //   .on("mouseout", function() {
      //     d3.select(this)
      //       .transition().duration(500)
      //       .attr("fill", "red").attr("opacity", ".5").attr('r', 10);
      // });
      }).catch(function(error) {
    console.log(error);
  });
  
  }
  
  makeResponsive();
  d3.select(window).on("resize", makeResponsive);