#!/usr/bin/env python3
import sys
import json
from collections import defaultdict

def load(path):
    with open(path) as f:
        return json.load(f)

def get_domains(entry):
    return entry.get("domains") or ["other"]

def compare(old, new):
    domain_stats = defaultdict(lambda: {
        "modules_added": 0,
        "modules_removed": 0,
        "versions_added": 0,
        "versions_removed": 0,
    })

    total_versions_added = total_versions_removed = 0

    def track(domains, modules=0, versions=0, add=True):
        nonlocal total_versions_added, total_versions_removed
        for d in domains:
            if add:
                domain_stats[d]["modules_added"] += modules
                domain_stats[d]["versions_added"] += versions
            else:
                domain_stats[d]["modules_removed"] += modules
                domain_stats[d]["versions_removed"] += versions
        if add:
            total_versions_added += versions
        else:
            total_versions_removed += versions

    old_keys = set(old)
    new_keys = set(new)

    added = new_keys - old_keys
    removed = old_keys - new_keys

    for k in added:
        versions = new[k].get("versions", [])
        track(get_domains(new[k]), modules=1, versions=len(versions), add=True)

    for k in removed:
        versions = old[k].get("versions", [])
        track(get_domains(old[k]), modules=1, versions=len(versions), add=False)

    for k in old_keys & new_keys:
        ov = set(old[k].get("versions", []))
        nv = set(new[k].get("versions", []))
        added_v = len(nv - ov)
        removed_v = len(ov - nv)
        if added_v or removed_v:
            for d in get_domains(new[k]):
                domain_stats[d]["versions_added"] += added_v
                domain_stats[d]["versions_removed"] += removed_v
            total_versions_added += added_v
            total_versions_removed += removed_v

    print("[TOTAL]")
    print(f"  modules +{len(added)} / -{len(removed)}")
    print(f"  versions +{total_versions_added} / -{total_versions_removed}")

    for d in sorted(domain_stats):
        s = domain_stats[d]
        print(f"\n[{d}]")
        print(f"  modules +{s['modules_added']} / -{s['modules_removed']}")
        print(f"  versions +{s['versions_added']} / -{s['versions_removed']}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: summary.py old.json new.json")
        sys.exit(1)

    compare(load(sys.argv[1]), load(sys.argv[2]))
