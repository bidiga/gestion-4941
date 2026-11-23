import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "fr" | "son";

/**
 * Dictionnaire bilingue. Le soninké est une première proposition :
 * à faire relire par un locuteur natif du village et corriger ici.
 */
const dict = {
  appTag: { fr: "Gestion du village · Mali", son: "Debe gollen · Maali" },
  dashboard: { fr: "Tableau de bord", son: "Gollen kafu" },
  buildings: { fr: "Bâtiments", son: "Kaanu" },
  map: { fr: "Carte du village", son: "Debe karti" },
  streets: { fr: "Gestion des rues", son: "Killu" },
  families: { fr: "Familles", son: "Kaabilanu" },
  members: { fr: "Membres des familles", son: "Kaabila moxu" },
  plates: { fr: "Plaques et impression", son: "Limiyu nan safa" },
  reports: { fr: "Rapports et statistiques", son: "Kawandu" },
  users: { fr: "Utilisateurs", son: "Golliyanu" },
  settings: { fr: "Paramètres", son: "Sigindu" },
  sectionRegistry: { fr: "Registre", son: "Defte" },
  sectionPeople: { fr: "Population", son: "Moxu" },
  sectionOutput: { fr: "Documents", son: "Kayitu" },
  sectionAdmin: { fr: "Administration", son: "Tonbe" },
  welcome: { fr: "Bienvenue dans votre espace de gestion", son: "Bisimilla, ma gollen kafo" },
  welcomeSub: { fr: "Registre des bâtiments, familles et rues", son: "Kaanu, kaabilanu do killu defte" },
  statBuildings: { fr: "Bâtiments recensés", son: "Kaanu n da xasu" },
  statStreets: { fr: "Rues créées", son: "Killu" },
  statFamilies: { fr: "Familles enregistrées", son: "Kaabilanu" },
  statMembers: { fr: "Membres recensés", son: "Moxu n da xasu" },
  quickAccess: { fr: "Accès rapide", son: "Siiri lenqi" },
  addBuilding: { fr: "Ajouter bâtiment", son: "Ka kaane" },
  addBuildingSub: { fr: "Nouvelle habitation", son: "Ka kurunte" },
  mapSub: { fr: "Localiser les maisons", son: "Kaanu bireye" },
  familiesSub: { fr: "Gérer les habitants", son: "Debe moxu" },
  platesSub: { fr: "Numéros des bâtiments", son: "Kaanu limiyu" },
  search: { fr: "Rechercher…", son: "Gemu…" },
  add: { fr: "Ajouter", son: "Kaane" },
  edit: { fr: "Modifier", son: "Falle" },
  delete: { fr: "Supprimer", son: "Bonu" },
  save: { fr: "Enregistrer", son: "Ronbu" },
  cancel: { fr: "Annuler", son: "Bati" },
  print: { fr: "Imprimer", son: "Safa" },
  all: { fr: "Tous", son: "Sere" },
  number: { fr: "Numéro", son: "Limi" },
  street: { fr: "Rue", son: "Kille" },
  type: { fr: "Type", son: "Fasu" },
  status: { fr: "Statut", son: "Taxu" },
  owner: { fr: "Propriétaire / responsable", son: "Ka tanpaxe" },
  phone: { fr: "Téléphone", son: "Telefon" },
  rooms: { fr: "Pièces", son: "Bunbu" },
  gps: { fr: "Position GPS", son: "GPS" },
  notes: { fr: "Remarques", son: "Xibaaru" },
  name: { fr: "Nom", son: "Toxo" },
  firstName: { fr: "Prénom", son: "Toxo" },
  lastName: { fr: "Nom de famille", son: "Jamu" },
  head: { fr: "Chef de famille", son: "Ka gumme" },
  building: { fr: "Bâtiment", son: "Ka" },
  family: { fr: "Famille", son: "Kaabila" },
  sex: { fr: "Sexe", son: "Fasu" },
  birthYear: { fr: "Année de naissance", son: "Sanne" },
  relation: { fr: "Lien", son: "Tunbe" },
  occupation: { fr: "Activité", son: "Golle" },
  quartier: { fr: "Quartier", son: "Kaabile" },
  code: { fr: "Code", son: "Kodu" },
  description: { fr: "Description", son: "Ñaña" },
  role: { fr: "Rôle", son: "Golle" },
  active: { fr: "Actif", son: "Gollen" },
  members_n: { fr: "membres", son: "moxu" },
  families_n: { fr: "familles", son: "kaabilanu" },
  buildings_n: { fr: "bâtiments", son: "kaanu" },
  noData: { fr: "Aucune donnée pour l'instant", son: "Fofi nta ya" },
  loadDemo: { fr: "Charger des données de démonstration", son: "Misaali soxo" },
  satellite: { fr: "Satellite", son: "Satelit" },
  plan: { fr: "Plan", son: "Karti" },
  myPosition: { fr: "Ma position", son: "N bireye" },
  clickMap: { fr: "Cliquez sur la carte pour placer le bâtiment", son: "Karti noxo tiini" },
  located: { fr: "géolocalisés", son: "GPS" },
  recent: { fr: "Derniers bâtiments ajoutés", son: "Kaanu kurunte" },
  avgFamily: { fr: "Taille moyenne d'une famille", son: "Kaabila moxu" },
  male: { fr: "Hommes", son: "Yugonu" },
  female: { fr: "Femmes", son: "Yaxarenu" },
  ageGroups: { fr: "Pyramide des âges", son: "Sannu" },
  byType: { fr: "Bâtiments par type", son: "Kaanu fasu" },
  byStreet: { fr: "Bâtiments par rue", son: "Kaanu killu" },
  byStatus: { fr: "Occupation des bâtiments", son: "Kaanu taxu" },
  exportCsv: { fr: "Exporter CSV", son: "CSV" },
  selected: { fr: "sélectionnées", son: "suguta" },
  selectAll: { fr: "Tout sélectionner", son: "Sere suguta" },
  platePreview: { fr: "Aperçu des plaques", son: "Limiyu" },
  republic: { fr: "République du Mali", son: "Maali" },
  saved: { fr: "Enregistré", son: "Ronbunta" },
  confirmDelete: { fr: "Confirmer la suppression ?", son: "Bonu?" },
} satisfies Record<string, { fr: string; son: string }>;

