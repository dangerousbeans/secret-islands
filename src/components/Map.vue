
<template>
  <div class="fluid-container">
    <div class="row">
      <div id="map" class="col-md-6">
        <MapSVG id="map_svg"></MapSVG>
      </div>

      <div id="" class="col-md-6 scroll">
        <div class="card-body">
          <h2 class="card-title">⬡ {{x}} / {{y}}</h2>
          <h3 class="card-title">{{active_tags}}</h3>
          <Messages :x="x" :y="y"></Messages>
        </div>  
      </div>

    </div>
  </div>
</template>


<script>
var d3 = require("d3");

import MapSVG from './map.svg';
import Messages from './../components/Messages'

import * as topojson from "topojson-client";
import layout from './circle-layout'
// import resize from 'vue-resize-directive'

window.map_context = ""

const directives = {
  // resize
}

const pull = require('pull-stream')
const drain = require('pull-stream/sinks/drain')

import sbotLibs from './../sbot'


// D3 settings
var margin = {top: 5, right: 5, bottom: 5, left: 5},
      width = 2000,
      height = 2000


var radius = 20;

// D3 context hacks for update method
var group, mesh, border;

var svg, g, path, container_container;

function mousedown(d) {
  map_context.$router.push({ path: `/${d.i}/${d.j}`})
}

function draw_border(border, path, topology) {
  border.attr("d", path(topojson.mesh(topology, topology.objects.hexagons, function(a, b) { return a.fill ^ b.fill; })));
}

function hexTopology(radius, width, height) {
  var dx = radius * 2 * Math.sin(Math.PI / 3),
      dy = radius * 1.5,
      m = Math.ceil((height + radius) / dy) + 1,
      n = Math.ceil(width / dx) + 1,
      geometries = [],
      arcs = [];

  for (var j = -1; j <= m; ++j) {
    for (var i = -1; i <= n; ++i) {
      var y = j * 2, x = (i + (j & 1) / 2) * 2;
      arcs.push([[x, y - 1], [1, 1]], [[x + 1, y], [0, 1]], [[x + 1, y + 1], [-1, 1]]);
    }
  }

  var x_pos = map_context.$props.x
  var y_pos = map_context.$props.y

  // console.log("xy", x_pos, y_pos)

  var geom_id = 1
  for (var j = 0, q = 3; j < m; ++j, q += 6) {
    for (var i = 0; i < n; ++i, q += 3) {
      
      
      var lookup_activity = i + '/' + j
      var activ = map_context.$data.activity[lookup_activity]

      geometries.push({
        type: "Polygon",
        arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
        fill: x_pos == i && y_pos == j,
        last_activity: activ ? activ.last_activity : null,
        tags: (activ && activ.tags) ? activ.tags : [],
        j: j,
        i: i,
        id: geom_id
      });

      geom_id++;
    }
  }

  return {
    transform: {translate: [0, 0], scale: [1, 1]},
    objects: {hexagons: {type: "GeometryCollection", geometries: geometries}},
    arcs: arcs
  };
}

function hexProjection(radius) {
  var dx = radius * 2 * Math.sin(Math.PI / 3),
      dy = radius * 1.5;
  return {
    stream: function(stream) {
      return {
        point: function(x, y) { stream.point(x * dx / 2, (y - (2 - (y & 1)) / 3) * dy / 2); },
        lineStart: function() { stream.lineStart(); },
        lineEnd: function() { stream.lineEnd(); },
        polygonStart: function() { stream.polygonStart(); },
        polygonEnd: function() { stream.polygonEnd(); }
      };
    }
  };
}

