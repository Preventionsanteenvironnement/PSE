/* Mots du module D2 CAP — Le budget.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Le budget (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation */
window.MOTS = {
 "module": "D2",
 "classe": "CAP",
 "titre": "Le budget",
 "retour": "cap_D2_jeux.html",
 "cle": "CAPD2",
 "seances": {
  "1": "Les recettes et les dépenses",
  "2": "L'équilibre du budget et l'épargne",
  "3": "Le crédit et le surendettement"
 },
 "familles": [
  {
   "l": "Les revenus sociaux",
   "m": [
    "PRIME D'ACTIVITÉ",
    "AIDE AU LOGEMENT",
    "ALLOCATIONS"
   ]
  },
  {
   "l": "Les dépenses incompressibles",
   "m": [
    "LOYER",
    "MUTUELLE",
    "ABONNEMENTS"
   ]
  },
  {
   "l": "Les dépenses courantes",
   "m": [
    "ALIMENTATION",
    "TRANSPORT",
    "HYGIÈNE"
   ]
  },
  {
   "l": "Les dépenses occasionnelles",
   "m": [
    "VÊTEMENTS",
    "LOISIRS",
    "CADEAUX",
    "RÉPARATIONS"
   ]
  },
  {
   "l": "Les trois états d'un budget",
   "m": [
    "ÉQUILIBRÉ",
    "EXCÉDENTAIRE",
    "DÉFICITAIRE"
   ]
  },
  {
   "l": "Les éléments d'une offre de crédit",
   "m": [
    "MENSUALITÉ",
    "DURÉE",
    "TAEG"
   ]
  }
 ],
 "liste": [
  {
   "m": "BUDGET",
   "s": 1,
   "d": "Document qui met en regard les recettes et les dépenses d'un mois.",
   "e": "Il permet de savoir s'il reste de l'argent ou s'il en manque.",
   "x": "Dans la situation : Lina ne sait pas si elle peut supporter ce crédit."
  },
  {
   "m": "RECETTES",
   "s": 1,
   "d": "Argent qui entre chaque mois : salaire, primes, revenus sociaux.",
   "e": "Celles de Lina s'élèvent à 1 600 € par mois.",
   "x": "Dans la situation : salaire de 1 380 €, prime d'activité de 150 €, aide au logement de 70 €."
  },
  {
   "m": "SALAIRE",
   "s": 1,
   "d": "Revenu lié au travail versé par l'employeur ; 1 380 € net pour Lina.",
   "e": "Avec les primes, c'est un revenu lié au travail.",
   "x": "Dans la situation : Lina reçoit 1 380 € net chaque mois."
  },
  {
   "m": "REVENUS SOCIAUX",
   "s": 1,
   "d": "Sommes versées par un organisme : prime d'activité, aide au logement, allocations.",
   "e": "Ils se distinguent des revenus liés au travail, versés par l'employeur."
  },
  {
   "m": "PRIME D'ACTIVITÉ",
   "s": 1,
   "d": "Revenu social de 150 € par mois reçu par Lina.",
   "e": "Elle est versée par un organisme : c'est un revenu social, pas un revenu lié au travail."
  },
  {
   "m": "AIDE AU LOGEMENT",
   "s": 1,
   "d": "Revenu social de 70 € par mois versé à Lina.",
   "e": "Elle est versée par un organisme : c'est un revenu social."
  },
  {
   "m": "ALLOCATIONS",
   "s": 1,
   "d": "Sommes versées par un organisme, comptées parmi les revenus sociaux.",
   "e": "Comme la prime d'activité et l'aide au logement, ce sont des revenus sociaux."
  },
  {
   "m": "DÉPENSE INCOMPRESSIBLE",
   "s": 1,
   "d": "Somme fixée à l'avance, souvent par un contrat, difficile à réduire.",
   "e": "Exemples : loyer et charges, assurances, mutuelle, abonnements, remboursements de crédit."
  },
  {
   "m": "DÉPENSE COURANTE",
   "s": 1,
   "d": "Somme payée chaque mois dont le montant change : alimentation, transport, hygiène.",
   "e": "Elle peut baisser dès le mois suivant."
  },
  {
   "m": "DÉPENSE OCCASIONNELLE",
   "s": 1,
   "d": "Somme qui n'est pas à payer tous les mois : vêtements, loisirs, cadeaux, réparations.",
   "e": "Elle peut baisser dès le mois suivant."
  },
  {
   "m": "LOYER",
   "s": 1,
   "d": "Somme payée chaque mois pour le logement ; avec les charges, 520 € pour Lina.",
   "e": "Fixé par un contrat, c'est une dépense incompressible."
  },
  {
   "m": "MUTUELLE",
   "s": 1,
   "d": "Dépense incompressible de 30 € par mois dans le budget de Lina.",
   "e": "Elle est fixée par un contrat : elle se réduit difficilement."
  },
  {
   "m": "ABONNEMENTS",
   "s": 1,
   "d": "Dépenses incompressibles fixées par un contrat, comme le forfait téléphone.",
   "e": "Le forfait téléphone de Lina coûte 25 € par mois."
  },
  {
   "m": "ALIMENTATION",
   "s": 1,
   "d": "Dépense courante de 300 € par mois pour Lina.",
   "e": "Elle revient chaque mois, mais son montant change."
  },
  {
   "m": "TRANSPORT",
   "s": 1,
   "d": "Dépense courante ; pour Lina, le bus coûte 40 € par mois.",
   "e": "Il revient chaque mois, mais son montant change."
  },
  {
   "m": "HYGIÈNE",
   "s": 1,
   "d": "Dépense courante ; avec l'entretien, 40 € par mois pour Lina.",
   "e": "Elle revient chaque mois, mais son montant change."
  },
  {
   "m": "VÊTEMENTS",
   "s": 1,
   "d": "Dépense occasionnelle ; 60 € ce mois-ci pour Lina.",
   "e": "Un jean est une dépense occasionnelle : elle n'arrive pas tous les mois."
  },
  {
   "m": "LOISIRS",
   "s": 1,
   "d": "Dépense occasionnelle de 100 € dans le budget du mois de Lina.",
   "e": "Elle n'arrive pas tous les mois."
  },
  {
   "m": "CADEAUX",
   "s": 1,
   "d": "Dépense occasionnelle, comme un présent d'anniversaire.",
   "e": "Elle n'arrive pas tous les mois."
  },
  {
   "m": "RÉPARATIONS",
   "s": 1,
   "d": "Dépenses occasionnelles qui arrivent après une panne.",
   "e": "Elles n'arrivent pas tous les mois ; l'épargne de précaution permet de les payer."
  },
  {
   "m": "SOLDE",
   "s": 2,
   "d": "Résultat du calcul recettes moins dépenses.",
   "e": "Celui de Lina : 1 600 − 1 227 = 373 €."
  },
  {
   "m": "ÉQUILIBRÉ",
   "s": 2,
   "d": "Se dit d'un budget dont le solde est nul.",
   "e": "Les recettes et les dépenses sont égales."
  },
  {
   "m": "EXCÉDENTAIRE",
   "s": 2,
   "d": "Se dit d'un budget dont le solde est positif : il reste de l'argent.",
   "e": "Le budget de Lina, avec un solde de 373 €, l'est."
  },
  {
   "m": "DÉFICITAIRE",
   "s": 2,
   "d": "Se dit d'un budget dont le solde est négatif : il manque de l'argent.",
   "e": "Les dépenses dépassent les recettes."
  },
  {
   "m": "ÉPARGNE DE PRÉCAUTION",
   "s": 2,
   "d": "Somme mise de côté pour les imprévus : de 2 à 6 mois de revenus, le plus souvent 3.",
   "e": "Elle est placée sur un livret disponible à tout moment, comme le Livret A.",
   "x": "Dans la situation : Lina verse 100 € par mois sur son Livret A."
  },
  {
   "m": "LIVRET A",
   "s": 2,
   "d": "Placement disponible à tout moment, rémunéré à 1,7 % par an depuis le 1er août 2026.",
   "e": "1 000 € placés toute l'année à ce taux rapportent 17 € d'intérêts.",
   "x": "Dans la situation : Lina n'a encore que 400 € sur son Livret A."
  },
  {
   "m": "IMPRÉVUS",
   "s": 2,
   "d": "Événements non attendus : panne, réparation, frais de santé.",
   "e": "L'épargne de précaution sert à les payer sans emprunter."
  },
  {
   "m": "CRÉDIT",
   "s": 3,
   "d": "Somme empruntée à un prêteur, remboursée chaque mois avec des intérêts et des frais.",
   "e": "Il permet d'acheter tout de suite, mais il a un coût.",
   "x": "Dans la situation : le vendeur propose un crédit à Lina pour la voiture."
  },
  {
   "m": "PRÊTEUR",
   "s": 3,
   "d": "Celui qui avance l'argent ; il remet une fiche d'information avant la signature.",
   "e": "Il vérifie que l'emprunteur peut rembourser."
  },
  {
   "m": "EMPRUNTEUR",
   "s": 3,
   "d": "Personne qui reçoit l'argent prêté et le rembourse.",
   "e": "Après la signature, il a 14 jours pour changer d'avis."
  },
  {
   "m": "MENSUALITÉ",
   "s": 3,
   "d": "Somme remboursée chaque mois au prêteur ; 188 € dans l'offre faite à Lina.",
   "e": "La somme de toutes les mensualités donne le montant total remboursé : 6 768 €."
  },
  {
   "m": "DURÉE",
   "s": 3,
   "d": "Temps fixé pour rembourser ; 36 mois dans l'offre du vendeur.",
   "e": "Elle figure sur la fiche d'information remise avant de signer."
  },
  {
   "m": "TAEG",
   "s": 3,
   "d": "Sigle du taux qui donne le coût complet du crédit : intérêts, frais, assurance exigée.",
   "e": "Taux annuel effectif global : 8,3 % dans l'offre du vendeur. Il ne peut pas dépasser le taux maximal fixé par la Banque de France."
  },
  {
   "m": "INTÉRÊTS",
   "s": 3,
   "d": "Prix payé au prêteur pour l'argent emprunté.",
   "e": "Avec les frais, ils forment le coût du crédit : 768 € dans l'offre faite à Lina."
  },
  {
   "m": "FICHE D'INFORMATION",
   "s": 3,
   "d": "Document remis avant de signer : montant, durée, mensualités, TAEG, coût total.",
   "e": "Le prêteur la remet avant la signature et vérifie que l'emprunteur peut rembourser."
  },
  {
   "m": "RÉTRACTATION",
   "s": 3,
   "d": "Droit de renoncer au crédit dans les 14 jours après la signature.",
   "e": "Si Lina change d'avis dix jours après avoir signé, elle peut encore renoncer."
  },
  {
   "m": "SURENDETTEMENT",
   "s": 3,
   "d": "Situation d'une personne qui ne peut plus rembourser ses dettes.",
   "e": "Elle peut déposer gratuitement un dossier auprès de la Banque de France."
  },
  {
   "m": "DETTES",
   "s": 3,
   "d": "Sommes que l'on doit encore rembourser.",
   "e": "Quand on ne peut plus les rembourser, on est en surendettement."
  },
  {
   "m": "BANQUE DE FRANCE",
   "s": 3,
   "d": "Organisme auprès duquel on dépose gratuitement un dossier quand on ne peut plus rembourser ses dettes.",
   "e": "Elle fixe aussi le taux maximal que le TAEG ne peut pas dépasser."
  },
  {
   "m": "APPORT",
   "s": 3,
   "d": "Somme épargnée, versée au départ pour emprunter moins.",
   "e": "Épargner quelques mois permet de le verser et d'emprunter moins."
  }
 ]
};
