# Guide de Design FLIT

## 🎨 Palette de Couleurs

### Couleur Principale
**Vert émeraude FLIT** `#00A88B`
- Utilisation : Boutons principaux, liens, icônes actives, éléments interactifs

### Couleurs de Texte
- **Noir** `#000000` - Titres premium
- **Gris ardoise** `#2B2B2B` - Texte fort (paragraphes, contenu principal)
- **Gris moyen** `#9B9B9B` - Texte désactivé, icônes secondaires

### Couleurs de Fond
- **Gris clair** `#F3F3F3` - Fond principal de l'application
- **Blanc** `#FFFFFF` - Contraste (cartes, modals, surfaces)

## ✍️ Typographie

Toute l'application utilise la police **Inter** de Google Fonts.

### Titres
**Inter Semibold 16-22px** (UI compacte)
```tsx
<Heading level={1}>Titre H1</Heading> // 22px
<Heading level={2}>Titre H2</Heading> // 18px
<Heading level={3}>Titre H3</Heading> // 16px
```

### Texte
**Inter Regular 13-15px** (UI compacte)
```tsx
<Text size="lg">Texte large 15px</Text>
<Text size="md">Texte moyen 13px</Text>
```

### Prix
**Semibold 14-16px** (UI compacte)
```tsx
<Price size="lg">500 MAD</Price> // 16px
<Price size="sm">250 MAD</Price> // 14px
```

### Boutons
**Inter Medium 14px** (UI compacte)
```tsx
<Button>Réserver</Button>
```

## 🧩 Composants UI

### Boutons
**Coins arrondis (radius 12px)**

```tsx
import { Button } from '@/components/ui';

// Bouton primaire
<Button variant="primary">Réserver</Button>

// Bouton secondaire
<Button variant="secondary">Annuler</Button>

// Bouton outline
<Button variant="outline">En savoir plus</Button>

// Tailles
<Button size="sm">Petit</Button>
<Button size="md">Moyen</Button>
<Button size="lg">Grand</Button>
```

### Cartes
**Shadow douce**

```tsx
import { Card } from '@/components/ui';

// Carte simple
<Card>
  <p>Contenu</p>
</Card>

// Carte avec hover
<Card hover>
  <p>Contenu cliquable</p>
</Card>

// Padding personnalisé (réduit pour UI compacte)
<Card padding="sm">Petit padding (12px)</Card>
<Card padding="md">Padding moyen (16px - défaut)</Card>
<Card padding="lg">Grand padding (24px)</Card>
```

### Icônes
**Fines type Feather Icons (stroke 1.5)**

Utiliser `react-icons` avec un strokeWidth de 1.5 :
```tsx
import { FaSearch, FaHeart } from 'react-icons/fa';

<FaSearch className="w-5 h-5" strokeWidth={1.5} />
```

## 📦 Classes Tailwind Personnalisées

### Couleurs
```tsx
className="text-primary"          // Vert #00A88B
className="bg-primary"            // Fond vert
className="text-textPrimary"      // Noir #000000
className="text-textSecondary"    // Gris ardoise #2B2B2B
className="bg-background"         // Gris clair #F3F3F3
```

### Typographie
```tsx
className="text-title-lg"         // 22px Semibold (UI compacte)
className="text-title-md"         // 18px Semibold
className="text-title-sm"         // 16px Semibold
className="text-body-lg"          // 15px Regular
className="text-body-md"          // 13px Regular
className="text-price"            // 16px Semibold
className="text-button"           // 14px Medium
```

### Border Radius
```tsx
className="rounded-md"            // 12px (standard FLIT)
className="rounded-lg"            // 16px
className="rounded-xl"            // 24px
```

### Shadows
```tsx
className="shadow-sm"             // Shadow douce
className="shadow-md"             // Shadow moyenne
className="hover:shadow-lg"       // Shadow au hover
```

## 🎯 Exemples d'Utilisation

### Bouton d'Action Principal
```tsx
<Button
  variant="primary"
  size="lg"
  className="w-full"
>
  Rechercher une voiture
</Button>
```

### Carte de Produit
```tsx
<Card hover padding="md" onClick={() => navigate('/product')}>
  <img src="..." className="w-full rounded-md mb-4" />
  <Heading level={3}>Dacia Duster</Heading>
  <Text>Marrakech - Aéroport</Text>
  <Price>250 MAD/jour</Price>
</Card>
```

### Section avec Titre
```tsx
<section className="py-12 px-4 bg-background">
  <Heading level={1} className="mb-4">
    Notre Flotte
  </Heading>
  <Text size="lg" className="mb-8">
    Des voitures pour tous vos besoins
  </Text>
  {/* Contenu */}
</section>
```

## ✅ Checklist Design

Avant de créer un nouveau composant, vérifier :
- [ ] Utilise la police Inter
- [ ] Respecte la palette de couleurs FLIT
- [ ] Boutons avec radius 12px
- [ ] Cartes avec shadow douce
- [ ] Icônes fines (stroke 1.5)
- [ ] Transitions fluides sur hover
- [ ] Responsive design (mobile-first)

## 📱 Responsive

### Breakpoints
- Mobile : < 640px
- Tablet : 640px - 1024px
- Desktop : > 1024px

### Exemple
```tsx
<div className="p-4 lg:p-8">
  <Heading level={1} className="text-2xl lg:text-title-lg">
    Titre Responsive
  </Heading>
</div>
```

## 🔗 Ressources

- Police Inter : [Google Fonts](https://fonts.google.com/specimen/Inter)
- Icônes : [React Icons](https://react-icons.github.io/react-icons/)
- Colors : `src/constants/colors.ts`
- Components : `src/components/ui/`
