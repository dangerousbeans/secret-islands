
<template>
  <div class="fluid-container">
    <div class="row">
      <div id="map" class="col-md-6">
        <MapSVG id="map_svg"></MapSVG>
      </div>

      <div id="" class="col-md-6 scroll">
        <div class="card-body">
          <TileInfo :x="x" :y="y" v-bind:active_tags="active_tags"></TileInfo>
          
          <!-- <h3 class="card-title">{{active_tags}}</h3> -->
          <Messages @new_post="handle_new_post" v-bind:this_tile_tags="active_tags" :x="x" :y="y"></Messages>
        </div>  
      </div>

    </div>
  </div>
</template>


<script>
var d3 = require("d3");

import MapSVG from './map.svg';

import Messages from './../components/Messages'
import TileInfo from './../components/TileInfo'

import * as topojson from "topojson-client";
import layout from './circle-layout'
// import resize from 'vue-resize-directive'

window.map_context = ""

const pull = require('pull-stream')
const drain = require('pull-stream/sinks/drain')

import sbotLibs from './../sbot'


// D3 settings
var margin = {top: 5, right: 5, bottom: 5, left: 5},
      width = 2000,
      height = 2000


var radius = 20;

// D3 context hacks for update method
var group, mesh, border, labels;

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
        tags: (activ && activ.tags) ? activ.tags.map((t) => { return typeof t == 'string' ? t : null }) : [],
        j: j,
        i: i,
        id: geom_id
      });


      geom_id++;
    }
  }

  return {
    transform: {translate: [0, 0], scale: [1, 1]},
    objects: { hexagons: {type: "GeometryCollection", geometries: geometries} },
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

var MIN = {x: -1540, y: -1270},     //top-left corner
MAX = {x: 0, y: 0};   //bottom-right corner

export default {

  components: {
    MapSVG,
    Messages,
    TileInfo
  },

  props: {
    x: {type: String, default: "4"},
    y: {type: String, default: "21"}
  },

  data () {
    return { 
      messages: [],
      activity: {},
      active_tags: [ ]
    }
  },

  computed: {
    position() {
      return this.$route.params.x, this.$route.params.y
    }
  },

  watch: {
    // if the position moves, load new messages
    position() {
      this.getActivity()
    }
  },

  methods: {
    handle_new_post () {
      // console.log("handle_new_post")
      this.$forceUpdate()
      this.getActivity()
    },

    new_activity (err, a) {
      console.log("new_activity")
      this.$data.activity = a
      
      // Check for active tags where we are
      var x = this.$route.params.x
      var y = this.$route.params.y

      if(x && y) // if we have a postion
      {
        this.$data.active_tags = a[ x + '/' + y ] ? a[ x + '/' + y ].tags : []
      }

      // d3 update stuff
      var size = this.getSize()
      var data = hexTopology(radius, size.width, size.height);
      
      var topology = hexTopology(radius, size.width, size.height);
      var projection = hexProjection(radius);

      path = d3.geoPath(projection);

      var paths = g.selectAll("path")
        .data(topology.objects.hexagons.geometries)

      var labels_to_update = labels.selectAll("text")
        .data(topology.objects.hexagons.geometries)

      this.update_backgrounds(paths, topology)
      this.update_labels(labels_to_update, topology)
      this.update_borders(border, topology)
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
      const size = this.getSize()
      const {g, svg, tree} = this.internaldata
      
      this.transformSvg(g, size)
      layout.optimizeSize(tree, size, this.margin, this.textContraint)
      this.redraw()
    },


    getActivity: function(refresh_activity) {
      console.log("getActivity")
      this.$ssb.then((ssb) => {
        var index = ssb.geospatial.get(this.new_activity)
      })
    },

    zoomed: function() {
      var transform = d3.event.transform;

      // limiting tranformation by MIN and MAX bounds
      transform.x = d3.max([transform.x, MIN.x]);
      transform.y = d3.max([transform.y, MIN.y]);
      transform.x = d3.min([transform.x, MAX.x]);
      transform.y = d3.min([transform.y, MAX.y]);

      container_container.attr("transform", transform);
    },

    // dragstarted: function (d) {
    //   d3.event.sourceEvent.stopPropagation();
    // },

    // dragged: function (d) {
    //   d.x = d3.event.x;
    //   d.y = d3.event.y;

    //   container_container.attr("transform", "translate(" + [d.x, d.y] + ")")
    // },

    // dragended: function (d) {
    // },

    // For a given activity timestamp, fade it out based on how long ago it was
    activity_to_alpha: function(d) {
      if(d.last_activity == null)
        return

      // ScuttleCity - no fill
      if(d.i == 4 && d.j == 21)
        return 0

      // Time difference
      var difference = Date.now() - d.last_activity

      // max age
      var max = 8.64e+6 * 7 // 1 week
      // console.log(max / difference)

      return Math.min( Math.max( max / difference, 0.05 ), 0.35) // so you can still see small things
    },

    apply_attributes: function(paths, topology) {
      return paths
        .attr("d", function(d) { return path(topojson.feature(topology, d)) })
        .attr("fill-opacity", function(d) { return map_context.activity_to_alpha(d) })
        .style("fill", function(d) { return d.last_activity != null ? "Green" : null })
        //.style("background-image", function(d) { if(true){ return "scuttlebuttCity.png" } })
      
        .on("click", mousedown)
    },

    update_backgrounds: function(paths, topology) {
      // UPDATE
      this.apply_attributes(paths, topology)

      // ENTER
      // Create new elements as needed.
      //
      // ENTER + UPDATE
      // After merging the entered elements with the update selection,
      // apply operations to both.
      this.apply_attributes(
          paths.enter().append("path"), topology
        )
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
    },



    apply_label_attrs: function(labels, topology){
      return labels
        .attr("class", "label")
        .text(function(d) {
          if(d.i == 4 && d.j == 21)
          {
            return // 'ScuttleCity'
          }
          else
          {
            return d.tags.join(', ');
          }
        })
        .attr('transform', function(d) {
          return 'translate(' + ( d.i * 34.64 ) + ',' + ( d.j * 30 - 15) + ')';
        })
    },

    update_labels: function(labels, topology) {
      // border = container_container.append("g").append("path")
      //     .attr("class", "border")
      //     .call(draw_border, path, topology);
      // UPDATE
      // Update old elements as needed.
      this.apply_label_attrs(labels)

      // ENTER
      // Create new elements as needed.
      //
      // ENTER + UPDATE
      // After merging the entered elements with the update selection,
      // apply operations to both.
      this.apply_label_attrs(labels.enter().append("text"))
        

      // EXIT
      // Remove old elements as needed.
      labels.exit().remove();
    }
  },

  mounted: function() {
    // Check we're following the pub
    this.$ssb.then((ssb) => {
      var pub_id = "@+COav7rGgSXqV36bsgYJK1EHtUuk9SvojPFGdIzJLlA=.ed25519"
      var our_id = JSON.parse(localStorage.keys).id
      
      ssb.friends.isFollowing({source: our_id, dest: pub_id}, function(err, following)
      {
        if(!following)
        {
          // console.log("not following, so gunna follow", pub_id, our_id)
          // follow
          sbotLibs.post_as(ssb, JSON.parse(localStorage.keys), {
            type: "contact",
            contact: pub_id,
            following: true
          }, () => {
            // console.log("followed")
          })
        }
      })    
    })

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

    // Zoom / pan behaviour
    d3.select("#map_svg").call(d3.zoom()
      // .translateExtent([0, 0], [width, height])
      .scaleExtent([0.5, 3])
      .on("zoom", this.zoomed))

    // Add map visuals
    var imgs = container_container.selectAll("image").data([0]);
    imgs.enter()
      .append("svg:image")
      .attr('x', 0)
      .attr('y', -2)
      .attr('width', 2280)
      .attr('height', 1300)
      .attr("xlink:href", require("./../assets/fantasy_map_1554102582670.png"))



    g = container_container.append("g").attr("class", "hexagon");
    
    mesh = container_container.append("g").append("path")
      .datum(topojson.mesh(topology, topology.objects.hexagons))
      .attr("class", "mesh")
      .attr("d", path);

    border = container_container.append("g").attr("class", "border").append("path")
      .attr("class", "border")
      .call(draw_border, path, topology);

    labels = container_container.append("g").attr("class", "labels")
      .datum(topojson.mesh(topology, topology.objects.hexagons))
      // .attr("d", path)
      .attr("class", "label")
    
    // Hack for if we dont have a position
    // Dump them in aligator city
    // if(!this.$route.params.x && !this.$route.params.y)
    // {
    //   this.$route.params.x = "4"
    //   this.$route.params.x = "21"
    // }

    this.getActivity()
    
    // this.inital_draw()
    // this.getActivity()
    
  },
  updated: function() {
    console.log("update")

    // this.getActivity()
    

    // var t = d3.transition()
    // .duration(750);

    
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

/*stop pointer events on labels*/
text.label { 
  color: gray;
  paint-order: stroke;
  stroke: #FFF;
  stroke-width: 2px;
  stroke-linecap: butt;
  stroke-linejoin: miter;

  pointer-events: none; 

  font-size: 11pt;
  opacity: 0.8;
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
  height: 100%;
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
  display: table-cell;
  height: auto;
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