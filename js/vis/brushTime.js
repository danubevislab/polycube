/**
 * Created by simba on 06/04/2017.
 *  * addint data to time brush
 * http://blockbuilder.org/mbostock/4349545
 */
(function () {
    let timeBrush = {};
    let parse5 = d3.timeParse("%Y");
    let format2 = d3.timeFormat("%Y");

    function init() {
        // console.log(window.dateTestEx);


        // let dateRange = [new Date(1977, 1, 1), new Date(1938, 1, 1) - 1]; //Cushman Todo: Manual Change
        let dateRange = [new Date(window.dateTestEx[1], 1, 1), new Date(window.dateTestEx[0], 1, 1) - 1]; //Cushman Todo: Manual Change

        let margin = {top: 40, right: 40, bottom: 140, left: 40},
            width = 120 - margin.left - margin.right,
            height = window.innerHeight - margin.top - margin.bottom;

        let y = d3.scaleTime() //todo: pass the date range from datasets for polycube
            .domain(dateRange)
            .rangeRound([height, 0]);

        let x = d3.scaleLinear()
            .range([0, width - 10]);

        let data = window.data;
        x.domain([0, d3.max(count(), function(d) { return d.val; })]);


        let line = d3.line()
            .y(d => {
                return y(new Date(d.date, 1, 1))
                // return d.val
            })
            .x(d => {
                return x(d.val);
                // return y(new Date(d.date, 1, 1))
            })
            .curve(d3.curveCardinal);

        let brush = d3
            .brushY()
            .extent([[0, 0], [width, height]])
            .on("end", brushened);

        let svg = d3.select("#timeLine")
            .style("position", "absolute")
            .style("z-index", "999")
            .style("width", "150px")
            .style("top", (30) + "px")
            .style("left", (-30) + "px")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //y axis
        svg.append("g")
            .attr("class", "axis2 axis--y2")
            .attr("transform", "translate(" + 0 + "," + margin.top + ")")
            .call(d3.axisLeft(y)
                // .ticks(d3.timeMonth)
                .ticks(d3.timeYear) //khm
                .tickSize(-width)
                .tickFormat(function () {
                    return null;
                }))
            .selectAll(".tick")
            .classed("tick--minor", function (d) {
                return d.getYear();
            });

        svg.append("g")
            .attr("class", "axis axis--y")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(d3.axisLeft(y)
                    // .ticks(d3.timeYear) //cushman
                .tickPadding(6)
            )
            .attr("text-anchor", null)
            .selectAll("text")
            .attr("x", 6);
        // .attr("y", 0);


        svg.select(".domain")
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", "2")
            .attr("d", line(count()));

        svg.append("g")
            .attr("class", "brush")
            .attr("transform", "translate(" + 0 + "," + margin.top + ")")
            .call(brush)
            .append("text")
            .attr("class", "brush_count")
            .attr("x", function () {
                return 5;
            })
            .attr("y", -20)
            .attr("dy", ".35em")
            .attr("stroke", "#8a8a8a")
            // .attr("stroke", "blue")
            .text(function (d) {
                return 550;
            });

        function brushened() {
            if (!d3.event.sourceEvent) return; // Only transition after input.
            if (!d3.event.selection) return; // Ignore empty selections.
            let d0 = d3.event.selection.map(y.invert),
                d1 = d0.map(d3.timeMonth.round);
            // d1 = d0.map(d3.timeYear.round);
            //
            // var d0 = d3.event.selection.map(x.invert),
            //     d1 = d0.map(d3.timeDay.round);

            // If empty when rounded, use floor & ceil instead.
            // if (d1[0] >= d1[1]) {
            //     d1[0] = d3.timeDay.floor(d0[0]);
            //     d1[1] = d3.timeDay.offset(d1[0]);
            // }

            // d3.select(this).transition().call(d3.event.target.move, d1.map(x));
            d3.select(this).transition().call(d3.event.target.move, d1.map(y));

            let range = d3.brushSelection(this)
                .map(y.invert);

            /**
             * TODO:Function to determine what data to use from the start and end date
             * @type {Array.<>}
             * window.data for each, if (time >= startDate and <= endDate, return)
             */
                // dateRange = [new Date(dateTestEx[0], 1, 1), new Date(dateTestEx[1], 1, 1) - 1];
                // init();
            let start = +format2(range[0]);
            let end = +format2(range[1]);

            // console.log(window.dateTestEx);

            let selectedData = window.data.filter(function (d) {
                if (d.time >= start && d.time <= end) {
                    return d;
                }
            });

            polyCube.updatePC(selectedData);

            //update text count
            d3.select(".brush_count")
                .text(selectedData.length);

        }

        function count() {
            let counts = {};
            let container = [];

            for (let i = 0; i < data.length; i++) {
                counts[data[i].time] = 1 + (counts[data[i].time] || 0);
            }

            let obj;
            let value;

            d3.keys(counts).forEach(function eachKey(key) {
                obj = +key;
                value = counts[key];
                container.push({date: obj, val: counts[key]});
            });

            return container;
        }

        /**
         * Animate brush from A to B
         * http://bl.ocks.org/timelyportfolio/5c136de85de1c2abb6fc
         */
        // animate briush from a to b
        function animateBrush() {
            // our year will this.innerText
            console.log(this.innerText);

            // define our brush extent to be begin and end of the year
            brush.extent([new Date(this.innerText + '-01-01'), new Date(this.innerText + '-12-31')]);

            // now draw the brush to match our extent
            // use transition to slow it down so we can see what is happening
            // remove transition so just d3.select(".brush") to just draw
            brush(d3.select(".brush").transition());

            // now fire the brushstart, brushmove, and brushend events
            // remove transition so just d3.select(".brush") to just draw
            brush.event(d3.select(".brush").transition().delay(1000))
        }
    }

    setTimeout(function () {
        init();
    }, 1000);


}());