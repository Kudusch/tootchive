#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from functions import *

# create and configure the app
app = Flask(__name__, instance_relative_config=True)
app.config.from_pyfile(os.path.join("config.py"), silent=False)
Session(app)
cache = Cache(app)
global_timeout = 20

@app.route('/', methods=['GET', 'POST'])
@cache.cached(timeout=global_timeout)
def index():
    mastodon_api = make_session()
    if mastodon_api:
        try:
            mastodon_api.account_statuses(mastodon_api.me(), exclude_reblogs=True, limit=1)
            scope = "alleviated"
        except:
            scope = "normal"
        return render_template('index.html', json_data=mastodon_api.me(), scope=scope)
    else:
        return render_template('index.html')

@app.route('/posts', methods=['GET'])
@cache.cached(timeout=global_timeout)
def posts():
    mastodon_api = make_session()
    if mastodon_api:
        try:
            mastodon_api.account_statuses(mastodon_api.me(), exclude_reblogs=True, limit=1)
            scope = "alleviated"
        except:
            scope = "normal"
        posts = get_posts()
        meta = {"number_of_posts":len(posts), "scope":scope}
        return render_template('posts.html', posts=posts, meta=meta)
    else:
        return render_template('index.html')

@app.route('/download', methods=['GET'])
@cache.cached(timeout=global_timeout)
def download():
    mastodon_api = make_session()
    if mastodon_api:
        posts = get_posts()
        return Response(
            json.dumps(posts, default=str), 
            mimetype='application/json',
            headers={'Content-Disposition':'attachment;filename=toots.json'}
        )
    else:
        return render_template('index.html')

@app.route('/archive', methods=('GET', 'POST'))
def archive():
    return render_template('archive.html')

@app.route('/impressum', methods=('GET', 'POST'))
def impressum():
    return render_template('impressum.html')

@app.route('/logout', methods=["GET"])
def logout():
    try:
        mastodon_api = make_session()
        mastodon_api.revoke_access_token()
    except:
        pass
    session.clear()
    cache.clear()
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    code = request.args.get("code")
    user = parse_username(request.args.get("u"))
    if request.args.get("scope") == "alleviated_scope":
        scope = ["read:accounts", "read:statuses"]
    else:
        scope = ["read:accounts"]

    if user["is_valid"]:
        user_name = user["name"]
        user_server = user["server"]

        client_id, client_secret = Mastodon.create_app(
            client_name = "tootchive", 
            scopes=scope,
            redirect_uris="http://127.0.0.1:5000/login", 
            website="https://kudusch.de", 
            api_base_url=user_server
        )
        mastodon_api = Mastodon(client_id=client_id, client_secret=client_secret, api_base_url = user_server)
        auth_url = mastodon_api.auth_request_url(
            client_id=client_id, 
            redirect_uris="http://127.0.0.1:5000/login", 
            scopes=scope
        )
        session["client_id"] = client_id
        session["client_secret"] = client_secret
        session["api_base_url"] = user_server
        session["user_name"] = user_name
        return redirect(auth_url, code=302)
    
    if code:
        client_id = session["client_id"]
        client_secret = session["client_secret"]
        api_base_url = session["api_base_url"]
        user_name = session["user_name"]
        mastodon_api = Mastodon(client_id=client_id, client_secret=client_secret, api_base_url = api_base_url)
        access_token = mastodon_api.log_in(code=code, redirect_uri="http://127.0.0.1:5000/login", scopes=scope)
        session["is_logged_in"] = "true"
        session["access_token"] = access_token
        mastodon_api = make_session()
        cache.clear()
        
        return redirect("/")

if __name__ == "__main__":
    app.run()