export default {

  directives,

  components: {
    MapSVG,
    Messages
  },

  props: ['x', 'y'],

  data () {
    return { 
      messages: [ ],
      activity: {},
      active_tags: [ ]
    }
  },

  methods: {
    new_activity (err, a) {
      this.$data.activity = a
      
      // Check for active tags where we are
      var x = this.$route.params.x
      var y = this.$route.params.y

      if(x && y) // if we have a postion
      {
        this.$data.active_tags = a[ x + '/' + y ] ? a[ x + '/' + y ].tags : []
      }
    },
    getSize () {
      var width = 2270
      var height = 1300
      return { width, height }
    },
    transformSvg (g, size) {
      size = size || this.getSize()
      return layout.transformSvg(g, this.margin, size)
    },
    updateTransform (g, size) {
      size = size || this.getSize()
      return layout.updateTransform(g, this.margin, size)
    },
    resize: function() {
      console.log("resize?")
      const size = this.getSize()
      const {g, svg, tree} = this.internaldata
      
      this.transformSvg(g, size)
      layout.optimizeSize(tree, size, this.margin, this.textContraint)
      this.redraw()
    },


    getActivity: function(refresh_activity) {
      this.$ssb.then((ssb) => {
        var index = ssb.geospatial.get(this.new_activity)
      })
    },

    // zoomed: function() {
    //   console.log("zoom", d3.event.transform, container_container.attr("transform"))

    //   container_container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    //   // container_container.attr("transform", d3.event.transform);
    // },

    dragstarted: function (d) {
      d3.event.sourceEvent.stopPropagation();
    },

    dragged: function (d) {
      // console.log("dragg", container_container.attr("transform"))

      d.x = d3.event.x;
      d.y = d3.event.y;

      container_container.attr("transform", "translate(" + [d.x, d.y] + ")")
    },

    dragended: function (d) {
    },

    update_backgrounds: function(paths, topology) {
      // UPDATE
      // Update old elements as needed.
      paths.attr("class", "update")
        .attr("d", function(d) { return path(topojson.feature(topology, d)); })
        .attr("class", function(d) { return d.fill ? "fill" : null; })
        .attr("topics", function(d) { return d.tags })
        .attr("active", function(d) { return d.last_activity != null })
        .on("mousedown", mousedown)

      // ENTER
      // Create new elements as needed.
      //
      // ENTER + UPDATE
      // After merging the entered elements with the update selection,
      // apply operations to both.
      paths.enter().append("path")
        .attr("d", function(d) { return path(topojson.feature(topology, d)); })
        .attr("class", function(d) { return d.fill ? "fill" : null; })
        .attr("topics", function(d) { return d.tags })
        .attr("active", function(d) { return d.last_activity != null })
        .on("mousedown", mousedown)
        .merge(paths)

      // EXIT
      // Remove old elements as needed.
      paths.exit().remove();
    },

    update_borders: function(borders, topology) {
      // border = container_container.append("g").append("path")
      //     .attr("class", "border")
      //     .call(draw_border, path, topology);
      // UPDATE
      // Update old elements as needed.
      borders.attr("class", "border")
        .call(draw_border, path, topology);

      // ENTER
      // Create new elements as needed.
      //
      // ENTER + UPDATE
      // After merging the entered elements with the update selection,
      // apply operations to both.
      borders.enter().append("path")
        .attr("class", "border")
        .call(draw_border, path, topology);

      // EXIT
      // Remove old elements as needed.
      borders.exit().remove();
    }
  },

  mounted: function() {
    // Setup d3 stuff
    var margin = {top: -5, right: -5, bottom: -5, left: -5}
    var svg = d3.select("#map_svg").append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
      .attr("class", "wrapper")
      .data([{x: 0, y: 0}]);
    width = +svg.attr("width"),
    height = +svg.attr("height")

    var size = this.getSize()
      
    path = d3.geoPath(projection);

    map_context = this;

    var topology = hexTopology(radius, size.width, size.height);
    var projection = hexProjection(radius);
    var path = d3.geoPath(projection);

    container_container = svg

    // var zoom = d3.zoom()
    //   .scaleExtent([0.5, 3])
    //   .on("zoom", this.zoomed);

    var drag = d3.drag()
      // .container(svg)
      .on("start", this.dragstarted)
      .on("drag", this.dragged)
      .on("end", this.dragended);

    svg
      .call(drag)
      // .call(zoom)

    // Add map visuals
    // ./../assets/fantasy_map_1554102582670.png
    var imgs = container_container.selectAll("image").data([0]);
    imgs.enter()
      .append("svg:image")
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 2280)
      // .attr('height', 200)
      .attr("xlink:href", require("./../assets/fantasy_map_1554102582670.png"))

    g = container_container.append("g").attr("class", "hexagon");
    
    mesh = container_container.append("g").append("path")
      .datum(topojson.mesh(topology, topology.objects.hexagons))
      .attr("class", "mesh")
      .attr("d", path);

    border = container_container.append("g").append("path")
      .attr("class", "border")
      .call(draw_border, path, topology);
      
    // this.inital_draw()
    this.getActivity()
    
  },
  updated: function() {
    console.log("update")

    // var t = d3.transition()
    // .duration(750);

    var size = this.getSize()
    var data = hexTopology(radius, size.width, size.height);
    
    var topology = hexTopology(radius, size.width, size.height);
    var projection = hexProjection(radius);

    path = d3.geoPath(projection);

    var paths = g.selectAll("path")
      .data(topology.objects.hexagons.geometries)

    this.update_backgrounds(paths, topology)

    this.update_borders(border, topology)
  }
}
</script>

