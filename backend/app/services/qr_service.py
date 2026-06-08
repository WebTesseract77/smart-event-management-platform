import qrcode
from pathlib import Path


def generate_qr(
    registration_id: int,
):
    qr = qrcode.make(
        str(registration_id)
    )

    output_dir = Path("generated_qr")

    output_dir.mkdir(
        exist_ok=True
    )

    file_path = (
        output_dir
        / f"{registration_id}.png"
    )

    qr.save(file_path)

    return str(file_path)