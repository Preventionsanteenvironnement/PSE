#!/usr/bin/env python3
"""Genere images/banque_modules.json : catalogue des images reelles du site PSE,
regroupees par module, avec URL absolue (https://mapse.fr/...).

Pour regenerer apres ajout d'images :
    cd PSE && python3 images/build_banque_modules.py

Le champ 'description' de chaque image est laisse vide : il est rempli
module par module (manuellement ou via Claude) pour alimenter le prompt IA
des evaluations.
"""
import os, json, datetime

# Racine du depot PSE = dossier parent de ce script (images/..)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE_URL = "https://mapse.fr/"
EXTS = (".jpg", ".jpeg", ".png", ".webp")

LABELS = {
    "C1": "C1 — Le contrat de travail / droits et obligations",
    "C2": "C2 — Analyse d'une situation de travail",
    "C3": "C3 — Module C3",
    "C4": "C4 — Module C4",
    "C7": "C7 — Module C7",
    "C9_RPS": "C9 — Risques psychosociaux (RPS)",
    "C11": "C11 — Module C11",
    "C12": "C12 — Module C12",
    "A5": "A5 — Module A5",
    "A9": "A9 — Sécurité sanitaire / alimentaire",
    "B1": "B1 — Module B1",
    "B3": "B3 — Bruit / système auditif",
    "B5": "B5 — Énergie / activité physique au travail",
    "CAP_A6": "CAP A6 — Module A6 (CAP)",
    "D2_BUDGET": "D2 — Budget / crédit / consommation",
    "A7_ALIMENTATION": "A7 — Alimentation adaptée / besoins nutritionnels",
    "MA5_REPRO": "MA5 — Sexualité, contraception, reproduction",
    "SECURITE_PICTOGRAMMES": "Transversal — Pictogrammes sécurité (danger / obligation EPI / secours)",
    "ACTEURS_PREVENTION": "Transversal — Acteurs de la prévention",
    "RESSOURCES_ECO": "PSR — Ressources économie/cuisine (aliments, hygiène, marche en avant)",
    "DIVERS_DEVOIRS": "Divers — Images utilisées dans les devoirs",
    "A_CLASSER": "À classer — images du dossier central non rattachées",
    "AUTRES": "Autres dossiers",
}

def module_for(relpath):
    p = relpath.replace("\\", "/")
    top = p.split("/")[0]
    fname = os.path.basename(p).lower()
    folder_map = {
        "bacproC2": "C2", "C1": "C1", "C4": "C4", "B1": "B1", "B3": "B3",
        "B5": "B5", "A5": "A5", "CAPA6": "CAP_A6", "module_C7": "C7",
        "moduleC11": "C11", "bcp_1ere_C3": "C3", "bcp_term_C9": "C9_RPS",
        "bcp_term_C12": "C12", "bcp_term_A9": "A9", "imagesrps": "C9_RPS",
        "pictogrammes": "SECURITE_PICTOGRAMMES",
        "flashcard_acteur_prevention": "ACTEURS_PREVENTION",
    }
    if top in folder_map:
        return folder_map[top]
    if top == "psr":
        return "RESSOURCES_ECO"
    if top == "devoirs":
        return "DIVERS_DEVOIRS"
    if top == "images":
        if fname.startswith("c1_"):
            return "C1"
        if fname.startswith("doc_b_"):
            return "A7_ALIMENTATION"
        if any(fname.startswith(x) for x in ("anatomie", "gamete", "fecondation", "shema_oreille")):
            return "MA5_REPRO"
        if any(k in fname for k in ("credit", "depense", "recette", "taux", "budget", "quentin", "organisme", "endett")):
            return "D2_BUDGET"
        if any(k in fname for k in ("petit_dej", "gouter", "diner", "camenbert", "aliment", "repas")):
            return "A7_ALIMENTATION"
        return "A_CLASSER"
    return "AUTRES"

def main():
    modules, total = {}, 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        if os.sep + ".git" in dirpath:
            continue
        for fn in filenames:
            if fn.lower().endswith(EXTS):
                rel = os.path.relpath(os.path.join(dirpath, fn), ROOT).replace("\\", "/")
                key = module_for(rel)
                modules.setdefault(key, []).append({
                    "path": rel, "url": BASE_URL + rel, "description": ""
                })
                total += 1

    # Conserve les descriptions deja saisies si le fichier existe
    dest = os.path.join(ROOT, "images", "banque_modules.json")
    old_desc = {}
    if os.path.exists(dest):
        try:
            prev = json.load(open(dest, encoding="utf-8"))
            for mod in prev.get("modules", {}).values():
                for im in mod.get("images", []):
                    if im.get("description"):
                        old_desc[im["path"]] = im["description"]
        except Exception:
            pass

    out_modules = {}
    for key in sorted(modules.keys()):
        imgs = sorted(modules[key], key=lambda x: x["path"])
        for im in imgs:
            if im["path"] in old_desc:
                im["description"] = old_desc[im["path"]]
        out_modules[key] = {"label": LABELS.get(key, key), "count": len(imgs), "images": imgs}

    catalog = {
        "_meta": {
            "base_url": BASE_URL,
            "generated": datetime.datetime.now().isoformat(timespec="seconds"),
            "total": total,
            "note": "Catalogue auto-genere des images reelles du site PSE, regroupees par module. "
                    "Champ 'description' a remplir module par module pour le prompt IA des evaluations. "
                    "Les descriptions deja saisies sont conservees a la regeneration."
        },
        "modules": out_modules
    }
    with open(dest, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
    print("OK ->", dest, "| total:", total)

if __name__ == "__main__":
    main()
