let get_modify_data = function(data){
  window._data = data
  // accumulate_data_liucan()
  // console.log("old", ncov_data)
  let data_contain = convert_data_liucan(data, "全国")
  let data_contain_cure = convert_data_liucan(data, "全国", "治愈")
  let data_contain_dead = convert_data_liucan(data, "全国", "死亡")
  console.log(data_contain)
  console.log(data_contain_cure)
  console.log(data_contain_dead)
  let ncov_data_new = data_contain.table_data;
  let minus_ncov_data = data_contain.minus_table_data;
  let begin_date = data_contain.begin_date;
  // console.log("minus_table_data", minus_ncov_data)
  // console.log("old ncov", ncov_data)
  let ncov_data_accu = accumulate_data_liucan(ncov_data_new, minus_ncov_data)
  ncov_data_new = modify_data_liucan(ncov_data_new);
  ncov_data_accu = modify_data_liucan(ncov_data_accu);
  minus_ncov_data = modify_data_liucan(minus_ncov_data);
  data_contain_cure.ncov_data_accu_cure = accumulate_data_liucan(data_contain_cure.table_data, data_contain_cure.minus_table_data)
  data_contain_dead.ncov_data_accu_dead = accumulate_data_liucan(data_contain_dead.table_data, data_contain_dead.minus_table_data)
  let cure = new Array()
  let dead = new Array()
  cure.new = modify_data_liucan(data_contain_cure.table_data)
  cure.minus = modify_data_liucan(data_contain_cure.minus_table_data)
  cure.accu = modify_data_liucan(data_contain_cure.ncov_data_accu_cure)

  dead.new = modify_data_liucan(data_contain_dead.table_data)
  dead.minus = modify_data_liucan(data_contain_dead.minus_table_data)
  dead.accu = modify_data_liucan(data_contain_dead.ncov_data_accu_dead)


  return {new: ncov_data_new, minus: minus_ncov_data, accu: ncov_data_accu, begin:begin_date, dead: dead, cure: cure}
}
let modify_data_liucan = function(data){
  let new_data = new Array();
  let data_length = data.length;
  for (let i = 0; i < data_length; i ++ )
  {
    new_data[data[i][0]] = data[i].slice(1, data[i].length)
  }
  return new_data
}

let accumulate_data_liucan = function(ncov_data_input, ncov_data_minus)
{
  let ncov_data_tmp = new Array()

  for (let i = 0; i < ncov_data_input.length; i ++ )
  {
    ncov_data_tmp[i] = new Array()
    ncov_data_tmp[i][0] = ncov_data_input[i][0]
    ncov_data_tmp[i][1] = ncov_data_input[i][1] + ncov_data_minus[i][1]
    
    // ncov_data[i][0] = modify_name(ncov_data[i][0])
    for (let j = 2; j < ncov_data_input[i].length; j ++ )
      ncov_data_tmp[i][j] = ncov_data_tmp[i][j - 1] + ncov_data_input[i][j] + ncov_data_minus[i][j]
  }
  ncov_data_new = ncov_data_input
  ncov_data_accu = ncov_data_tmp
  return ncov_data_accu

  // return ncov_data_tmp
}

