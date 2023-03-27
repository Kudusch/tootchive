#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os
import json

class Toot():
    def __init__(self, raw_toot):
        self.content = raw_toot["object"]["content"]
        self.created_at = raw_toot["object"]["published"]
        self.url = raw_toot["object"]["url"]
        try:
            self.edited_at = raw_toot["object"]["updated"]
        except:
            self.edited_at = None

    def __str__(self):
        return json.dumps({k:getattr(self, k) for k in dir(self) if not k.startswith("_")}) + "\n"

export_dir = sys.argv[1]

with open(f"{export_dir}/actor.json", "r") as f:
    actor = json.load(f)
accepted_streams = ["https://www.w3.org/ns/activitystreams#Public", actor["followers"]]

with open(f"{export_dir}/outbox.json", "r") as f:
    outbox = json.load(f)

all_toots = {}
for e in outbox["orderedItems"]:
    if e["type"] != "Create":
        continue
    if any([to in accepted_streams for to in e["to"]]) or any([cc in accepted_streams for to in e["cc"]]):
        all_toots[e["object"]["id"]] = Toot(e)

with open("toots.json", "w") as f:
    for t in all_toots.values():
        f.write(str(t))