<style>

/*g .hexagon
{
  background-image: url('./../assets/fantasy_map_1554102582670.png');
  background-size: 2289px;
  
}*/

/* small display mode */
@media (max-width: 500px){
  #map
  {
    height: 15rem !important;
  }
}

.message{
  overflow-y: wrap;
}

[active~="true"]
{
  fill: green;
  fill-opacity: 0.4;
}

.scroll
{
  overflow-y: scroll;
  height: 800px;
}

      .reset, html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video {
  margin: 0;
  padding: 0;
  border: 0;
  font: inherit;
  font-size: 100%;
  vertical-align: baseline;
}

.reset_2, caption, th, td {
  text-align: left;
  font-weight: normal;
  vertical-align: middle;
}

html {
  line-height: 1;
  position: relative;
  height: 100%;
  font-size: 16px;
  font-family: Lato, sans-serif;
}

body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding-top: 53px;
  padding-bottom: 64px;
}

blockquote {
  quotes: none;
}
blockquote:before {
  content: "";
  content: none;
}
blockquote:after {
  content: "";
  content: none;
}

a img {
  border: none;
}

q {
  quotes: none;
}
q:before {
  content: "";
  content: none;
}
q:after {
  content: "";
  content: none;
}

ol {
  list-style: none;
}

