# modules-list

This repo is _public facing_. Contains dynamically generated info for the support documentation, as well as manually added info like tags and overwrites.


## Generation

Module list and licence information is scraped using /opt/nesi/nesi-apps-admin/ModuleTools/ModuleTracker.py script, and should run in a daily cron job. 
`ModuleTracker.py` should write into `.module-list-generated.json` in the local copy of this repository.

On push, the script `.github/workflows/merge.py` should run, merging tags and overwrites into a single file `module-list.json`.

## Tags

Where standard format is:

 module_list.json

 ```
 {
   module1:{
       property1:[value1, value2]
   },
   module2:{
       property1:[value1, value2]
   }
 }
```

 I'm defining a 'tag' as an attribute defined in the inverted format:

tag_property1.json

```
 {
   value1:[module1, module2],
   value2:[module1, module2]
 }
 ```
 
This makes it easier for people to assign optional tags.

## Files

`alias.json`
Contains nice word aliases for institutional codes.

`main_overwrites.json`
Any values in here will overwrite values geneated my module tracker.

`tags_domains.json`
List of what domain tags to apply. Please add to.

`tags_licence_type.json`
Type of licence
