# Escape Room Outdoor — Specifica del Committente

**Documento:** SPEC-001 | **Versione:** 3.0 | **Data:** 3 Giugno 2026 | **Committente:** AS GAIA

---

## Descrizione del progetto (punto di vista del cliente)

Si richiede la realizzazione di un'applicazione in grado di trasformare uno spazio reale — quale una città o un'area urbana — in un'esperienza di gioco interattiva basata sul paradigma dell'escape room outdoor.

L'obiettivo consiste nel realizzare un sistema che consenta agli utenti di muoversi fisicamente nello spazio, organizzati in squadre, per affrontare una serie di sfide ed enigmi il cui sblocco dipende dalla posizione geografica rilevata.

Non si tratta, pertanto, di un mero gioco digitale, bensì di un'esperienza che integra la dimensione fisica con quella digitale, le dinamiche di gruppo e i contenuti generati in modo intelligente.

---

## Contesto d’uso

Si consideri un gruppo di partecipanti suddivisi in squadre che prendono parte a un'esperienza di gioco all'aperto, ad esempio nel centro storico di una città ovvero all'interno di un contesto aziendale.

Ciascuna squadra impiega i propri dispositivi mobili per interagire con il sistema.

Il sistema guida i partecipanti attraverso una serie di tappe geolocalizzate. Allorquando una squadra raggiunge un punto specifico, viene sbloccato un contenuto il quale può includere un enigma, una prova ovvero un elemento narrativo.

Le squadre avanzano nel gioco risolvendo le sfide e competendo reciprocamente in termini di tempo, punteggio o progressione.

---

## Esperienza utente (mobile-first)

L'applicazione deve essere progettata secondo un approccio **mobile-first**, in considerazione del fatto che l'utilizzo avviene in movimento e in contesti reali.

L'interfaccia deve risultare intuitiva e di immediata comprensione, consentendo agli utenti di:

* visualizzare la propria posizione
* individuare il prossimo obiettivo
* ricevere indicazioni e feedback in tempo reale
* accedere agli enigmi una volta raggiunta la posizione corretta

È di fondamentale importanza che l'esperienza risulti fluida e coinvolgente, senza richiedere un'attenzione eccessiva all'interfaccia.

---

## Gioco a squadre

Un elemento centrale del progetto è costituito dalla gestione del gioco a squadre.

Gli utenti devono essere organizzati in gruppi, e il sistema deve consentire la gestione della progressione a livello di squadra, e non di singolo individuo.

Ciò comporta che:

* le azioni di un membro della squadra influenzano lo stato dell'intero gruppo
* la risoluzione di un enigma vale per tutta la squadra
* il sistema tiene traccia del progresso collettivo

Risulta importante che il sistema favorisca la collaborazione tra i membri della medesima squadra e introduca dinamiche di competizione tra squadre diverse.

---

## Meccanismo di geolocalizzazione

Il sistema impiega il GPS dei dispositivi per determinare la posizione degli utenti.

Ciascun punto del gioco risulta associato a coordinate geografiche e a un'area di attivazione.

Allorquando una squadra accede a tale area, il contenuto viene sbloccato.

Tale meccanismo deve presentare caratteristiche di affidabilità e di corretta calibrazione, al fine di evitare tanto attivazioni premature quanto difficoltà nel riconoscimento della posizione.

---

## Enigmi e contenuti dinamici

Uno degli elementi di maggiore innovazione del progetto risiede nella generazione dinamica degli enigmi attraverso l'impiego di modelli linguistici avanzati.

Non si intende realizzare un sistema statico, bensì un'esperienza capace di adattarsi ai giocatori.

Nello specifico, il sistema deve essere in grado di:

* generare enigmi in modo dinamico
* adattare il livello di difficoltà
* personalizzare i contenuti in base alle caratteristiche degli utenti

A titolo esemplificativo, il sistema potrebbe proporre enigmi differenziati in base all'età dei partecipanti, rendendo l'esperienza accessibile tanto a gruppi di ragazzi quanto a utenti adulti.

Analogamente, il sistema potrebbe adattare la complessità delle sfide in base alle prestazioni della squadra.

---

## Applicazione in contesti aziendali

Il sistema è concepito anche per l'impiego nell'ambito di attività di team building aziendale.

In tale contesto, gli enigmi possono essere personalizzati in funzione dell'azienda committente, includendo riferimenti a:

* valori aziendali
* prodotti o servizi
* storia dell'organizzazione
* dinamiche interne

Ciò rende l'esperienza non soltanto ludica, ma anche formativa e coerente con il contesto nel quale viene impiegata.

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

Il sistema deve fornire un feedback costante alle squadre.

I giocatori devono poter comprendere:

* il punto in cui si trovano
* quali tappe abbiano completato
* quanto manchi alla conclusione del gioco

Possono essere introdotti elementi quali classifiche, punteggi o tempi, al fine di accrescere il coinvolgimento.

---

## Gestione dei limiti

Trattandosi di un sistema basato su geolocalizzazione reale e sull'interazione tra persone, risulta di primaria importanza considerare:

* le imprecisioni del GPS
* i comportamenti imprevisti dei giocatori
* le difficoltà variabili tra le squadre

Il sistema deve essere progettato per gestire tali situazioni in modo robusto, senza compromettere l'esperienza complessiva.

---

## Valore del progetto

Il presente progetto combina molteplici aspetti:

* esperienza fisica e digitale
* collaborazione e competizione
* contenuti dinamici generati automaticamente
* personalizzazione in funzione del contesto

Esso rappresenta, pertanto, una piattaforma capace di generare esperienze coinvolgenti e adattabili a scenari diversificati.

---

## Conclusione

L'obiettivo non consiste semplicemente nel realizzare un'applicazione, bensì nel costruire un sistema che consenta di progettare e vivere esperienze di gioco outdoor a squadre.

Il sistema deve presentare caratteristiche di flessibilità e adattività, e deve risultare in grado di offrire contenuti personalizzati, rendendo ciascuna esperienza unica e coerente con il contesto nel quale viene impiegata.
