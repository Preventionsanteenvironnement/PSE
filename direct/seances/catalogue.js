/* MaPSE Direct — catalogue des séances prêtes (prototype)
 * Une séance = une suite d'activités. Plus tard, elles seront créées dans l'Atelier PSE et publiées ici.
 * Contenu PSE à faire relire par M. Mecheri avant tout usage en classe.
 */
(function (global) {
  'use strict';
  const CASES_PROCESSUS = [
    { id: 'danger', nom: 'Danger', aide: 'Ce qui peut faire du mal', couleur: '#dc2626' },
    { id: 'situation', nom: 'Situation exposante', aide: 'La personne est en contact avec le danger', couleur: '#ea580c', lien: '+' },
    { id: 'evenement', nom: 'Événement dangereux', aide: 'Ce qui déclenche le dommage', couleur: '#ca8a04', lien: '→' },
    { id: 'dommage', nom: 'Dommage', aide: 'L’atteinte à la santé', couleur: '#7c3aed', lien: '→' }
  ];

  const SEANCES = [
    {
      id: 'cap-b4-bruit',
      titre: 'Le bruit au quotidien — Camille, serveuse',
      theme: 'Bruit et santé',
      niveau: 'CAP',
      module: 'B4',
      duree: '30 min',
      activites: [
        { id: 'a1', type: 'sondage', titre: 'Pour commencer', question: 'Écoutes-tu de la musique avec des écouteurs tous les jours ?', choix: ['Oui, souvent fort', 'Oui, pas trop fort', 'Parfois', 'Non'] },
        { id: 'a2', type: 'etape', titre: 'La situation de Camille', image: 'images/serveuse.png', imageAlt: 'Une serveuse',
          texte: 'Camille, 24 ans, est serveuse dans une salle de concert. Le bruit y atteint 92 dB(A) pendant 8 heures.\nElle enlève ses bouchons d’oreilles pour entendre les clients.\nLe soir, elle entend des sifflements et dort mal.' },
        { id: 'a3', type: 'qcm', titre: 'Le problème', question: 'Quel est le problème posé par la situation de Camille ?',
          choix: ['Camille ne gagne pas assez d’argent.', 'Le bruit au travail menace l’audition de Camille.', 'Camille n’aime pas la musique.'], bonne: 1 },
        { id: 'a4', type: 'processus', titre: 'Comment le dommage apparaît', consigne: 'Place chaque élément de la situation de Camille dans sa case.',
          cases: CASES_PROCESSUS,
          items: [
            { id: 'i1', texte: 'Le bruit de 92 dB(A) dans la salle', case: 'danger' },
            { id: 'i2', texte: 'Camille sert en salle pendant 8 heures', case: 'situation' },
            { id: 'i3', texte: 'Camille enlève ses bouchons d’oreilles', case: 'evenement' },
            { id: 'i4', texte: 'Sifflements dans les oreilles, risque de surdité', case: 'dommage' }
          ] },
        { id: 'a5', type: 'qcm', titre: 'La règle au travail', question: 'À partir de combien de décibels l’employeur doit-il contrôler le port des protecteurs ?',
          choix: ['80 dB(A)', '85 dB(A)', '120 dB(A)'], bonne: 1, explication: 'À partir de 85 dB(A) sur 8 heures, l’employeur contrôle le port des protecteurs.' },
        { id: 'a6', type: 'classer', titre: 'Protéger Camille', consigne: 'Trie les mesures : protègent-elles une seule personne ou tout le monde ?',
          cases: [
            { id: 'collective', nom: 'Prévention collective', aide: 'Protège tout le monde', couleur: '#2563eb' },
            { id: 'individuelle', nom: 'Prévention individuelle', aide: 'Protège une personne', couleur: '#059669' }
          ],
          items: [
            { id: 'm1', texte: 'Baisser le volume de la sonorisation', case: 'collective' },
            { id: 'm2', texte: 'Porter des bouchons d’oreilles moulés', case: 'individuelle' },
            { id: 'm3', texte: 'Poser des panneaux qui absorbent le bruit', case: 'collective' },
            { id: 'm4', texte: 'Baisser le son de ses écouteurs', case: 'individuelle' },
            { id: 'm5', texte: 'Éloigner le bar des enceintes', case: 'collective' }
          ] },
        { id: 'a7', type: 'courte', titre: 'Ton conseil', question: 'Écris un conseil à Camille pour protéger ses oreilles au travail.' }
      ]
    },
    {
      id: 'demo-tri-dechets',
      titre: 'Démonstration — un tri rapide',
      theme: 'Démonstration',
      niveau: 'Tous',
      duree: '5 min',
      activites: [
        { id: 'd1', type: 'etape', titre: 'Bienvenue dans MaPSE Direct', texte: 'Ton professeur voit ton avancée en direct.\nTu peux lever la main avec le bouton « J’ai besoin d’aide ».', points: ['Une activité à la fois', 'Tu peux écouter la consigne', 'Ton nom n’est jamais affiché : seulement ton code'] },
        { id: 'd2', type: 'sondage', titre: 'Ta météo', question: 'Comment te sens-tu aujourd’hui ?', choix: ['☀️ Bien', '⛅ Moyen', '🌧️ Pas très bien'] },
        { id: 'd3', type: 'qcm', titre: 'Une question', question: 'Combien d’heures de sommeil conseille-t-on à un adolescent ?', choix: ['5 à 6 heures', '8 à 10 heures', '12 à 14 heures'], bonne: 1 }
      ]
    }
  ];

  global.MapseDirect = global.MapseDirect || {};
  global.MapseDirect.catalogue = SEANCES;
})(window);