export type TKey = keyof typeof dict;

export const LABELS: Record<string, Record<string, { fr: string; son: string }>> = {
  type: {
    habitation: { fr: "Habitation", son: "Ka" },
    commerce: { fr: "Commerce", son: "Julaaxu" },
    religieux: { fr: "Lieu de culte", son: "Misiide" },
    education: { fr: "École", son: "Lekkol" },
    sante: { fr: "Santé", son: "Dooteri" },
    administratif: { fr: "Administratif", son: "Tonbe" },
    autre: { fr: "Autre", son: "Tanpi" },
  },
  status: {
    occupe: { fr: "Occupé", son: "Moxu ya" },
    vacant: { fr: "Vacant", son: "Sinme" },
    construction: { fr: "En construction", son: "Tanpe" },
  },
  relation: {
    chef: { fr: "Chef de famille", son: "Ka gumme" },
    epouse: { fr: "Épouse", son: "Yaxare" },
    enfant: { fr: "Enfant", son: "Lemine" },
    parent: { fr: "Parent", son: "Faaba / Ma" },
    autre: { fr: "Autre", son: "Tanpi" },
  },
  role: {
    admin: { fr: "Administrateur", son: "Tonbe" },
    agent: { fr: "Agent recenseur", son: "Xasuyi" },
    lecteur: { fr: "Consultation", son: "Yi" },
  },
  sex: { M: { fr: "Homme", son: "Yugo" }, F: { fr: "Femme", son: "Yaxare" } },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: TKey) => string; l: (group: string, v: string | null | undefined) => string };
const I18nCtx = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem("smk-lang") as Lang) || "fr");
  useEffect(() => {
    document.documentElement.lang = lang === "fr" ? "fr" : "snk";
  }, [lang]);
  const setLang = (l: Lang) => {
    localStorage.setItem("smk-lang", l);
    setLangState(l);
  };
  const t = (k: TKey) => dict[k]?.[lang] ?? k;
  const l = (group: string, v: string | null | undefined) => (v ? LABELS[group]?.[v]?.[lang] ?? v : "—");
  return <I18nCtx.Provider value={{ lang, setLang, t, l }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const c = useContext(I18nCtx);
  if (!c) throw new Error("I18nProvider manquant");
  return c;
}
