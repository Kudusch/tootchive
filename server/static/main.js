"use strict";

var media_attachments = {};
var toots = {};
$("#file").on("change", function(evt) {
    // Closure to capture the file information.
    function handleFile(f) {
        JSZip.loadAsync(f)
            .then(function(zip) {
                zip.forEach(function(relativePath, zipEntry) {
                    if (!zipEntry.dir && zipEntry.name.includes("media_attachments") && !zipEntry.name.split('/').reverse()[0].startsWith(".")) {
                        media_attachments[zipEntry.name] = zipEntry;
                    }
                    if (zipEntry.name.includes("outbox.json")) {
                        zipEntry.async("string").then(function(content) {
                            const obj = JSON.parse(content);
                            for (let key in obj["orderedItems"]) {
                                var e = obj["orderedItems"][key];
                                if (e["type"] == "Create") {
                                    var toot = {
                                        "id": hashCode(e["object"]["id"]),
                                        "content": e["object"]["content"],
                                        "created_at": e["object"]["published"],
                                        "url": e["object"]["url"]
                                    }
                                    if (typeof e["object"]["updated"] !== "undefined") {
                                        toot["edited_at"] = e["object"]["updated"];
                                    } else {
                                        toot["edited_at"] = "";
                                    }
                                    //if (toot["id"]) {}
                                    toots[toot["id"]] = toot;
                                    // if () {
                                    //     e["object"]["attachment"]
                                    // }
                                }

                            }

                        });

                    }
                });
            }, function(e) {
                // $result.append($("<div>", {
                //     "class" : "alert alert-danger",
                //     text : "Error reading " + f.name + ": " + e.message
                // }));
            });
    }

    var files = evt.target.files;
    for (var i = 0; i < files.length; i++) {
        handleFile(files[i]);
    }
    setTimeout(() => {
        $("#result").html("<p>There are " + Object.keys(toots).length + " toots.</p>");
        console.log(toots);
    }, "1000");
});

/**
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number}    A 32bit integer
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

function update() {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent("var toots = " + JSON.stringify(Object.entries(toots).map((e) => ( e[1] )))) + ";");
    element.setAttribute('download', "data.js");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function document_ready(callback) {
    // in case the document is already rendered
    if (document.readyState != 'loading') callback();
    // modern browsers
    else if (document.addEventListener) document.addEventListener('DOMContentLoaded', callback);
    // IE <= 8
    else document.attachEvent('onreadystatechange', function() {
        if (document.readyState == 'complete') callback();
    });
}

document_ready(function() {
    $("#result").html("<p>There are " + Object.keys(toots).length + " toots.</p>");
});