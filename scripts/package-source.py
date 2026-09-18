from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import os

root = Path(__file__).resolve().parents[1]
destination = root.parent / "signal-source.zip"
excluded = {"node_modules", ".next", ".git", ".vercel", "test-results", "test-results-cross", "playwright-report", "__pycache__"}
with ZipFile(destination, "w", ZIP_DEFLATED) as archive:
    for folder, directories, filenames in os.walk(root):
        directories[:] = [name for name in directories if name not in excluded]
        for name in filenames:
            if name.endswith(".tsbuildinfo") or (name.startswith(".env") and name != ".env.example"):
                continue
            source = Path(folder) / name
            archive.write(source, Path("signal") / source.relative_to(root))
print(destination)
print(f"{destination.stat().st_size:,} bytes")