let convert_data_liucan  = function(data, simple_province_name, type = "确诊"){
    let new_add_name = "新增确诊病例"
    let new_minus_name = "核减"

    if (type === "死亡"){
      new_add_name = "新增死亡数"
      new_minus_name = "死亡核减"
    }
    if (type === "治愈"){
      new_add_name = "新增治愈出院数"
      new_minus_name = "治愈核减"
    }


    let cities = ["新疆", "西藏", "内蒙古", "青海", "四川", "黑龙江", "甘肃", "云南", "广西", "湖南", "陕西", "广东", "吉林", "河北", "湖北", "贵州", "山东", "江西", "河南", "辽宁", "山西", "安徽", "福建", "浙江", "江苏", "重庆", "宁夏", "海南", "台湾", "北京", "天津", "上海", "香港", "澳门"]
    let provinces = cities
    // console.log(data)
    let item_number = data.length
    let new_data = new Array()
    let date_list = new Array()
    let minus_data = new Array()

    for (i = 0; i < item_number; i ++)
    {
      let current_item = data[i]
      let city_name
      if (simple_province_name === "全国")
      {
        if (current_item["类别"] === "国家级"){
          city_name = "total"
        }
        else if (current_item["类别"] != "省级")
          continue
        else 
          city_name = current_item["省份"].replace("市", "").replace("恩施州", "恩施").replace("林区", "")
      }
      else {
        if (current_item["类别"] === "省级" && current_item["省份"] === simple_province_name){
          city_name = "total"
          if (current_item[new_add_name] === "")
            continue
        }
        else if (current_item["类别"] != "地区级")
          continue
        else if (current_item["省份"] != simple_province_name && current_item["省份"] != full_province_name_dict[simple_province_name])
          continue
        else
          city_name = current_item["城市"].replace("市", "").replace("恩施州", "恩施").replace("林区", "")
      }
      // city_name = correct_simple_name(city_name)
      // console.log(city_name)
      if (!new_data.hasOwnProperty(city_name))
        new_data[city_name] = new Array()

      if (!minus_data.hasOwnProperty(city_name))
        minus_data[city_name] = new Array()

      let new_add = current_item[new_add_name]
      new_add = parse_to_int_liucan(new_add)

      let new_minus = current_item[new_minus_name]
      new_minus = parse_to_int_liucan(new_minus)
      // if (new_minus !== 0)
      //   console.log(city_name+ current_item["公开时间"] +  " 核减 " + new_minus )

      minus_data[city_name][current_item["公开时间"]] = new_minus

      if (!new_data[city_name].hasOwnProperty(current_item["公开时间"])){
        new_data[city_name][current_item["公开时间"]] = new_add
      }
      else {
        new_data[city_name][current_item["公开时间"]] += new_add
        // if (parseInt(current_item["新增确诊病例"]) > new_data[city_name][current_item["公开时间"]])
        //   new_data[city_name][current_item["公开时间"]] = parseInt(current_item["新增确诊病例"])
      }
      if (date_list.indexOf(get_day_liucan_index(current_item["公开时间"])) === -1)
        date_list.push(get_day_liucan_index(current_item["公开时间"]))
    }
    // console.log("new_data ", new_data)
    // console.log("minus data", minus_data)
    date_list = date_list.sort()
    // console.log(date_list)
    let begin_date = date_list[0]
    let end_date = date_list[date_list.length - 1]
    // console.log("begin_date", begin_date)
    // console.log("end_date", end_date)
    diff_day = end_date - begin_date
    // console.log(diff_day)

    let table_data = new Array()
    let minus_table_data = new Array()
    let city_list = Object.keys(new_data)
    let city_dict = find_pair_liucan(city_list)
    // console.log("city_dict", city_dict)
    let used_city = new Array()
    for (i = 0; i < city_list.length; i ++ )
    {
      minus_table_data[i] = new Array()
      minus_table_data[i][0] = city_dict[city_list[i]]

      table_data[i] = new Array()
      table_data[i][0] = city_dict[city_list[i]]

      used_city[i] = city_dict[city_list[i]] 

      for (j = 0; j < diff_day + 1; j ++)
      {
        // console.log(city_list)
        // console.log(city_list[i])
        // console.log()
        if (minus_data[city_list[i]].hasOwnProperty(get_day_liucan(j + 1, begin_date))){
          // console.log(minus_data[city_list[i]][get_day_liucan(j + 1)])
          minus_table_data[i][j + 1] = minus_data[city_list[i]][get_day_liucan(j + 1, begin_date)]
        }
        else
          minus_table_data[i][j + 1] = 0

        if (new_data[city_list[i]].hasOwnProperty(get_day_liucan(j + 1, begin_date)))
          table_data[i][j + 1] = new_data[city_list[i]][get_day_liucan(j + 1, begin_date)]
        else table_data[i][j + 1] = 0
      }
      // for (j = 1; j < )
    }

    // console.log("old table_data"+ table_data)
    // console.log("minus_table_data", minus_table_data)
    // console.log("city_list", city_list)
    // console.log("used_city", used_city)
    // console.log("cities", cities)
    let city_index = city_list.length
    for (i = 0; i < cities.length; i ++)
    {
      // console.log("正在排查", provinces[i])
      if (used_city.indexOf(provinces[i]) === -1)
      {
        // console.log(provinces[i])
        table_data[city_index] = new Array()
        // console.log(table_data[city_index])
        // table_data[city_index][2] = 0
        minus_table_data[city_index] = new Array()

        table_data[city_index][0] = provinces[i]
        minus_table_data[city_index][0] = provinces[i]
        for (j = 0; j < diff_day + 1; j ++)
        {
          // console.log(city_list)
          // console.log(city_list[i])
          // console.log("asdf" + table_data[city_index])
          minus_table_data[city_index][j + 1] = 0
          table_data[city_index][j + 1] = 0
          // console.log(city_index)
        }
        city_index = city_index + 1
      }
    }
    // console.log("new table_data" + table_data)
    let table_data_length = table_data.length
    // console.log("table_data_length", table_data_length)
    // for (i = 0; i < table_data_length; i ++ )
    // {
    //   table_data[i][0] = correct_simple_name(table_data[i][0])
    // }
    

    // console.log(city_list)
    // console.log("new table_data", table_data)
    return {table_data: table_data, minus_table_data: minus_table_data, begin_date: begin_date}
}

