#!/usr/bin/env python3
import sys
import json
from collections import defaultdict

def load(path):
    with open(path) as f:
        return json.load(f)

def domains(entry):
    return entry.get("domains") or ["other"]

def summarize(data):
    stats = defaultdict(lambda: {"modules": 0, "versions": 0})
    for v in data.values():
        vs = v.get("versions", [])
        for d in domains(v):
            stats[d]["modules"] += 1
            stats[d]["versions"] += len(vs)
    return stats

def compare(old, new):
    stats = defaultdict(lambda: {
        "modules_added": 0, "modules_removed": 0,
        "versions_added": 0, "versions_removed": 0
    })

    old_keys, new_keys = set(old), set(new)

    added = new_keys - old_keys
    removed = old_keys - new_keys
    common = old_keys & new_keys

    # modules added/removed
    for k in added:
        vs = len(new[k].get("versions", []))
        for d in domains(new[k]):
            stats[d]["modules_added"] += 1
            stats[d]["versions_added"] += vs

    for k in removed:
        vs = len(old[k].get("versions", []))
        for d in domains(old[k]):
            stats[d]["modules_removed"] += 1
            stats[d]["versions_removed"] += vs

    # version diffs in common modules
    for k in common:
        ov = set(old[k].get("versions", []))
        nv = set(new[k].get("versions", []))
        add_v = len(nv - ov)
        rem_v = len(ov - nv)

        if add_v or rem_v:
            for d in domains(new[k]):
                stats[d]["versions_added"] += add_v
                stats[d]["versions_removed"] += rem_v

    # totals (current state)
    totals = summarize(new)

    # global totals
    print("[TOTAL]")
    print(f"  modules +{len(added)} / -{len(removed)} = {len(new_keys)}")
    print(f"  versions +{sum(s['versions_added'] for s in stats.values())} "
          f"/ -{sum(s['versions_removed'] for s in stats.values())} = {sum(t['versions'] for t in totals.values())}")

    # per domain
    for d in sorted(set(stats) | set(totals)):
        s = stats[d]
        t = totals[d]

        print(f"\n[{d}]")
        print(f"  modules +{s['modules_added']} / -{s['modules_removed']} = {t['modules']}")
        print(f"  versions +{s['versions_added']} / -{s['versions_removed']} = {t['versions']}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: summary.py old.json new.json")
        sys.exit(1)

    compare(load(sys.argv[1]), load(sys.argv[2]))