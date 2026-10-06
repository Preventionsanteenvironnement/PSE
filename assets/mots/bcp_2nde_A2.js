/* Mots du module A2 Bac Pro (Seconde) — Les rythmes biologiques, le sommeil.
   Mots écrits avec leurs accents ; le jeu les ignore pour la saisie.
   Source unique : cours Les rythmes biologiques, le sommeil v3.1 (bibliothèque de l'Atelier). Aucun mot hors cours.
   m = mot à trouver · s = séance · d = définition (indice) · e = explication simple · x = repère dans la situation de Noah */
window.MOTS = {
  module: "A2", classe: "2nde Bac Pro", titre: "Les rythmes biologiques, le sommeil", retour: "bcp_2nde_A2_jeux.html", cle: "BP2A2",
  seances: { 1: "Les rythmes biologiques", 2: "Le cycle du sommeil", 3: "Sommeil, rythmes sociaux et travail" },
  /* Familles de notions (jeu de l'intrus) : chaque mot appartient au plus à une famille. */
  familles: [
    { l: "Des exemples de rythmes biologiques", m: ["BATTEMENTS", "RESPIRATION", "CYCLE MENSTRUEL"] },
    { l: "Les stades du sommeil", m: ["SOMMEIL LENT LÉGER", "SOMMEIL LENT PROFOND", "SOMMEIL PARADOXAL"] },
    { l: "Les rôles du sommeil", m: ["RÉCUPÉRATION", "MÉMOIRE", "APPRENTISSAGES"] },
    { l: "Ce que produit la désynchronisation", m: ["SOMNOLENCE", "TROUBLES DIGESTIFS", "ACCIDENTS"] },
    { l: "Les protections du travailleur de nuit", m: ["REPOS QUOTIDIEN", "REPOS COMPENSATEUR", "VISITE D'INFORMATION", "PRIORITÉ"] },
    { l: "Les mesures d'hygiène du sommeil", m: ["VOLETS", "REPAS LÉGER", "HEURES RÉGULIÈRES"] }
  ],
  liste: [
    { m: "RYTHME BIOLOGIQUE", s: 1, d: "Variation régulière d'une fonction de l'organisme, qui revient à l'identique au bout d'une durée à peu près constante.", e: "Les battements du cœur, la respiration, l'alternance veille-sommeil et le cycle menstruel en sont des exemples." },
    { m: "CYCLE", s: 1, d: "Suite de phénomènes qui se répète, du début d'une variation au début de la suivante.", e: "Un cycle respiratoire dure 4 secondes chez un adulte au repos ; celui de l'alternance veille-sommeil, environ 24 heures." },
    { m: "FRÉQUENCE", s: 1, d: "Nombre de répétitions dans un temps donné : par minute, par jour ou par mois.", e: "Elle se calcule à partir de la durée d'un cycle : 60 ÷ 4 = 15 cycles respiratoires par minute." },
    { m: "RYTHME CIRCADIEN", s: 1, d: "Variation régulière de l'organisme dont un tour complet dure environ 24 heures.", e: "L'alternance veille-sommeil en est l'exemple type : un cycle par jour.", x: "C'est ce rythme qui est perturbé chez Noah." },
    { m: "HORLOGE BIOLOGIQUE", s: 1, d: "Partie du cerveau qui règle l'heure des rythmes sur 24 heures.", e: "Prévenue par l'œil, elle tient compte de la lumière : c'est elle qui règle l'heure du sommeil." },
    { m: "VEILLE", s: 1, d: "État d'activité éveillée qui alterne avec le sommeil sur 24 heures environ.", e: "L'alternance entre cet état et le sommeil forme un rythme circadien : un cycle par jour." },
    { m: "CERVEAU", s: 1, d: "Organe où se trouve l'horloge qui règle les rythmes sur 24 heures.", e: "Il reçoit l'information de la lumière par l'œil ; une de ses glandes produit la mélatonine." },
    { m: "ORGANISME", s: 1, d: "Ensemble du corps dont les fonctions varient de façon régulière.", e: "Un rythme biologique est la variation régulière d'une de ses fonctions : cœur, respiration, veille et sommeil." },
    { m: "BATTEMENTS", s: 1, d: "Rythme du cœur : un cycle dure environ 1 seconde, soit 60 par minute environ.", e: "Ils forment un rythme biologique très court, à l'opposé du cycle menstruel, qui dure environ 28 jours." },
    { m: "RESPIRATION", s: 1, d: "Rythme biologique dont un cycle dure 4 secondes chez un adulte au repos.", e: "Le même cycle se répète toujours pendant la même durée : 15 cycles par minute." },
    { m: "INSPIRATION", s: 1, d: "Temps du cycle où le volume d'air dans les poumons augmente.", e: "Sur le graphique, la courbe monte ; elle redescend pendant l'expiration." },
    { m: "EXPIRATION", s: 1, d: "Temps du cycle où le volume d'air dans les poumons diminue.", e: "Sur le graphique, la courbe descend ; elle remonte pendant l'inspiration." },
    { m: "CYCLE MENSTRUEL", s: 1, d: "Rythme biologique d'environ 28 jours : environ une fois par mois.", e: "C'est un rythme long ; la respiration et les battements du cœur sont des rythmes courts." },

    { m: "CYCLE DE SOMMEIL", s: 2, d: "Suite de stades qui dure environ 90 minutes et se répète toute la nuit.", e: "Une nuit de 7 h 30 en compte cinq. Les cycles se suivent sans que le dormeur s'en aperçoive.", x: "En cinq heures, Noah ne fait que 3 cycles complets." },
    { m: "SOMMEIL LENT LÉGER", s: 2, d: "Stade où le réveil reste assez facile.", e: "Il revient au début et au milieu de chaque cycle, autour des autres stades." },
    { m: "SOMMEIL LENT PROFOND", s: 2, d: "Stade surtout présent en début de nuit, où le réveil est difficile.", e: "Il participe à la récupération. Il occupe le plus de temps dans les premiers cycles de la nuit." },
    { m: "SOMMEIL PARADOXAL", s: 2, d: "Stade où le cerveau est très actif et les muscles relâchés.", e: "Il s'allonge souvent en fin de nuit : 10 minutes au premier cycle, jusqu'à 55 minutes au cinquième." },
    { m: "ÉVEIL", s: 2, d: "Niveau le plus haut du graphique d'une nuit : le dormeur ne dort plus.", e: "Un bref moment de ce type peut survenir pendant la nuit, entre deux cycles." },
    { m: "ENDORMISSEMENT", s: 2, d: "Passage de la veille au sommeil, facilité par la mélatonine.", e: "Dans l'obscurité, il est facilité ; à la lumière, il est retardé.", x: "Noah ne trouve le sommeil que vers 6 h 30, après son téléphone." },
    { m: "MÉLATONINE", s: 2, d: "Hormone produite dans l'obscurité par une glande du cerveau ; elle facilite l'endormissement.", e: "La lumière, même celle d'un écran, freine sa production : l'envie de dormir n'arrive pas." },
    { m: "HORMONE", s: 2, d: "Substance produite par une glande ; la mélatonine en est une.", e: "La mélatonine est produite dans l'obscurité et prépare le corps à dormir." },
    { m: "GLANDE", s: 2, d: "Organe du cerveau qui produit la mélatonine.", e: "Elle produit la mélatonine dans l'obscurité et freine cette production à la lumière." },
    { m: "OBSCURITÉ", s: 2, d: "Absence de lumière : la mélatonine est alors produite et la température du corps baisse.", e: "Le corps se prépare à dormir et l'envie de dormir arrive : l'endormissement est facilité." },
    { m: "LUMIÈRE", s: 2, d: "Celle du jour ou d'un écran freine la production de mélatonine.", e: "Le corps réagit comme s'il faisait jour : l'endormissement est retardé.", x: "Chez Noah, elle passe entre les rideaux et le réveille." },
    { m: "ÉCRAN", s: 2, d: "Source de lumière qui, tard le soir, retarde l'endormissement.", e: "Sa lumière freine la production de mélatonine.", x: "Noah consulte son téléphone dans son lit." },
    { m: "RÉCUPÉRATION", s: 2, d: "Restauration des fonctions du corps et de l'esprit, à laquelle contribuent plusieurs stades du sommeil.", e: "Une nuit écourtée réduit le temps consacré aux stades qui y contribuent." },
    { m: "MÉMOIRE", s: 2, d: "Fonction de l'esprit soutenue par le sommeil, avec les apprentissages.", e: "Plusieurs stades du sommeil y contribuent : une nuit écourtée la fragilise." },
    { m: "APPRENTISSAGES", s: 2, d: "Acquisitions soutenues par plusieurs stades du sommeil, avec la mémoire.", e: "Ils font partie de la récupération mentale ; une nuit écourtée les réduit." },
    { m: "MUSCLES", s: 2, d: "Pendant le stade paradoxal, ils sont relâchés alors que le cerveau est très actif.", e: "Cette opposition entre un cerveau actif et un corps immobile caractérise le sommeil paradoxal." },

    { m: "RYTHME SOCIAL", s: 3, d: "Heures de lever, de coucher et d'activité imposées par le travail, les repas, les transports, les loisirs.", e: "La vie de famille en fait aussi partie. Il peut s'opposer au rythme circadien." },
    { m: "DÉSYNCHRONISATION", s: 3, d: "Situation où les rythmes biologiques et les rythmes sociaux ne coïncident plus.", e: "Le travail de nuit en est la cause la plus fréquente : le salarié veille quand l'organisme prépare le sommeil.", x: "Noah dort le jour, à la lumière et dans le bruit." },
    { m: "TRAVAIL DE NUIT", s: 3, d: "À défaut d'accord collectif, activité professionnelle effectuée entre 21 heures et 6 heures.", e: "C'est la cause la plus fréquente de désynchronisation.", x: "Noah travaille de 21 h à 5 h." },
    { m: "TRAVAILLEUR DE NUIT", s: 3, d: "Salarié qui fait au moins trois heures entre 21 h et 6 h, au moins deux fois par semaine.", e: "Sa durée quotidienne de travail ne dépasse pas huit heures ; il bénéficie de protections particulières.", x: "Noah remplit les deux conditions : huit heures, quatre nuits par semaine." },
    { m: "SOMNOLENCE", s: 3, d: "Envie de dormir pendant l'activité, effet de la désynchronisation.", e: "Elle s'accompagne d'une baisse de la vigilance et rend les accidents plus nombreux.", x: "Vers 4 h du matin, Noah lutte contre le sommeil sur le transpalette." },
    { m: "VIGILANCE", s: 3, d: "Attention éveillée qui baisse chez le salarié qui travaille la nuit.", e: "Sa baisse, avec la somnolence, explique que les accidents soient plus nombreux la nuit et sur le trajet du retour." },
    { m: "ACCIDENTS", s: 3, d: "Plus nombreux pendant le travail de nuit et sur le trajet du retour.", e: "C'est une conséquence de la désynchronisation sur le travail, liée à la somnolence." },
    { m: "TROUBLES DIGESTIFS", s: 3, d: "Problèmes de l'appareil qui transforme les aliments, causés par la désynchronisation.", e: "C'est un effet sur la santé, à côté d'un sommeil plus court et morcelé.", x: "Noah a souvent mal à l'estomac." },
    { m: "MORCELÉ", s: 3, d: "Se dit d'un sommeil de jour interrompu, en plusieurs fragments.", e: "Le sommeil de jour est plus court, coupé et de moins bonne qualité : il manque une à deux heures par jour.", x: "Noah dort environ cinq heures, en plusieurs morceaux." },
    { m: "REPOS QUOTIDIEN", s: 3, d: "Pause de onze heures dont bénéficie le salarié après une période de nuit travaillée.", e: "Le sommeil de jour étant plus court, ce temps long permet de récupérer le sommeil perdu." },
    { m: "REPOS COMPENSATEUR", s: 3, d: "Temps de récupération obligatoire du salarié de nuit, auquel peut s'ajouter une majoration de salaire.", e: "C'est l'une des quatre protections prévues par la réglementation du travail de nuit." },
    { m: "VISITE D'INFORMATION", s: 3, d: "Rendez-vous de prévention avant l'affectation à un poste de nuit.", e: "Son nom complet : visite d'information et de prévention. C'est l'une des quatre protections du travailleur de nuit." },
    { m: "PRIORITÉ", s: 3, d: "Avantage du salarié de nuit pour occuper un poste de jour dans l'entreprise.", e: "Elle permet à un travailleur de nuit de revenir plus facilement à des horaires de jour." },
    { m: "HYGIÈNE DU SOMMEIL", s: 3, d: "Ensemble des habitudes qui favorisent l'endormissement et un repos récupérateur.", e: "L'Assurance Maladie conseille des horaires réguliers, l'obscurité, une chambre calme, l'arrêt des écrans une heure avant le coucher." },
    { m: "VOLETS", s: 3, d: "Fermés, avec les rideaux, ils permettent de dormir dans l'obscurité.", e: "Dans l'obscurité, la mélatonine est produite : l'endormissement est facilité.", x: "Chez Noah, la lumière passe entre les rideaux." },
    { m: "REPAS LÉGER", s: 3, d: "Ce qu'il est conseillé de manger avant de dormir.", e: "C'est l'une des mesures d'hygiène du sommeil, comme éviter les boissons caféinées avant le coucher." },
    { m: "HEURES RÉGULIÈRES", s: 3, d: "Se coucher et se lever ainsi, même les jours de repos.", e: "Mesure conseillée par l'Assurance Maladie : l'horloge biologique règle l'heure du sommeil sur 24 heures." },
    { m: "BÂILLEMENTS", s: 3, d: "Signes du sommeil, avec les paupières lourdes, auxquels il ne faut pas résister.", e: "Ne pas lutter contre ces signes est une mesure d'hygiène du sommeil." },
    { m: "PAUPIÈRES", s: 3, d: "Lourdes, elles sont un signe du sommeil, comme les bâillements.", e: "Quand elles deviennent lourdes, le moment de dormir est venu : il ne faut pas résister." }
  ]
};
