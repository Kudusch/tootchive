# Change to proper secrete key e.g. `python3 -c 'import os; print(os.urandom(16))'`
SECRET_KEY = b'\xba\x8b)3\x05F\x93\xf9\xb8o\x16Mw*T\x17'
SESSION_TYPE = "filesystem"
CACHE_TYPE = "filesystem"
CACHE_DIR = "flask_cache"