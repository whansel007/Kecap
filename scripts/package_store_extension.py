from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parents[1]
EXTENSION = ROOT / "kecap-extension"
ARCHIVE = ROOT / "kecap-extension-store.zip"
EXCLUDED_PARTS = {"node_modules", "test", "__pycache__"}
EXCLUDED_FILES = {".gitignore", "README.md", "package.json", "package-lock.json"}


def package_files():
    for path in sorted(EXTENSION.rglob("*")):
        if not path.is_file():
            continue
        relative = path.relative_to(EXTENSION)
        if EXCLUDED_PARTS.intersection(relative.parts) or path.name in EXCLUDED_FILES:
            continue
        if path.suffix == ".pyc":
            continue
        yield path, relative


if __name__ == "__main__":
    files = list(package_files())
    with ZipFile(ARCHIVE, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for path, relative in files:
            archive.write(path, relative.as_posix())
    print(f"Created {ARCHIVE} with {len(files)} files ({ARCHIVE.stat().st_size:,} bytes).")