ul {
  list-style: none;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

article {
  display: block;
}

aside {
  display: block;
}

details {
  display: block;
}

figure {
  display: block;
}

figcaption {
  display: block;
}

footer {
  display: block;
}

header {
  display: block;
}

hgroup {
  display: block;
}
menu {
  display: block;
}

nav {
  display: block;
}

section {
  display: block;
}

summary {
  display: block;
}

main {
  display: block;
}

* {
  box-sizing: border-box;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  height: 53px;
  width: 100%;
}

.main {
  height: 100%;
}

.footer {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 64px;
  width: 100%;
}

.team-menu {
  position: relative;
  width: 220px;
  height: 53px;
  line-height: 53px;
  font-weight: 900;
  padding: 0 1rem;
  color: #ffffff;
  background: #3e313c;
  border-bottom: 2px solid #372c36;
  float: left;
  cursor: pointer;
}

.channel-menu_name {
  display: inline-block;
  padding: 0 0.5rem 0 1.5rem;
  color: #555459;
  font-size: 1.4rem;
  font-weight: 900;
  line-height: 53px;
  cursor: pointer;
}

.channel-menu_prefix {
  color: #9e9ea6;
  padding-right: 0.1rem;
  font-weight: 500;
}

.listings {
  height: 100%;
  width: 220px;
  float: left;
  color: #ab9ba9;
  background-color: #4d394b;
  overflow-y: auto;
  overflow-x: hidden;
}

.message-history {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  /*padding: 0 18px 1rem 1.5rem;*/
  overflow: scroll;
  overflow-x: hidden;
}

.listings_channels {
  margin: 1rem 0 2rem;
}

.listings_header {
  text-align: left;
  font-size: 0.8rem;
  line-height: 1.25rem;
  margin: 0 1rem 0.1rem;
  text-transform: uppercase;
  font-weight: 700;
  color: #ab9ba9;
  width: 165px;
  position: relative;
}

.channel_list {
  list-style-type: none;
  text-align: left;
  color: #ab9ba9;
}

.channel {
  height: 24px;
  line-height: 24px;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  margin-right: 17px;
  color: #ffffff;
  padding-left: 1rem;
}
.channel.active {
  background: #4c9689;
}

.unread {
  color: #ffffff;
  background: #eb4d5c;
  border-radius: 9px;
  padding: 2px 9px;
  font-size: 0.8rem;
  line-height: 14px;
  font-weight: 700;
  vertical-align: baseline;
  white-space: nowrap;
  text-shadow: 0 1px 0 rgba(0, 0, 0, 0.2);
  float: right;
  margin-right: 3px;
  margin-top: 3px;
}

.channel_prefix {
  color: #b2d5c9;
}

.disclaimer {
  font-size: 0.8rem;
  padding-left: 1rem;
  margin-right: 17px;
}


.user-menu {
  float: left;
  width: 220px;
  height: 100%;
  cursor: pointer;
  background: #3e313c;
  border-top: 2px solid #372c36;
  padding: 7px 0 9px 8px;
  height: 4rem;
  position: fixed;
  bottom: 0;
  left: 0;
}

.user-menu_profile-pic {
  display: inline-block;
  float: left;
  border-radius: 0.2rem;
  width: 48px;
  height: 48px;
  background-image: url(http://findicons.com/icon/download/102283/fh02/300/png);
  background-size: cover;
  margin-right: 8px;
}

.user-menu_username {
  display: block;
  color: #ffffff;
  font-weight: 900;
  line-height: 1.5rem;
  margin-top: 0.2rem;
  max-width: 120px;
}

.connection_icon {
  width: 12px;
  height: 12px;
}

.connection_status {
  color: #ab9ba9;
}

.input-box {
  height: 100%;
  margin-left: 220px;
}

.input-box_text {
  font-size: 0.95rem;
  width: 90%;
  margin-left: 2%;
  margin-bottom: auto;
  line-height: 1.2rem;
  border: 2px solid #e0e0e0;
  border-radius: 0.2rem;
  background-clip: padding-box;
  color: #3d3c40;
  box-shadow: none;
  outline: 0;
  bottom: 0;
  min-height: 41px !important;
  padding: 9px 5px 9px 8px;
}

    

@import url('https://fonts.googleapis.com/css?family=Bitter:400,400i&subset=latin-ext');
html, body {
  margin:0;
  padding:0;
  overflow:hidden;
}



svg {
  background-color: transparent;
  cursor: default;
}

#map
{
  /*max-width: 50%;*/
  overflow: hidden;
  background-position-x: 14px;
  /*2280px*/
  /*height: 1960px;*/
  height: 100%;
}

.names {
    font-family: 'Bitter', verdana;
    text-anchor: middle;
    fill: #3e3e4b;
    text-shadow: 0 0 6px white;
}

.active {
    text-shadow: 0 0 6px red;
    cursor: grabbing;
    cursor: -webkit-grabbing;
}

.hexagon {
  fill: transparent;
  pointer-events: all;
}

.hexagon path {
  -webkit-transition: fill 250ms linear;
  transition: fill 250ms linear;
}

.hexagon :hover {
  fill: pink;
  fill-opacity: 0.7;
}

.hexagon .fill {
  fill: pink;
  fill-opacity: 0.7;
}

.mesh {
  fill: none;
  stroke: #000;
  stroke-opacity: .2;
  pointer-events: none;
}

.border {
  fill: none;
  stroke: #555;
  stroke-width: 3px;
  pointer-events: none;
}
</style>