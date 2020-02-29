let DataPanel = function (data, provinces) {
    this.is_log = true;
    this.data = data;
    this.provinces = provinces;
    this.place_is_choose = new Array();
    this.provinces_num = provinces.length;
    for (let i = 0; i < this.provinces_num; i++) {
        this.place_is_choose[provinces[i]] = true
    }
    // this.place_is_choose["山东"] =
    this.place_is_choose["全国"] = true;
    // this.place_is_choose["仅湖北"] = false;
    this.place_is_choose['其它'] = true;

    this.margin = {left: 0, right: 0, top: 0, bottom: 0};
    this.width = document.getElementById('middle-div').clientWidth - this.margin.left - this.margin.right,
        this.height = document.getElementById('middle-div').clientHeight - this.margin.top - this.margin.bottom;
    this.svg = d3.select("#middle-div").append("svg")
        .attr("id", "panel_svg")
        .attr("font-family", "Arial")
        .attr("width", this.width - this.margin.left - this.margin.right)
        .attr("height", this.height - this.margin.top - this.margin.bottom);

    // this.svg.append("rect")
    // 	.attr("width", this.width)
    // 	.attr("height", this.height)

    this.title_position = {left: 0, top: 0, width: this.width, height: this.height * 0.05};
    this.time_position = {
        left: this.width * 0.08,
        top: this.height * 0.07,
        width: this.width * 0.84,
        height: this.height * 0.40
    };
    this.area_position = {
        left: this.width * 0.05,
        top: this.height * 0.52,
        width: this.width * 0.9,
        height: this.height * 0.48
    };

    // this.load_title(this.svg, this.title_position)
};
DataPanel.prototype.load_title = function () {
    let svg = this.svg;
    let title_position = this.title_position;
    this.title = svg.append("g")
        .attr("transform", function (d) {
            return "translate(" + title_position.left + "," + title_position.top + ")"
        })
    // this.title.append('rect')
    // 	.attr("x", title_position.width * 0.05)
    // 	.attr("y", title_position.height * 0.2 )
    // 	.attr("height", title_position.width / 10)
    // 	.attr("width", title_position.width * 0.05)
    // 	.attr("fill", "blue")
    // 	.attr("rx", title_position.width * 0.05 / 2)

    this.title.append("text")
        .attr("x", title_position.width / 2)
        .attr("y", title_position.height * 0.2)
        .attr("dominant-baseline", "hanging")
        .style("font-size", title_position.width / 10)
        .attr("text-anchor", "middle")
        .text("数据选择")

};
// DataPanel.prototype.load_place_color = function(){

// }

