# Lee Ferrcal-Inventario-Comparativa.xlsx y escribe src/lib/inventory.data.ts
import json
import re
import sys
import unicodedata
from pathlib import Path

import openpyxl

ROOT = Path(r"e:\INVETARIOS DP")
SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "Ferrcal-Inventario-Comparativa.xlsx"
TARGET = ROOT / "calipso" / "src" / "lib" / "inventory.data.ts"

SUPPLIERS = ["Amanda", "Coproad", "Fibraplax", "Gasfix", "IGMA", "TOSO", "Valprik"]

CATEGORIES = [
    ("cat-gasfiteria", "Gasfitería", "gasfiteria", None),
    ("cat-fittings", "Fittings y cañerías", "fittings-y-canerias", "cat-gasfiteria"),
    ("cat-griferia", "Grifería", "griferia", "cat-gasfiteria"),
    ("cat-gas", "Gas", "gas", "cat-gasfiteria"),
    ("cat-electricidad", "Electricidad", "electricidad", None),
    ("cat-fijaciones", "Fijaciones", "fijaciones", None),
    ("cat-quincalleria", "Quincallería", "quincalleria", None),
    ("cat-herramientas", "Herramientas", "herramientas", None),
    ("cat-pinturas", "Pinturas", "pinturas", None),
    ("cat-quimicos", "Pinturas y químicos", "pinturas-y-quimicos", "cat-pinturas"),
    ("cat-adhesivos", "Adhesivos y cintas", "adhesivos-y-cintas", "cat-pinturas"),
    ("cat-lijas", "Lijas", "lijas", "cat-pinturas"),
    ("cat-construccion", "Construcción", "construccion", None),
    ("cat-aseo", "Aseo y hogar", "aseo-y-hogar", None),
    ("cat-jardin", "Jardín", "jardin", None),
    ("cat-seguridad", "Seguridad", "seguridad", None),
    ("cat-soldadura", "Soldadura", "soldadura", None),
    ("cat-varios", "Varios", "varios", None),
]

