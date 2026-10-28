"""Add the R-019 joinery to the maintained GLB without changing existing nodes.

The maintained HTML scene is authored in model/interior.js. This script keeps the
existing GLB in sync for R-019 when a full browser export is unavailable. It is
idempotent and adds only simple box geometry under the existing feet-to-metres root.
"""

from __future__ import annotations

import json
import struct
from pathlib import Path


GLB = Path(__file__).resolve().parents[1] / "jaipur-first-floor.glb"


def aligned(data: bytes) -> bytes:
    return data + b"\0" * ((-len(data)) % 4)


def cube_data() -> tuple[bytes, bytes, bytes]:
    faces = [
        ((0, 0, 1), [(-.5, -.5, .5), (.5, -.5, .5), (.5, .5, .5), (-.5, .5, .5)]),
        ((0, 0, -1), [(.5, -.5, -.5), (-.5, -.5, -.5), (-.5, .5, -.5), (.5, .5, -.5)]),
        ((1, 0, 0), [(.5, -.5, .5), (.5, -.5, -.5), (.5, .5, -.5), (.5, .5, .5)]),
        ((-1, 0, 0), [(-.5, -.5, -.5), (-.5, -.5, .5), (-.5, .5, .5), (-.5, .5, -.5)]),
        ((0, 1, 0), [(-.5, .5, .5), (.5, .5, .5), (.5, .5, -.5), (-.5, .5, -.5)]),
        ((0, -1, 0), [(-.5, -.5, -.5), (.5, -.5, -.5), (.5, -.5, .5), (-.5, -.5, .5)]),
    ]
    positions, normals, indices = [], [], []
    for face_index, (normal, corners) in enumerate(faces):
        for corner in corners:
            positions.extend(corner)
            normals.extend(normal)
        start = face_index * 4
        indices.extend([start, start + 1, start + 2, start, start + 2, start + 3])
    return (
        struct.pack("<" + "f" * len(positions), *positions),
        struct.pack("<" + "f" * len(normals), *normals),
        struct.pack("<" + "H" * len(indices), *indices),
    )