DataPanel.prototype.load_time = function () {
    let svg = this.svg
    let data = this.data
    let time_position = this.time_position
    let width = time_position.width
    let height = time_position.height
    let left = time_position.left
    let top = time_position.top
    let data_item_number = this.data.new.total.length
    this.data_item_number = data_item_number
    let left_date_text
    let right_date_text
    this.date_range = new Array()
    let date_range = this.date_range
    date_range.left = 0
    date_range.right = data_item_number - 1

    let line = d3.line()
        .x(function (d, i) {
            return width * i / data_item_number;
        }) // set the x values for the line generator
        .y(function (d) {
            return y_scale(d + 0.1);
        }) // set the y values for the line generator
        .curve(d3.curveMonotoneX) // apply smoothing to the line

    let new_data = this.get_data(this.data.new)
    let accu_data = this.get_data(this.data.accu)
    this.new_data = new_data
    this.accu_data = accu_data
    // console.log(new_data)
    // console.log(accu_data)


    // this.y_scale = d3.scaleLinear()
    //    	.domain([0, Math.max(...accu_data)])
    //    	.range([height, 0]);


    this.y_scale = d3.scaleLog()
        .domain([1, Math.max(...accu_data)])
        .range([height, 0]);


    this.x_scale = d3.scaleLinear()
        .domain([0, data_item_number])
        .range([0, width])

    this.red_color = "#DE5E5B"
    this.gray_color = "#EBECEF"


    let y_scale = this.y_scale
    let x_scale = this.x_scale

    window._y_scale = this.y_scale
    window._x_scale = this.x_scale

    this.time = svg.append("g")
        .attr("id", "time_area")
        .attr("transform", function (d) {
            return "translate(" + left + "," + top + ")"
        })
    // console.log(new_data)
    this.new_rect = this.time.append("g")

    this.new_rect.selectAll(".new_rect")
        .data(new_data)
        .enter()
        .append("rect")
        .attr("class", "new_rect")
        .attr("id", (d, i) => "new_" + i)
        .attr("height", d => (Math.max(y_scale(1) - y_scale(d), 0)))
        .attr("y", d => y_scale(d + 0.1))
        .attr("x", (d, i) => x_scale(i))
        .attr("fill", this.gray_color)
        .attr("width", width / data_item_number);

    this.accu_path = this.time.append("path")
        .datum(accu_data) // 10. Binds data to the line
        .attr("class", "line") // Assign a class for styling
        .attr("id", "accu_path")
        .attr("d", line) // 11. Calls the line generator
        .attr("fill-opacity", 0)
        .attr("stroke-width", 2)
        .attr("stroke", this.red_color);

    this.time.append('g')
        .attr("class", "y-axis")
        .call(d3.axisRight(y_scale).tickArguments([5, ".0s"])); // Create an axis component with d3.axisLeft

    let panel = this;
    var brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on("brush", function (d) {
            let selection = d3.event.selection;
            let left_date = Math.floor(x_scale.invert(selection[0]));
            let right_date = Math.floor(x_scale.invert(selection[1]));
            if (right_date >= data_item_number)
                right_date = data_item_number - 1;
            date_range.left = left_date;
            date_range.right = right_date;

            left_date_text
                .text(get_day_en(left_date, data.begin))
                .attr("x", selection[0]);
            right_date_text
                .text(get_day_en(right_date, data.begin))
                .attr("x", selection[1])
            // panel.send_message()
        })
        .on("end", function (d) {
            if (d3.event.selection === null)
                return;
            let selection = d3.event.selection;
            let left_date = Math.floor(x_scale.invert(selection[0]));
            let right_date = Math.floor(x_scale.invert(selection[1]));
            if (right_date >= data_item_number)
                right_date = data_item_number - 1;
            date_range.left = left_date;
            date_range.right = right_date;

            left_date_text
                .text(get_day_en(left_date, data.begin))
                .attr("x", selection[0]);
            right_date_text
                .text(get_day_en(right_date, data.begin))
                .attr("x", selection[1]);
            panel.send_message()
        });

    this.time.append("g")
        .attr("class", "brush")
        .call(brush)
        .on("mousemove", function (d) {
            // console.log(d3.mouse(this))
            let this_date_index = Math.floor(x_scale.invert(d3.mouse(this)[0]));
            // console.log(this_date_index, get_day_en(this_date_index))
            panel.select_date_text
                .text(get_day_en(this_date_index, panel.data.begin))
                .attr("x", x_scale(this_date_index));


            // console.log(this_date_index)
            let this_rect = panel.svg.select("#new_" + this_date_index);
            let this_data = this_rect.datum();
            // let this_date = get_day_en()
            // console.log(this_data)

            panel.select_info_text
                .text(this_data)
                .attr("x", x_scale(this_date_index))
                .attr("y", y_scale(this_data + 0.1));

            panel.new_rect.selectAll(".new_rect")
                .attr("fill", panel.gray_color);
            this_rect.attr("fill", panel.red_color);


            // console.log(panel.accu_data[this_date_index])

            panel.select_accu_text
                .text(panel.accu_data[this_date_index])
                .attr("x", x_scale(this_date_index))
                .attr("y", y_scale(panel.accu_data[this_date_index] + 0.1))

            // console.log()

            // console.log("position", d3.event.offsetX, d3.event.offsetY)

        });

    let show_date = this.time.append("g")
        .attr("id", "show_date")
        .attr("transform", "translate(0," + height * 1.02 + ")");

    left_date_text = show_date.append("text")
        .attr("class", "left_date")
        .text(get_day_en(0, this.data.begin))
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "middle");

    right_date_text = show_date.append("text")
        .attr("class", "right_date")
        .attr("x", width)
        .text(get_day_en(data_item_number - 1, this.data.begin))
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "middle");

    select_date_text = show_date.append("text")
        .attr("class", "select_date")
        // .attr("x", width)
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "middle");

    select_info_text = this.time.append("g")
        .append("text")
        .attr("class", "select_info")
        // .attr("x", width)
        // .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "middle");

    select_accu_text = this.time.append("g")
        .append("text")
        .attr("class", "select_accu")
        // .attr("x", width)
        // .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "middle");


    this.left_date_text = left_date_text;
    this.right_date_text = right_date_text;
    this.select_date_text = select_date_text;
    this.select_info_text = select_info_text;
    this.select_accu_text = select_accu_text


};

