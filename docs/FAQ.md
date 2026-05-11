# FAQ utilisateurs ThermoTwin

[GPTT-209]

---

## À propos de ThermoTwin

### ThermoTwin remplace-t-il un DPE officiel ?

Non. ThermoTwin est un **pré-diagnostic pédagogique** qui vous donne une vision rapide et chiffrée des déperditions thermiques de votre logement. Pour vendre ou louer, vous aurez toujours besoin d'un DPE officiel réalisé par un diagnostiqueur certifié. ThermoTwin vous aide à savoir où agir avant de faire les travaux.

### Quelle est la précision de l'analyse ?

Nos tests sur 100 images annotées manuellement montrent une précision supérieure à 90% sur la détection des zones de déperdition. Le score thermique global a une marge d'erreur de ±0,5 point sur 10.

### Faut-il une caméra thermique pour utiliser ThermoTwin ?

Non. ThermoTwin utilise l'IA pour analyser des photos normales prises avec n'importe quel smartphone. Pas besoin de matériel spécifique.

### Quels smartphones sont compatibles ?

- **iOS** : iPhone 11 et plus récent, iOS 15+
- **Android** : Android 10+, RAM 4 Go minimum

Les iPhone avec LiDAR (12 Pro et +) bénéficient de la fonctionnalité de scan 3D pour des résultats plus précis.

---

## Réaliser un scan

### Pourquoi ma photo est-elle rejetée ?

Plusieurs raisons possibles :

- **Photo trop floue** : retenez votre souffle et tenez le téléphone à deux mains
- **Luminosité insuffisante** : faites le scan en journée
- **Format non supporté** : seuls JPEG et PNG sont acceptés
- **Image trop grande** : la limite est 10 Mo

### Combien de temps prend une analyse ?

Entre 10 et 15 secondes en moyenne. Si c'est plus long, c'est probablement un souci réseau — réessayez.

### Puis-je scanner plusieurs pièces ?

Oui, vous pouvez faire autant de scans que vous voulez, dans la limite de votre quota (5/mois en gratuit, illimité en Premium).

### Mes photos sont-elles partagées ?

Non. Vos photos sont uniquement envoyées à notre serveur pour analyse, puis stockées de manière chiffrée. Elles ne sont jamais partagées avec des tiers, et vous pouvez les supprimer à tout moment.

---

## Résultats et recommandations

### Que signifie le score thermique ?

C'est une note sur 10 qui résume la performance thermique globale de la zone scannée :

- **9-10** : excellente isolation, peu d'actions à prévoir
- **7-8** : bonne isolation, quelques optimisations possibles
- **5-6** : isolation correcte mais améliorable
- **3-4** : isolation insuffisante, travaux conseillés
- **0-2** : passoire énergétique, travaux prioritaires

### Comment sont calculées les recommandations ?

Notre IA détecte les zones de déperdition puis associe à chaque zone des travaux types (isolation, fenêtres, joints, etc.). On utilise des prix de marché moyens (sources : ADEME, FFB) pour estimer les coûts. Les économies sont calculées sur la base de votre surface et du tarif moyen de l'énergie en France.

### Le ROI affiché est-il fiable ?

Les estimations sont basées sur des moyennes nationales. Pour un chiffrage précis, demandez un devis à un artisan RGE via la marketplace. Comptez une marge d'erreur de ±20% sur le ROI.

### Mon score est mauvais, que faire en priorité ?

Suivez l'ordre indiqué dans le plan d'action : il est trié par ROI décroissant. Les premières actions vous donnent le plus d'économies pour le moins d'investissement.

---

## Compte et abonnement

### Quelle est la différence entre Free et Premium ?

| Fonctionnalité | Free | Premium |
|---|---|---|
| Scans par mois | 5 | Illimité |
| Rapport PDF | Oui | Oui (avancé) |
| Simulation what-if | Oui | Oui |
| Marketplace artisans | Oui | Oui (prioritaire) |
| Support | Email 48h | Chat 4h |
| Historique | 6 mois | Illimité |

