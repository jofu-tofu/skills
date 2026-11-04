#!/usr/bin/env python3
"""Run trigger evaluation for a skill description.

Tests whether a skill's description causes Claude to trigger (read the skill)
for a set of queries. Outputs results as JSON.
"""

import argparse
import json
import os
import subprocess
import sys
import uuid
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from scripts.utils import parse_skill_md


def find_project_root() -> Path:
    """Find the project root by walking up from cwd looking for .claude/.

    Mimics how Claude Code discovers its project root, so the command file
    we create ends up where claude -p will look for it.
    """
    current = Path.cwd()
    for parent in [current, *current.parents]:
        if (parent / ".claude").is_dir():
            return parent
    return current


def run_single_query(
    query: str,
    skill_name: str,
    skill_description: str,
    timeout: int,
    project_root: str,
    model: str | None = None,
) -> dict:
    """Run a single query and return observation and execution status separately.

    Creates a command file in .claude/commands/ so it appears in Claude's
    available_skills list, then runs `claude -p` with the raw query.
    Uses --include-partial-messages to detect triggering early from
    stream events (content_block_start) rather than waiting for the
    full assistant message, which only arrives after tool execution.
    """
    unique_id = uuid.uuid4().hex[:8]
    clean_name = f"{skill_name}-skill-{unique_id}"
    project_commands_dir = Path(project_root) / ".claude" / "commands"
    command_file = project_commands_dir / f"{clean_name}.md"

    try:
        project_commands_dir.mkdir(parents=True, exist_ok=True)
        # Use YAML block scalar to avoid breaking on quotes in description
        indented_desc = "\n  ".join(skill_description.split("\n"))
        command_content = (
            f"---\n"
            f"description: |\n"
            f"  {indented_desc}\n"
            f"---\n\n"
            f"# {skill_name}\n\n"
            f"This skill handles: {skill_description}\n"
        )
        command_file.write_text(command_content)

        cmd = [
            "claude",
            "-p", query,
            "--output-format", "stream-json",
            "--verbose",
            "--include-partial-messages",
        ]
        if model:
            cmd.extend(["--model", model])

        # Remove CLAUDECODE env var to allow nesting claude -p inside a
        # Claude Code session. The guard is for interactive terminal conflicts;
        # programmatic subprocess usage is safe.
        env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            cwd=project_root,
            env=env,
        )

        execution_status = "completed"
        reason = None
        try:
            try:
                output, _ = process.communicate(timeout=timeout)
            except subprocess.TimeoutExpired:
                execution_status = "timeout"
                reason = "Provider timed out"
                process.kill()
                output, _ = process.communicate()
        finally:
            if process.poll() is None:
                process.kill()
                process.wait()
            if process.stdout:
                process.stdout.close()
        if process.returncode and execution_status == "completed":
            execution_status = "error"
            reason = f"Provider exited with code {process.returncode}"

        triggered = False
        completed = False
        malformed = False
        pending = {}

        def matches(name, args):
            if not isinstance(args, dict):
                return False
            field = "skill" if name == "Skill" else "file_path" if name == "Read" else None
            value = args.get(field) if field else None
            return isinstance(value, str) and clean_name in value

        for line in output.decode("utf-8", errors="replace").splitlines():
            if not line.strip():
                continue
            try:
                event = json.loads(line)
                if not isinstance(event, dict):
                    raise ValueError("Expected object")
                kind = event.get("type")
                if kind == "assistant":
                    for item in event.get("message", {}).get("content", []):
                        if item.get("type") == "tool_use":
                            triggered |= matches(item.get("name"), item.get("input"))
                elif kind == "stream_event":
                    se = event.get("event", {})
                    index = se.get("index", 0)
                    if se.get("type") == "content_block_start":
                        cb = se.get("content_block", {})
                        pending[index] = [cb.get("name"), ""]
                        if cb.get("type") == "tool_use":
                            triggered |= matches(cb.get("name"), cb.get("input"))
                    elif se.get("type") == "content_block_delta" and index in pending:
                        delta = se.get("delta", {})
                        if delta.get("type") == "input_json_delta":
                            pending[index][1] += delta.get("partial_json", "")
                            try:
                                args = json.loads(pending[index][1])
                            except json.JSONDecodeError:
                                continue
                            triggered |= matches(pending[index][0], args)
                    elif se.get("type") == "content_block_stop":
                        pending.pop(index, None)
                elif kind == "result":
                    if event.get("is_error") or str(event.get("subtype", "")).startswith("error"):
                        execution_status = "error"
                        reason = "Provider reported an error result"
                    elif event.get("subtype") == "success":
                        completed = True
            except (ValueError, TypeError, AttributeError):
                malformed = True
        if execution_status == "completed" and (malformed or not completed):
            execution_status = "incomplete"
            reason = "Malformed stream or missing successful result"
        # Selection is an observed event even if execution later fails.
        observed = True if triggered else False if execution_status == "completed" else None
        return {"triggered": observed, "execution_status": execution_status, "reason": reason}
    finally:
        if command_file.exists():
            command_file.unlink()


