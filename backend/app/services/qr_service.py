import qrcode
from pathlib import Path
import re


def generate_qr(
    qr_data: str,
):
    safe_name = re.sub(
        r"[^A-Za-z0-9_.-]",
        "_",
        str(qr_data),
    ).strip("._")

    if not safe_name:
        safe_name = "qr"

    qr = qrcode.make(
        str(qr_data)
    )

    output_dir = Path("generated_qr")

    output_dir.mkdir(
        exist_ok=True
    )

    file_path = (
        output_dir
        / f"{safe_name}.png"
    )

    qr.save(file_path)

    return str(file_path)
