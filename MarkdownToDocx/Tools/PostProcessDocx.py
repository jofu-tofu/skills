#!/usr/bin/env python3
"""Post-process DOCX outputs for table visibility and optional auto-open."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


def _set_cell_borders(cell, qn, OxmlElement) -> None:
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()

    tc_borders = tc_pr.find(qn("w:tcBorders"))
    if tc_borders is None:
        tc_borders = OxmlElement("w:tcBorders")
        tc_pr.append(tc_borders)

    for edge in ("top", "left", "bottom", "right"):
        edge_tag = qn(f"w:{edge}")
        edge_element = tc_borders.find(edge_tag)
        if edge_element is None:
            edge_element = OxmlElement(f"w:{edge}")
            tc_borders.append(edge_element)
        edge_element.set(qn("w:val"), "single")
        edge_element.set(qn("w:sz"), "8")
        edge_element.set(qn("w:space"), "0")
        edge_element.set(qn("w:color"), "000000")


def ensure_table_visibility(path: Path) -> int:
    try:
        from docx import Document
        from docx.oxml import OxmlElement
        from docx.oxml.ns import qn
    except ImportError as exc:
        raise RuntimeError(
            "python-docx is required for table visibility processing. "
            "Install with: python -m pip install python-docx"
        ) from exc

    document = Document(str(path))
    table_count = 0

    for table in document.tables:
        table_count += 1
        try:
            table.style = "Table Grid"
        except Exception:
            # Keep processing even if the style is unavailable in this template.
            pass

        table.autofit = True
        for row in table.rows:
            for cell in row.cells:
                _set_cell_borders(cell, qn, OxmlElement)

    document.save(str(path))
    return table_count


def open_docx(path: Path) -> None:
    if sys.platform.startswith("win"):
        os.startfile(str(path))  # type: ignore[attr-defined]
        return

    if sys.platform == "darwin":
        subprocess.Popen(["open", str(path)])
        return

    subprocess.Popen(["xdg-open", str(path)])


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Apply visible DOCX table borders and optionally open outputs."
    )
    parser.add_argument("paths", nargs="+", help="One or more .docx files to process")
    parser.add_argument(
        "--open",
        action="store_true",
        help="Open files after table visibility processing",
    )
    parser.add_argument(
        "--open-only",
        action="store_true",
        help="Open files without table visibility processing",
    )
    args = parser.parse_args()

    if args.open and args.open_only:
        print("ERROR: Use either --open or --open-only, not both.")
        return 2

    success = True
    for raw_path in args.paths:
        path = Path(raw_path).expanduser()
        if not path.exists():
            print(f"ERROR: Missing file: {path}")
            success = False
            continue
        if path.suffix.lower() != ".docx":
            print(f"ERROR: Not a .docx file: {path}")
            success = False
            continue

        if not args.open_only:
            try:
                table_count = ensure_table_visibility(path)
                print(f"UPDATED: {path} (tables={table_count})")
            except RuntimeError as exc:
                print(f"ERROR: {exc}")
                return 2
            except Exception as exc:
                print(f"ERROR: Failed table processing for {path}: {exc}")
                success = False
                continue

        if args.open or args.open_only:
            try:
                open_docx(path)
                print(f"OPENED: {path}")
            except Exception as exc:
                print(f"ERROR: Failed to open {path}: {exc}")
                success = False

    return 0 if success else 1


if __name__ == "__main__":
    raise SystemExit(main())
