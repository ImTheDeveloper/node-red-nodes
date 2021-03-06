/**
 * Copyright 2013 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var RED = require(process.env.NODE_RED_HOME+"/red/red");
var SunCalc = require('suncalc');

function SunNode(n) {
    RED.nodes.createNode(this,n);
    this.lat = n.lat;
    this.lon = n.lon;
    this.start = n.start;
    this.end = n.end;

    var node = this;
    var oldval = null;

    this.tick = setInterval(function() {
        var now = new Date();
        var hour = now.getHours();
        var mins = now.getMinutes();
        var times = SunCalc.getTimes(now, node.lat, node.lon);
        var hour1 = times[node.start].getHours();
        var mins1 = times[node.start].getMinutes();
        var hour2 = times[node.end].getHours();
        var mins2 = times[node.end].getMinutes();
        var e1 = (hour*60+mins) - (hour1*60+mins1);
        var e2 = (hour*60+mins) - (hour2*60+mins2);
        var moon = parseInt(SunCalc.getMoonFraction(now)*100)/100;
        msg = { payload:0, topic:"sun", moon:moon };
        if ((e1 > 0) & (e2 < 0)) { msg.payload = 1; }
        if (oldval == null) { oldval = msg.payload; }
        if (msg.payload != oldval) {
            oldval = msg.payload;
            msg2 = msg;
            node.send( [msg,msg2] );
        }
        else { node.send(msg); }
    }, 60000);

    this.on("close", function() {
        clearInterval(this.tick);
    });
}
RED.nodes.registerType("sunrise",SunNode);
