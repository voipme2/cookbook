angular.module("cookbook.filters", [])
    .filter("asTime", function () {
        return function (timeInMin) {
            var hours = parseInt(timeInMin / 60) % 24;
            var minutes = timeInMin % 60;
            var dString = "";
            if (hours > 0) {
                dString += hours + " hr ";
            }
            if (minutes > 0) {
                dString += minutes + " min ";
            }

            if (timeInMin == undefined || timeInMin == 0) {
                dString = "0 min";
            }
            return dString;

        }
    });
