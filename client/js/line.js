function Line(Observer) {
    var line = {};

    var $brtDiv = $("#line-div");
    var width = $brtDiv.width();
    var height = $brtDiv.height();

    var padding = {
        left: 80,
        right: 50,
        top: 30,
        bottom: 30
    };
    var timeStart = 1578585600000;
    var lineType = "line_abs";
    var dataAll = [];
    let keys = ['Recovered', 'Infectious'];
    let keys_set = new Set(keys);
    var colorArr = {"Recovered": "#70ad47", "Unknown": "#D7D599", "Infectious": "#DE5E5B"};
    var keysMap = {"Recovered": "恢复", "Unknown": "未知", "Infectious": "确诊"};

    var svg = d3.select("#line-div")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    $('input[name="line"]').change(function () {
        lineType = ($(this).attr("id"));
        drawLines();
    });

    function handle_ture_data(true_data){
		let population = 0;
		for (let province in province_population){
			if (province === '全国' || province === '其他') continue;
			if (true_data.area[province]){
				population += province_population[province];
			}
		}
		let I = true_data.diagnosed_accu;
		let R = true_data.cure_accu.map((d, i) => d + true_data.dead_accu[i]);
		let U = I.map((d, i) => population - I[i] - R[i]);
		console.log('all population', population)
		return {'Recovered': R, 'Unknown': U, 'Infectious': I};
	}

    function drawLines() {
        svg.selectAll("*").remove();
        // var true_data = dataAll[0];
		let original_input_truedata = dataAll[0];
		let true_data = handle_ture_data(dataAll[0]);
        let model_data = dataAll[1];

        console.log('true data', true_data);
        console.log('model data', model_data);

        // var keys = _.keys(model_data);
        // if (keys.length === 0) {
        //     return;
        // }
        // var values = _.values(model_data);
        // var maxnum = _.max(_.map(values, function (v) {
        //     return _.max(v);
        // }));
		var n_days = original_input_truedata.time.right - original_input_truedata.time.left + 1;
		// var pairs_true_data = _.pairs(true_data);
		// var pairs_model_data = _.pairs(model_data);
		// let keys = _.keys(model_data);
		if (Object.keys(model_data).length === 0) return;
		var n_lines = keys.length;
		// var maxnum = Math.max(_.max(pairs_model_data.map(d => _.max(d[1]))), _.max(pairs_true_data.map(d => _.max(d[1]))));
		let pairs_true_data, pairs_model_data;
		let maxnum;
		let data_format = lineType === 'line_per' ? d3.format('.0p') : d3.format('.0s');

        // 计算百分比数据
        //  比如某天疑似的百分比指的是 当天疑似的人数/（当天疑似+潜伏+感染+康复）
        if (lineType === "line_per") {
            // pairs_true_data = keys.map(d => {d: []});
            // pairs_model_data = keys.map(d => [d, []]);
			let true_data_per = {};
			let model_data_per = {};
			for (let k of keys){
				true_data_per[k] = [];
				model_data_per[k] = [];
			}
            console.log('per ', true_data_per);
            let sum_tmp = 0;

            for (let i = 0; i < n_days; i++) {
            	// true data
                sum_tmp = 0;
                for (let key in true_data) {
                    sum_tmp = sum_tmp + true_data[key][i];
                }
                for (let key of keys) {
                	true_data_per[key].push(true_data[key][i] / sum_tmp);
                }

                // model data
				sum_tmp = 0;
                for (let key in model_data){
                    console.log(key);
                	if (model_data.hasOwnProperty(key)) {
						sum_tmp += model_data[key][i];
					}
				}
                for (let key of keys){
                	if (model_data.hasOwnProperty(key)){
						model_data_per[key].push(model_data[key][i] / sum_tmp);
					}
				}
            }
            pairs_true_data = Object.entries(true_data_per);
			pairs_model_data = Object.entries(model_data_per);
			maxnum = Math.max(_.max(pairs_model_data.filter(d => keys_set.has(d[0])).map(d => _.max(d[1]))),
                _.max(pairs_true_data.filter(d => keys_set.has(d[0])).map(d => _.max(d[1]))));
        }
        else{
			pairs_true_data = Object.entries(true_data).filter(d => keys_set.has(d[0]));
			pairs_model_data = Object.entries(model_data).filter(d => keys_set.has(d[0]));
			maxnum = Math.max(_.max(pairs_model_data.filter(d => keys_set.has(d[0])).map(d => _.max(d[1]))),
                _.max(pairs_true_data.filter(d => keys_set.has(d[0])).map(d => _.max(d[1]))));
		}
        console.log('maxnum ', maxnum);

        console.log('handled true data', pairs_true_data);
		console.log('handled model data', pairs_model_data);

        var x_scale = d3.scaleTime()
            .domain([new Date(timeStart + original_input_truedata["time"]["left"] * 24 * 60 * 60 * 1000),
				new Date(timeStart + original_input_truedata["time"]["right"] * 24 * 60 * 60 * 1000)])
            .range([padding.left, width - padding.right]);
        var y_scale_linear = d3.scaleLinear().domain([0, maxnum]).range([height - padding.bottom, padding.top]);
        let y_scale_log = d3.scaleLog().domain([1, maxnum]).range([height - padding.bottom, padding.top]);

        var lineCurve = d3.line()
            .curve(d3.curveCatmullRom)
            .x(function (d, i) {
                return x_scale(new Date(timeStart + (original_input_truedata["time"]["left"] + i) * 24 * 60 * 60 * 1000));
            })
            .y(function (d) {
                // return y_scale_linear(d);
                return lineType === 'line_per' ? y_scale_linear(d) : y_scale_log(d);
            });

        //var backg=svg.append("g").attr("class","backg");
        var rectg = svg.append("g").attr("class", "rectg");
        var lineg = svg.append("g").attr("class", "lineg").style('pointer-events', 'none');
        let detailg = svg.append('g').attr('class', 'detailg');
        let cursor_line = detailg.append('line').style('stroke', '#aaa').style('stroke-width', 2);
        let cursor_points = detailg.append('g');
        // let tooltip = $('div#line-tooltip');
        let tooltip = d3.select('div#line-tooltip');
        let selection_rect = svg.append('rect')
            .attr('x', padding.left)
            .attr('y', padding.top)
            .attr('width', width - padding.left - padding.right)
            .attr('height', height - padding.bottom - padding.top)
            .style('fill', 'white')
            .on('mousemove', function(){
                let pos = d3.mouse(svg.node());
                let cursorpoint_radius = 3;
                let day_idx = Math.round((x_scale.invert(pos[0]) - timeStart) / 24 / 60 / 60 / 1000);
                let rounded_x_pos = x_scale(new Date(timeStart + (original_input_truedata["time"]["left"] + day_idx) * 24 * 60 * 60 * 1000));
                let true_points = pairs_true_data.map(d => ['true_data', d[0], d[1][day_idx]]);
                let model_points = pairs_model_data.map(d => ['model_data', d[0], d[1][day_idx]]);
                let sort_f = function(a, b){
                    return a[1] < b[1] ? -1 : 1;
                };
                true_points.sort(sort_f);
                model_points.sort(sort_f);
                let points = true_points.concat(model_points);

                let points_update = cursor_points.selectAll('circle').data(points);
                let points_enter = points_update.enter()
                    .append('circle')
                    .attr('cx', rounded_x_pos)
                    .attr('cy', d => lineType === 'line_per' ? y_scale_linear(d[2]) : y_scale_log(d[2]))
                    .attr('r', cursorpoint_radius)
                    .style('fill', d => colorArr[d[1]]);
                points_update
                    .attr('cx', rounded_x_pos)
                    .attr('cy', d => lineType === 'line_per' ? y_scale_linear(d[2]) : y_scale_log(d[2]))
                    .attr('r', cursorpoint_radius)
                    .style('fill', d => colorArr[d[1]]);
                points_update.exit().remove();

                cursor_line
                    .attr('x1', rounded_x_pos)
                    .attr('x2', rounded_x_pos)
                    .attr('y1', padding.top)
                    .attr('y2', height - padding.bottom);

                tooltip
                    .style('left', function(){
                        return (d3.event.x - 20 - $(this).width()) + 'px';
                    })
                    .style('top', (d3.event.y + 10) + 'px')
                    .html(function(){
                        let true_rows = ``;
                        let col0, col1, col2;
                        let text_format = lineType === 'line_per' ? data_format : d => Math.round(d);
                        for (let i = 0; i < true_points.length; ++i){
                            col0 = `<td rowspan="${true_points.length}" style="vertical-align: middle">真实数据</td>`;
                            col1 = `<td>${keysMap[true_points[i][1]]}</td>`;
                            col2 = `<td>${text_format(true_points[i][2])}</td>`;
                            if (i === 0) true_rows += `<tr>${(col0 + col1 + col2)}</tr>`;
                            else true_rows += `<tr>${col1 + col2}</tr>`;
                        }
                        let model_rows = ``;
                        for (let i = 0; i < model_points.length; ++i){
                            col0 = `<td rowspan="${model_points.length}" style="vertical-align: middle">模型预测</td>`;
                            col1 = `<td>${keysMap[model_points[i][1]]}</td>`;
                            col2 = `<td>${text_format(model_points[i][2])}</td>`;
                            if (i === 0) model_rows += `<tr>${(col0 + col1 + col2)}</tr>`;
                            else model_rows += `<tr>${col1 + col2}</tr>`;
                        }
                        let table = `<table class="table">${true_rows + model_rows}</table>`;
                        return table;
                    })
            })
            .on('mouseout', function(){
                cursor_line.style('opacity', 0);
                cursor_points.style('opacity', 0);
                tooltip.style('display', 'none');
            })
            .on('mouseover', function(){
                cursor_line.style('opacity', 0.8);
                cursor_points.style('opacity', 0.8);
                tooltip.style('display', 'block')
            })
            .lower();
        let true_data_group = lineg.append('g')
			.attr('class', 'true-data')
            .selectAll("g")
            .data(pairs_true_data)
            .enter().append("g");
        let model_data_group = lineg.append('g')
			.attr('class', 'model-data')
			.selectAll('g')
			.data(pairs_model_data)
			.enter()
			.append('g');

        true_data_group.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return lineCurve(d[1]);
            })
            .style("stroke", function (d) {
                return colorArr[d[0]];
            })
            .style("stroke-width", "2px")
            .style("fill", "none");
        model_data_group.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return lineCurve(d[1]);
            })
            .style("stroke", function (d) {
                return colorArr[d[0]];
            })
            .style("stroke-width", "2px")
			.style('stroke-dasharray', '5, 5')
            .style("fill", "none");

        lineg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - padding.bottom) + ")")
            .call(d3.axisBottom(x_scale).ticks(5));

        // var y_axis = d3.axisLeft(y_scale);
        let y_axis;
        if (lineType === "line_per") {
            y_axis = d3.axisLeft(y_scale_linear);
            y_axis.tickFormat(d3.format(".0p"));
        }
        else{
            y_axis = d3.axisLeft(y_scale_log);
            y_axis.tickArguments([5, '.0s']);
        }
        lineg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (padding.left) + ",0)")
            .call(y_axis);

        // 标签说明
        var legend = lineg.append("g").attr("class", "labeltext")
            .selectAll("g")
            .data(keys)
            .enter().append("g")
            .attr("transform", function (d, i) {
                return "translate(" + (padding.left + 50 * i) + "," + (padding.top - 20) + ")";
            });
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", 10)
            .attr("r", 5)
            .attr("fill", function (d, i) {
                return colorArr[d];
            });
        legend.append("text")
            .attr("x", function (d, i) {
                return 10;
            })
            .attr("y", 12.5)
            .text(function (d, i) {
                return keysMap[d];
            });

        // 曲线style标签说明
		let type = ['真实数据', '预测结果'];
		let legend_style = lineg.append('g').attr('class', 'label-linestyle')
			.selectAll('g')
			.data(type)
			.enter()
			.append('g')
			.attr('transform', function(d, i){
				return `translate(${[width - padding.right - 120 * (i + 1), padding.top - 20]})`;
			});
		legend_style.append('line')
			.attr('x1', 0)
			.attr('x2', 30)
			.attr('y1', 10)
			.attr('y2', 10)
			.style('stroke', 'black')
			.style('stroke-width', 2)
			.style('stroke-dasharray', function(d, i){
				return i === 0 ? '10, 0' : '3, 3';
			});
		legend_style.append('text')
			.attr('x', 40)
			.attr('y', 10)
			.style('dominant-baseline', 'middle')
			.text(d => d);

        // 打点
        // for (var k = 0; k < pairs_model_data.length; k++) {
        //     svg.append("g").attr("class", "circleg")
        //         .selectAll("circle")
        //         .data(pairs_model_data[k][1])
        //         .enter().append("circle")
        //         .attr("cx", function (d, i) {
        //             return x_scale(new Date(timeStart + (original_input_truedata["time"]["left"] + i) * 24 * 60 * 60 * 1000));
        //         })
        //         .attr("cy", function (d) {
        //             return y_scale(d);
        //         })
        //         .attr("r", 2)
        //         .style("fill", colorArr[pairs_model_data[k][0]]);
        // }
        // for (var k = 0; k < pairs_true_data.length; k++) {
        //     svg.append("g").attr("class", "circleg")
        //         .selectAll("circle")
        //         .data(pairs_true_data[k][1])
        //         .enter().append("circle")
        //         .attr("cx", function (d, i) {
        //             return x_scale(new Date(timeStart + (original_input_truedata["time"]["left"] + i) * 24 * 60 * 60 * 1000));
        //         })
        //         .attr("cy", function (d) {
        //             return y_scale(d);
        //         })
        //         .attr("r", 2)
        //         .style("fill", colorArr[pairs_true_data[k][0]]);
        // }

        // 每天新增 柱状图
        // var new_data = original_input_truedata["diagnosed_new"].slice(original_input_truedata["time"]["left"], original_input_truedata["time"]["right"] + 1);
        // console.log(new_data);
        // var newmax = _.max(new_data);
        // var y_new_scale = d3.scaleLinear().domain([0, newmax]).range([height - padding.bottom, padding.top]);
        // var rectw = (width - padding.left - padding.right) / (original_input_truedata["time"]["right"] - original_input_truedata["time"]["left"] + 1);
        // rectg.selectAll("rect")
        //     .data(new_data)
        //     .enter().append("rect")
        //     .attr("fill", "#eee")
        //     .attr("stroke", "#ccc")
        //     .attr("stroke-width", "1")
        //     .attr("x", function (d, i) {
        //         return padding.left + (width - padding.left - padding.right) / (original_input_truedata["time"]["right"] - original_input_truedata["time"]["left"] + 1) * i;
        //     })
        //     .attr("y", function (d, i) {
        //         return height - padding.bottom - (height - padding.top - padding.bottom) / newmax * d;
        //     })
        //     .attr("width", rectw)
        //     .attr("height", function (d, i) {
        //         return (height - padding.top - padding.bottom) / newmax * d;
        //     });
        // rectg.append("g")
        //     .attr("class", "y axis")
        //     .attr("transform", "translate(" + (width - padding.right) + ",0)")
        //     .call(d3.axisRight(y_new_scale));

        // 用于鼠标悬浮提示具体数据
        // var backg = svg.append("g").attr("class", "backg")
        //     .selectAll("rect")
        //     .data(new_data)
        //     .enter().append("rect")
        //     .attr("fill", "black").attr("opacity", 0)
        //     .attr("x", function (d, i) {
        //         return padding.left + (width - padding.left - padding.right) / (original_input_truedata["time"]["right"] - original_input_truedata["time"]["left"] + 1) * i;
        //     })
        //     .attr("y", padding.top)
        //     .attr("width", rectw)
        //     .attr("height", height - padding.top - padding.bottom)
        //     .append("title").text(function (d, i) {
        //         var date = new Date(timeStart + (original_input_truedata["time"]["left"] + i) * 24 * 60 * 60 * 1000);
        //         var str = "日期: " + (date.getMonth() + 1) + "月" + (date.getDate()) + "日 \r";
        //         for (var j = 0; j < keys.length; j++) {
        //             str = str + keysMap[keys[j]] + ": " + Math.round(values[j][i]) + " \r";
        //         }
        //         str = str + "新增确诊: " + d;
        //         return str;
        //     });
    }

    line.onMessage = function (message, data, from) {
        console.log('line on message ', message)
        if (message === "showResult") {
            console.log('line start')
            dataAll = data;
            drawLines();
        }

    };


    Observer.addView(line);
    return line;
}
	
	
