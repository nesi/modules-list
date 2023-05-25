#!python

import glob
import ruamel.yaml as yaml



def get_tags():
    # Where standard format is:
    # module_list.json
    # {
    #   module1:{
    #       property1:[value1, value2]
    #   },
    #   module2:{
    #       property1:[value1, value2]
    #   }
    # }
    #
    # I'm defining a 'tag' as an attribute defined in the inverted format:
    # property1_tags.json
    # {
    #   value1:[module1, module2],
    #   value2:[module1, module2]
    # }
    generated_modules_path = ".module-list-generated.json"
    generated_modules = yaml.load(open(generated_modules_path), Loader=yaml.BaseLoader)

    for file in glob.glob('tags/*.yml'):
        tags = yaml.load(open("settings.yml"), Loader=yaml.BaseLoader)

        # This makes it easier for people to assign optional tags
        for tag_key, module_value in tag_values.items():
            for module in module_value:
                if module in all_cluster_modules:
                    # If list, append
                    # log.debug(json.dumps(all_cluster_modules[module]))
                    if isinstance(all_cluster_modules[module][key], list):
                        if tag_key not in all_cluster_modules[module][key]:
                            all_cluster_modules[module][key].append(tag_key)
                            all_cluster_modules[module][key].sort()
                    # Else output_dictwrite
                    else:
                        all_cluster_modules[module][key] = tag_key
                else:
                    log.info(
                        f"Tag {module} does not correspond to a application on the platform."
                    )
