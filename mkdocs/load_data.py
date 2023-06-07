import mkdocs.plugins
import json

def on_env(env, config, files, **kwargs): 
    env.globals["applications"]=json.load(open('module-list.json'))
    # env.globals["domains"]=json.load(open('../tags/domains.json')).keys() # Needs list of cannon domains to make into

    # for symbol, value in locals().items():
    #     print(symbol, value)