/* Mots du module C6 CAP — Les acteurs et les organismes de la prévention.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Les acteurs et les organismes de la prévention v2.2 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Kévin */
window.MOTS = {
  module: "C6", classe: "CAP", titre: "Les acteurs et les organismes de la prévention", retour: "cap_C6_jeux.html", cle: "CAPC6",
  seances: { 1: "Les acteurs internes de prévention", 2: "Les autres acteurs et organismes" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Les acteurs internes de la prévention", m: ["EMPLOYEUR", "SALARIÉ", "PPRP", "SST", "CSE"] },
    { l: "Les autres acteurs et organismes de prévention", m: ["SPST", "INSPECTION DU TRAVAIL", "CARSAT"] },
    { l: "Le sauveteur secouriste du travail (SST)", m: ["SECOURS", "VICTIME", "MALAISE"] },
    { l: "Le comité social et économique (CSE)", m: ["DÉLÉGATION", "RÉCLAMATIONS", "DROIT D'ALERTE"] },
    { l: "L'équipe pluridisciplinaire du SPST", m: ["MÉDECIN DU TRAVAIL", "INFIRMIER", "IPRP"] },
    { l: "L'inspection du travail", m: ["INFRACTION", "MÉDIATEUR", "AGENT DE CONTRÔLE", "ARRÊT TEMPORAIRE"] },
    { l: "La Caisse d'assurance retraite et de la santé au travail (Carsat)", m: ["AIDES FINANCIÈRES", "INJONCTION", "INGÉNIEUR-CONSEIL"] }
  ],
  liste: [
    { m: "PRÉVENTION", s: 1, d: "Ensemble des actions menées dans l'entreprise pour éviter les accidents du travail et les maladies professionnelles.", e: "Tous les acteurs, internes et externes, agissent ensemble pour la santé et la sécurité au travail." },
    { m: "ACTEUR INTERNE", s: 1, d: "Personne ou instance de prévention qui travaille dans l'entreprise.", e: "Exemples : l'employeur, le salarié, le salarié compétent (PPRP), le CSE, le SST." },
    { m: "EMPLOYEUR", s: 1, d: "Responsable de la santé et de la sécurité des salariés : il organise la prévention et met en place les moyens nécessaires.", e: "Il désigne le salarié compétent et préside le CSE.", x: "Dans la situation : c'est à lui, ou à son représentant, que Kévin signale le sol glissant ; il peut le faire supprimer." },
    { m: "SALARIÉ", s: 1, d: "Personne qui travaille pour un employeur, respecte les consignes de sécurité et participe à la prévention.", e: "Il n'est pas seulement protégé : il est lui aussi un acteur interne de la prévention.", x: "Dans la situation : Kévin, 22 ans, mécanicien automobile depuis trois mois." },
    { m: "CONSIGNES DE SÉCURITÉ", s: 1, d: "Règles que le salarié respecte pour participer à la prévention.", e: "Les respecter est le rôle du salarié ; l'employeur, lui, organise la prévention." },
    { m: "SALARIÉ COMPÉTENT", s: 1, d: "Personne de l'entreprise désignée par l'employeur pour s'occuper de la protection et de la prévention des risques professionnels.", e: "Tout employeur doit en désigner un ou plusieurs (article L. 4644-1 du Code du travail). On l'appelle aussi PPRP." },
    { m: "PPRP", s: 1, d: "Sigle donné à la personne de l'entreprise que l'employeur désigne pour l'aider face aux risques du travail.", e: "Il participe à l'évaluation des risques, aide à mettre en place des actions de prévention et suit leur mise en œuvre." },
    { m: "RISQUES PROFESSIONNELS", s: 1, d: "Ce que le salarié compétent aide l'employeur à prévenir.", e: "Le salarié compétent et le SST agissent avec l'employeur pour les prévenir." },
    { m: "SST", s: 1, d: "Sigle du salarié formé pour intervenir en cas d'accident ou de malaise et repérer les situations dangereuses.", e: "Sauveteur secouriste du travail. Sa formation a deux dimensions : la prévention des risques professionnels et le secours aux victimes." },
    { m: "SECOURS", s: 1, d: "Une des deux dimensions de la formation du SST, tournée vers les victimes.", e: "L'autre dimension est la prévention des risques professionnels." },
    { m: "VICTIME", s: 1, d: "Personne à qui le SST porte les premiers soins après un accident ou un malaise.", e: "Le SST lui porte les premiers secours sur le lieu de travail." },
    { m: "MALAISE", s: 1, d: "Problème de santé soudain sur le lieu de travail, pour lequel le SST est formé à intervenir.", e: "Le SST intervient en cas d'accident ou de malaise sur le lieu de travail." },
    { m: "SITUATION DANGEREUSE", s: 1, d: "Ce que le SST repère pour la faire corriger avant qu'un accident se produise.", e: "La repérer permet de la faire corriger avant un accident : c'est de la prévention.", x: "Dans la situation : l'huile répandue autour du pont élévateur rend le sol glissant." },
    { m: "CSE", s: 1, d: "Sigle de l'instance unique de représentation du personnel, obligatoire dès 11 salariés pendant 12 mois consécutifs.", e: "Comité social et économique. Il est présidé par l'employeur et comprend une délégation du personnel élue par les salariés.", x: "Dans la situation : le garage emploie vingt-quatre salariés depuis plusieurs années : il doit en avoir un." },
    { m: "REPRÉSENTATION", s: 1, d: "Rôle du CSE : parler au nom du personnel dans l'entreprise.", e: "Le CSE en est l'instance unique dans l'entreprise." },
    { m: "DÉLÉGATION", s: 1, d: "Groupe élu par les salariés qui compose le CSE avec l'employeur.", e: "L'employeur préside le CSE ; la délégation du personnel y représente les salariés." },
    { m: "RÉCLAMATIONS", s: 1, d: "Demandes des salariés que le CSE présente.", e: "Les présenter est l'une des trois missions du CSE en santé et sécurité au travail." },
    { m: "ENQUÊTE", s: 1, d: "Recherche que le CSE réalise après un accident du travail.", e: "C'est l'une des missions du CSE ; les agents de contrôle de l'inspection du travail en mènent aussi." },
    { m: "DROIT D'ALERTE", s: 1, d: "Pouvoir d'un membre du CSE de saisir immédiatement l'employeur face à un danger grave et imminent.", e: "Il permet d'agir vite, avant qu'un accident se produise." },
    { m: "DANGER GRAVE ET IMMINENT", s: 1, d: "Menace sérieuse et immédiate pour un travailleur.", e: "Le CSE alerte alors l'employeur ; l'agent de contrôle de l'inspection peut décider l'arrêt temporaire de l'activité." },
    { m: "PLAINTES", s: 1, d: "Ce que le CSE peut transmettre à l'inspection du travail, avec ses observations.", e: "Le CSE peut saisir l'inspection du travail sur l'application du droit du travail." },

    { m: "ACTEUR EXTERNE", s: 2, d: "Personne ou organisme de prévention qui intervient depuis le dehors de l'entreprise.", e: "Exemples : le SPST, l'inspection du travail, la Carsat. Ils conseillent, contrôlent et accompagnent." },
    { m: "SPST", s: 2, d: "Sigle de l'organisme animé par le médecin du travail, qui suit les travailleurs et conseille l'employeur.", e: "Service de prévention et de santé au travail : il peut être autonome ou interentreprises." },
    { m: "AUTONOME", s: 2, d: "Se dit du SPST propre à une seule entreprise.", e: "Le SPST est soit propre à l'entreprise, soit commun à plusieurs entreprises (interentreprises)." },
    { m: "INTERENTREPRISES", s: 2, d: "Se dit du SPST commun à plusieurs sociétés.", e: "Il s'oppose au service autonome, propre à une seule entreprise." },
    { m: "ALTÉRATION", s: 2, d: "Dégradation de la santé des travailleurs du fait de leur travail, que le SPST doit éviter.", e: "Éviter toute dégradation de ce type est la mission du SPST (article L. 4622-2 du Code du travail)." },
    { m: "SUIVI", s: 2, d: "Ce que le SPST assure pour l'état de santé des travailleurs.", e: "Exemple : un salarié qui reprend le travail après un arrêt de trois mois revoit un professionnel de santé." },
    { m: "TRAÇABILITÉ", s: 2, d: "Garder la trace des expositions professionnelles : le SPST y participe.", e: "C'est l'une des missions du SPST, avec le conseil, les actions de prévention et le suivi de l'état de santé." },
    { m: "PLURIDISCIPLINAIRE", s: 2, d: "Se dit de l'équipe du SPST, qui réunit plusieurs métiers sous la conduite du médecin du travail.", e: "L'équipe pluridisciplinaire comprend notamment des infirmiers en santé au travail et des IPRP." },
    { m: "MÉDECIN DU TRAVAIL", s: 2, d: "Professionnel de santé qui anime et coordonne l'équipe du SPST.", e: "Il dirige une équipe qui comprend notamment des infirmiers et des IPRP." },
    { m: "INFIRMIER", s: 2, d: "Professionnel de santé au travail qui fait partie de l'équipe du SPST.", e: "Il travaille dans l'équipe animée par le médecin du travail." },
    { m: "IPRP", s: 2, d: "Sigle du spécialiste auquel l'employeur fait appel quand l'entreprise manque de compétences en prévention.", e: "Intervenant en prévention des risques professionnels. Il fait aussi partie de l'équipe du SPST." },
    { m: "INSPECTION DU TRAVAIL", s: 2, d: "Service de l'État qui contrôle le respect des règles dans les entreprises, informe, conseille et constate les infractions.", e: "Elle contrôle la santé, la sécurité, la durée du travail et la représentation du personnel." },
    { m: "AGENT DE CONTRÔLE", s: 2, d: "Membre de l'inspection du travail qui peut entrer dans les établissements pour y mener des enquêtes.", e: "Face à un danger grave et imminent, il peut décider l'arrêt temporaire de travaux ou d'une activité." },
    { m: "INFRACTION", s: 2, d: "Manquement au droit du travail que les agents de contrôle constatent.", e: "Les agents de contrôle ont le droit d'entrer dans les établissements pour les constater." },
    { m: "MÉDIATEUR", s: 2, d: "Rôle que peut jouer l'inspection du travail lors d'un conflit collectif.", e: "L'inspection du travail informe et conseille aussi les employeurs, les salariés et leurs représentants." },
    { m: "ARRÊT TEMPORAIRE", s: 2, d: "Décision de l'agent de contrôle qui retire le travailleur d'une activité exposée à un danger grave et imminent.", e: "Il protège le travailleur d'un accident tant que le danger n'est pas supprimé." },
    { m: "CARSAT", s: 2, d: "Organisme qui conseille et accompagne les entreprises, et peut leur accorder des aides pour la prévention.", e: "Caisse d'assurance retraite et de la santé au travail. Elle agit pour réduire le nombre et la gravité des accidents du travail et des maladies professionnelles." },
    { m: "AIDES FINANCIÈRES", s: 2, d: "Argent que la Carsat peut accorder aux entreprises pour investir dans la prévention.", e: "Exemple : une entreprise qui veut acheter une machine moins bruyante peut s'adresser à la Carsat." },
    { m: "INGÉNIEUR-CONSEIL", s: 2, d: "Spécialiste de la Carsat qui se rend dans les entreprises et peut demander toute mesure de prévention justifiée.", e: "Avec les contrôleurs de sécurité de la Carsat, il peut prononcer une injonction." },
    { m: "INJONCTION", s: 2, d: "Ordre que peuvent prononcer les ingénieurs-conseils et les contrôleurs de sécurité de la Carsat.", e: "Ces spécialistes de la Carsat se rendent dans les entreprises et peuvent demander toute mesure de prévention justifiée." }
  ]
};
