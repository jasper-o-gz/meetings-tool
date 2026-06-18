# Klantnotities — Design Spec
*2026-06-18*

## Samenvatting

Een persoonlijke web-app voor het bijhouden van klantgesprekken en actiepunten. Georganiseerd per klant, met een sidebar-navigatie en chronologische feed van meeting-notities. Beschikbaar via een eigen URL, beveiligd met Google-login, en verbonden aan GitHub voor versiebeheer.

---

## Doelstelling

De tool vervangt losse notities (Google Keep, kladblok, etc.) met een gestructureerde, klantgerichte weergave. Per klant ziet de gebruiker een chronologisch overzicht van alle gesprekken en bijbehorende actiepunten — zonder clutter.

---

## Gebruikersflow

1. Gebruiker opent de URL → wordt doorgestuurd naar loginpagina als niet ingelogd
2. Login met Google-account (alleen het eigen e-mailadres heeft toegang)
3. Hoofdscherm: sidebar links met klantenlijst, rechts de notities van de geselecteerde klant
4. Klik op "Nieuwe meeting" → overlay-formulier
5. Vul in: datum, type gesprek, wat besproken, actiepunten → Opslaan
6. Notitie verschijnt bovenaan de feed van die klant

---

## Schermen

### 1. Login
- Simpele centreerde kaart met app-logo en naam
- Eén knop: "Inloggen met Google"
- Na login: redirect naar hoofdscherm
- Toegang beperkt tot één specifiek e-mailadres (geconfigureerd in env-variabele)

### 2. Hoofdscherm
**Sidebar (links, ~240px):**
- App-logo en naam
- Zoekbalk (filtert klantenlijst op naam)
- Knop "+ Nieuwe klant" (opent simpel formulier: alleen naam)
- Lijst van klanten, gesorteerd op datum laatste meeting (nieuwste bovenaan)
- Per klant: gekleurde avatar (initialen), naam, datum laatste contact; "···" menu voor hernoemen of verwijderen
- Ingelogde gebruiker onderaan

**Hoofdpaneel (rechts):**
- Header: avatar + naam geselecteerde klant, aantal meetings, datum laatste contact, knop "+ Nieuwe meeting"
- Chronologische feed van meeting-notities (nieuwste bovenaan)
- Per notitie: datum, type gesprek, vrije tekst, actiepunten als pijltjeslijst
- Notitie heeft een "···" menu voor bewerken of verwijderen

### 3. Formulier: Nieuwe meeting (overlay)
Velden:
- **Datum** — standaard vandaag, aanpasbaar
- **Type gesprek** — vrij tekstveld (bijv. Kick-off, Voortgang, Presentatie)
- **Wat besproken** — groot tekstveld, vrije tekst
- **Actiepunten** — invoerveld + "Voeg toe"-knop; lijst groeit per toegevoegd punt

Acties: Annuleer / Opslaan

---

## Data-model

### Client
```
id: uuid
name: string
color: string        -- automatisch toegewezen uit een vaste palet van 8 kleuren op basis van index
created_at: timestamp
```

### Meeting
```
id: uuid
client_id: uuid
date: date
type: string         -- vrij tekstveld
notes: text
actions: string[]    -- array van actiepunten
created_at: timestamp
```

---

## Technische stack

| Onderdeel | Keuze | Reden |
|---|---|---|
| Framework | Next.js 14 (App Router) | React + server actions, goed Vercel-support |
| Hosting | Vercel | Gratis, koppelt direct aan GitHub, auto-deploy |
| Database | Supabase (PostgreSQL) | Gratis tier, eenvoudige setup met Next.js |
| Authenticatie | NextAuth.js | Google OAuth, minimale config |
| Versiebeheer | GitHub | Vercel deployt automatisch bij push naar main |
| Styling | Tailwind CSS | Snel, geen aparte CSS-bestanden |

---

## Authenticatie & toegang

- NextAuth.js met Google provider
- Toegang beperkt via `ALLOWED_EMAIL` env-variabele in Vercel
- Middleware beschermt alle routes behalve `/api/auth/*`
- Geen registratie — alleen de geconfigureerde e-mail heeft toegang

---

## Buiten scope (eerste versie)

- Meerdere gebruikers
- Bijlagen of afbeeldingen
- Notificaties of reminders
- Export-functionaliteit
- Mobiele app (responsive web volstaat)

---

## Succescriteria

- De tool is bereikbaar via een vaste URL
- Login werkt met Google-account
- Klanten aanmaken, bewerken en verwijderen
- Meetings toevoegen, bewerken en verwijderen per klant
- Notities en actiepunten zijn direct zichtbaar per klant
- Elke GitHub-push naar `main` deployt automatisch naar Vercel
