#!/usr/bin/env python3
"""Play the gym's QR scanner: check a code in against a running BookIt API.

Usage: simulate_scan.py CODE --studio harbor [--session default] [--api http://localhost:8000]

Exit 0 on 201 (checked in), 1 otherwise. See docs/prd/qr-check-in.md.
"""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
parser.add_argument("code", help="the code shown under the QR, e.g. 7F3K-92QD")
parser.add_argument("--studio", required=True, help="studio id: harbor, summit or ember")
parser.add_argument("--session", default="default", help="X-Test-Session the app is using")
parser.add_argument("--api", default="http://localhost:8000")
args = parser.parse_args()

with open(os.path.join(ROOT, "fixtures", "studios.json"), encoding="utf-8") as f:
    keys = {s["id"]: s["scanner_key"] for s in json.load(f)}
if args.studio not in keys:
    sys.exit(f"unknown studio '{args.studio}'; expected one of {', '.join(keys)}")

request = urllib.request.Request(
    f"{args.api}/checkins",
    method="POST",
    data=json.dumps({"code": args.code}).encode(),
    headers={"Content-Type": "application/json", "X-Studio-Key": keys[args.studio],
             "X-Test-Session": args.session},
)
try:
    with urllib.request.urlopen(request) as response:
        print(response.status, response.read().decode())
        sys.exit(0)
except urllib.error.HTTPError as error:
    print(error.code, error.read().decode())
    sys.exit(1)
