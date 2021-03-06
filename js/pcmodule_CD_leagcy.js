/**
 * Created by simba on 27/03/2017.
 */
(function () {
    var pCube = {};

    /**default data
     *
     * @type {Array}
     */
    var defaultData = [];

    /**
     * Container to hold line geometry coordinates
     * @type {Array}
     */
    var lineList = [];

    /**d3 variables and declarations
     *
     * @type {number}
     */
    var width = 500,
        height = 500,
        widthHalf = width / 2,
        heightHalf = height / 2;
    var svg;

    var formatTime = d3.timeFormat("%Y");

    var projectionScale = 5000;

    /**
     * Point of entry function to draw scene elements and inject data from map (), point cloud () and segements ()
     * @param datasets
     * @param datasets2
     */

    var dataSlices = 4;
    var interval = 500 / dataSlices; //height/segments


    var timeLinearG;

    var segmentedData;

    var layout;

    let scales = {
        puOr11: ['#7f3b08', '#b35806', '#e08214', '#fdb863', '#fee0b6', '#f7f7f7', '#d8daeb', '#b2abd2', '#8073ac', '#542788', '#2d004b'],
        spectral8: ['#d53e4f', '#f46d43', '#fdae61', '#fee08b', '#e6f598', '#abdda4', '#66c2a5', '#3288bd'],
        redBlackGreen: ['#ff0000', '#AA0000', '#550000', '#005500', '#00AA00', '#00ff00'],
        viridis: ["#440154","#440256","#450457","#450559","#46075a","#46085c","#460a5d","#460b5e","#470d60","#470e61","#471063","#471164","#471365","#481467","#481668","#481769","#48186a","#481a6c","#481b6d","#481c6e","#481d6f","#481f70","#482071","#482173","#482374","#482475","#482576","#482677","#482878","#482979","#472a7a","#472c7a","#472d7b","#472e7c","#472f7d","#46307e","#46327e","#46337f","#463480","#453581","#453781","#453882","#443983","#443a83","#443b84","#433d84","#433e85","#423f85","#424086","#424186","#414287","#414487","#404588","#404688","#3f4788","#3f4889","#3e4989","#3e4a89","#3e4c8a","#3d4d8a","#3d4e8a","#3c4f8a","#3c508b","#3b518b","#3b528b","#3a538b","#3a548c","#39558c","#39568c","#38588c","#38598c","#375a8c","#375b8d","#365c8d","#365d8d","#355e8d","#355f8d","#34608d","#34618d","#33628d","#33638d","#32648e","#32658e","#31668e","#31678e","#31688e","#30698e","#306a8e","#2f6b8e","#2f6c8e","#2e6d8e","#2e6e8e","#2e6f8e","#2d708e","#2d718e","#2c718e","#2c728e","#2c738e","#2b748e","#2b758e","#2a768e","#2a778e","#2a788e","#29798e","#297a8e","#297b8e","#287c8e","#287d8e","#277e8e","#277f8e","#27808e","#26818e","#26828e","#26828e","#25838e","#25848e","#25858e","#24868e","#24878e","#23888e","#23898e","#238a8d","#228b8d","#228c8d","#228d8d","#218e8d","#218f8d","#21908d","#21918c","#20928c","#20928c","#20938c","#1f948c","#1f958b","#1f968b","#1f978b","#1f988b","#1f998a","#1f9a8a","#1e9b8a","#1e9c89","#1e9d89","#1f9e89","#1f9f88","#1fa088","#1fa188","#1fa187","#1fa287","#20a386","#20a486","#21a585","#21a685","#22a785","#22a884","#23a983","#24aa83","#25ab82","#25ac82","#26ad81","#27ad81","#28ae80","#29af7f","#2ab07f","#2cb17e","#2db27d","#2eb37c","#2fb47c","#31b57b","#32b67a","#34b679","#35b779","#37b878","#38b977","#3aba76","#3bbb75","#3dbc74","#3fbc73","#40bd72","#42be71","#44bf70","#46c06f","#48c16e","#4ac16d","#4cc26c","#4ec36b","#50c46a","#52c569","#54c568","#56c667","#58c765","#5ac864","#5cc863","#5ec962","#60ca60","#63cb5f","#65cb5e","#67cc5c","#69cd5b","#6ccd5a","#6ece58","#70cf57","#73d056","#75d054","#77d153","#7ad151","#7cd250","#7fd34e","#81d34d","#84d44b","#86d549","#89d548","#8bd646","#8ed645","#90d743","#93d741","#95d840","#98d83e","#9bd93c","#9dd93b","#a0da39","#a2da37","#a5db36","#a8db34","#aadc32","#addc30","#b0dd2f","#b2dd2d","#b5de2b","#b8de29","#bade28","#bddf26","#c0df25","#c2df23","#c5e021","#c8e020","#cae11f","#cde11d","#d0e11c","#d2e21b","#d5e21a","#d8e219","#dae319","#dde318","#dfe318","#e2e418","#e5e419","#e7e419","#eae51a","#ece51b","#efe51c","#f1e51d","#f4e61e","#f6e620","#f8e621","#fbe723","#fde725"]
    };

    /**
     * Flip mirro and horizontal
     * https://threejs.org/docs/#manual/introduction/Matrix-transformations
     * https://stackoverflow.com/questions/11060734/how-to-rotate-a-3d-object-on-axis-three-js
     */

    var mS = (new THREE.Matrix4()).identity();
    // var mS = (new THREE.Matrix4()).getInverse();
    //set -1 to the corresponding axis
    // mS.elements[0] = -1;
    //mS.elements[5] = -1;
    // mS.elements[10] = -1;


    pCube.drawElements = function (datasets, datasets2) {
        /**
         * Parse and Format Time
         */
        var parse2 = d3.timeParse("%Y-%m-%d");
        var parse3 = d3.timeParse("%b. %d, %Y"); //data format for cushman data
        var parse4 = d3.timeParse("%Y-%m-%dT00:00:00Z");


        var format2 = d3.timeFormat("%Y");


        /**
         * Cleaning Function for Datasets
         */

        /**
         * Clean func for Datasets1
         *Datasets to draw the segments
         */
        datasets.forEach(function (d, i) {
            var coord = d.Geocoordinates.split(",");
            d.long = +coord[0];
            d.lat = +coord[1];
            // d.long = d
            /**
             * Data to draw segements from
             * @type {T}
             */
            defaultData[i] = d;

            // console.log(+format2(parse4(d.Date)));

            d.time = parse4(d.Date);
            d.time = +format2(d.time);


            //data segmentation
            /**
             * Group dataSets by intervals and sum of the intervals date range,
             * add a field to each data object representing the value of the range in y axis e.g jp:1, jp:2, jp:3
             * use d3.nest() to group all elements in dataSet by jp suing example from the link below
             * https://proquestionasker.github.io/blog/d3Nest/
             * pass grouped data to elements d3 function and draw them on maps individually
             */

            var jp1 = 1942, jp2 = 1946, jp3 = 1950, jp4 = 1977;

            if (d.time <= jp1) {
                d.ts = "jp1";
            }

            if (d.time > jp1 && d.time <= jp2) {
                d.ts = "jp2";
            }

            if (d.time > jp2 && d.time <= jp3) {
                d.ts = "jp3";
            }

            if (d.time > jp3 && d.time <= jp4) {
                d.ts = "jp4";
            }

        });

        /**
         * Clean func for Data sets 2
         *Data sets to draw point clouds
         */
        datasets2.forEach(function (d, i) {
            d.start_date = parse2(d.start_date); //parse date first and then format
            d.start_date = +format2(d.start_date)
        });

        /**
         * Time linear function to calculate the y axis on the cube by passing the value of year from the datasets
         *
         */
        var dateTestEx = d3.extent(datasets, function (d) {
            return d.time;
        });

        var timeLinear = d3.scaleLinear().domain(dateTestEx).range([-heightHalf, heightHalf]);

        timeLinearG = timeLinear;

        /**d3 data scale
         * to be implemented with datasets with time and location
         * todo: data scale for x, y, z
         */
        var xExent = d3.extent(datasets, function (d) {//to determine the range of x in the data
                return d.Archive_Date;
            }),
            yExent = d3.extent(datasets, function (d) { // to determine the range of y in the data
                // console.log(d["Archive Date"]);
                return d.Archive_Date;
            }),
            zExent = d3.extent(datasets, function (d) {
                return d;
            });


        /**
         * calculate the largest and smallest value for Xscale and Y scale
         */
        var xScale = d3.scaleLinear()
                .domain(xExent)
                .range([-widthHalf, width]),
            yScale = d3.scaleLinear()
                .domain(yExent)
                .range([0, height]);

        /**
         * scenes
         * Introduction CSS3D and WebGL scenes
         */
        WGLScene = new THREE.Scene();
        scene = new THREE.Scene();

        /**
         * Render point cloud from the automated data and points;
         * TrackballControls makes object disspear when zooming out ?
         */
        pCube.showPointCloud = function () {
            // pCube.spriteRender(xScale, yScale);
        };


        pCube.showNodes = function () {
            pCube.drawLines()
        };


        /**WebGL renderer implementation
         *
         * @type {THREE.WebGLRenderer}
         * https://stackoverflow.com/questions/24681170/three-js-properly-blending-css3d-and-webgl/24688807#24688807
         * http://learningthreejs.com/blog/2013/04/30/closing-the-gap-between-html-and-webgl/
         * setting both wgl dom and css dom styles to thesame absolute position to align xyz positions
         */
        WGLRenderer = new THREE.WebGLRenderer({alpha: true});
        WGLRenderer.setSize(window.innerWidth, window.innerHeight);
        WGLRenderer.setClearColor(0x00ff00, 0.0);
        WGLRenderer.domElement.style.position = 'absolute';
        // WGLRenderer.domElement.style.zIndex = 1;
        WGLRenderer.domElement.style.top = 0;
        document.body.appendChild(WGLRenderer.domElement);


        /**CSS renderer
         *
         * @type {THREE.CSS3DRenderer}
         */
        renderer = new THREE.CSS3DRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.style.position = 'absolute';
        // renderer.domElement.style.zIndex = 5;
        renderer.domElement.style.top = 0;
        document.body.appendChild(renderer.domElement);

        /**
         * Callibrating css cubebox and glcube box positions
         * https://stackoverflow.com/questions/24681170/three-js-properly-blending-css3d-and-webgl/24688807#24688807
         * Copy position of the cube box and attach it to glbox to callibrate both objects
         */
        glbox.position.copy(cube.position);
        glbox.rotation.copy(cube.rotation);


        /**camera
         * Threejs camera implementation
         * @type {any}
         * Prob: Object disappear from screen when zooming out
         * Ans: camera's far plane is at 3000 which means everything that is 3000 units away will be clipped and not drawn
         * https://stackoverflow.com/questions/29185783/three-js-things-disappear-when-zooming-out
         * try a combined camera
         */

        // camera = new THREE.CombinedCamera( window.innerWidth, window.innerHeight, 55, 1, 1000, - 200, 100 );
        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.set(600, 400, 800);

        /** Mouse Controls for zooming, panning etc
         *
         * @type {THREE.OrbitControls}
         *
         */
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.target = new THREE.Vector3(0, 0, 0);
        controls.autoRotateSpeed = 0.3;
        controls.noRotate = false;
        // controls.pan = false;
        controls.addEventListener('change', pCube.render);

        /**
         * Add Object Group to Scene (Cube and Mesh?)
         *Mesh is for the timeline title
         */

        scene.add(cube);
        scene.add(mesh);


        scene.add(pointCloud);
        WGLScene.add(glbox);

        /**
         * Time axis inverted
         * @type {number}
         */

        pointCloud.rotation.z = 3.15;
        pointCloud.position.z = -90;
        pointCloud.position.y += 5;


        glbox.rotation.z = 3.15;
        glbox.position.z = -90;
        glbox.position.y += 5;

        // pointCloud.position.x += 4;

        // console.log(pointCloud);

        // glbox.rotation.y = 10;
        // glbox.position.z = -60;

        //rotate cube
        // pointCloud.position.copy(cube.position);
        // pointCloud.rotation.copy(cube.rotation);


        //flip pointcloud
        // cube.applyMatrix(mS);
        // pointCloud.applyMatrix(mS);


        /**
         * WEBGL PLAYGROUND
         * Callibrating css cubebox and glcube box positions
         *
         */


        /**CSS3D Scene
         * Cube Sides
         *6 sided cube creation with CSS3D, div and then added to cube group object
         */
        for (var i = 0; i < 6; i++) {
            var element = document.createElement('div');

            /**
             * Cube Width and height
             * @type {string}
             */
            element.style.width = width + 'px';
            element.style.height = height + 'px';

            /**
             *
             * @type {string}
             */
            element.style.opacity = '0.1';
            element.style.border = "0.5px dotted #FFF";
            element.className = "side";

            /**
             * Create new CSS3D object side and add it to the cube group
             * get position from array of predefined cube rotation and position css3d matrix
             * @type {THREE.CSS3DObject}
             */
            var object = new THREE.CSS3DObject(element);
            object.position.fromArray(pos[i]);
            object.rotation.fromArray(rot[i]);
            object.name = "side";
            cube.add(object);
        }

        /**
         * Segments
         * var segments = datasets.length; //todo: specify config value for the segments numbers
         * dynamic segementation :: var segments = (datasets2.length < 20 ? datasets.length : 10)
         * segements from the length of defaultData or datasets1
         */
        // var segments = defaultData.length;
        // var segments = (datasets2.length < 20 ? datasets.length : 10);
        // var segments = 10;

        /**D3
         *Map Projection
         *Mercator or geoAlbers
         *Dynamic Scale with editing and update function
         */
        var projection = d3.geoAlbers()
            .translate([width / 2, height / 2])
            .center([0, 45.5])
            .rotate([-13.5, -2])
            .scale(100);

        var path = d3.geoPath()
            .projection(projection)
            .pointRadius(2);

        /**
         * D3.nest to segment each data by ts property
         * sort data by jp1
         */

        var dataBySeg = d3.nest()
            .key(function (d) {
                return d.ts;
            })
            .entries(datasets).sort(function (a, b) {
                return a.key < b.key;
            });

        /**
         * push segmented data to global variable
         * @type {any}
         */
        segmentedData = dataBySeg;
        // console.log(dataBySeg);

        /**
         *Create Div holders for the segments
         * main Element Div (Create new segments holders from here)
         *Currently using todo: datasets1 should be changed to datasets2
         */

            // console.log(dataBySeg);


        var elements = d3.select("body").selectAll('.element')
            //todo: add function to .data to slice dataSets into dataSlides amount of individual segments
            //     .data(datasets.slice(0, dataSlices)).enter() //todo: limit datasets to sepcific time for y axis
                .data(dataBySeg)
                .enter()
                .append('div')
                .attr('class', 'elements')
                .style("width", width + "px")
                .style("height", height + "px")
                .attr('id', 'mapbox')
                .each(function (d, i) {
                    // console.log(d);
                    var div = d3.select(this).append("div")
                        .attr("class", "elements_child")
                        .style("width", width + "px")
                        .style("height", height + "px")
                        .attr("id", function (d) {
                            // return d.IU_Archives_Number; //todo: show different data on map layers
                            return d.key;
                            // return "55117";
                        })
                        .filter(function () {  //todo: point of hiding other map items
                            return i !== 0;
                        })
                        .classed("hide", true)
                        .classed("dataPane", true);

                    /**
                     * MAP entry point
                     * world mao implementation with leaflet
                     * @param d.IU is the elem ID of each mao
                     * Implement MabBox component
                     * http://www.delimited.io/blog/2014/5/10/maps-with-d3js-threejs-and-mapbox
                     *
                     */
                        // pCube.drawMap(d.IU_Archives_Number, datasets); //todo: show map on each layer
                    var maps = pCube.drawMap(d.key, d.values);
                });

        //Div SVG
        // svg = elements.append("svg")
        //     .attr("class", "circle_elements")
        //     .attr("width", width)
        //     .attr("height", height)
        //     // .style("opacity", 0.2)
        //     .append("circle")
        //     .attr("r", function (d, i) { //generated data to highlight circle radius
        //         var x = 200.4;
        //             // x2 = x * (datasets.length / 2) + x;
        //
        //         // if (i < (datasets.length / 2)) {
        //         //     return x + (i * x )
        //         // } else {
        //         //     return x2 - (i * (x / 2));
        //         // }
        //
        //         return x;
        //     })
        //
        //     .attr("cx", function (d) {
        //         // return d.geometry.coordinates[0] += 40;
        //         return 0
        //     })
        //     .attr("cy", function (d) {
        //         // var cy = d.geometry.coordinates[1] + 220;
        //         return 0;
        //     })
        //     .attr("fill", "orange");

        // pCube.drawMap("55117", datasets);

        pCube.drawMap_old = function (aut) {
            var counter = 0; //counter to monitor the amount of data rounds

            // map paths
            // svg.selectAll(".subunit")
            //     .data(topojson.feature(aut, aut.objects.subunits).features)
            //     // .data(aut.features)
            //     .enter()
            //     .append('g')
            //     .attr('transform', 'translate(460,0)rotate(80)')
            //     .append("path")
            //     .attr("class", function (d, i) {
            //         return "subunit"; //remove id
            //     })
            //     .classed("hide", function (d, i) {
            //         counter += 1;
            //         if (counter !== 1) { //only display map path for first map
            //             return true
            //         }
            //     })
            //     .attr("d", path);

            /**
             * google maps implementation
             **/

            var map = new google.maps.Map(d3.select("#mapbox").node(), {
                zoom: 8,
                center: new google.maps.LatLng(37.76487, -122.41948),
                mapTypeId: google.maps.MapTypeId.TERRAIN
            });

            var overlay = new google.maps.OverlayView();

            overlay.onAdd = function () {
                var layer = d3.select(this.getPanes().overlayLayer).append("div")
                    .attr("class", "stations");
                // Draw each marker as a separate SVG element.
                // We could use a single SVG, but what size would it have?
                overlay.draw = function () {
                    var projection = this.getProjection(),
                        padding = 10;

                    var marker = layer.selectAll("svg")
                        .data(d3.entries(datasets))
                        .each(transform) // update existing markers
                        .enter().append("svg:svg")
                        .each(transform)
                        .attr("class", "marker");

                    // Add a circle.
                    marker.append("svg:circle")
                        .attr("r", 4.5)
                        .attr("cx", padding)
                        .attr("cy", padding);

                    // Add a label.
                    marker.append("svg:text")
                        .attr("x", padding + 7)
                        .attr("y", padding)
                        .attr("dy", ".31em")
                        .text(function (d) {
                            return d.key;
                        });

                    function transform(d) {

                        // console.log(d)

                        d = new google.maps.LatLng(d.value[1], d.value[0]);
                        d = projection.fromLatLngToDivPixel(d);
                        return d3.select(this)
                            .style("left", (d.x - padding) + "px")
                            .style("top", (d.y - padding) + "px");
                    }
                };
            };

            // console.log(d3.select(".elements_child").node());

        };

        /**
         * Objectify and draw segments elements
         */
        // elements.each(setViewData);
        elements.each(addtoScene);

        // var newDiv = d3.select("body").append('div')
        //     .attr("class", "newElement")
        //     .style("width",200 + "px")
        //     .style("height",200 + "px");
        //
        // newDiv.each(addtoScene);


        /**
         * Test biographical data
         */

        var newList = [];

        console.log(dateTestEx);

        /**
         * Colour Scale
         */
            // let colour = d3.scaleLinear()
        let colour = d3.scaleOrdinal()
            // .domain(["jp1", "jp2", "jp3", "jp4"])
                .domain([dateTestEx[0], dateTestEx[1]])
                .range(["#450d54", "#481568" , "#482778", "#463782", "#3f4788", "#3a558c", "#32648e", "#32718e", "#367d8d", "#3a8a8c", "#3e968a", "#42a286", "#46af7e", "#4abc75", "#56c567", "#75d056", "#93d841", "#b8de2a", "#dce415", "#dce415"]);
        // .range(["#450d54", "#3a8a8c", "#d5dee4"]);
        // .range(["#450d54", "#3a8a8c"]);


        var testElem = d3.selectAll('.pointCloud')
            .data(datasets).enter()
            .each(function (d, i) {
                // var image = document.createElement('img');
                var image = document.createElement('div');
                var interval = 500 / dataSlices; //height/segments

                image.style.width = 8 + "px";
                image.style.height = 8 + "px";
                image.className = "pointCloud";
                image.style.background = colour(d.time);
                // image.style.boxShadow = "0 0 5px " + d.ts;

                // image.addEventListener('load', function (event) {
                var object = new THREE.CSS3DSprite(image.cloneNode()),
                    long = pCube.projection(d.long, d.lat).x,
                    lat = pCube.projection(d.long, d.lat).y;

                var coord = translate([lat, long]);

                object.position.y = timeLinear(d.time); //todo: height + scale + time to determine y axis
                object.position.z = coord[0] - 500;
                object.position.x = coord[1] + 250;

                /**
                 * add each proerties of the pointcloud to new data
                 *
                 */
                object["newData"] = d;


                var stc = new THREE.Object3D();
                stc.position.x = object.position.x;
                stc.position.y = object.position.y;
                stc.position.z = object.position.z;
                object['STC'] = stc;

                // add object rotation
                // object.rotation.fromArray(rot[2]);

                object.name = "pointCloud"; //todo: remove later

                object.element.onclick = function () {
                    // object.element.onmouseover = function () {

                    //Change image src
                    // console.log(d);

                    d3.select("#textTitle")
                        .html("<strong<p>" + d.Description_from_Notebook + "</p>" +
                            "<span class='date'>Date : " + d.Archive_Date + " </span> <br>" +
                            "<span class='location'>Location : " + d.City_and_State + "</span> <br>"
                        );

                    d3.select("#dataImage")
                        .attr("src", d.Image_URL)
                };

                var geometry = new THREE.Geometry();
                geometry.name = "guideLines";

                // object.element.onmouseover = function () {
                //     //draw a line to edge of the box
                //     var material = new THREE.LineBasicMaterial({
                //         color: "#feffff",
                //         linewidth: 2,
                //         linecap: 'round', //ignored by WebGLRenderer
                //         linejoin: 'round' //ignored by WebGLRenderer
                //     });
                //     material.blending = THREE.NoBlending;
                //
                //     /**
                //      * WebGl Scene
                //      * Temporary Web Gl Scene implementation for line testing
                //      * @type {any}
                //      */
                //
                //
                //     geometry.vertices.push(new THREE.Vector3(object.position.x, object.position.y, object.position.z));
                //     geometry.vertices.push(new THREE.Vector3(object.position.x, object.position.y, 500));
                //
                //     // console.log(object.position.z);
                //
                //     var line = new THREE.Line(geometry, material);
                //     glbox.add(line);
                //
                // };

                // object.element.onmouseout = function () {
                //     var guidline = scene.getObjectByName("guideLines");
                //     console.log(guidline)
                // };

                /**
                 * populate line list
                 */

                // newList.push(object.position);

                lineList.push(object.position);

                /**
                 * Add point clouds to pointCloud object created not scene so we can modify and display its rotation and position
                 */

                pointCloud.add(object);
                // }
                // }, false);
                // image.src = 'texture/ball2.png';

            });



        /**
         * Draw Timeline and Labels
         * todo: Redo timeLine
         *
         */


        drawLabels({ //Todo: fix label with proper svg
            labelPosition: {
                x: widthHalf,//offset border
                y: -(height / 2),
                z: widthHalf
            }
        });

        function drawLabels(parameters) {

            // console.log(dateTestEx[0]);
            // console.log(new Date(dateTestEx[1]));

            // console.log(d3.scaleTime().domain([new Date(dateTestEx[0])]))


            if (parameters === undefined) parameters = {};
            var labelCount = parameters["labelCount"] || dataSlices; //use label count or specified parameters

            var startDate = parameters["startDate"] || dateTestEx[0].toString();
            var endDate = parameters["endDate"] || dateTestEx[1].toString();

            // console.log(startDate);
            // console.log(endDate);

            var dateArray = d3.scaleTime()
                .domain([new Date(endDate), new Date(startDate)])
                .ticks(dataSlices);

            // var dateARR = d3.scaleTime().domain([new Date(startDate), new Date(endDate)]);
            // console.log(dateARR);

            // var separator = height / dateArray.length;
            var separator = height / dataSlices;
            var p = parameters["labelPosition"] || {
                x: -80,//offset border
                y: 0,
                z: 100
            };

            for (var i = 0; i < (dataSlices); i++) {

                // console.log(dateArray[i]);

                var label = makeTextSprite(formatTime(dateArray[i]), {fontsize: 10});
                label.position.set(p.x, p.y, p.z);
                label.rotation.y = 20;
                p.y += separator; //increment y position of individual label to increase over time
            }

            function makeTextSprite(message, parameters) {
                if (parameters === undefined) parameters = {};
                var fontsize = parameters["fontsize"] || 70;

                var element = document.createElement('p');
                element.className = "textTitle";
                element.style.color = 'grey';
                element.style.fontSize = fontsize + "px";
                // element.style.fontFaceName = parameters["fontface"] || "Helvetica";
                var elMessage = document.createTextNode(message);
                element.appendChild(elMessage);

                var object = new THREE.CSS3DObject(element);
                // object.position.fromArray(pos[i]);
                // object.rotation.fromArray(rot[i]);
                object.name = "titles";
                mesh.add(object);

                return object;
            }
        }

        /**
         * BioVis Styling
         */
        d3.selectAll(".elements_child")
            .style("background-color", "transparent");

        pCube.render();
        layout = "STC";

    };

    function addtoScene(d, i) {
        var objSeg = new THREE.CSS3DObject(this);
        //position
        objSeg.position.x = 0;
        objSeg.position.y = (i * interval) - height / 2;
        objSeg.position.z = 0;
        //rotation
        objSeg.rotation.fromArray(rot[2]);
        objSeg.name = "seg";
        cube.add(objSeg);
        //add new object test

        // console.log(objSeg.rotation);
        // objSeg.rotation.x = 1;

        // console.log(rot[2])
    }

    // console.log(testData);
    function setViewData(d, i) {
        var vector, phi, theta;
        var stc, jp, si;

        // stc = new THREE.Object3D();
        // stc.position.x = Math.random() * 4000 - 2000;
        // stc.position.y = Math.random() * 4000 - 2000;
        // stc.position.z = Math.random() * 4000 - 2000;
        // d['STC'] = stc;

        stc = new THREE.Object3D();
        stc.position.x = d.position.x;
        stc.position.y = d.position.y;
        stc.position.z = d.position.z;
        d['STC'] = stc;


        // jp = new THREE.Object3D();
        // jp.position.x = (( i % 5 ) * (width + 50)) - (width * 2);
        // jp.position.y = ( -( Math.floor(i / 5) % 5 ) * (width + 50) ) + 400;
        // jp.position.z = 0;
        // jp.time = ["1920", "1930"];
        // d['JP'] = jp;
        //
        // si = new THREE.Object3D();
        // si.position.x = (( i % 5 ) * 1050) - 2000;
        // si.position.y = ( -( Math.floor(i / 5) % 5 ) * 650 ) + 800;
        // si.position.z = 0;
        // d['SI'] = si;
    }

    /**
     * Default STC Layout Fallback function
     *
     */
    pCube.default = function (callbackFuntion) {
        // var segments = defaultData.length;
        var segments = dataSlices;

        var interval = height / segments; //height/segments

        var duration = 2500;
        TWEEN.removeAll();

        /**
         * Hide leaflet markers
         */
        d3.selectAll(".leaflet-marker-icon")
            .classed("hide", true);

        //show all time panels
        d3.selectAll(".textTitle")
            .classed("hide", false);

        //show all point clouds
        //delay poitcloud introduction
        //add transition tween

        setTimeout(function () {
            d3.selectAll(".pointCloud")
                .classed("hide", false);
        }, 2500);

        //display all the maps for the segments
        // d3.selectAll(".elements_child")
        //     .classed("hide", function (d, i) {
        //         // console.log(i);
        //         if (i !== 0) {
        //             return true
        //         }
        //     });

        var segCounter = 0; //keep list of the segment counters

        /**
         * Point Cloud reverse flattening
         */
        scene.getObjectByName("pointCloud").children.forEach(function (d) {

            var unFlattenPoints = new TWEEN.Tween(d.position)
                .to({
                    y: d.STC.position.y
                }, duration)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .start();
        });

        /**
         * Reverse array to show last segment first
         * Only show
         */
        // scene.getObjectByName("pointCloud").children.reverse(); reverse point cloud y axis
        if (layout !== "STC" ) {
            scene.children[0].children.reverse();
        }

        // if(layout === "SI"){
        //     scene.children[0].children.reverse();
        // }

        // console.log(scene.children[0].children);

        scene.children[0].children.forEach(function (object, i) {

            //show box shapes
            if (object.name == "side") {
                object.element.hidden = false;
            }


            //show segments
            if (object.name == "seg") {

                segCounter++;

                // console.log(interval);

                var posTween = new TWEEN.Tween(object.position)
                    .to({
                        x: 0,
                        y: (segCounter * interval) - (height / 2 + interval),
                        z: 0
                    }, duration)
                    .easing(TWEEN.Easing.Sinusoidal.InOut)
                    .start();


                var rotate = new TWEEN.Tween(object.rotation)
                    .to({x: rot[2][0], y: rot[2][1], z: rot[2][2]}, duration)
                    .easing(TWEEN.Easing.Sinusoidal.InOut)
                    .start();


                var tweenOpacity = new TWEEN.Tween((object.element.firstChild.style))
                    .to({
                        // opacity: 0.2,
                        backgroundColor: "#2f2f2f"
                    }, duration).easing(TWEEN.Easing.Sinusoidal.InOut)
                    .start()
            }

        });

        //camera movement

        var tween = new TWEEN.Tween({
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        }).to({
            x: 600,
            y: 400,
            z: 800
        }, 1600)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(function () {
                camera.position.set(this.x, this.y, this.z);
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            })
            .onComplete(function () {
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            })
            .start();

        //modify controls
        controls.noZoom = false;
        controls.noRotate = false;

        /**
         * Remove transparency on first layer only and hide the rest
         */

        d3.selectAll(".elements_child")
            .filter(function (d, i) {  //todo: point of hiding other map items
                return i !== 0;
            })
            .classed("hide", true)
            .classed("dataPane", false);

        //callback function to run at the end of every default redraw
        if (callbackFuntion) {
            callbackFuntion()
        }

        layout = "STC";
    };


    /**
     * Juxtaposition function
     *
     */


    pCube.juxstaPose = function () {
        var duration = 2500;
        TWEEN.removeAll();

        /**
         * show leaflet markers
         * show leaflet maps
         */
        d3.selectAll(".leaflet-marker-icon")
            .classed("hide", false);

        polyCube.hideLeafletMap(false);

        // conntrols
        controls.noZoom = false;
        controls.noRotate = true;

        //display all the maps for the segments
        d3.selectAll(".elements_child")
            .classed("hide", false);

        //hide canvas temporarily //todo: remove all pointClouds


        if (layout === "STC") {
            //flatten pointCloud time first if layout is STC
            polyCube.setsDraw()
        }

        //hide all time panels
        d3.selectAll(".textTitle")
            .classed("hide", true);

        var segCounter = 0; //keep list of the segment counters

        /**
         * reverse array before animating
         * Flatten Time before animating
         */

        scene.children[0].children.reverse();


        // console.log(scene.children[0].children);

        scene.children[0].children.forEach(function (object, i) { //todo: fixleftspace

            var reduceLeft = {
                x: (( segCounter % 5 ) * (width + 50)) - (width),
                y: ( -( Math.floor(segCounter / 5) % 5 ) * (width + 50) ) + 100, //just another way of getting 550
                z: 0
            };
            //remove box shapes
            if (object.name == "side") {
                object.element.hidden = true;
            }

            //tween the segments to grid shape
            if (object.name == "seg") {
                segCounter++;

                // console.log(object);
                //delay the transition to flatten time first
                // if (layout === "STC") {
                //
                // }

                setTimeout(function () {
                    d3.selectAll(".pointCloud")
                        .classed("hide", true);

                    var posTween = new TWEEN.Tween(object.position)
                        .to(reduceLeft, duration)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .start();

                    var rotate = new TWEEN.Tween(object.rotation)
                        .to({x: 0, y: 0, z: 0}, duration)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .start();

                    //
                    var tweenOpacity = new TWEEN.Tween((object.element.firstChild.style))
                        .to({
                            // opacity: 0.8,
                            backgroundColor: "black"
                        }, duration).easing(TWEEN.Easing.Sinusoidal.InOut)
                        .start();
                }, 1200);

                // console.log(object)

                //store object JP position inside the container
                var jp = new THREE.Object3D();
                jp.position.x = object.position.x;
                jp.position.y = object.position.y;
                jp.position.z = object.position.z;
                object['JP'] = jp;
            }
        });

        //camera movement
        var tween = new TWEEN.Tween({
            x: camera.position.x,
            y: camera.position.y,
            z: camera.position.z
        })
            .to({
                x: 0,
                y: 0,
                z: 2050
            }, 1600)
            .easing(TWEEN.Easing.Linear.None)
            .onUpdate(function () {
                camera.position.set(this.x, this.y, this.z);
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            })
            .onComplete(function () {
                camera.lookAt(new THREE.Vector3(0, 0, 0));
            })
            .start();

        layout = "JP";

    };

    pCube.onWindowResize = function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        pCube.render()
    };

    pCube.animate = function () {
        requestAnimationFrame(pCube.animate);
        TWEEN.update();
        controls.update();
        pCube.render()
    };

    /**
     * Super imposition function
     * todo: fix rotation of the cube with map
     */
    pCube.superImpose = function () {

        //make control center thesame as cube xyz position
        // controls.center = cube.position;
        controls.center.add(cube.position);
        console.log(controls);


        //controls
        // controls.noZoom = false;
        controls.noRotate = true;

        //hide all time panels
        d3.selectAll(".textTitle")
            .classed("hide", true);

        //display all the maps for the segments
        d3.selectAll(".elements_child")
            .classed("hide", false);

        var duration = 700;

        /**
         * Reverse array to show last segment first
         */
        scene.children[0].children.reverse();
        // console.log(scene.children[0].children);


        /**
         * Point Cloud Flattening
         * create a new object STC, save positions of STC inside object
         * rotate point cloud to match the positions of the
         */

        scene.getObjectByName("pointCloud").children.forEach(function (d) {

            d.position.y = 0;


            // console.log(d);

            // var flattenPoints = new TWEEN.Tween(d.position)
            //     .to({
            //         y: 0
            //     }, duration)
            //     .easing(TWEEN.Easing.Sinusoidal.InOut)
            //     .start();

            // console.log(d)
        });

        /**
         * Layers flattening
         */

        // SI to JP
        // scene.getObjectByName("cube").children.forEach(function (d, i) {
        //     if(d.getObjectByName("side")){
        //         d.element.hidden = true;
        //     }
        //
        //     if(d.getObjectByName("seg")){
        //         var reduceLeft = {
        //             x: 0,
        //             y: ( -( Math.floor(i / 5) % 5 ) * (width + 50) ) + 100, //just another way of getting 550
        //             z: 0
        //         };
        //
        //         //make the rotation thesame as jp segments
        //         // d.rotation._x = 0;
        //         // d.rotation._y = 0;
        //         // d.rotation._z = 0;
        //
        //
        //         var posTween = new TWEEN.Tween(d.position)
        //             .to(reduceLeft, duration)
        //             .easing(TWEEN.Easing.Sinusoidal.InOut)
        //             .start();
        //
        //         var rotate = new TWEEN.Tween(d.rotation)
        //             .to({x: 0, y: 0, z: 0}, duration)
        //             .easing(TWEEN.Easing.Sinusoidal.InOut)
        //             .start();
        //
        //         //make the point cloud rotation thesame as above
        //
        //         console.log(d);
        //
        //         d.position.x = 0;
        //         d.position.z = 0;
        //     }
        // });

        scene.children[0].children.forEach(function (object, i) {

            // remove box shapes
            if (object.name == "side") {
                object.element.hidden = true;
            }

            //show only segments
            if (object.name == "seg") {

                var posTween = new TWEEN.Tween(object.position)
                    .to({
                        y: 0
                    }, duration)
                    .easing(TWEEN.Easing.Sinusoidal.InOut)
                    .start();

                // var tweenOpacity = new TWEEN.Tween((object.element.firstChild.style))
                //     .to({
                //         opacity: 0.9
                //     }, duration).easing(TWEEN.Easing.Sinusoidal.InOut)
                //     .start()
            }

        });

        //change camera view
        //camera position

        //if juxtapos = false
        /**
         * Smoothing the camera transition
         */

        if (layout === "JP" || layout === "SI") {

            //transparent leaflet maps
            // setTimeout(function () {
            polyCube.hideLeafletMap(true);
            // }, duration)

            //put the segments together
            scene.getObjectByName("cube").children.forEach(function (d, i) {
                if (d.getObjectByName("seg")) {
                    var reduceLeft = {
                        x: 0,
                        // y: ( -( Math.floor(i / 5) % 5 ) * (width + 50) ) + 200, //just another way of getting 550
                        z: 0
                    };

                    var posTween = new TWEEN.Tween(d.position)
                        .to(reduceLeft, duration)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .start();

                    var rotate = new TWEEN.Tween(d.rotation)
                        .to({x: 0, y: 0, z: 0}, duration)
                        .easing(TWEEN.Easing.Sinusoidal.InOut)
                        .start();

                    d.position.x = 0;
                    d.position.z = 0;
                }
            });
            //and rotate the camera with all the points showing as above

            //or show the points only with only one map on the pane

            //rotate the pointclouds thesame way and position as the camera

        } else {
            //camera rotation
            var tween = new TWEEN.Tween({
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            }).to({
                x: 0, //todo: fix rotation of camera axis
                y: 1077.0329614263626,
                z: 0
            }, duration)
                .easing(TWEEN.Easing.Sinusoidal.Out)
                .onUpdate(function () {
                    camera.position.set(this.x, this.y, this.z);
                    camera.lookAt(new THREE.Vector3(0, 0, 0));
                    //camera.fov = 8; todo: add a new fov to change perspective
                })
                .onComplete(function () {
                    camera.lookAt(new THREE.Vector3(0, 0, 0));
                    // camera.lookAt(scene.position);
                })
                .start();

            var rotate = new TWEEN.Tween({
                x: camera.rotation.x,
                y: camera.rotation.y,
                z: camera.rotation.z
            }).to({
                x: -1.5707953161924646,
                y: -5.53118884027981,
                z: -0.005531219681680428
            }, duration)
                .easing(TWEEN.Easing.Elastic.InOut)
                // .onUpdate(function () {
                //     camera.rotation.set(this.x, this.y, this.z);
                //     // camera.lookAt(new THREE.Vector3(0, 0, 0));
                //     //camera.fov = 8; todo: add a new fov to change perspective
                // })
                .onComplete(function () {
                    // camera.lookAt(new THREE.Vector3(0, 0, 0));
                    // camera.position.x = 0;
                    // camera.position.y = 1077.0329614258226;
                    // camera.position.z = 0.0010770329614261862;
                })
                .start();
        }

        //else
        // do not rotate camera
        /**
         * Use Orthographic Camera
         * https://threejs.org/docs/#api/cameras/OrthographicCamera
         * https://threejs.org/docs/#examples/cameras/CombinedCamera
         */

        // camera.toOrthographic();

        layout = "SI";
    };

    /**
     * Morphing controls accross data layers
     * @param parameters
     */
    pCube.morphing = function (parameters) {
        if (parameters === undefined) parameters = {};

        var segCounter = 0; //keep list of the segment counters
        var duration = 5500;
        var yMorph = parameters["axis"] || 50; // todo: create
        scene.children[0].children.forEach(function (object, i) {
            //show only segments
            if (object.name == "seg") {

                segCounter++;
                // console.log(segCounter);
                if (segCounter == 1) {

                    object.element.firstChild.lastChild.style.display = "none"; //remove red circle

                    object.position.y = yMorph; //todo:for the control
                    object.position.x = 0; //todo:for the control
                    object.position.z = 0; //todo:for the control

                    // var posTween = new TWEEN.Tween(object.position) //todo: for the tween
                    //     .to({
                    //         x: 0,
                    //         y: yMorph,
                    //         z: 0
                    //     }, duration)
                    //     .easing(TWEEN.Easing.Sinusoidal.InOut)
                    //     .start();

                    //todo: animate the data spots on the map as it moves along time
                }
            }
        });
    };

    /**
     * Line function implementation
     * create line using only CSS3D
     */

    pCube.drawLines = function () {

        // console.log(lineList);

        /** Threejs Material decl to be used later for lines implementation
         *
         * @type {any}
         */
        var material = new THREE.LineBasicMaterial({
            color: "#FF4500",
            linewidth: 2,
            linecap: 'round', //ignored by WebGLRenderer
            linejoin: 'round' //ignored by WebGLRenderer
        });
        material.blending = THREE.NoBlending;

        /**
         * WebGl Scene
         * Temporary Web Gl Scene implementation for line testing
         * @type {any}
         */
        var geometry = new THREE.Geometry();

        /**
         * Draw lines from the coordinates inside lineList
         * interates through linelist
         * select position one, draw from 1 to 2, 2 to 3, 3 to 4
         */


        for (var i = 0; i < lineList.length; i++) {
            if (lineList[i].x !== undefined) {
                // console.log("A " + lineList[i].x);
                geometry.vertices.push(new THREE.Vector3(lineList[i].x, lineList[i].y, lineList[i].z));
            }

            for (var z = 0; z < lineList.length - 1; z++) {
                if (lineList[i + 1] !== undefined) {
                    // console.log("B " + lineList[i + 1].x)
                    geometry.vertices.push(new THREE.Vector3(lineList[i + 1].x, lineList[i + 1].y, lineList[i + 1].z));

                }

            }
        }

        // geometry.vertices.push(new THREE.Vector3(-10, 0, 0));
        // geometry.vertices.push(new THREE.Vector3(0, 40, 0));
        // geometry.vertices.push(new THREE.Vector3(10, 0, 0));

        var line = new THREE.Line(geometry, material);
        glbox.add(line);

        // WGLScene.add(line);

    };

    /**
     * CSS3D sprite for point cloud implementation
     * @param xScale
     * @param yScale
     * @param params
     */
    pCube.spriteRender = function (xScale, yScale, params) {
        if (params === undefined) params = {};
        var size = params["size"] || 10;
        var image = document.createElement('img');

        //count of point clouds
        var countPC = params["countPC"] || 100;

        image.style.width = size + "px";
        image.style.height = size + "px";
        image.className = "pointCloud";

        image.addEventListener('load', function (event) {
            for (var i = 0; i < countPC; i++) {
                var object = new THREE.CSS3DSprite(image.cloneNode());
                var min = -200,
                    max = 200;

                // object.position.x = xScale(Math.random() * 250); // using xScale to determine the positions
                // object.position.y = yScale(Math.random() * 200 - 100);
                // object.position.z = Math.random() * 200 - 200;

                object.position.y = Math.random() * (max - min) + min;
                object.position.z = Math.random() * ((50) - (-60)) + (-60);
                object.position.x = Math.random() * ((30) - (-50)) + (-50); // using xScale to determine the positions

                object.name = "pointCloud"; //todo: remove later

                object.element.onmouseover = function (d) {
                    this.y = 0;
                };

                scene.add(object);
            }
        }, false);
        image.src = 'texture/ball2.png';
    };

    pCube.render = function () {
        // remember to call both renderers!
        WGLRenderer.render(WGLScene, camera);
        renderer.render(scene, camera);
        // pointCloud.rotation.y -= 0.05;

        // console.log(layout)
    };

    /**
     * MAP entry point
     * Austrian Map Implementation with topojson
     * @param aut
     * Implement MabBox component
     * http://www.delimited.io/blog/2014/5/10/maps-with-d3js-threejs-and-mapbox
     * https://hackernoon.com/d3-js-and-google-maps-api-in-10-easy-steps-4f258323525b
     * https://developers.google.com/maps/documentation/javascript/examples/circle-simple
     * http://blockbuilder.org/jaegerka/e53294b2f5087e03525ff8d508767a2d
     *
     */

    pCube.drawMap = function (elemID, data) {

        var accesToken = 'pk.eyJ1Ijoib3NhZXoiLCJhIjoiOExKN0RWQSJ9.Hgewe_0r7gXoLCJHuupRfg';

        var street = L.tileLayer('http://a.tiles.mapbox.com/v3/tmcw.map-rep59d6x/{z}/{x}/{y}.png'),
            street2 = L.tileLayer('http://{s}.sm.mapstack.stamen.com/(toner-lite,$fff[difference],$fff[@23],$fff[hsl-saturation@20])/{z}/{x}/{y}.png?access_token={accessToken}', {
                attributionControl: false,
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: accesToken,
                zoomControl: false
            }),
            street3 = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attributionControl: false,
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: accesToken,
                zoomControl: false
            });

        var mymap = L.map(elemID, {
            layers: [street2],
            attributionControl: false,
            maxZoom: 18,
            id: 'mapbox.streets',
            accessToken: accesToken,
            zoomControl: false
        }).setView([30.4507462, -91.154552], 3);

        mymap.touchZoom.disable();
        mymap.doubleClickZoom.enable();
        // mymap.doubleClickZoom.disable();
        mymap.scrollWheelZoom.disable();
        mymap.boxZoom.disable();
        mymap.keyboard.disable();
        mymap.dragging.disable();

        var getPxBounds = mymap.getPixelBounds;

        mymap.getPixelBounds = function () {
            var bounds = getPxBounds.call(this);
            // ... extend the bounds
            bounds.min.x = bounds.min.x - 1000;
            bounds.min.y = bounds.min.y - 1000;
            bounds.max.x = bounds.max.x + 1000;
            bounds.max.y = bounds.max.y + 1000;
            return bounds;
        };

        var color = '#1C75BC';
        var circle_options = {
            color: '#ff9600',
            fillColor: '#ff9600'
        };

        var crs = mymap.options.crs;
        var pixelOrigin = mymap.getPixelOrigin();
        var mapZoom = mymap.getZoom();

        /**LATLONG to POINT
         * convert latlong to point and use it to porject xy coordinates of the sprite
         * https://stackoverflow.com/questions/40986573/project-leaflet-latlng-to-tile-pixel-coordinates
         */
        pCube.projection = function projectPoint(x, y) {
            // return mymap.latLngToLayerPoint(new L.LatLng(y, x));
            var latlong = new L.LatLng(x, y);
            var projectedPoint = mymap.project(latlong, mapZoom);
            // return crs.latLngToPoint(latlong, mapZoom);
            // console.log(projectedPoint);
            return projectedPoint;
        };

        let icon = L.icon({
            iconUrl: 'texture/ball2.svg',
            iconSize: [8, 8] // size of the icon
            // shadowSize:   [50, 64], // size of the shadow
            // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
            // shadowAnchor: [4, 62],  // the same for the shadow
            // popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
        });


        data.forEach(function (d) {
            var coord = L.latLng(d.long, d.lat);
            // var layerPoint = crs.latLngToPoint(coord, mapZoom);
            // var radius = 1000;


            // var circle = L.circle(coord, radius, circle_options).addTo(mymap);

            var marker = L.marker(coord, {icon: icon}).addTo(mymap)

            marker.on('mouseover', function (e) {
                // console.log(d);
                d3.select("#textTitle")
                    .html("<strong<p>" + d.Description_from_Notebook + "</p>" +
                        "<span class='date'>Date : " + d.Archive_Date + " </span> <br>" +
                        "<span class='location'>Location : " + d.City_and_State + "</span> <br>"
                    );

                d3.select("#dataImage")
                    .attr("src", d.Image_URL)

            });
        });

        /**
         * On zoom map, remove, update and draw pointClouds
         *
         */

        // mymap.on('zoomend', function (e) {
        //     // console.log(mapZoom)
        //     console.log(e.target);
        //
        //     // remove point cloud
        //     delete3DOBJ("pointCloud");
        //     // add new point cloud with project points
        // });

        // var polygon = L.polygon([
        //     [51.509, -0.08],
        //     [51.503, -0.06],
        //     [51.51, -0.047]
        // ]).addTo(mymap);

        // mymap.addLayer(layers.street3);

        /**
         * Switch leaflet map layers
         * @param map
         */

        var baseMaps = {
            "Street1": street,
            "Street2": street2,
            "Street3": street3
        };

        var overlays = {};

        L.control.layers(baseMaps, overlays).addTo(mymap);

        pCube.switchMap = function (map) {
            if (mymap.hasLayer(street)) {
                mymap.removeLayer(street)
            } else {
                mymap.addLayer(street2)
            }
        };
    };

    pCube.hideLeafletMap = function (value) {

        d3.selectAll(".leaflet-pane .leaflet-tile-pane")
            .filter(function (d, i) {  //todo: point of hiding other map items
                return i !== 0;
            })
            .classed("hide", value)
    };

    pCube.setsDraw = function () {
        var duration = 1000;
        //rearrange point clouds
        //hide maps
        //draw a

        // console.log(interval * dataSlices);

        var nestedPointCloud = d3.nest()
            .key(function (d) {
                return d.newData.ts;
            }).entries(scene.getObjectByName("pointCloud").children)
            .sort(function (a, b) {
                return a.key > b.key;
            });

        // console.log(nestedPointCloud);

        nestedPointCloud.forEach(function (data, i) {
            var segs = data.values;
            // console.log(interval);

            segs.forEach(function (d) {
                // d.position.y = interval + interval;
                // d.position.y = interval * i - 125;

                var rotate = new TWEEN.Tween(d.position)
                    .to({
                            y: interval * i - 125
                        }
                        , duration)
                    .easing(TWEEN.Easing.Sinusoidal.InOut)
                    .start();
            })
        });

        // scene.getObjectByName("pointCloud").children.forEach(function (d) {
        //
        //     // console.log(d);
        // });


        // d3.selectAll(".elements")
    };

    /**
     * Translate function for the long and lat coordinates
     * @param point
     * @returns {*[]}
     * http://blog.mastermaps.com/2013/11/showing-gps-tracks-in-3d-with-threejs.html
     */

    function translate(point) {
        return [point[0] - (width / 2), (height / 2) - point[1]];
        // return [point[0] - (width), (height) - point[1]];
    }

    /**
     * Remove object from scene
     */

    function delete3DOBJ(objName) {
        var selectedObject = scene.getObjectByName(objName);
        // var elem = document.getElementsByClassName("pointCloud");
        var elem = d3.selectAll("." + objName);
        elem.remove();
        // elem.remove();
        // elem.parentNode.removeChild(elem);

        scene.remove(selectedObject);
        pCube.animate();
    }

    /**
     * 3D Scene Renderer
     *
     */
    var renderer, scene, camera, controls;
    var cube = new THREE.Object3D();
    cube.name = "cube";
    var mesh = new THREE.Object3D();
    var glbox = new THREE.Object3D();
    glbox.name = "glbox";

    var pointCloud = new THREE.Object3D();
    pointCloud.name = "pointCloud";

    /**
     * WebGl Scene and renderer
     * Example od a perfect webglcube https://threejs.org/examples/webgl_lines_dashed.html
     */
    var WGLScene,
        WGLRenderer;

    /**
     * Array cube rotation and position css3d matrix
     * @type {*[]}
     */
    var r = Math.PI / 2;
    var d = 250;
    var pos = [[d, 0, 0], [-d, 0, 0], [0, d, 0], [0, -d, 0], [0, 0, d], [0, 0, -d]];
    var rot = [[0, r, 0], [0, -r, 0], [-r, 0, 0], [r, 0, 0], [0, 0, 0], [0, 0, 0]];

    window.polyCube = pCube;
}());