function find_pair_liucan(city_list){
  cities = ["新疆", "西藏", "内蒙古", "青海", "四川", "黑龙江", "甘肃", "云南", "广西", "湖南", "陕西", "广东", "吉林", "河北", "湖北", "贵州", "山东", "江西", "河南", "辽宁", "山西", "安徽", "福建", "浙江", "江苏", "重庆", "宁夏", "海南", "台湾", "北京", "天津", "上海", "香港", "澳门"]
  // console.log("city_list", city_list)
  // console.log("cities", cities)
  let city_dict = new Array()
  for (let i = 0; i < city_list.length; i ++)
  {
    city_dict[city_list[i]] = city_list[i]
    for (let j = 0; j < cities.length; j ++)
    {
      if (city_list[i].indexOf(cities[j]) >= 0)
      {
        city_dict[city_list[i]] = cities[j]
      }
    }
  }
  // console.log(city_dict)
  return city_dict
}

function parse_to_int_liucan(input){
  if (input === "")
    return 0
  return parseInt(input)
}
function get_day_liucan_index(day_str)
{
  // console.log(day_str)
  let date_array = day_str.split(/月|日/)
  let month = parseInt(date_array[0])
  let day = parseInt(date_array[1])
  if (month == 1)
    return day
  if (month == 2)
    return day + 31
  if (month == 3)
    return day + 60
  return (month - 1) * 30 + day 


  // let date = i + 10
  // if (date > 31)
  // {
  //   return "2月" + (date - 31) + "日"
  // }
  // return "1月" + date + "日"
  return 0
}

function get_day_liucan(i, begin_date)
{
  let date = i + begin_date - 1
  if (date > 31)
  {
    return "2月" + (date - 31) + "日"
  }
  return "1月" + date + "日"
}

function get_day_en(i, begin_date)
{
  let date = i + begin_date 
  if (date > 31)
  {
    return "Feb. " + (date - 31) 
  }
  else if (date > 60)
  {
    return "Mar. " + (date - 60) 
  }
  else if (date > 91)
  {
    return "Apr. " + (date - 91)
  }
  else if (date > 121)
  {
    return "May " + (date - 91)
  }
  return "Jan. " + date 
}