def run_eval(
    eval_set: list[dict],
    skill_name: str,
    description: str,
    num_workers: int,
    timeout: int,
    project_root: Path,
    runs_per_query: int = 1,
    trigger_threshold: float = 0.5,
    model: str | None = None,
) -> dict:
    """Run the full eval set and return results."""
    if runs_per_query < 1:
        raise ValueError("runs_per_query must be positive")
    results = []

    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        future_to_info = {}
        for item in eval_set:
            for run_idx in range(runs_per_query):
                future = executor.submit(
                    run_single_query,
                    item["query"],
                    skill_name,
                    description,
                    timeout,
                    str(project_root),
                    model,
                )
                future_to_info[future] = (item, run_idx)

        query_triggers: dict[str, list[dict]] = {}
        query_items: dict[str, dict] = {}
        for future in as_completed(future_to_info):
            item, _ = future_to_info[future]
            query = item["query"]
            query_items[query] = item
            if query not in query_triggers:
                query_triggers[query] = []
            try:
                query_triggers[query].append(future.result())
            except Exception as e:
                print(f"Warning: query failed: {e}", file=sys.stderr)
                query_triggers[query].append({"triggered": None, "execution_status": "error", "reason": str(e)})

    for query, triggers in query_triggers.items():
        item = query_items[query]
        observations = [t["triggered"] for t in triggers]
        unavailable = observations.count(None)
        count = sum(t is True for t in observations)
        trigger_rate = count / len(triggers) if not unavailable else None
        should_trigger = item["should_trigger"]
        if unavailable:
            did_pass = None
        elif should_trigger:
            did_pass = trigger_rate >= trigger_threshold
        else:
            did_pass = trigger_rate < trigger_threshold
        results.append({
            "query": query,
            "should_trigger": should_trigger,
            "trigger_rate": trigger_rate,
            "triggers": count,
            "unverified_runs": unavailable,
            "observations": triggers,
            "status": "unverified" if did_pass is None else "pass" if did_pass else "fail",
            "runs": len(triggers),
            "pass": did_pass,
        })

    passed = sum(1 for r in results if r["pass"])
    total = len(results)

    return {
        "skill_name": skill_name,
        "description": description,
        "results": results,
        "summary": {
            "total": total,
            "passed": passed,
            "failed": sum(r["pass"] is False for r in results),
            "unverified": sum(r["pass"] is None for r in results),
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Run trigger evaluation for a skill description")
    parser.add_argument("--eval-set", required=True, help="Path to eval set JSON file")
    parser.add_argument("--skill-path", required=True, help="Path to skill directory")
    parser.add_argument("--description", default=None, help="Override description to test")
    parser.add_argument("--num-workers", type=int, default=10, help="Number of parallel workers")
    parser.add_argument("--timeout", type=int, default=30, help="Timeout per query in seconds")
    parser.add_argument("--runs-per-query", type=int, default=3, help="Number of runs per query")
    parser.add_argument("--trigger-threshold", type=float, default=0.5, help="Trigger rate threshold")
    parser.add_argument("--model", default=None, help="Model to use for claude -p (default: user's configured model)")
    parser.add_argument("--verbose", action="store_true", help="Print progress to stderr")
    args = parser.parse_args()

    eval_set = json.loads(Path(args.eval_set).read_text())
    skill_path = Path(args.skill_path)

    if not (skill_path / "SKILL.md").exists():
        print(f"Error: No SKILL.md found at {skill_path}", file=sys.stderr)
        sys.exit(1)

    name, original_description, content = parse_skill_md(skill_path)
    description = args.description or original_description
    project_root = find_project_root()

    if args.verbose:
        print(f"Evaluating: {description}", file=sys.stderr)

    output = run_eval(
        eval_set=eval_set,
        skill_name=name,
        description=description,
        num_workers=args.num_workers,
        timeout=args.timeout,
        project_root=project_root,
        runs_per_query=args.runs_per_query,
        trigger_threshold=args.trigger_threshold,
        model=args.model,
    )

    if args.verbose:
        summary = output["summary"]
        print(f"Results: {summary['passed']}/{summary['total']} passed", file=sys.stderr)
        for r in output["results"]:
            status = r["status"].upper()
            rate_str = f"{r['triggers']}/{r['runs']}"
            print(f"  [{status}] rate={rate_str} expected={r['should_trigger']}: {r['query'][:70]}", file=sys.stderr)

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
