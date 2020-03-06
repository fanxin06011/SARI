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
    var colorArr = {"Recovered": "#70ad47", "Unknown": "#D7D599", "Infectious": "#ED7D31"};
    var keysMap = {"Recovered": "恢复", "Unknown": "未知", "Infectious": "确诊"};

    var svg = d3.select("#line-div")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    let cal_option = 'accu',      // ['new', 'accu']
        cmp_option = 'separate',      // ['separate', 'diff']
        display_option = 'abs';  // ['abs', 'per']

    let model1 = new Model('empty'), model2 = new Model('empty');  // model loaded from the database or true_data
    let model_code = ['A', 'B'];
    // let sort_f = function(a, b){
    //                 return a[1] < b[1] ? -1 : 1;
    //             };
    let my_sort = function(data, f){
        if (f === null){
            return data.sort();
        }
        else{
            data.sort((a, b) => f(a) < f(b) ? -1 : 1);
        }
    };

    cal_params_changed();
    cmp_params_changed();
    display_params_changed();
    d3.selectAll('tr#data-cal button').on('click', function(){
            cal_option = d3.select(this).attr('cal-option');
            cal_params_changed();
        });
    d3.selectAll('tr#data-cmp button').on('click', function(){
        cmp_option = d3.select(this).attr('cmp-option');
        cmp_params_changed();
    });
    d3.selectAll('tr#data-display button').on('click', function(){
        display_option = d3.select(this).attr('display-option');
        display_params_changed();
    });

    $('#data-source1-select').change(function(){
        console.log($(this).val());
    });
    $('#data-source2-select').change(function(){
       console.log($(this).val());
    });


    $('input[name="line"]').change(function () {
        lineType = ($(this).attr("id"));
        drawLines();
    });

    class Model{
        constructor(type, data, time_range) {
            /**
             * @type: empty, true_data or model_name
             */
            this.type = type;
            this.data = data;
            this.time_range = time_range;
            this.n_days = time_range[1] - time_range[0] + 1;
            // this.status = 'loaded';   // status: loaded or waiting. if waiting, this.data will be filled with incoming new data

            if (type === 'true_data'){
                this.handled_data = this.handle_ture_data(this.data);
            }
            else if (type === 'empty'){
                this.handled_data = this.handle_empty_data(this.data);
            }
            else{
                this.handled_data = this.handle_model_data(this.data);
            }
        }

        get_pairs(){
            let pairs_data;
            if (display_option === 'per'){
                let data_per = {};
                for (let k of keys){
                    data_per[k] = [];
                }
                console.log('per ', data_per);
                let sum_tmp = 0;

                for (let i = 0; i < this.n_days; i++) {
                    // true data
                    sum_tmp = 0;
                    for (let key in this.handled_data) {
                        if (this.handled_data.hasOwnProperty(key)) {
                            sum_tmp = sum_tmp + this.handled_data[key][i];
                        }
                    }
                    for (let key of keys) {
                        if (key in this.handled_data) {
                            data_per[key].push(this.handled_data[key][i] / sum_tmp);
                        }
                    }
                }
                pairs_data = Object.entries(data_per);
            }
            else{
                pairs_data = Object.entries(this.handled_data).filter(d => d[0] in keys);
            }
            pairs_data = my_sort(pairs_data, d => d[0]);
            return pairs_data;
        }

        handle_ture_data(true_data){
            let population = 0;
            for (let province in province_population){
                if (province === '全国' || province === '其他') continue;
                if (true_data.area[province]){
                    population += province_population[province];
                }
            }
            let {left, right} = true_data.time;
            let I = true_data.diagnosed_accu.slice(left, right + 1);
            let R = true_data.cure_accu.slice(left, right + 1).map((d, i) => d + true_data.dead_accu.slice(left, right + 1)[i]);
            let U = I.map((d, i) => population - I[i] - R[i]);
            console.log('all population', population);
            if (cal_option === 'new'){
                I = get_new_data(I);
                R = get_new_data(R);
                U = get_new_data(U);
            }
            return {'Recovered': R, 'Unknown': U, 'Infectious': I};
        }

        handle_model_data(model_data){
            if (cal_option === 'new'){
                for (let k in model_data){
                    if (model_data.hasOwnProperty(k)) {
                        model_data[k] = get_new_data(model_data[k]);
                    }
                }
            }
            return model_data;
        }

        handle_empty_data(empty_data){
            return {'Recovered': [], 'Unknown': [], 'Infectious': []};
        }
    }

    function cal_params_changed(){
        d3.selectAll('tr#data-cal button').classed('option-selected', function(){
            return d3.select(this).attr('cal-option') === cal_option;
        });
    }

    function cmp_params_changed(){
        d3.selectAll('tr#data-cmp button').classed('option-selected', function(){
            return d3.select(this).attr('cmp-option') === cmp_option;
        });
    }

    function display_params_changed(){
        d3.selectAll('tr#data-display button').classed('option-selected', function(){
            return d3.select(this).attr('display-option') === display_option;
        });
    }

    function get_new_data(arr){
        let ans = [arr[0]];
        for (let i = 1; i < arr.length; ++i){
            ans.push(arr[i] - arr[i - 1]);
        }
        return ans;
    }

    function drawLines(time_range) {
        svg.selectAll("*").remove();
        // var true_data = dataAll[0];
		// let original_input_truedata = dataAll[0];
		// let true_data = handle_ture_data(dataAll[0]);
        // let model_data = dataAll[1];


        // console.log('true data', true_data);
        // console.log('model data', model_data);
        // if (model1.type === 'true')

        // var keys = _.keys(model_data);
        // if (keys.length === 0) {
        //     return;
        // }
        // var values = _.values(model_data);
        // var maxnum = _.max(_.map(values, function (v) {
        //     return _.max(v);
        // }));
		let n_days = time_range[1] - time_range[0] + 1;
		// var pairs_true_data = _.pairs(true_data);
		// var pairs_model_data = _.pairs(model_data);
		// let keys = _.keys(model_data);
		// if (Object.keys(model_data).length === 0) return;
		let n_lines = keys.length;
		// var maxnum = Math.max(_.max(pairs_model_data.map(d => _.max(d[1]))), _.max(pairs_true_data.map(d => _.max(d[1]))));
		// let pairs_true_data, pairs_model_data;
		let maxnum;
		let data_format = lineType === 'line_per' ? d3.format('.0p') : d3.format('.0s');

        let pairs_model1_data = model1.get_pairs();
        let pairs_model2_data = model2.get_pairs();
        let data_collection;
        if (cmp_option === 'separate'){
            data_collection = [pairs_model1_data, pairs_model2_data];
        }
        else if (cmp_option === 'diff'){
            data_collection = [];
            for (let i = 0; i < keys.length; ++i) {
                let n = pairs_model1_data[i][1].length;
                let arr = [];
                for (let j = 0; j < n; ++j) {
                    arr.push(pairs_model1_data[i][1][j] - pairs_model2_data[i][1][j]);
                }
                data_collection.push([keys[i], arr]);
            }
        }

        // maxnum = Math.max(_.max(pairs_model1_data.filter(d => keys_set.has(d[0])).map(d => _.max(d[1]))),
        //             _.max(pairs_model2_data.filter(d => keys_set.has(d[0])).map(d => _.max(d[1]))));
        maxnum = _.max(data_collection.map(model_d => _.max(model_d.map(d => _.max(d[1])))));

        // console.log('handled model1 data', pairs_model1_data);
		// console.log('handled model2 data', pairs_model2_data);
        console.log('data collection', data_collection);
        console.log('max value', maxnum);

		console.log('brushed time', time_range);
        let x_scale = d3.scaleTime()
            .domain([new Date(timeStart + time_range[0] * 24 * 60 * 60 * 1000),
				new Date(timeStart + time_range[1] * 24 * 60 * 60 * 1000)])
            .range([padding.left, width - padding.right]);
        let y_scale_linear = d3.scaleLinear().domain([0, maxnum]).range([height - padding.bottom, padding.top]);
        let y_scale_log = d3.scaleLog().domain([1, maxnum]).range([height - padding.bottom, padding.top]);

        let lineCurve = d3.line()
            .curve(d3.curveCatmullRom)
            .x(function (d, i) {
                return x_scale(new Date(timeStart + (time_range[0] + i) * 24 * 60 * 60 * 1000));
            })
            .y(function (d) {
                return display_option === 'per' ? y_scale_linear(d) : y_scale_log(Math.max(d, 1));
            });

        //var backg=svg.append("g").attr("class","backg");
        var rectg = svg.append("g").attr("class", "rectg");
        var lineg = svg.append("g").attr("class", "lineg").style('pointer-events', 'none');
        let detailg = svg.append('g').attr('class', 'detailg');
        let cursor_line = detailg.append('line').style('stroke', '#aaa').style('stroke-width', 2);
        let cursor_points = detailg.append('g');
        // let tooltip = $('div#line-tooltip');
        let tooltip = d3.select('div#line-tooltip')
            .style('display', 'none')
            .html(function(){
                let n_models = data_collection.length;
                let col0, col1, col2;
                let rows = ``;
                let model_rows;
                if (cmp_option === 'separate') {
                    for (let i = 0; i < n_models; ++i) {
                        model_rows = ``;
                        for (let j = 0; j < keys.length; ++j) {
                            col0 = `<td rowspan="${keys.length}" style="vertical-align: middle">${String.fromCharCode(65 + i)}</td>`;
                            col1 = `<td>${keysMap[keys[j]]}</td>`;
                            col2 = `<td class="data-cell"></td>`;
                            if (j === 0) model_rows += `<tr value-type="${i}" value-name="${keys[j]}">${(col0 + col1 + col2)}</tr>`;
                            else model_rows += `<tr value-type="${i}" value-name="${keys[j]}">${col1 + col2}</tr>`;
                        }
                        rows += model_rows;
                    }
                }
                else if (cmp_option === 'diff'){
                    model_rows = ``;
                    for (let j = 0; j < keys.length; ++j) {
                        col0 = `<td rowspan="${keys.length}" style="vertical-align: middle">A - B</td>`;
                        col1 = `<td>${keysMap[keys[j]]}</td>`;
                        col2 = `<td class="data-cell"></td>`;
                        if (j === 0) model_rows += `<tr value-type="1" value-name="${keys[j]}">${(col0 + col1 + col2)}</tr>`;
                        else model_rows += `<tr value-type="1" value-name="${keys[j]}">${col1 + col2}</tr>`;
                    }
                }
                return `<table class="table">${rows}</table>`;
                // let model1_rows = ``;
                // let col0, col1, col2;
                // for (let i = 0; i < keys.length; ++i){
                //     col0 = `<td rowspan="${keys.length}" style="vertical-align: middle">真实数据</td>`;
                //     col1 = `<td>${keysMap[keys[i]]}</td>`;
                //     col2 = `<td class="data-cell"></td>`;
                //     if (i === 0) model1_rows += `<tr value-type="true" value-name="${keys[i]}">${(col0 + col1 + col2)}</tr>`;
                //     else model1_rows += `<tr value-type="true" value-name="${keys[i]}">${col1 + col2}</tr>`;
                // }
                // let model2_rows = ``;
                // for (let i = 0; i < keys.length; ++i){
                //     col0 = `<td rowspan="${keys.length}" style="vertical-align: middle">模型预测</td>`;
                //     col1 = `<td>${keysMap[keys[i]]}</td>`;
                //     col2 = `<td class="data-cell"></td>`;
                //     if (i === 0) model2_rows += `<tr value-type="model" value-name="${keys[i]}">${(col0 + col1 + col2)}</tr>`;
                //     else model2_rows += `<tr value-type="model" value-name="${keys[i]}">${col1 + col2}</tr>`;
                // }
                // let table = `<table class="table">${model1_rows + model2_rows}</table>`;
                // return table;
            });
        let selection_rect = svg.append('rect')
            .attr('x', padding.left)
            .attr('y', padding.top)
            .attr('width', width - padding.left - padding.right)
            .attr('height', height - padding.bottom - padding.top)
            .style('fill', 'white')
            .style('opacity', 0)
            .on('mousemove', function(){
                let pos = d3.mouse(svg.node());
                let cursorpoint_radius = 5;
                let day_idx = Math.round((x_scale.invert(pos[0]) - timeStart - time_range[0] * 24 * 60 * 60 * 1000) / 24 / 60 / 60 / 1000);
                let rounded_x_pos = x_scale(new Date(timeStart + (time_range[0] + day_idx) * 24 * 60 * 60 * 1000));
                // let true_points = pairs_true_data.map(d => ['true_data', d[0], d[1][day_idx]]);
                // let model_points = pairs_model_data.map(d => ['model_data', d[0], d[1][day_idx]]);
                // true_points.sort(sort_f);
                // model_points.sort(sort_f);
                // let points = true_points.concat(model_points);
                // let points = [];
                // for (let i = 0; i < data_collection.length; ++i){
                //     points = points.concat(data_collection[i].map(d => [model_code[i], d[0], d[1][day_idx]]));
                // }
                let points_collection = data_collection.map((model_d, i) => model_d.map((d, j) => [model_code[i], d[0], d[1][day_idx]]));
                let points = [];
                for (let points_pair of points_collection){
                    points = points.concat(points_pair);
                }

                let points_update = cursor_points.selectAll('circle').data(points);
                let points_enter = points_update.enter()
                    .append('circle')
                    .attr('cx', rounded_x_pos)
                    .attr('cy', d => display_option === 'per' ? y_scale_linear(d[2]) : y_scale_log(d[2]))
                    .attr('r', cursorpoint_radius)
                    .style('fill', d => colorArr[d[1]]);
                points_update
                    .attr('cx', rounded_x_pos)
                    .attr('cy', d => display_option === 'per' ? y_scale_linear(d[2]) : y_scale_log(d[2]))
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
                    .style('top', (d3.event.y + 10) + 'px');
                let text_format = display_option === 'per' ? data_format : d => Math.round(d);
                for (let i = 0; i < data_collection.length; ++i){
                    for (let j = 0; j < keys.length; ++j) {
                        tooltip.select(`tr[value-type=${i}][value-name=${points_collection[i][j][1]}] td.data-cell`)
                            .text(text_format(points_collection[i][j][2]));
                    }
                }
            })
            .on('mouseout', function(){
                cursor_line.style('opacity', 0);
                cursor_points.style('opacity', 0);
                console.log('mouseout event triggered');
                tooltip.style('display', 'none');
            })
            .on('mouseover', function(){
                cursor_line.style('opacity', 0.8);
                cursor_points.style('opacity', 0.8);
                tooltip.style('display', 'block')
            })
            .raise();
        let data_groups = lineg.selectAll('g')
            .data(data_collection)
            .enter()
            .append('g')
            .selectAll('g')
            .data(d => d)
            .enter()
            .append('g');
        data_groups.append('path')
            .attr('class', 'line')
            .attr('d', function(d){
                return lineCurve(d[1]);
            })
            .style('stroke', function(d){
                return colorArr[d[0]];
            })
            .style('stroke-width', '2px')
            .style('fill', 'none');

        lineg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (height - padding.bottom) + ")")
            .call(d3.axisBottom(x_scale).ticks(5));

        // var y_axis = d3.axisLeft(y_scale);
        let y_axis;
        if (display_option === "per") {
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
        let type;
		if (cmp_option === 'separate'){
		    type = ['A', 'B'];
        }
		else{
		    type = ['A - B'];
        }
        let legend_style = lineg.append('g').attr('class', 'label-linestyle')
            .selectAll('g')
            .data(type)
            .enter()
            .append('g')
            .attr('transform', function (d, i) {
                return `translate(${[width - padding.right - 120 * (i + 1), padding.top - 20]})`;
            });
        legend_style.append('line')
            .attr('x1', 0)
            .attr('x2', 30)
            .attr('y1', 10)
            .attr('y2', 10)
            .style('stroke', 'black')
            .style('stroke-width', 2)
            .style('stroke-dasharray', function (d, i) {
                return i === 0 ? '10, 0' : '3, 3';
            });
        legend_style.append('text')
            .attr('x', 40)
            .attr('y', 10)
            .style('dominant-baseline', 'middle')
            .text(d => d);

    }

    line.onMessage = function (message, data, from) {
        console.log('line on message ', message);
        if (message === "showResult") {
            console.log('line start');
            dataAll = data;
            drawLines();
        }

    };


    Observer.addView(line);
    return line;
}
	
	