### Comment passer Premium ?

Dans **Compte → Abonnement → Passer Premium**. Paiement via Apple/Google Pay ou carte bancaire. Vous pouvez choisir mensuel (9,99€) ou à vie (49€).

### Puis-je annuler à tout moment ?

Oui, sans engagement. L'annulation se fait depuis votre compte App Store / Google Play.

### Y a-t-il un essai gratuit Premium ?

Oui, 7 jours d'essai gratuit pour découvrir les fonctionnalités avancées.

---

## Marketplace artisans

### Tous les artisans sont-ils RGE ?

Oui, nous vérifions automatiquement la certification RGE Qualit'EnR de chaque artisan référencé. Aucun artisan non-certifié n'est listé.

### Comment sont sélectionnés les artisans ?

Par géolocalisation (rayon configurable autour de votre logement), spécialité (type de travaux), et note moyenne. Vous pouvez aussi consulter les avis clients sur chaque fiche.

### ThermoTwin prend-il une commission ?

Oui, 15% du montant des travaux uniquement si un devis est signé. C'est ce qui finance la gratuité de l'analyse pour vous.

### L'artisan est-il obligé de me répondre ?

Notre engagement est une réponse sous 48h ouvrées. Si vous ne recevez pas de retour, signalez-le via le support et nous relancerons l'artisan.

---

## Sécurité et confidentialité

### Mes données sont-elles sécurisées ?

Oui. Toutes les communications sont chiffrées en HTTPS/TLS 1.3. Vos mots de passe sont hashés avec bcrypt. Les données sont stockées chiffrées en AES-256.

### Que se passe-t-il si je supprime mon compte ?

Toutes vos données personnelles sont supprimées dans les 30 jours. Vos scans sont anonymisés et conservés à des fins de recherche statistique uniquement.

### ThermoTwin partage-t-il mes données ?

Non. Nous ne vendons ni ne partageons jamais vos données. Notre modèle économique repose sur les abonnements Premium et la commission marketplace.

### Comment exporter mes données ?

**Compte → Confidentialité → Exporter mes données**. Vous obtenez un fichier JSON avec toutes vos informations.

---

## Problèmes techniques

### L'app crash au lancement

Essayez dans l'ordre :

1. Fermez l'app complètement et relancez-la
2. Vérifiez que votre OS est à jour
3. Désinstallez et réinstallez l'app
4. Si le problème persiste, contactez support@thermotwin.fr avec le modèle de votre téléphone et la version d'OS

### Le scan reste bloqué à "Analyse en cours..."

C'est souvent un problème de réseau. Vérifiez votre connexion Wi-Fi/4G et réessayez. Si le problème persiste plus de 30 secondes, l'app vous proposera de réessayer plus tard.

### Je n'ai pas reçu l'email de confirmation

- Vérifiez vos spams
- Attendez 5 minutes (les emails peuvent être différés)
- Essayez de vous connecter, l'app vous proposera de renvoyer l'email

### Mon abonnement Premium n'est pas reconnu

**Compte → Restaurer les achats**. Si le problème persiste, contactez le support avec une preuve d'achat (capture d'écran de la facture App Store / Google Play).

---

## Partenariat et reconnaissance

### Quel est le lien entre ThermoTwin et GRDF ?

ThermoTwin est issu d'un partenariat académique entre H3 Hitema (Master IA & Data Systems) et GRDF Île-de-France. Le projet a remporté la 1ère place du concours AGORIZE 2025. GRDF valide notre méthodologie thermique et nous donne accès à son réseau d'artisans RGE.

### ThermoTwin est-il subventionné par l'État ?

Non. ThermoTwin est financé par les abonnements Premium et la marketplace. Nous ne touchons aucune subvention publique, ce qui garantit notre indépendance.

---

*Une question qui n'est pas dans la FAQ ? Écrivez-nous à support@thermotwin.fr*
