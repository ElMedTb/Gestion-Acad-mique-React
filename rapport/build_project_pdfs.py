from pathlib import Path
from html import escape
import re
import textwrap

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Preformatted,
    PageBreak,
)


ROOT = Path(__file__).resolve().parents[1]


def make_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="DocTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0B6B3A"),
            alignment=TA_CENTER,
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1Custom",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=18,
            textColor=colors.HexColor("#0B6B3A"),
            spaceBefore=12,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2Custom",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=colors.HexColor("#1F2933"),
            spaceBefore=9,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyCustom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletCustom",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            leftIndent=14,
            firstLineIndent=-8,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CodeCustom",
            parent=styles["Code"],
            fontName="Courier",
            fontSize=8,
            leading=10,
            leftIndent=8,
            rightIndent=8,
            backColor=colors.HexColor("#F3F5F2"),
            borderColor=colors.HexColor("#D7DED8"),
            borderWidth=0.5,
            borderPadding=5,
            spaceBefore=4,
            spaceAfter=8,
        )
    )
    return styles


def wrap_code_block(text):
    wrapped_lines = []
    for line in text.splitlines():
        if not line:
            wrapped_lines.append("")
            continue
        wrapped_lines.extend(textwrap.wrap(line, width=92, replace_whitespace=False, drop_whitespace=False) or [""])
    return "\n".join(wrapped_lines)


def markdown_to_story(markdown_text):
    styles = make_styles()
    story = []
    in_code = False
    code_lines = []

    for raw_line in markdown_text.splitlines():
        line = raw_line.rstrip()

        if line.startswith("```"):
            if in_code:
                story.append(Preformatted(wrap_code_block("\n".join(code_lines)), styles["CodeCustom"]))
                code_lines = []
                in_code = False
            else:
                in_code = True
            continue

        if in_code:
            code_lines.append(line)
            continue

        if not line.strip():
            continue

        if line.startswith("# "):
            story.append(Paragraph(escape(line[2:].strip()), styles["DocTitle"]))
            continue

        if line.startswith("## "):
            story.append(Paragraph(escape(line[3:].strip()), styles["H1Custom"]))
            continue

        if line.startswith("### "):
            story.append(Paragraph(escape(line[4:].strip()), styles["H2Custom"]))
            continue

        if line.startswith("- "):
            story.append(Paragraph(f"- {escape(line[2:].strip())}", styles["BulletCustom"]))
            continue

        numbered = re.match(r"^(\d+)\.\s+(.*)$", line)
        if numbered:
            story.append(Paragraph(f"{numbered.group(1)}. {escape(numbered.group(2))}", styles["BulletCustom"]))
            continue

        if set(line.strip()) <= {"|", "-", " "}:
            continue

        if line.startswith("|"):
            cells = [cell.strip() for cell in line.strip("|").split("|")]
            story.append(Paragraph(" | ".join(escape(cell) for cell in cells), styles["BodyCustom"]))
            continue

        safe_line = escape(line)
        safe_line = re.sub(r"`([^`]+)`", r"<font name='Courier'>\1</font>", safe_line)
        story.append(Paragraph(safe_line, styles["BodyCustom"]))

    if code_lines:
        story.append(Preformatted(wrap_code_block("\n".join(code_lines)), styles["CodeCustom"]))

    return story


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#6B7280"))
    canvas.drawRightString(A4[0] - 1.5 * cm, 1 * cm, f"Page {doc.page}")
    canvas.restoreState()


def build_pdf(source_name, output_name):
    source = ROOT / source_name
    output = ROOT / output_name
    story = markdown_to_story(source.read_text(encoding="utf-8"))
    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.4 * cm,
        bottomMargin=1.4 * cm,
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(output)


def main():
    build_pdf("GUIDE_TEST_PROFESSEUR.md", "GUIDE_TEST_PROFESSEUR.pdf")
    build_pdf("README_PRESENTATION_GITHUB.md", "README_PRESENTATION_GITHUB.pdf")


if __name__ == "__main__":
    main()