DataPanel.prototype.reload_time = function () {
    let height = this.time_position.height;
    let new_data = this.get_data(this.data.new);
    let accu_data = this.get_data(this.data.accu);

    let line = d3.line()
        .x(function (d, i) {
            return x_scale(i);
        }) // set the x values for the line generator
        .y(function (d) {
            return y_scale(d + 0.1);
        }) // set the y values for the line generator
        .curve(d3.curveMonotoneX); // apply smoothing to the line

    console.log(new_data);
    console.log(accu_data);
    this.new_data = new_data;
    this.accu_data = accu_data;


    this.y_scale = d3.scaleLog()
        .domain([1, Math.max(...accu_data)])
        .range([height, 0]);

    // if 
    let x_scale = this.x_scale
    let y_scale = this.y_scale

    d3.select(".y-axis")
        .call(d3.axisRight(this.y_scale).tickArguments([5, ".0s"]))

    this.accu_path
        .datum(accu_data)
        .attr("d", line)

    this.new_rect.selectAll(".new_rect")
        .datum(new_data[i])
        .attr("height", (d, i) => (y_scale(1) - y_scale(new_data[i])))
        .attr("y", function (d, i) {
            return y_scale(new_data[i] + 0.1)

        })
    this.select_info_text.text("")
    this.select_date_text.text("")
    this.select_accu_text.text("")
}


DataPanel.prototype.get_data = function (input_data) {
    let output_data = new Array();
    // console.log(this.data_item_number)
    for (let i = 0; i < this.data_item_number; i++) {
        output_data[i] = 0
    }
    for (let p_i = 0; p_i < this.provinces_num; p_i++) {
        let current_province = this.provinces[p_i];
        if (this.place_is_choose[current_province]) {
            for (let i = 0; i < this.data_item_number; i++)
                output_data[i] += input_data[current_province][i]
        }
    }
    return output_data
};