def main() -> None:
    raw = GLB.read_bytes()
    magic, version, total_length = struct.unpack_from("<4sII", raw)
    assert magic == b"glTF" and version == 2 and total_length == len(raw)
    json_length, json_type = struct.unpack_from("<I4s", raw, 12)
    assert json_type == b"JSON"
    document = json.loads(raw[20 : 20 + json_length])
    binary_offset = 20 + json_length
    binary_length, binary_type = struct.unpack_from("<I4s", raw, binary_offset)
    assert binary_type == b"BIN\0"
    binary = bytearray(raw[binary_offset + 8 : binary_offset + 8 + binary_length])
    assert len(binary) == document["buffers"][0]["byteLength"]
    if any(node.get("name") == "Kitchen-living ledge — R-019" for node in document["nodes"]):
        print(f"Already present in {GLB}; no change")
        return

    material_by_name = {m.get("name"): i for i, m in enumerate(document["materials"])}
    for required in (
        "Charcoal powder coat", "Matte sand laminate", "Brushed stainless steel",
        "Warm diffused light", "Master washer sealed light marble slab",
    ):
        assert required in material_by_name, required

    document["materials"].extend([
        {"name": "R-019 shallow dark fluting", "pbrMetallicRoughness": {
            "baseColorFactor": [.141, .119, .102, 1], "metallicFactor": 0, "roughnessFactor": .78}},
        {"name": "R-019 matte sand drawer fronts", "pbrMetallicRoughness": {
            "baseColorFactor": [.584, .462, .337, 1], "metallicFactor": 0, "roughnessFactor": .84}},
    ])
    rib_material = len(document["materials"]) - 2
    drawer_material = len(document["materials"]) - 1

    views = document["bufferViews"]
    accessors = document["accessors"]
    refs = []
    for payload, target, component_type, accessor_type, count, bounds in [
        (cube_data()[0], 34962, 5126, "VEC3", 24, {"min": [-.5, -.5, -.5], "max": [.5, .5, .5]}),
        (cube_data()[1], 34962, 5126, "VEC3", 24, {}),
        (cube_data()[2], 34963, 5123, "SCALAR", 36, {"min": [0], "max": [23]}),
    ]:
        offset = len(binary)
        binary.extend(aligned(payload))
        view_index = len(views)
        views.append({"buffer": 0, "byteOffset": offset, "byteLength": len(payload), "target": target})
        accessor_index = len(accessors)
        accessors.append({"bufferView": view_index, "componentType": component_type,
                          "count": count, "type": accessor_type, **bounds})
        refs.append(accessor_index)
    document["buffers"][0]["byteLength"] = len(binary)

    materials = {
        "charcoal": material_by_name["Charcoal powder coat"],
        "greige": material_by_name["Matte sand laminate"],
        "metal": material_by_name["Brushed stainless steel"],
        "warm": material_by_name["Warm diffused light"],
        "top": material_by_name["Master washer sealed light marble slab"],
        "rib": rib_material,
        "drawer": drawer_material,
    }
    mesh_by_material = {}
    for name, material in materials.items():
        mesh_by_material[name] = len(document["meshes"])
        document["meshes"].append({"name": f"R-019 {name} box", "primitives": [{
            "attributes": {"POSITION": refs[0], "NORMAL": refs[1]},
            "indices": refs[2], "material": material, "mode": 4,
        }]})

    x0, x1, z0 = 6.75, 10.25, 34.84
    z1 = z0 + 600 / 304.8
    cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    width, depth = x1 - x0, z1 - z0
    child_indices = []

    def box(name: str, w: float, h: float, d: float, x: float, y: float, z: float, material: str) -> None:
        child_indices.append(len(document["nodes"]))
        document["nodes"].append({"name": name, "mesh": mesh_by_material[material],
                                  "matrix": [w, 0, 0, 0, 0, h, 0, 0, 0, 0, d, 0, x, y, z, 1]})

    box("R-019 recessed washable plinth", width - .14, .32, depth - .20, cx, .16, cz + .05, "charcoal")
    for x in (x0 + .045, x1 - .045):
        box("R-019 floor-supported carcass side", .09, 2.10, depth - .08, x, 1.38, cz, "greige")
    box("R-019 central drawer divider", .09, 2.10, depth - .08, cx, 1.38, cz, "greige")
    box("R-019 living-face backing", width - .12, 2.10, .055, cx, 1.38, z0 + .04, "charcoal")
    box("R-019 top support concept", width - .12, .075, depth - .08, cx, 2.3965, cz, "charcoal")
    box("R-019 light stone-look top", width, .066, depth, cx, 2.467, cz, "top")
    x = x0 + .12
    while x < x1 - .08:
        box("R-019 shallow wipeable rib", .038, 2.035, .028, x, 1.38, z0 - .004, "rib")
        x += .115
    box("R-019 illustrative shielded under-lip light", width - .18, .035, .04,
        cx, 2.425, z0 - .016, "warm")
    for x in (x0 + .875, x1 - .875):
        box("R-019 deep kitchen-facing drawer", 1.64, 1.40, .055, x, 1.14, z1 - .005, "drawer")
        box("R-019 shallow kitchen-facing drawer", 1.64, .54, .055, x, 2.14, z1 - .005, "drawer")
        for y in (1.65, 2.16):
            box("R-019 accessible drawer pull", .43, .034, .075, x, y, z1 + .065, "metal")

    group_index = len(document["nodes"])
    document["nodes"].append({"name": "Kitchen-living ledge — R-019", "children": child_indices,
                              "extras": {"status": "current working model; site fit pending",
                                         "length_mm": 1066.8, "depth_mm": 600,
                                         "top_height_mm": 762, "storage_access": "kitchen"}})
    root_index = document["scenes"][document.get("scene", 0)]["nodes"][0]
    root = document["nodes"][root_index]
    assert root.get("name") == "Suresh Ji first floor — metres"
    root["children"].append(group_index)
    root.setdefault("extras", {})["r019"] = "Kitchen-living ledge; site fit and joinery details pending"

    json_bytes = json.dumps(document, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    json_bytes += b" " * ((-len(json_bytes)) % 4)
    binary_bytes = aligned(bytes(binary))
    total = 12 + 8 + len(json_bytes) + 8 + len(binary_bytes)
    output = (struct.pack("<4sII", b"glTF", 2, total)
              + struct.pack("<I4s", len(json_bytes), b"JSON") + json_bytes
              + struct.pack("<I4s", len(binary_bytes), b"BIN\0") + binary_bytes)
    temporary = GLB.with_suffix(".glb.tmp")
    temporary.write_bytes(output)
    temporary.replace(GLB)
    print(f"Updated {GLB}: {len(child_indices)} joinery nodes; {len(output)} bytes")


if __name__ == "__main__":
    main()