RULES = [
    ("cat-soldadura", ["MASCARA SOLDAR", "CARETA", "PASTA P. SOLDAR", "ELECTRODO", "SOLDADURA"]),
    ("cat-gas", ["REGULADOR", "TEFLON GAS", "VALV. BOLA GAS", "VALVULA BOLA GAS"]),
    ("cat-jardin", ["PISTOLA RIEGO", "MANGUERA", "NEUMATICO", "CAMARA CARRETILLA", "TIJERA PODAR"]),
    ("cat-seguridad", ["GUANTE", "SOBREENTE", "SOBRELENTE", "CONCERTINA", "ALAMBRE DE PUAS", "ALAMBRE PUAS"]),
    ("cat-electricidad", ["CINTA ELECT", "CINTA AISLANTE", "AMPOLLETA", "LED ", "PILA ", "DURACELL", "CONDUIT", "CAJA ELECT", "CAJA CORRIENTE", "CAJA CHUQUI", "ENCHUFE", "TOMACORRIENTE", "INTERRUPTOR", "ELECTRALINE", "ALARGADOR", "CANALETA", "LIMPIA CONTACTO"]),
    ("cat-fijaciones", ["TORNILLO", "TUERCA", "TARUGO", "CLAVO", "PERNO", "GOLILLA", "REMACHE", "TUE HEX", "TOR. ", "ROSCALATA", "TIRAFONDO", "AUTOP.", "PER COCHE", "PER MAQ", "GRAPA"]),
    ("cat-quincalleria", ["BISAGRA", "CERRADURA", "CERROJO", "CANDADO", "PICAPORTE", "PESTILLO", "TIRADOR", "OJO MAGICO", "PORTACANDADO", "ARGOLLA"]),
    ("cat-herramientas", ["LLAVE PUNTA", "LLAVE ", "ALICATE", "MARTILLO", "DESTORNILL", "SIERRA", "ESPATULA", "BROCHA", "RODILLO", "MARCO SIERRA", "DISCO CORTE", "DISCO DE CORTE", "DISCO DIAMANTADO", "HUINCHA", "REMACHADORA", "CARTONERO", "MECHA", "BROCA", "PLANA", "LLANA", "CINCEL", "CALAFATERA", "PUNTA ", "CAIMAN", "CHICHARRA", "TIJERA", "HACHA", "PRENSA", "ESCUADRA", "TIZADOR", "PISTOLA"]),
    ("cat-lijas", ["LIJA"]),
    ("cat-adhesivos", ["ADHESIVO", "ADH ", "SILICON", "ACERO LIQUIDO", "GOTITA", "PEGAMENTO", "PEGA ", "MASKING", "USATAPE", "CINTA EMBALAJE", "CINTA JUNTURA", "CINTA DOBLE", "SELLADOR", "SELLO ANTIFUGAS", "ESPUMA EXPANSIVA", "TAPA GOTERAS"]),
    ("cat-quimicos", ["SPRAY", "PINTURA", "DILUYENTE", "BARNIZ", "ESMALTE", "AGUARRAS", "ANTICORROSIVO", "PASTA MURO", "BEFRAGUE", "FRAGUE", "CAL PINTAR", "CAL HIDRAULICA", "LUBRICANTE", "LIMPIA CARBURADOR", "AEROSOL", "RENOVADOR", "ACIDO", "SODA CAUSTICA"]),
    ("cat-aseo", ["PALA", "ESCOBILLON", "ESCOBILLA", "CLORO", "BOLSA DE BASURA", "BOLSA P/BASURA", "HUAIPE", "PAPEL ALUMINIO", "TRAMPA", "ESCOMBRO", "RATICIDA", "TANAX", "DUAL OIL", "CORTINA", "ENCEND", "RONSON"]),
    ("cat-construccion", ["VOLCANITA", "YESO", "FIBRO", "ZINC", "CEMENTO", "MORTERO", "PLANCHA", "MALLA", "WEBER", "MADERA", "PINO ", "TERCIADO", "OSB", "MELAMINA", "DUROLAC", "CABALLETE", "POLICARBONATO", "CUBREJUNTA", "TAPACANTO", "MANGA POLIETILENO", "SEPARADOR", "CUARZO", "FILM", "ALAMBRE NEGRO", "ESPONJA FRAG"]),
    ("cat-griferia", ["MONOMANDO", "SIFON", "DUCHA", "GRIF", "LAVAPLATO", "LAVATORIO", "LLAVE DE ", "VALVULA", "VALV.", "W.C", "ANCLAJE"]),
    ("cat-fittings", ["COPLA", "CODO", "NIPLE", "REDUCCION", "CURVA", "ABRAZADERA", "BRONCE", "PVC", "PPR", "SANITAR", "FLEX", "EMPAQUETADURA", "TAPAGORRO", "TAPA GORRO", "BUSHING", "ADAPTADOR", "FUSION", "TAPON", "TERMINAL", "TERM.", "PILETA", "UNION AMERICANA", "CANERIA", "CAÑERIA", "COBRE", "TEE ", "TEE.", "BUJE", "TEFLON", "DESAGUE", "FLAPPER", "MANILLA ESTANQUE", "BOTON ESTANQUE", "GOMA CONICA", "CARTUCHO", "CUERPO #", "SOPORTE CANALETA", "SELLO DE REPUESTO"]),
]


def norm(value: str) -> str:
    text = unicodedata.normalize("NFD", value.upper())
    return "".join(ch for ch in text if unicodedata.category(ch) != "Mn")


def code_str(value) -> str:
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, int):
        return str(value)
    return str(value).strip()


def peso(value) -> int:
    return int(round(float(value)))


def slugify(value: str) -> str:
    text = unicodedata.normalize("NFD", value)
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return text


def classify(description: str) -> str:
    folded = norm(description)
    for category_id, keys in RULES:
        if any(key in folded for key in keys):
            return category_id
    return "cat-varios"


