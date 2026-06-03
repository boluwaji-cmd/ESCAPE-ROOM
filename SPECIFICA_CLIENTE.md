# Escape Room Outdoor – Specifica del Committente

## Descrizione del progetto (punto di vista del cliente)

---

Siamo interessati alla realizzazione di un’applicazione che trasformi uno spazio reale, come una città o un’area urbana, in un’esperienza di gioco interattiva basata su una escape room outdoor.

L’obiettivo è creare un sistema che permetta agli utenti di muoversi fisicamente nello spazio, organizzati in squadre, per affrontare una serie di sfide ed enigmi che si sbloccano in base alla loro posizione.

Non si tratta quindi di un semplice gioco digitale, ma di un’esperienza che integra mondo fisico e digitale, dinamiche di gruppo e contenuti intelligenti.

---

## Contesto d’uso

Immaginiamo un gruppo di partecipanti divisi in squadre che prendono parte a un’esperienza di gioco all’aperto, ad esempio nel centro storico di una città oppure all’interno di un contesto aziendale.

Ogni squadra utilizza i propri dispositivi mobili per interagire con il sistema.

Il sistema guida i partecipanti attraverso una serie di tappe geolocalizzate. Quando una squadra raggiunge un punto specifico, viene sbloccato un contenuto che può includere un enigma, una prova o un elemento narrativo.

Le squadre avanzano nel gioco risolvendo le sfide e competendo tra loro in termini di tempo, punteggio o progressione.

---

## Esperienza utente (mobile-first)

L’applicazione deve essere progettata con un approccio **mobile-first**, in quanto l’utilizzo avviene in movimento e in contesti reali.

L’interfaccia deve essere intuitiva e immediata, consentendo agli utenti di:

* vedere la propria posizione
* capire dove si trova il prossimo obiettivo
* ricevere indicazioni e feedback in tempo reale
* accedere agli enigmi una volta raggiunta la posizione corretta

È fondamentale che l’esperienza sia fluida e coinvolgente, senza richiedere attenzione eccessiva all’interfaccia.

---

## Gioco a squadre

Un elemento centrale del progetto è la gestione del gioco a squadre.

Gli utenti devono essere organizzati in gruppi, e il sistema deve permettere di gestire la progressione a livello di squadra, non di singolo individuo.

Questo implica che:

* le azioni di un membro della squadra influenzano lo stato del gruppo
* la risoluzione di un enigma vale per tutta la squadra
* il sistema tiene traccia del progresso collettivo

È importante che il sistema favorisca la collaborazione tra i membri della squadra e introduca dinamiche di competizione tra squadre diverse.

---

## Meccanismo di geolocalizzazione

Il sistema utilizza il GPS dei dispositivi per determinare la posizione degli utenti.

Ogni punto del gioco è associato a coordinate geografiche e a un’area di attivazione.

Quando una squadra entra in quest’area, il contenuto viene sbloccato.

Questo meccanismo deve essere affidabile e ben calibrato, per evitare sia attivazioni premature sia difficoltà nel riconoscimento della posizione.

---

## Enigmi e contenuti dinamici

Uno degli elementi più innovativi del progetto è la generazione dinamica degli enigmi attraverso l'utilizzo di modelli linguistici avanzati.

Non vogliamo un sistema statico, ma un’esperienza capace di adattarsi ai giocatori.

In particolare, il sistema deve essere in grado di:

* generare enigmi in modo dinamico
* adattare il livello di difficoltà
* personalizzare i contenuti in base alle caratteristiche degli utenti

Ad esempio, il sistema potrebbe proporre enigmi diversi in base all’età dei partecipanti, rendendo l’esperienza accessibile sia a gruppi di ragazzi sia a utenti adulti.

Allo stesso modo, il sistema potrebbe adattare la complessità delle sfide in base alle prestazioni della squadra.

---

## Applicazione in contesti aziendali

Il sistema è pensato anche per essere utilizzato in attività di team building aziendale.

In questo contesto, gli enigmi possono essere personalizzati in base all’azienda, includendo riferimenti a:

* valori aziendali
* prodotti o servizi
* storia dell’organizzazione
* dinamiche interne

Questo rende l’esperienza non solo ludica, ma anche formativa e coerente con il contesto in cui viene utilizzata.

---

## Pannello di amministrazione

È necessario sviluppare un pannello di amministrazione accessibile via web, progettato per un utilizzo da desktop.

Questo pannello consente di costruire e gestire l’esperienza di gioco.

L’amministratore deve poter:

* definire i punti di gioco sulla mappa
* associare coordinate e raggio di attivazione
* configurare la sequenza delle tappe
* creare e modificare i contenuti associati

Inoltre, deve essere possibile gestire la componente di gamification e i contenuti generati automaticamente.

L’amministratore deve poter:

* definire il tipo di esperienza (competitiva, collaborativa, aziendale)
* configurare le caratteristiche delle squadre
* influenzare la tipologia di enigmi generati
* adattare il livello di difficoltà

Il pannello deve essere sufficientemente potente da permettere la creazione di esperienze diverse, ma allo stesso tempo semplice da utilizzare.

---

## Progressione e feedback

Il sistema deve fornire feedback costante alle squadre.

I giocatori devono poter capire:

* a che punto si trovano
* quali tappe hanno completato
* quanto manca alla fine del gioco

Possono essere introdotti elementi come classifiche, punteggi o tempi, per aumentare il coinvolgimento.

---

## Gestione dei limiti

Trattandosi di un sistema basato su geolocalizzazione reale e interazione tra persone, è importante considerare:

* imprecisioni del GPS
* comportamenti imprevisti dei giocatori
* difficoltà variabili tra le squadre

Il sistema deve essere progettato per gestire queste situazioni in modo robusto e senza compromettere l’esperienza.

---

## Valore del progetto

Questo progetto combina diversi aspetti:

* esperienza fisica e digitale
* collaborazione e competizione
* contenuti dinamici generati automaticamente
* personalizzazione in base al contesto

Rappresenta quindi una piattaforma capace di creare esperienze coinvolgenti e adattabili a diversi scenari.

---

## Conclusione

L’obiettivo non è semplicemente realizzare un’applicazione, ma costruire un sistema che permetta di progettare e vivere esperienze di gioco outdoor a squadre.

Il sistema deve essere flessibile, adattivo e in grado di offrire contenuti personalizzati, rendendo ogni esperienza unica e coerente con il contesto in cui viene utilizzata.
