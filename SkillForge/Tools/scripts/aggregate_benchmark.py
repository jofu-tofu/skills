#!/usr/bin/env python3
"""
Aggregate individual run results into benchmark summary statistics.

Reads grading.json files from run directories and produces:
- run_summary with mean, stddev, min, max for each metric
- descriptive delta between the first two alphabetical configurations

Usage:
    python aggregate_benchmark.py <benchmark_dir>

Example:
    python aggregate_benchmark.py benchmarks/2026-01-15T10-30-00/

The script supports two directory layouts:

    Workspace layout (from skill-creator iterations):
    <benchmark_dir>/
    â””â”€â”€ eval-N/
        â”œâ”€â”€ with_skill/
        â”‚   â”œâ”€â”€ run-1/grading.json
        â”‚   â””â”€â”€ run-2/grading.json
        â””â”€â”€ without_skill/
            â”œâ”€â”€ run-1/grading.json
            â””â”€â”€ run-2/grading.json

    Legacy layout (with runs/ subdirectory):
    <benchmark_dir>/
    â””â”€â”€ runs/
        â””â”€â”€ eval-N/
            â”œâ”€â”€ with_skill/
            â”‚   â””â”€â”€ run-1/grading.json
            â””â”€â”€ without_skill/
                â””â”€â”€ run-1/grading.json
"""

import argparse
import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path


METRICS = ("pass_rate", "time_seconds", "tokens", "output_chars")


def number(value, maximum=None):
    """Accept measured numbers, including zero; reject missing/invalid values."""
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    if not math.isfinite(value) or value < 0 or (maximum is not None and value > maximum):
        return None
    return value


def calculate_stats(values: list[float], total=None) -> dict:
    """Observed-value statistics with explicit coverage of discovered runs."""
    total = len(values) if total is None else total
    values = [v for v in values if number(v) is not None]
    n = len(values)
    stats = dict.fromkeys(("mean", "stddev", "min", "max"))
    if n:
        mean = sum(values) / n
        stddev = math.sqrt(sum((x - mean) ** 2 for x in values) / (n - 1)) if n > 1 else 0.0
        stats.update(mean=round(mean, 4), stddev=round(stddev, 4), min=round(min(values), 4), max=round(max(values), 4))
    stats.update(n=n, missing=total-n, total=total, status="complete" if n and n == total else "partial" if n else "unknown")
    return stats


def read_object(path, notes, required=False):
    if not path.exists() and not required:
        return {}
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(value, dict):
            raise ValueError("expected an object")
        return value
    except (OSError, ValueError) as exc:
        notes.append(f"{path.name}: {exc}")
        return {}


def object_field(data, key, notes):
    value = data.get(key, {})
    if isinstance(value, dict):
        return value
    notes.append(f"{key}: expected an object")
    return {}


def load_run_results(benchmark_dir: Path) -> dict:
    """Retain each discovered run, including runs with unavailable grading."""
    search_dir = benchmark_dir / "runs" if (benchmark_dir / "runs").is_dir() else benchmark_dir
    results = {}
    for eval_idx, eval_dir in enumerate(sorted(search_dir.glob("eval-*"))):
        if not eval_dir.is_dir():
            continue
        metadata_notes = []
        metadata = read_object(eval_dir / "eval_metadata.json", metadata_notes)
        suffix = eval_dir.name[5:]
        default_id = int(suffix) if suffix.isdigit() else eval_idx
        eval_id = metadata.get("eval_id", default_id)
        if isinstance(eval_id, bool) or not isinstance(eval_id, (int, str)):
            eval_id = default_id
        for config_dir in sorted(eval_dir.iterdir()):
            if not config_dir.is_dir():
                continue
            run_dirs = sorted(p for p in config_dir.glob("run-*") if p.is_dir())
            if not run_dirs:
                continue
            runs = results.setdefault(config_dir.name, [])
            for run_dir in run_dirs:
                notes = list(metadata_notes)
                grading = read_object(run_dir / "grading.json", notes, required=True)
                sibling = read_object(run_dir / "timing.json", notes)
                summary = object_field(grading, "summary", notes)
                timing = object_field(grading, "timing", notes)
                metrics = object_field(grading, "execution_metrics", notes)
                def measured(sources, field, maximum=None):
                    for source in sources:
                        if field not in source or source[field] is None:
                            continue
                        value = number(source[field], maximum)
                        if value is not None:
                            return value
                        notes.append(f"{field}: invalid measurement ignored")
                    return None
                suffix = run_dir.name[4:]
                result = {
                    "eval_id": eval_id, "eval_directory": eval_dir.name,
                    "run_number": int(suffix) if suffix.isdigit() else suffix,
                    "run_directory": run_dir.name,
                    "pass_rate": measured([summary], "pass_rate", 1),
                    **{k: measured([summary], k) for k in ("passed", "failed", "total")},
                    "time_seconds": measured([timing, sibling], "total_duration_seconds"),
                    "tokens": measured([timing, sibling, metrics], "total_tokens"),
                    "output_chars": measured([metrics], "output_chars"),
                    "tool_calls": measured([metrics], "total_tool_calls"),
                    "errors": measured([metrics], "errors_encountered"),
                }
                expectations = grading.get("expectations", [])
                if not isinstance(expectations, list):
                    expectations = []
                    notes.append("expectations: expected a list")
                result["expectations"] = []
                for exp in expectations:
                    if isinstance(exp, dict) and isinstance(exp.get("text"), str) and isinstance(exp.get("passed"), bool):
                        result["expectations"].append({**exp, "evidence": str(exp.get("evidence", ""))})
                    else:
                        notes.append("expectations: invalid entry ignored")
                user_notes = object_field(grading, "user_notes_summary", notes)
                for key in ("uncertainties", "needs_review", "workarounds"):
                    items = user_notes.get(key, [])
                    if isinstance(items, list):
                        notes.extend(str(item) for item in items)
                result["notes"] = notes
                runs.append(result)
    return results


