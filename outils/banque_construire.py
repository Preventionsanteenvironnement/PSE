#!/usr/bin/env python3
"""Banque d'exercices de mapse.fr : vérifie les fichiers et reconstruit la liste.

Chaque exercice est un fichier banque/exercices/<id>.json (réglages + contenu).
Ce script vérifie chaque fichier puis écrit banque/index.json : la liste légère
des exercices publiés (tous les réglages, sans le contenu), lue par exercices.html.
Le contenu d'un exercice n'est chargé qu'à son ouverture.

Usage : python3 outils/banque_construire.py           (vérifie et reconstruit)
        python3 outils/banque_construire.py --verifier (vérifie seulement, échoue si l'index n'est pas à jour)
"""
import json, os, re, sys, glob

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOSSIER = os.path.join(RACINE, 'banque', 'exercices')
INDEX = os.path.join(RACINE, 'banque', 'index.json')
OBLIGATOIRES = {'id': str, 'titre': str, 'type': str, 'publie': bool, 'difficulte': str,
                'classeIds': list, 'contenu': dict}
FACULTATIFS = {'niveau': str, 'moduleId': str, 'dossier': str, 'sous_dossier': str}  # null accepté (exercices transversaux)
INTERDITS = ('sourcePrompt',)  # consignes de conception : jamais dans les fichiers publics
DIFFICULTES = ('facile', 'moyen', 'difficile')


def lire_exercices():
    erreurs, exos = [], []
    for chemin in sorted(glob.glob(os.path.join(DOSSIER, '*.json'))):
        nom = os.path.basename(chemin)
        try:
            with open(chemin, encoding='utf-8') as f:
                e = json.load(f)
        except ValueError as err:
            erreurs.append(f'{nom} : JSON illisible ({err})')
            continue
        for cle, typ in OBLIGATOIRES.items():
            if not isinstance(e.get(cle), typ):
                erreurs.append(f'{nom} : champ « {cle} » manquant ou invalide')
        for cle, typ in FACULTATIFS.items():
            if e.get(cle) is not None and not isinstance(e.get(cle), typ):
                erreurs.append(f'{nom} : champ « {cle} » invalide')
        for cle in INTERDITS:
            if cle in e:
                erreurs.append(f'{nom} : champ « {cle} » interdit dans un fichier public')
        if e.get('id') != nom[:-5]:
            erreurs.append(f'{nom} : l\'id doit être identique au nom du fichier')
        if not re.fullmatch(r'[A-Za-z0-9_-]+', nom[:-5]):
            erreurs.append(f'{nom} : nom de fichier limité à lettres, chiffres, _ et -')
        if e.get('difficulte') not in DIFFICULTES:
            erreurs.append(f'{nom} : difficulte doit valoir {", ".join(DIFFICULTES)}')
        exos.append(e)
    return exos, erreurs


def construire_index(exos):
    publies = [{k: v for k, v in e.items() if k != 'contenu'} for e in exos if e.get('publie') is True]
    publies.sort(key=lambda e: (e.get('updatedAt') or '', e['id']), reverse=True)
    return json.dumps(publies, ensure_ascii=False, separators=(',', ':')) + '\n'


def main():
    exos, erreurs = lire_exercices()
    if erreurs:
        print('\n'.join(erreurs))
        sys.exit(1)
    texte = construire_index(exos)
    if '--verifier' in sys.argv:
        actuel = open(INDEX, encoding='utf-8').read() if os.path.exists(INDEX) else ''
        if actuel != texte:
            print('banque/index.json n\'est pas à jour : lancer python3 outils/banque_construire.py')
            sys.exit(1)
        print(f'{len(exos)} fichiers vérifiés, index à jour')
        return
    with open(INDEX, 'w', encoding='utf-8') as f:
        f.write(texte)
    print(f'{len(exos)} fichiers vérifiés, {texte.count(chr(123)+chr(34)+"id")} exercices publiés dans banque/index.json')


if __name__ == '__main__':
    main()
