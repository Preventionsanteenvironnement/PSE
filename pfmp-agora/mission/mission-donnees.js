/* ═══════════════════════════════════════════════════════════════════════════
   MISSION STAGE — le contenu des chapitres et des jeux (mapse.fr › PFMP AGOrA)
   Tout vient des documents du lycée : procédure de gestion des PFMP, check-list
   du professeur référent, fiche de négociation Bac Pro AGOrA, pré-convention,
   convention-type (articles 3, 4, 5, 9, 13, annexe pédagogique).
   Vouvoiement. Une consigne d'une ligne par jeu, une ligne d'explication après la réponse.
   ═══════════════════════════════════════════════════════════════════════════ */
window.MISSION = {
  personnes: {
    eleve: { nom: 'Vous', img: 'img/perso-eleve.webp' },
    tuteur: { nom: 'Le tuteur', img: 'img/perso-tuteur.webp' },
    referent: { nom: 'Le professeur référent', img: 'img/perso-referent.webp' },
    pro: { nom: 'L’enseignant professionnel', img: 'img/perso-enseignant-pro.webp' },
    pp: { nom: 'Le professeur principal', img: 'img/perso-pp.webp' },
    famille: { nom: 'Le responsable légal', img: 'img/perso-famille.webp' }
  },

  chapitres: [
    /* 1 ─ Le CV : trouver les erreurs */
    { id: 'cv', quand: 'Octobre', date: '2026-10-01', titre: 'Mon CV', img: 'img/01-cv.webp', jeu: {
      type: 'cibles', consigne: 'Touchez les 5 erreurs de ce CV.',
      doc: 'cv',
      lignes: [
        { t: 'Sam Martin', k: 'titre' },
        { t: 'Photo prise à la plage, en maillot', faux: 1, pq: 'Une photo sérieuse, de face, en tenue correcte.' },
        { t: 'sam.lebg69@mail.fr', faux: 1, pq: 'Une adresse sérieuse : prenom.nom@…' },
        { t: 'Téléphone : —', faux: 1, pq: 'Sans numéro, l’entreprise ne peut pas vous rappeler.' },
        { t: 'Formation : Seconde Bac Pro AGOrA', k: 'section' },
        { t: 'Expérience profesionnelle', faux: 1, pq: 'Faute d’orthographe : « professionnelle ».' },
        { t: 'Stage d’observation en collège : accueil du public' },
        { t: 'Compétences : Word, Excel, accueil téléphonique' },
        { t: 'Loisirs : dormir, jeux vidéo jusqu’à 3 h du matin', faux: 1, pq: 'Des loisirs qui vous mettent en valeur : sport, bénévolat…' },
        { t: 'Langues : anglais (niveau scolaire)' }
      ]
    } },

    /* 2 ─ Le coup de fil */
    { id: 'appel', quand: 'Novembre', date: '2026-11-02', titre: 'Je cherche une entreprise', img: 'img/02-recherche.webp', jeu: {
      type: 'dialogue', consigne: 'Choisissez la meilleure réponse à chaque moment de l’appel.',
      tours: [
        { dit: 'Mairie de Valrive, bonjour.', rep: [
          ['Bonjour madame, je suis élève en seconde Bac Pro AGOrA. Pourrais-je parler à la personne qui s’occupe des stages, s’il vous plaît ?', 1],
          ['Allô, c’est pour un stage.', 0], ['Ouais bonjour, vous prenez des stagiaires ?', 0]], pq: 'Bonjour, qui vous êtes, ce que vous voulez, s’il vous plaît.' },
        { dit: 'Oui, c’est à quel sujet ?', rep: [
          ['Je cherche une période de formation en milieu professionnel de deux semaines, du 4 au 17 janvier.', 1],
          ['C’est mon prof qui m’a dit d’appeler.', 0], ['Pour un stage, c’est obligatoire.', 0]], pq: 'Donnez tout de suite la durée et les dates.' },
        { dit: 'Quelles activités vous intéressent ?', rep: [
          ['L’accueil du public, le classement et la mise à jour de dossiers.', 1],
          ['Tout ce que vous voulez.', 0], ['Je ne sais pas.', 0]], pq: 'Citez des activités de votre formation.' },
        { dit: 'Envoyez-nous votre CV.', rep: [
          ['Bien sûr. À quelle adresse mail puis-je l’envoyer ?', 1],
          ['Je ne l’ai pas encore fait.', 0], ['D’accord. (Vous raccrochez.)', 0]], pq: 'Notez l’adresse exacte avant de raccrocher.' },
        { dit: 'Très bien, nous vous recontacterons.', rep: [
          ['Merci beaucoup pour votre temps. Bonne journée, madame.', 1],
          ['Ok, salut.', 0], ['(Vous raccrochez sans rien dire.)', 0]], pq: 'On remercie toujours, même sans réponse immédiate.' }
      ]
    } },

    /* 3 ─ La fiche de négociation : l'ordre */
    { id: 'fiche', quand: 'Fin novembre', date: '2026-11-20', titre: 'Ma fiche de négociation', img: 'img/03-fiche-recue.webp', jeu: {
      type: 'ordre', consigne: 'Touchez les étapes dans l’ordre, puis Valider.',
      etapes: [
        { t: 'Je demande ma fiche de négociation à mon enseignant professionnel' },
        { t: 'Je l’apporte à l’entreprise' },
        { t: 'Le tuteur coche les activités possibles, signe et met le cachet' },
        { t: 'Je la signe (ou mon responsable légal si je suis mineur)' },
        { t: 'Je la remets à mon enseignant professionnel' },
        { t: 'Il contrôle les activités, la valide, la signe et la transmet à mon référent' }
      ],
      fin: 'Le référent vérifie, signe et garde la fiche : mon lieu de stage est validé. Ensuite : la pré-convention.'
    } },

    /* 4 ─ Le tuteur choisit les activités */
    { id: 'activites', quand: 'Fin novembre', date: '2026-11-23', titre: 'Le tuteur choisit', img: 'img/04-remise-tuteur.webp', jeu: {
      type: 'multi', consigne: 'Stage à l’accueil d’une mairie, deux semaines. Choisissez les 3 activités possibles.',
      options: [
        ['1.1.1 Accueil et renseignement', 1],
        ['2.2.3 Préparation de la déclaration de TVA', 0],
        ['1.1.2 Prise en charge de la demande', 1],
        ['3.2.3 Préparation et suivi de la paie', 0],
        ['1.3.1 Mise à jour des dossiers', 1],
        ['2.2.2 Suivi de la trésorerie', 0]
      ],
      pq: 'À l’accueil : accueillir, prendre en charge la demande, tenir les dossiers à jour.'
    } },

    /* 5 ─ La pré-convention : ce qui manque */
    { id: 'preconv', quand: 'Début décembre', date: '2026-11-27', titre: 'La pré-convention', img: 'img/05-tampon.webp', jeu: {
      type: 'cibles', consigne: 'Il manque 3 informations. Touchez-les.',
      doc: 'preconv',
      lignes: [
        { t: 'ACCORD POUR FORMATION PROFESSIONNELLE EN ENTREPRISE', k: 'titre' },
        { t: 'Période : du 04/01/2027 au 17/01/2027' },
        { t: 'Entreprise : Mairie de Valrive' },
        { t: 'Lieu du stage : 1 place de la Mairie, Valrive' },
        { t: 'Responsable : Mme Durand, directrice des services' },
        { t: 'Assurance : SMACL · n° de contrat : ……', faux: 1, pq: 'Le numéro de contrat d’assurance est obligatoire.' },
        { t: 'Tuteur : ……', faux: 1, pq: 'Sans tuteur nommé, personne ne vous encadre.' },
        { t: 'Horaires : lundi au vendredi, 9 h – 12 h et 13 h 30 – 17 h' },
        { t: 'Cachet et signature de l’entreprise : ……', faux: 1, pq: 'Sans cachet ni signature, l’entreprise ne s’est pas engagée.' }
      ]
    } },

    /* 6 ─ La convention : qui signe ? */
    { id: 'convention', quand: 'Avant le 18 décembre', date: '2026-12-07', titre: 'La convention signée', img: 'img/06-famille.webp', jeu: {
      type: 'multi', consigne: 'Qui signe la convention ? Choisissez les 5 bonnes réponses.',
      options: [
        ['Le représentant de l’entreprise', 1],
        ['Le tuteur', 1],
        ['Moi, ou mon responsable légal si je suis mineur', 1],
        ['Le professeur référent', 1],
        ['La cheffe d’établissement', 1],
        ['Le professeur principal', 0],
        ['Le conseiller principal d’éducation', 0]
      ],
      pq: 'Cinq signatures, puis la convention part au bureau des entreprises.'
    } },

    /* 7 ─ Avant Noël : prêt à partir */
    { id: 'depart', quand: 'Vacances de Noël', date: '2026-12-18', titre: 'Prêt à partir', img: 'img/07-noel.webp', jeu: {
      type: 'qcm', consigne: 'Répondez aux 3 questions.',
      questions: [
        { q: 'Avant de partir en vacances, que devez-vous connaître ?', rep: [
          ['L’adresse, les horaires et le nom de mon tuteur', 1], ['Le code du wifi de l’entreprise', 0], ['Le salaire que je vais toucher', 0]],
          pq: 'Le 4 janvier, il faudra arriver à l’heure, au bon endroit, et demander la bonne personne.' },
        { q: 'L’entreprise vous paie-t-elle pour ces deux semaines ?', rep: [
          ['Non : l’État verse une allocation pour les jours de stage', 1], ['Oui, un salaire', 0], ['Oui, si je travaille bien', 0]],
          pq: 'Convention, article 6 : une allocation de l’État, grâce à l’attestation de stage.' },
        { q: 'Combien d’exemplaires signés de la convention sont remis ?', rep: [
          ['Deux : un pour ma famille, un pour l’entreprise', 1], ['Un seul, pour moi', 0], ['Aucun', 0]],
          pq: 'Le professeur référent remet un exemplaire à la famille et un à l’entreprise.' }
      ]
    } },

    /* 8 ─ Pendant le stage : que faire si ? */
    { id: 'situations', quand: '4 janvier', date: '2027-01-04', titre: 'Premier jour de stage', img: 'img/08-premier-jour.webp', jeu: {
      type: 'qcm', consigne: 'Que faire si… ?',
      questions: [
        { q: 'Votre bus est en panne : vous allez arriver en retard.', rep: [
          ['Je préviens l’entreprise et la vie scolaire, puis j’apporte un justificatif', 1], ['J’arrive plus tard sans prévenir', 0], ['Je reste chez moi', 0]],
          pq: 'Convention, annexe pédagogique : l’entreprise ET le lycée, puis un justificatif écrit.' },
        { q: 'Vous avez 16 ans. Après 8 h de travail, on vous demande de rester jusqu’à 20 h.', rep: [
          ['Je refuse poliment et j’en parle à mon professeur référent', 1], ['Je reste, c’est normal', 0], ['Je pars sans rien dire', 0]],
          pq: 'Mineur : 8 h par jour et 35 h par semaine au maximum (convention, article 10).' },
        { q: 'Vous travaillez 5 h d’affilée sans pause.', rep: [
          ['Ce n’est pas normal : au-delà de 4 h 30, une pause de 30 minutes est due', 1], ['C’est normal en entreprise', 0], ['Je mange en travaillant', 0]],
          pq: 'Convention, article 10 : pause d’au moins 30 minutes après 4 h 30 de travail.' },
        { q: 'Vous voyez les dossiers des habitants de la commune.', rep: [
          ['Je n’en parle à personne, ni sur les réseaux', 1], ['Je les raconte à mes amis', 0], ['Je les prends en photo', 0]],
          pq: 'Convention, article 5 : vous êtes tenu au secret professionnel.' },
        { q: 'Vous tombez à vélo en allant au stage.', rep: [
          ['Je préviens l’entreprise et le lycée : c’est un accident du travail', 1], ['Je ne dis rien', 0], ['Je préviens seulement mes amis', 0]],
          pq: 'Convention, article 15 : l’entreprise le déclare dans les 48 heures.' }
      ]
    } },

    /* 9 ─ La visite : qui fait quoi ? */
    { id: 'roles', quand: 'Pendant le stage', date: '2027-01-11', titre: 'Qui fait quoi ?', img: 'img/09-visite.webp', jeu: {
      type: 'associer', consigne: 'Pour chaque action, touchez la bonne personne.',
      personnes: ['tuteur', 'referent', 'pro', 'famille'],
      items: [
        ['Coche les activités de la fiche de négociation', 'tuteur'],
        ['Valide la fiche de négociation', 'pro'],
        ['Me remet la pré-convention', 'referent'],
        ['Saisit la convention dans Pronote', 'referent'],
        ['Signe pour moi si je suis mineur', 'famille'],
        ['M’accueille le premier jour', 'tuteur'],
        ['Vient me voir pendant le stage', 'referent'],
        ['Me remet l’attestation à la fin du stage', 'tuteur']
      ]
    } },

    /* 10 ─ Qui remplit quoi ? (09/10/2026 : remplace l'ordre des documents, qui recopiait le chemin) */
    { id: 'qui-remplit', quand: '17 janvier', date: '2027-01-17', titre: 'Qui remplit quoi ?', img: 'img/10-attestation.webp', jeu: {
      type: 'associer', consigne: 'Pour chaque document, touchez la personne qui le remplit ou le signe.',
      personnes: ['eleve', 'tuteur', 'pro', 'referent', 'famille'],
      items: [
        ['Les activités possibles, sur la fiche de négociation', 'tuteur'],
        ['La validation de la fiche de négociation', 'pro'],
        ['Les horaires et l’assurance, sur la pré-convention', 'tuteur'],
        ['La signature de la convention, pour un élève mineur', 'famille'],
        ['La vérification de la convention signée', 'referent'],
        ['Le nombre de jours réellement effectués, sur l’attestation', 'tuteur'],
        ['L’avis sur l’accueil, à la fin du stage', 'eleve'],
        ['Le carnet de bord, chaque jour', 'eleve']
      ]
    } }
  ],

  /* Le quiz final */
  final: { id: 'final', titre: 'Prêt pour mon stage ?', jeu: {
    type: 'qcm', consigne: '8 questions pour finir.',
    questions: [
      { q: 'Vous avez trouvé une entreprise. Quel document en premier ?', rep: [['La fiche de négociation', 1], ['La convention', 0], ['L’attestation', 0]] },
      { q: 'Qui coche les activités de la colonne (a) ?', rep: [['Le tuteur', 1], ['Moi', 0], ['Le professeur principal', 0]] },
      { q: 'Quand se coche la colonne (b) ?', rep: [['Après le stage', 1], ['Avant le stage', 0], ['Jamais', 0]] },
      { q: 'Qui valide la fiche de négociation ?', rep: [['L’enseignant professionnel', 1], ['Le tuteur', 0], ['Ma famille', 0]] },
      { q: 'Qui saisit la convention dans Pronote ?', rep: [['Le professeur référent', 1], ['Moi', 0], ['L’entreprise', 0]] },
      { q: 'Pour la PFMP de janvier, la convention doit être signée…', rep: [['Avant les vacances de Noël', 1], ['Le premier jour du stage', 0], ['Après le stage', 0]] },
      { q: 'Vous êtes absent un jour de stage.', rep: [['Je préviens l’entreprise et la vie scolaire, puis un justificatif', 1], ['Je préviens seulement mes amis', 0], ['Rien, ce n’est qu’un jour', 0]] },
      { q: 'À quoi sert l’attestation de stage ?', rep: [['À prouver mes jours de stage, pour l’allocation de l’État', 1], ['À rien', 0], ['À entrer en première', 0]] }
    ]
  } }
};