def configuration_stats(results):
    return {config: {metric: calculate_stats([r.get(metric) for r in runs], len(runs)) for metric in METRICS}
            for config, runs in sorted(results.items())}


def comparison(results, summaries):
    configs = sorted(results)
    delta = dict.fromkeys(METRICS)
    reasons = {}
    primary, baseline = (configs + [None, None])[:2]
    def population(config):
        return sorted((str(r.get("eval_directory", r["eval_id"])), str(r.get("run_directory", r["run_number"]))) for r in results[config])
    for metric in METRICS:
        if baseline is None:
            reasons[metric] = "Two configurations are required."
        elif not results[primary] or population(primary) != population(baseline):
            reasons[metric] = "Discovered eval/run populations differ or are empty."
        elif any(summaries[c][metric]["status"] != "complete" for c in (primary, baseline)):
            reasons[metric] = "Measurements are missing; no subset comparison was inferred."
        else:
            value = summaries[primary][metric]["mean"] - summaries[baseline][metric]["mean"]
            precision = 2 if metric == "pass_rate" else 1 if metric == "time_seconds" else 0
            delta[metric] = f"{value:+.{precision}f}"
            reasons[metric] = "Complete matching discovered populations; descriptive difference only."
    return delta, {"primary": primary, "baseline": baseline, "direction": "primary minus baseline", "reasons": reasons}


def aggregate_results(results: dict) -> dict:
    summaries = configuration_stats(results)
    delta, _ = comparison(results, summaries)
    return {**summaries, "delta": delta}


def generate_benchmark(benchmark_dir: Path, skill_name: str = "", skill_path: str = "") -> dict:
    results = load_run_results(benchmark_dir)
    summaries = configuration_stats(results)
    delta, delta_info = comparison(results, summaries)
    runs = []
    counts_by_eval = {}
    for config, records in sorted(results.items()):
        for r in records:
            counts = counts_by_eval.setdefault(r["eval_directory"], {})
            counts[config] = counts.get(config, 0) + 1
            runs.append({
                **{k: r[k] for k in ("eval_id", "eval_directory", "run_number", "run_directory", "expectations", "notes")},
                "configuration": config,
                "result": {k: r[k] for k in (*METRICS, "passed", "failed", "total", "tool_calls", "errors")},
            })
    for counts in counts_by_eval.values():
        for config in results:
            counts.setdefault(config, 0)
    cell_counts = {n for counts in counts_by_eval.values() for n in counts.values()}
    uniform = next(iter(cell_counts)) if len(cell_counts) == 1 and 0 not in cell_counts else None
    notes = ["Statistics cover observed measurements only; n/total shows coverage of discovered run directories. Undiscovered planned runs cannot be counted.",
             f"Delta: {delta_info['primary']} minus {delta_info['baseline']}; directory alignment does not establish experimental comparability."]
    notes.extend(f"{metric}: {reason}" for metric, reason in delta_info["reasons"].items())
    notes.extend(f"{r['eval_directory']}/{r['configuration']}/{r['run_directory']}: {note}" for r in runs for note in r["notes"])
    return {
        "metadata": {
            "skill_name": skill_name or "<skill-name>", "skill_path": skill_path or "<path/to/skill>",
            "executor_model": "<model-name>", "analyzer_model": "<model-name>",
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "evals_run": sorted({r["eval_id"] for r in runs}, key=str),
            "runs_per_configuration": uniform,
            "run_counts": {c: len(r) for c, r in sorted(results.items())},
            "run_counts_by_eval": counts_by_eval,
        },
        "runs": runs, "configuration_summary": summaries,
        "run_summary": {**summaries, "delta": delta}, "delta_info": delta_info, "notes": notes,
    }


