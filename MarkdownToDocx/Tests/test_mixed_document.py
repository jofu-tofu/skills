"""Offline end-to-end check with Pandoc, python-docx, Chromium and a local Mermaid bundle."""
import base64
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from zipfile import ZipFile

from docx import Document

TOOLS = Path(__file__).resolve().parents[1] / "Tools"
PANDOC = os.environ.get("PANDOC") or shutil.which("pandoc")


class MixedDocumentTest(unittest.TestCase):
    @unittest.skipUnless(PANDOC and os.environ.get("MERMAID_SCRIPT"), "requires Pandoc and local Mermaid")
    def test_relative_source_image_diagram_table_and_link_survive_staging(self):
        with tempfile.TemporaryDirectory(prefix="mixed docx ") as temp:
            directory = Path(temp)
            source_dir = directory / "source"
            stage = directory / "stage"
            source_dir.mkdir()
            stage.mkdir()
            # The source image deliberately has the same name as the generated diagram.
            source_image = source_dir / "mermaid1.png"
            pixels = base64.b64decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jc1kAAAAASUVORK5CYII=")
            source_image.write_bytes(pixels)
            source = source_dir / "report.md"
            source.write_text("# Result\n\n![Original](mermaid1.png)\n\n~~~mermaid\ngraph TD\nA-->B\n~~~\n\n| Item | Count |\n|---|---|\n| Beta | 17 |\n\n[Details](https://example.invalid/details)\n", encoding="utf8")
            before = source.read_bytes()
            prepared = stage / "prepared.md"
            output = stage / "output.docx"
            subprocess.run(["node", str(TOOLS / "RenderMermaid.mjs"), str(source), str(prepared), str(stage)], check=True)
            subprocess.run([PANDOC, str(prepared), "-f", "gfm", "-t", "docx", "--fail-if-warnings", "--resource-path", str(source_dir), "-o", str(output)], check=True, cwd=source_dir)
            subprocess.run([sys.executable, str(TOOLS / "PostProcessDocx.py"), str(output)], check=True)
            doc = Document(output)
            self.assertEqual(doc.paragraphs[0].text, "Result")
            self.assertEqual([[c.text for c in row.cells] for row in doc.tables[0].rows], [["Item", "Count"], ["Beta", "17"]])
            self.assertTrue(doc.tables[0].cell(1, 1)._tc.xpath("./w:tcPr/w:tcBorders/w:bottom"))
            self.assertTrue(any(rel.target_ref == "https://example.invalid/details" for rel in doc.part.rels.values()))
            with ZipFile(output) as pkg:
                media = [pkg.read(name) for name in pkg.namelist() if name.startswith("word/media/")]
            self.assertEqual(len(media), 2)
            self.assertIn(pixels, media)
            self.assertEqual(source.read_bytes(), before)
            self.assertEqual(source_image.read_bytes(), pixels)


if __name__ == "__main__":
    unittest.main()