def main() -> None:
    wb = openpyxl.load_workbook(SOURCE, data_only=True)
    chosen = {}
    todo = wb["Todo"]
    for index, row in enumerate(todo.iter_rows(values_only=True), 1):
        if index == 1 or row[0] is None or row[7] is None:
            continue
        chosen[code_str(row[0])] = row[7]

    items = []
    skipped = []
    for supplier in SUPPLIERS:
        ws = wb[supplier]
        headers = [cell.value for cell in next(ws.iter_rows(min_row=1, max_row=1))]
        url_idx = next((i for i, header in enumerate(headers) if header and "URL" in str(header)), None)
        for index, row in enumerate(ws.iter_rows(values_only=True), 1):
            if index == 1 or not row[1] or row[2] is None:
                continue
            name = re.sub(r"\s+", " ", str(row[1]).strip())
            if norm(name).startswith("FLETE "):
                skipped.append((supplier, name))
                continue
            code = code_str(row[0])
            net = peso(row[2])
            gross = peso(row[3])
            f2, f3, f4 = peso(row[4]), peso(row[5]), peso(row[6])
            note = None
            sale = f3
            factor = "3"
            picked = False
            if supplier == "Coproad" and code in chosen and isinstance(chosen[code], (int, float)):
                sale = peso(chosen[code])
                picked = True
                factor = "especial"
                for label, candidate in (("2", f2), ("3", f3), ("4", f4)):
                    if abs(sale - candidate) <= 2:
                        factor = label
                        sale = candidate
                        break
            extra = row[7] if len(row) > 7 else None
            if supplier == "Fibraplax" and isinstance(extra, (int, float)):
                sale = peso(extra)
                factor = "manual"
                picked = True
            elif supplier == "Fibraplax" and isinstance(extra, str) and extra.strip():
                note = extra.strip()
            image = None
            if url_idx is not None and len(row) > url_idx and isinstance(row[url_idx], str) and row[url_idx].startswith("http"):
                image = row[url_idx].strip()
            items.append({
                "id": slugify(f"{supplier}-{code}"),
                "supplier": supplier,
                "supplierCode": code,
                "name": name,
                "slug": slugify(f"{supplier}-{code}-{name}")[:80],
                "categoryId": classify(name),
                "costNet": net,
                "costWithTax": gross,
                "priceF2": f2,
                "priceF3": f3,
                "priceF4": f4,
                "salePrice": sale,
                "saleFactor": factor,
                "saleChosen": picked,
                "note": note,
                "imageUrl": image,
            })

    seen = {}
    for item in items:
        base = item["slug"]
        if base in seen:
            item["slug"] = f"{base}-{item['supplierCode'].lower()}"
        seen[item["slug"]] = True

    counts = {}
    for item in items:
        counts[item["categoryId"]] = counts.get(item["categoryId"], 0) + 1
    print("items", len(items), "skipped", skipped)
    for category_id, _name, _slug, _parent in CATEGORIES:
        print(f"  {counts.get(category_id, 0):4} {category_id}")
    varios = [item for item in items if item["categoryId"] == "cat-varios"]
    for item in varios:
        print("  VARIOS", item["supplier"], item["name"])

    categories = [
        {"id": cid, "name": name, "slug": slug, "parentId": parent}
        for cid, name, slug, parent in CATEGORIES
    ]
    body = {
        "categories": categories,
        "items": items,
    }
    text = (
        "/* Generado por scripts/import-inventory.py desde Ferrcal-Inventario-Comparativa.xlsx. */\n"
        "export type SaleFactor = \"2\" | \"3\" | \"4\" | \"manual\" | \"especial\";\n\n"
        "export type InventoryItem = {\n"
        "  id: string;\n"
        "  supplier: string;\n"
        "  supplierCode: string;\n"
        "  name: string;\n"
        "  slug: string;\n"
        "  categoryId: string;\n"
        "  /** Costo del proveedor, sin IVA. No se publica en la tienda. */\n"
        "  costNet: number;\n"
        "  costWithTax: number;\n"
        "  priceF2: number;\n"
        "  priceF3: number;\n"
        "  priceF4: number;\n"
        "  salePrice: number;\n"
        "  saleFactor: SaleFactor;\n"
        "  saleChosen: boolean;\n"
        "  note: string | null;\n"
        "  imageUrl: string | null;\n"
        "};\n\n"
        "export type InventoryCategory = {\n"
        "  id: string;\n"
        "  name: string;\n"
        "  slug: string;\n"
        "  parentId: string | null;\n"
        "};\n\n"
        f"export const categories: InventoryCategory[] = {json.dumps(categories, ensure_ascii=False, indent=2)};\n\n"
        f"export const items: InventoryItem[] = {json.dumps(items, ensure_ascii=False, indent=2)};\n"
    )
    TARGET.write_text(text, encoding="utf-8")
    data_path = ROOT / "calipso" / "data" / "catalog.json"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(json.dumps({"categories": categories, "items": items}, ensure_ascii=False), encoding="utf-8")
    print("wrote", TARGET, "bytes", TARGET.stat().st_size)
    print("wrote", data_path, "bytes", data_path.stat().st_size)


if __name__ == "__main__":
    main()