def generate_markdown(benchmark: dict) -> str:
    """Render all configurations and explicit unknown/partial coverage."""
    metadata = benchmark["metadata"]
    summaries = benchmark.get("configuration_summary", {k:v for k,v in benchmark["run_summary"].items() if k != "delta"})
    configs = list(summaries)
    def safe(value):
        return str(value).replace("|", "\\|").replace("\n", " ")
    lines = [f"# Skill Benchmark: {safe(metadata['skill_name'])}", "",
             f"**Model**: {safe(metadata['executor_model'])}", f"**Date**: {metadata['timestamp']}",
             f"**Evals**: {', '.join(map(str, metadata['evals_run']))}",
             f"**Discovered runs by configuration**: {safe(metadata.get('run_counts', {}))}", "", "## Summary", "",
             "| Metric | " + " | ".join(safe(c) for c in configs) + " | Delta (first minus second) |",
             "|---|" + "---|" * len(configs) + "---|"]
    for metric, label in zip(METRICS, ("Pass Rate", "Time (s)", "Tokens", "Output characters")):
        cells = []
        for config in configs:
            stat = summaries[config].get(metric, {})
            coverage = f" [{stat['n']}/{stat['total']}; {stat['status']}]" if 'n' in stat else ""
            if stat.get("mean") is None:
                cells.append("unknown" + coverage)
            else:
                factor = 100 if metric == "pass_rate" else 1
                suffix = "%" if metric == "pass_rate" else ""
                cells.append(f"{stat['mean']*factor:.2f}{suffix} ± {stat['stddev']*factor:.2f}{suffix}" + coverage)
        delta = benchmark["run_summary"].get("delta", {}).get(metric)
        lines.append("| " + label + " | " + " | ".join(cells) + " | " + (delta if delta is not None else "unknown") + " |")
    lines += ["", "## Notes", ""] + [f"- {safe(note)}" for note in benchmark.get("notes", [])]
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Aggregate benchmark run results into summary statistics"
    )
    parser.add_argument(
        "benchmark_dir",
        type=Path,
        help="Path to the benchmark directory"
    )
    parser.add_argument(
        "--skill-name",
        default="",
        help="Name of the skill being benchmarked"
    )
    parser.add_argument(
        "--skill-path",
        default="",
        help="Path to the skill being benchmarked"
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        help="Output path for benchmark.json (default: <benchmark_dir>/benchmark.json)"
    )

    args = parser.parse_args()

    if not args.benchmark_dir.is_dir():
        print(f"Directory not found: {args.benchmark_dir}")
        sys.exit(1)

    # Generate benchmark
    benchmark = generate_benchmark(args.benchmark_dir, args.skill_name, args.skill_path)

    # Determine output paths
    output_json = args.output or (args.benchmark_dir / "benchmark.json")
    output_md = output_json.with_suffix(".md")

    # Write benchmark.json
    with open(output_json, "w", encoding="utf-8") as f:
        json.dump(benchmark, f, indent=2, allow_nan=False)
    print(f"Generated: {output_json}")

    # Write benchmark.md
    markdown = generate_markdown(benchmark)
    with open(output_md, "w", encoding="utf-8") as f:
        f.write(markdown)
    print(f"Generated: {output_md}")

    print("\nSummary:")
    for config, summary in benchmark["configuration_summary"].items():
        stat = summary["pass_rate"]
        value = "unknown" if stat["mean"] is None else f"{stat['mean']*100:.1f}%"
        print(f"  {config}: {value} pass rate ({stat['n']}/{stat['total']}; {stat['status']})")
    print(f"  Delta: {benchmark['run_summary']['delta']['pass_rate'] or 'unknown'}")


if __name__ == "__main__":
    main()