DataPanel.prototype.load_range1 = function (places, columns_max = 3) {
    let svg = this.svg;
    let position = this.area_position;
    let provinces = this.provinces;

    let other_regions = places;

    let {width, height, left, top} = position;
    let place_is_choose = this.place_is_choose;

    let n_others_rows = Math.ceil(other_regions.length / columns_max);

    let alpha = 0.3;  // 间隔占button高度的比例
    let button_height = height / (3 + n_others_rows + alpha * (2 + n_others_rows));
    let skip = alpha * button_height;

    // let alpha = 0.1;  // 框间隔占框高度的比例
    // let button_height = height / (3 + 2 * alpha + n_others_rows + n_others_rows * alpha);
    // let skip = alpha * button_height;
    //
    // let inner_padding = {left: width * 0.05, right: width * 0.05};    // 全国框的padding
    // let inner_width = width - inner_padding.left - inner_padding.right;  // 全国框内有效宽度
    let inner_width = width - 2 * skip;
    let inner_inner_width = inner_width - 2 * skip;
    // let inner_inner_padding = {left: inner_width * 0.05, right: inner_width * 0.05};  // “其它”框padding

    this.area = svg.append('g')
        .attr('id', 'range_area')
        .attr('transform', function (d) {
            return `translate(${[left, top]})`;
        });

    // 全国
    let all_container = this.area.append('g').attr('class', 'whole-country').datum('全国');
    all_container.append('rect')
        .attr('class', 'box')
        .attr('width', width)
        .attr('height', height)
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', '2%');

    all_container.append('rect')
        .attr('class', 'selection-rect')
        .attr('width', width * 0.9)
        .attr('height', button_height * 0.95)
        .attr('x', width * 0.05)
        .attr('y', button_height * 0.05)
        .style('stroke', 'none')
        .style('cursor', 'pointer');

    all_container.append('text')
        .attr('x', width / 2)
        .attr('y', button_height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text('全国');

    // 湖北
    let hubei = this.area.append('g')
        .attr('class', 'province_button')
        .datum('湖北')
        .style('cursor', 'pointer');
    hubei.append('rect')
        .attr('width', inner_width)
        .attr('height', button_height)
        .attr('x', skip)
        .attr('y', button_height)
        .attr('rx', '1%');
    hubei.append('text')
        .attr('x', width / 2)
        .attr('y', button_height * 1.5)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text('湖北');

    // 其他
    let others_container = this.area.append('g')
        .attr('class', 'other-province')
        .attr('transform', `translate(${[skip, 2 * button_height + skip]})`).datum('其它');
    others_container.append('rect')
        .attr('class', 'box')
        .attr('x', 0)
        .attr('y', 0)
        .attr('rx', '2%')
        .attr('width', inner_width)
        .attr('height', height - 2 * button_height - 2 * skip);
    others_container.append('rect')
        .attr('class', 'selection-rect')
        .attr('width', inner_width * 0.9)
        .attr('height', button_height * 0.95)
        .attr('x', inner_width * 0.05)
        .attr('y', button_height * 0.05)
        .style('stroke', 'none')
        .style('cursor', 'pointer');
    others_container.append('text')
        .attr('x', width / 2 - skip)
        .attr('y', button_height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text('其他');


    let province_button_width = inner_inner_width / columns_max;
    let province_button_margin = {
        left: province_button_width * 0.05, right: province_button_width * 0.05,
    };
    let other_province = this.area.selectAll('.province_button')
        .data(['湖北'].concat(other_regions))
        .enter()
        .append('g')
        .attr('class', 'province_button')
        .style('cursor', 'pointer')
        .attr("transform", function (d, i) {
            let row = parseInt((i - 1) / columns_max);
            let col = i - row * columns_max - 1;
            return "translate(" + (2 * skip + col * province_button_width) + "," +
                (row * (button_height + skip) + 3 * button_height + skip) + ")";
        });
    other_province.append('rect')
        .attr('x', province_button_margin.left)
        .attr('y', 0)
        .attr('rx', '1%')
        .attr('width', province_button_width - province_button_margin.left - province_button_margin.right)
        .attr('height', button_height);
    other_province.append('text')
        .attr('x', province_button_width / 2)
        .attr('y', button_height / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(function (d) {
            return d;
        });

    let panel = this;
    let all_province_groups = this.area.selectAll('.province_button');
    all_province_groups
        .classed('selected_area_button', d => place_is_choose[d])
        .on('mouseover', function(d){
            d3.select(this).classed('hover_area_button', true);
        })
        .on('mouseout', function(){
            d3.select(this).classed('hover_area_button', false);
        })
        .on('click', function (d) {
            place_is_choose[d] = !place_is_choose[d];

            let whole_country = true;
            let other_province = true;

            for (let current_province of provinces){
                if (current_province === '湖北'){
                    if (!place_is_choose[current_province]){
                        whole_country = false;
                    }
                }
                // if (!place_is_choose[current_province]){
                //     whole_country = false;
                // }
                else{
                    if (!place_is_choose[current_province]){
                        other_province = false;
                        whole_country = false;
                    }
                }
            }

            place_is_choose["全国"] = whole_country;
            place_is_choose['其它'] = other_province;
            all_province_groups.classed("selected_area_button", d => place_is_choose[d]);
            all_container.classed('selected_area_button', d => place_is_choose[d]);
            others_container.classed('selected_area_button', d => place_is_choose[d]);
            panel.reload_time();
            panel.send_message();
        });

    all_container
        .classed('selected_area_button', d => place_is_choose[d]);
    all_container.selectAll('rect.selection-rect, text')
        .on('mouseover', function(d){
            all_container.classed('hover_area_button', true);
            others_container.classed('hover_area_button', true);
            all_province_groups.classed('hover_area_button', true);
        })
        .on('mouseout', function(d){
            all_container.classed('hover_area_button', false);
            others_container.classed('hover_area_button', false);
            all_province_groups.classed('hover_area_button', false);
        })
        .on('click', function(d){
            place_is_choose[d] = !place_is_choose[d];

            for (let current_province of provinces){
                place_is_choose[current_province] = place_is_choose[d];
            }

            place_is_choose['其它'] = place_is_choose[d];
            all_province_groups.classed("selected_area_button", d => place_is_choose[d]);
            all_container.classed('selected_area_button', d => place_is_choose[d]);
            others_container.classed('selected_area_button', d => place_is_choose[d]);

            panel.reload_time();
            panel.send_message();
        });

    others_container.classed('selected_area_button', d => place_is_choose[d]);
    others_container.selectAll('rect.selection-rect, text')
        .on('mouseover', function(d){
            others_container.classed('hover_area_button', true);
            all_province_groups.classed('hover_area_button', d => d !== '湖北');
        })
        .on('mouseout', function(d){
            others_container.classed('hover_area_button', false);
            all_province_groups.classed('hover_area_button', false);
        })
        .on('click', function(d){
            place_is_choose[d] = !place_is_choose[d];
            let whole_country = true;
            for (let current_province of provinces){
                if (current_province !== '湖北'){
                    place_is_choose[current_province] = place_is_choose[d];
                }
                if (!place_is_choose[current_province]){
                    whole_country = false;
                }
            }
            // if (place_is_choose[d]){
            //     for (let current_province of provinces){
            //         place_is_choose[current_province] = true;
            //     }
            // }
            // else{
            //     for (let current_province of provinces){
            //         if (current_province !== '湖北') {
            //             place_is_choose[current_province] = false;
            //         }
            //     }
            //     place_is_choose['全国'] = false;
            // }

            place_is_choose['全国'] = whole_country;
            all_province_groups.classed("selected_area_button", d => place_is_choose[d]);
            all_container.classed('selected_area_button', d => place_is_choose[d]);
            others_container.classed('selected_area_button', d => place_is_choose[d]);
            panel.reload_time();
            panel.send_message();
        })

};


DataPanel.prototype.load_range = function (places, column_max = 3) {
    let svg = this.svg;
    let position = this.area_position;
    let provinces = this.provinces;
    let skip = 10;

    // console.log(places)
    let width = position.width;
    let height = position.height;
    let left = position.left;
    let place_is_choose = this.place_is_choose;
    let top = position.top;
    let button_width = width / column_max;
    let button_height = (height - skip) / (Math.ceil(places.length / column_max));
    let button_margin = {
        left: button_width * 0.1,
        right: button_width * 0.1,
        top: button_height * 0.1,
        bottom: button_height * 0.1
    };


    this.area = svg.append("g")
        .attr("id", "range_area")
        .attr("transform", function (d) {
            return "translate(" + left + "," + top + ")"
        });

    this.area.append("g")
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", button_height + skip / 2)
        .attr("y2", button_height + skip / 2)
        .attr("stroke", "#ddd")
        .attr("stroke-width", 2);

    // this.area.append("rect")
    // 	.attr("fill", "blue")
    // 	.attr("width", width)
    // 	.attr('height', height)
    this.province_button = this.area.selectAll(".province")
        .data(places)
        .enter()
        .append("g")
        .attr("class", "province_button")
        .classed("selected_area_button", d => place_is_choose[d])
        .attr("transform", function (d, i) {
            row = parseInt(i / column_max);
            col = i - row * column_max;
            if (row === 0) {
                return "translate(" + col * button_width + "," + row * button_height + ")"
            } else {
                return "translate(" + col * button_width + "," + (row * button_height + skip) + ")"
            }
        });

    let province_button = this.province_button;

    this.province_button.append('rect')
        .attr("width", button_width - button_margin.left - button_margin.right)
        .attr("height", button_height - button_margin.top - button_margin.bottom)
        .attr("x", button_margin.left)
        .attr("y", button_margin.top);
    // .attr("rx", button_margin.left)

    this.province_button.append("text")
        .text(d => d)
        .attr("x", button_width / 2)
        .attr("y", button_height / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle") // hanging

    let panel = this;

    this.province_button
        .on("click", function (d) {
            if (d === "全国") {
                place_is_choose[d] = true;
                place_is_choose["仅湖北"] = false;
                place_is_choose["除湖北"] = false;
                for (let i = 0; i < provinces.length; i++) {
                    place_is_choose[provinces[i]] = true
                }
            } else if (d === "仅湖北") {
                place_is_choose[d] = true;
                place_is_choose["全国"] = false;
                place_is_choose["除湖北"] = false;
                for (let i = 0; i < provinces.length; i++) {
                    place_is_choose[provinces[i]] = false
                }
                place_is_choose["湖北"] = true
            } else if (d === "除湖北") {
                place_is_choose[d] = true
                place_is_choose["全国"] = false
                place_is_choose["仅湖北"] = false
                for (let i = 0; i < provinces.length; i++) {
                    place_is_choose[provinces[i]] = true
                }
                place_is_choose["湖北"] = false
            } else {
                if (place_is_choose[d]) {
                    place_is_choose[d] = false
                } else {
                    place_is_choose[d] = true
                }
                let only_hubei = true;
                let except_hubei = true;
                let whole_country = true;
                for (let i = 0; i < provinces.length; i++) {
                    let current_province = provinces[i]
                    if (!place_is_choose[current_province])
                        whole_country = false
                    if (current_province === "湖北") {
                        if (place_is_choose[current_province])
                            except_hubei = false
                        else
                            only_hubei = false
                    } else {
                        if (place_is_choose[current_province])
                            only_hubei = false
                        else
                            except_hubei = false
                    }
                }
                place_is_choose["除湖北"] = except_hubei
                place_is_choose["全国"] = whole_country
                place_is_choose["仅湖北"] = only_hubei

            }
            province_button.classed("selected_area_button", d => place_is_choose[d])
            panel.reload_time();
            panel.send_message()
        })
};

DataPanel.prototype.send_message = function () {
    let send_data = {
        time: this.date_range,
        area: this.place_is_choose,
        diagnosed_accu: this.get_data(this.data.accu),
        cure_accu: this.get_data(this.data.cure.accu),
        dead_accu: this.get_data(this.data.dead.accu),
        diagnosed_new: this.get_data(this.data.new),
        cure_new: this.get_data(this.data.cure.new),
        dead_new: this.get_data(this.data.dead.new),
        original_data: this.data
        // data: this.data,
    };
    console.log('send data', send_data);
    let event_name = "update_data_range";
    obs.fireEvent(event_name, send_data, this)
};


// let ncpdata = new NCPdata()
let panel;
let NCPdata = function () {
    url = "https://tanshaocong.github.io/2019-nCoV/map.csv"
    d3.csv(url, function (error, original_data) {
    	// let special = ["全国", "仅湖北", "除湖北"];
        let places = ['北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏',
            '浙江', '安徽', '福建', '江西', '山东', '河南', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾',
            '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门'];
        // let places = ["全国", "仅湖北", "除湖北", "新疆", "西藏", "内蒙古", "青海", "四川", "黑龙江", "甘肃", "湖北", "云南", "广西", "湖南",
        //     "陕西", "广东", "吉林", "河北", "贵州", "山东", "江西", "河南", "辽宁", "山西", "安徽", "福建", "浙江", "江苏", "重庆", "宁夏",
        //     "海南", "台湾", "北京", "天津", "香港", "澳门"]
        // let places = ["全国", "仅湖北", "除湖北", "新疆", "西藏", "内蒙古", "青海", "四川", "黑龙江", "甘肃", "云南", "广西", "湖南", "陕西", "广东", "吉林", "河北", "贵州", "山东", "江西", "河南", "辽宁", "山西", "安徽", "福建", "浙江", "江苏", "重庆", "宁夏", "海南", "台湾", "北京", "天津", "上海", "香港", "澳门"]
        // let provinces = ["新疆", "西藏", "内蒙古", "青海", "四川", "黑龙江", "甘肃", "湖北", "云南", "广西", "湖南", "陕西", "广东", "吉林", "河北", "贵州", "山东", "江西", "河南", "辽宁", "山西", "安徽", "福建", "浙江", "江苏", "重庆", "宁夏", "海南", "台湾", "北京", "天津", "上海", "香港", "澳门"]
        let provinces = ['北京', '天津', '上海', '重庆', '河北', '山西', '辽宁', '吉林', '黑龙江', '江苏',
            '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '海南', '四川', '贵州', '云南', '陕西', '甘肃', '青海', '台湾',
            '内蒙古', '广西', '西藏', '宁夏', '新疆', '香港', '澳门'];
        console.log('original data', original_data);
        data = get_modify_data(original_data);
        console.log('modified data: ', data);
        window._data = data;
        panel = new DataPanel(data, provinces);
        panel.load_title();
        panel.load_time();
        panel.load_range1(places);
        panel.send_message();

        // // 获得时间范围：
        // console.log(panel.date_range) // 从第一天开始为0.
        // console.log(panel.data.date_range) // 2020年1月1日为1

        // // 获得空间范围：
        // console.log(panel.place_is_choose) // 一个字典，存放着各个省份是否被选中。

    })
};


// function update_data_selection(){
// 	console.log()
// }
// console.log(data)
NCPdata();

