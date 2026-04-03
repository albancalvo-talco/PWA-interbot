# TALCO Agent Vocal - PWA

## 📦 Fichiers inclus

```
talco-pwa/
├── index.html      # Application principale (HTML + CSS + JS)
├── manifest.json   # Manifest PWA (icônes, nom, splash screen)
├── sw.js           # Service Worker (mode offline)
└── README.md       # Ce fichier
```

## 🚀 Installation

### 1. Fichiers requis à ajouter

Tu dois ajouter ces fichiers dans le même dossier :

| Fichier | Description |
|---------|-------------|
| `logo-centre-talco-lr-seul.pdf.png` | Logo TALCO (tu l'as déjà) |
| `icon-72.png` | Icône 72x72 |
| `icon-96.png` | Icône 96x96 |
| `icon-128.png` | Icône 128x128 |
| `icon-144.png` | Icône 144x144 |
| `icon-152.png` | Icône 152x152 |
| `icon-192.png` | Icône 192x192 (obligatoire) |
| `icon-384.png` | Icône 384x384 |
| `icon-512.png` | Icône 512x512 (obligatoire) |

💡 **Astuce** : Tu peux générer toutes ces icônes à partir d'une image 512x512 avec [https://realfavicongenerator.net](https://realfavicongenerator.net)

### 2. Déploiement

Déploie les fichiers sur ton serveur HTTPS (obligatoire pour PWA).

```bash
# Exemple avec ton serveur
scp -r talco-pwa/* user@talco-lr.com:/var/www/pwa/
```

### 3. Test PWA

1. Ouvre l'URL dans Chrome/Safari
2. Tu devrais voir "Installer l'application" dans la barre d'adresse
3. Sur mobile : Menu → "Ajouter à l'écran d'accueil"

---

## ⚙️ Configuration

### Modifier les paramètres

Dans `index.html`, section `CONFIG` :

```javascript
const CONFIG = {
  // ID client Google OAuth
  GOOGLE_CLIENT_ID: 'xxx.apps.googleusercontent.com',
  
  // URL du webhook n8n
  N8N_VOICE_URL: 'https://n8n.talco-lr.com/webhook/talco-voice-chat',
  
  // Domaine email autorisé
  ALLOWED_DOMAIN: 'talco-lr.com',
  
  // Délai silence VAD (ms)
  VAD_SILENCE_MS: 2000
};
```

### Modifier les champs du rapport

```javascript
const FIELD_LABELS = {
  nom_client: 'Client',
  numero_affaire: 'Affaire',
  // ... ajouter/modifier les champs ici
};
```

---

## 🎤 VAD (Voice Activity Detection)

### Comment ça marche

1. **L'utilisateur clique "Commencer"**
2. **L'IA pose la première question** (audio)
3. **Le micro s'active automatiquement** après que l'IA a fini de parler
4. **L'utilisateur parle** → l'orbe passe en mode "listening" (rouge)
5. **2 secondes de silence** → détection fin de parole
6. **Audio envoyé au backend** → traitement
7. **L'IA répond** → retour à l'étape 3

### Réglage du délai de silence

L'utilisateur peut ajuster le délai via le slider :
- **1s** : conversation rapide
- **2s** : normal (défaut)
- **4s** : réponses longues/réfléchies

---

## 🔧 Dépannage

### "Micro non disponible"

- Vérifie que le site est en HTTPS
- Autorise l'accès au micro dans les paramètres du navigateur

### "VAD ne détecte pas ma voix"

- Parle plus fort ou rapproche-toi du micro
- Augmente le délai de silence
- Vérifie qu'il n'y a pas de bruit de fond

### "L'app ne s'installe pas"

- HTTPS obligatoire
- Vérifie que `manifest.json` est accessible
- Vérifie les icônes 192x192 et 512x512

### "Service Worker ne fonctionne pas"

```javascript
// Dans la console du navigateur
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
// Puis recharge la page
```

---

## 📱 Compatibilité

| Navigateur | Support |
|------------|---------|
| Chrome (Android/Desktop) | ✅ Complet |
| Safari (iOS 14.5+) | ✅ Complet |
| Firefox | ⚠️ PWA limitée, VAD OK |
| Edge | ✅ Complet |

---

## 🔄 Mises à jour

Pour forcer une mise à jour du cache :

1. Modifie `CACHE_NAME` dans `sw.js` :
   ```javascript
   const CACHE_NAME = 'talco-pwa-v2'; // Incrémente la version
   ```

2. Redéploie les fichiers

3. Les utilisateurs recevront la mise à jour automatiquement

---

## 📞 Support

Pour toute question technique, contacte l'équipe de développement.
