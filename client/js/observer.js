function Observer() {
    var observer = {};
    var viewList = [];

    observer.addView = function(view) {
        viewList.push(view);
    };
    observer.fireEvent = function(message, data, from) {
        console.log('view list', viewList)
        viewList.forEach(function(view) {
            // if (view.hasOwnProperty('onMessage')) {
                view.onMessage(message, data, from);
            // }

        })
    };
    return observer;
}




var obs = Observer();
var params = Params(obs);
var line = Line(obs);


