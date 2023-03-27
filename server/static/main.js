"use strict";

var media_attachments = {};
var $result = $("#result");
$("#file").on("change", function(evt) {
    // remove content
    $result.html("");
    // be sure to show the results
    $("#result_block").removeClass("hidden").addClass("show");

    // Closure to capture the file information.
    function handleFile(f) {
        JSZip.loadAsync(f)
            .then(function(zip) {
                zip.forEach(function (relativePath, zipEntry) {
                    if (!zipEntry.dir && zipEntry.name.includes("media_attachments") && !zipEntry.name.split('/').reverse()[0].startsWith(".")) {
                        console.log(zipEntry);
                        media_attachments[zipEntry.name] = zipEntry;
                    }
                    if (zipEntry.name.includes("outbox.json")) {
                        zipEntry.async("string").then(function (content) {
                            const obj = JSON.parse(content);
                            for (let key in obj["orderedItems"]) {
                                var e = obj["orderedItems"][key];
                                if (e["type"] == "Create") {
                                    var toot = {
                                        "content" : e["object"]["content"],
                                        "created_at" : e["object"]["published"],
                                        "url" : e["object"]["url"]
                                    }
                                    if (typeof e["object"]["updated"] !== "undefined") {
                                        toot["edited_at"] = e["object"]["updated"];
                                    } else {
                                        toot["edited_at"] = "";
                                    }
                                    // if () {
                                    //     e["object"]["attachment"]
                                    // }
                                    $result.append(
                                        `
                                        <article style="border: 1px solid black;">
                                            <a href='${toot.url}'>${toot.created_at}</a>
                                            ${toot.content}
                                            <p>${toot.edited_at}</p>
                                        </article>
                                        `);
                                }

                            }
                            
                        });
                        
                    }
                });
            }, function (e) {
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
});