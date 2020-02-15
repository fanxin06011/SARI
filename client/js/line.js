
function Line(Observer){
	var line={};

	var $brtDiv=$("#line-div");
    var width=$brtDiv.width();
    var height=$brtDiv.height();
	
	var padding={
		left: 50,
		right:10,
		top:50,
		bottom:30
	};

	var colorArr=["#F48061","#56A4C9","#50890E","#AFC0DD","#F6E3BE"];
	
	var svg=d3.select("#line-div")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

	function drawLines(data){
		svg.selectAll("g").remove();

		var keys=_.keys(data);
		if(keys.length==0){
			return;
		}
		var values=_.values(data);
		var maxnum=_.max(_.map(values, function(v){ return _.max(v); }));

		var x_scale = d3.scaleLinear().domain([0,data[keys[0]].length-1]).range([padding.left,width-padding.right]);
		var y_scale = d3.scaleLinear().domain([0,maxnum]).range([height-padding.bottom, padding.top]);
		//console.log(x_scale.domain(),x_scale.range());
		//console.log(y_scale.domain(),y_scale.range());

		var lineCurve = d3.line()
			.curve(d3.curveBasis)
			.x(function(d,i) { console.log(d,i);return x_scale(i); })
			.y(function(d) { return y_scale(d); });
		
		var lineg=svg.append("g").attr("class","lineg")
			.selectAll("g")
			.data(values)
			.enter().append("g");
		
		lineg.append("path")
			.attr("class", "line")
			.attr("d", function(d) { return lineCurve(d); })
			.style("stroke", function(d,i){return colorArr[i];})
			.style("stroke-width", "2px")
			.style("fill","none");
		lineg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (height-padding.bottom) + ")")
			.call(d3.axisBottom(x_scale).ticks(5));
		lineg.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(" + (padding.left) + ",0)")
			.call(d3.axisLeft(y_scale).ticks(5));
		
		var legend = lineg.append("g").attr("class", "labeltext")
			.selectAll("g")
			.data(keys)
			.enter().append("g")
			.attr("transform", function(d, i) { return "translate("+(padding.left+100*i)+"," + (30) + ")"; });
		legend.append("circle")
			.attr("cx", 0)
			.attr("cy", 10)
			.attr("r",5)
			.attr("fill",function(d,i){return colorArr[i];})
		legend.append("text")
			.attr("x", function(d,i){return 10;})
			.attr("y", 12.5)
			.text(function(d,i) {;return d; });
		
	}
			
    line.onMessage = function(message, data, from){
		if(message=="showResult"){
			drawLines(data);
		}
		
	}
	
	
	Observer.addView(line);
	return line;
}
	
	
