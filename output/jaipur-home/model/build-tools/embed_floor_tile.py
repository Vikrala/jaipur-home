"""Embed the floor-tile image for the offline walkthrough."""

import base64
from pathlib import Path

model = Path(__file__).resolve().parents[1]
source = model / "floor-tile-reference.png"
data_uri = "data:image/png;base64," + base64.b64encode(source.read_bytes()).decode("ascii")
(model / "floor-tile-data.js").write_text(
    "/* Client showroom floor tile, cleaned from IMG_9981.HEIC for visualisation. */\n"
    "window.JAIPUR_FLOOR_TILE_DATA=" + repr(data_uri) + ";\n"
)
print(model / "floor-tile-data.js")
