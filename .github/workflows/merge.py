#!python

import glob
import ruamel.yaml as YAML
import json
import re   
import sys

def main():
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
    generated_modules = json.load(open(generated_modules_path))

    modified_modules_path = "module-list.json"

    yaml = YAML(typ='safe') 

    for file in glob.glob('tags/*.yml'):
        tag_count = 0
        tags = yaml.load(open(file))
        property = re.match(r'^tags/(.*).(yml|yaml)$', file).group(1)

        for tag, modules in tags.items():
            for module in modules:
                if module in generated_modules:
                    tag_count +=1
                    # If list, append
                    if isinstance(generated_modules[module][property], list):
                        # De dupe
                        if tag not in generated_modules[module][property]:
                            # Append and sort.
                            generated_modules[module][property].append(tag)
                            generated_modules[module][property].sort()
                    # Else output_dictwrite
                    else:
                        generated_modules[module][property] = tag
                else:
                    print(f"Tag {module} does not correspond to a application on the platform.", file=sys.stderr)

        print(f"{tag_count} tags added from {file}.")
    open(modified_modules_path, "w+").write(json.dumps(generated_modules, indent=4, sort_keys=True))
    print(f"Output written to {modified_modules_path}")

if __name__ == "__main__":
    main()
