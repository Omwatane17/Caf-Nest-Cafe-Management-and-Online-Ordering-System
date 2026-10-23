import sys
sys.path.insert(0, '.')
try:
    import app as application
    rules = list(application.app.url_map.iter_rules())
    api_routes = [r for r in rules if r.rule.startswith('/api/')]
    page_routes = [r for r in rules if not r.rule.startswith('/api/') and not r.rule.startswith('/static')]
    print(f"App loaded OK!")
    print(f"  API routes: {len(api_routes)}")
    print(f"  Page routes: {len(page_routes)}")
    print("\nPage routes:")
    for r in sorted(page_routes, key=lambda x: x.rule):
        methods = list(r.methods - {'HEAD','OPTIONS'})
        print(f"  {methods} {r.rule}")
    print("\nAPI route groups:")
    prefixes = set()
    for r in api_routes:
        parts = r.rule.split('/')
        if len(parts) > 3:
            prefixes.add('/'.join(parts[:4]))
    for p in sorted(prefixes):
        print(f"  {p}...")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
