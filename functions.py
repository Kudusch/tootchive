#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import urllib.request
from mastodon import Mastodon
from flask import (
    Flask, Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify, Response
)
from flask_session.__init__ import Session  # weird import?
from flask_caching import Cache
import datetime

def parse_username(u):
    if u:
        u, server = u.strip("@").split("@")
        return ({"is_valid": True, "name": u, "server": f"https://{server}"})
    else:
        return ({"is_valid": False})

def make_session(server=None):
    if server:
        mastodon_api = Mastodon(api_base_url=server)
        return mastodon_api
    elif session.get("is_logged_in") == "true":
        access_token = session["access_token"]
        client_id = session["client_id"]
        client_secret = session["client_secret"]
        api_base_url = session["api_base_url"]
    elif request.args.get("access_token"):
        access_token = request.args.get("access_token")
        client_id = request.args.get("client_id")
        client_secret = request.args.get("client_secret")
        api_base_url = request.args.get("api_base_url")
    elif request.args.get("instance_server"):
        mastodon_api = Mastodon(api_base_url=request.args.get("instance_server"))
        return mastodon_api

    try:
        mastodon_api = Mastodon(
            client_id=client_id,
            client_secret=client_secret,
            api_base_url=api_base_url,
            access_token=access_token
        )
        return mastodon_api
    except:
        return None

def get_posts():
    mastodon_api = make_session()
    try:
        mastodon_api.account_statuses(mastodon_api.me(), exclude_reblogs=True, limit=1)
        scope = "alleviated"
    except:
        scope = "normal"
    
    if scope == "normal":
        api = Mastodon(api_base_url=mastodon_api.api_base_url)
    else:
        api = mastodon_api
    posts = []
    prev_page = api.account_statuses(mastodon_api.me(), exclude_reblogs=True, limit=40)
    posts.extend(prev_page)
    for i in range(10):
        prev_page = api.fetch_next(prev_page)
        if not prev_page:
            break
        posts.extend(prev_page)
    return posts