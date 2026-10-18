# Punk City – Prototipo di battaglia

Primo prototipo giocabile del combattimento di **Punk City** (JRPG a turni, mafia + cyberpunk).
Gioca: https://infinityframestudios-rgb.github.io/punk-city-prototipo/

## Come si gioca
- Barra ATB: quando la barra bianca di un eroe è piena, si apre il menu.
- **Attacco · Tecniche · Oggetti · Difesa**, più la **Furia** quando la barra gialla è piena.
- **Colpo a tempo**: durante gli attacchi un cerchio bianco si stringe sul nemico. Tocca lo schermo (o Spazio) quando è sul cerchio giallo: BUONO = +15%, PERFETTO = +40%.
- **AUTO** fa combattere la squadra da sola, **x2** raddoppia la velocità.
- Tastiera: 1-4 per i comandi, frecce + Invio per il bersaglio, Esc per tornare indietro.

## Squadra
- **Ras**: spada in una mano e pistola nell'altra. Combo Infernale (spada, spada, pistola), Raffica a Bruciapelo (forte contro i droni), Fendente Alto (spacca gli scudi). Furia: Alba Rossa.
- **Lyra**: frusta al neon (nessun microfono). Frustata Neon, Laccio Elettrico (stordisce e toglie lo scudo), Vortice Neon (tutti), Scintilla Vitale (cura). Furia: Tempesta Neon.
- **Sable**: fucile a rotaia "Requiem" con baionetta monofilamento. Colpo di Requiem, Mirino Rosso (critici garantiti), Carica a Rotaia (trapassa tutti e gli scudi), Affondo di Baionetta (sanguinamento). Furia: Colpo Unico.

## Nemici
Ratto di Ferro · Drone Vespa (vola: schiva spada/frusta/baionetta, debole a pistola e fucile) · Agente PCPD (scudo energetico) · Infermiera Moreau (cura gli alleati, avvelena) · Mini-boss **Il Mastino** (sicario cyborg dei Varga: motosega caricata, morso che ruba vita, ululato che chiama rinforzi, furia sotto il 30%).

## Novità (secondo giro)
- **Arte vera**: sprite generati per Ras, Lyra, Sable (Requiem con rotaie cremisi, laser rosso e baionetta), tutti i nemici e lo sfondo del Vicolo Neon.
- **Effetti**: respiro e ondeggio a riposo, scatti d'attacco con scie, lampo bianco e scintille all'impatto, tremolio dello schermo, numeri dei danni, nemici che si dissolvono al neon, particelle per frusta, spada, pistola e fucile a rotaia (con carica).
- **Audio**: musica synthwave e effetti generati dal browser (nessun file), musica diversa per il Mastino. Parte al primo tocco; pulsante 🔊/🔇 in alto.
- **Bilanciamento**: nemici più forti; AUTO non fa quasi mai colpi PERFETTI e non sempre vince. Con i colpi a tempo e la DIFESA sulla motosega si vince.

Fatto con Phaser 3. © Infinity Frame Studios

## Novità (terzo giro): Stanza di prova "Il Covo"
Esplorazione in stile JRPG anni '90 (la nostra versione, nessun materiale preso da altri giochi).
Si apre dal pulsante **🚪 STANZA DI PROVA** nel menu, oppure direttamente: `stanza/`.
- Sfondo dipinto "pre-renderizzato" con inquadratura fissa, Ras e Kiri come personaggi 3D low-poly (Three.js) che diventano più grandi quando si avvicinano.
- Area calpestabile invisibile con percorso automatico; il personaggio passa **dietro** al tavolo del grammofono e al tubo (livelli ritagliati dallo sfondo).
- Tocca il pavimento per camminare, oppure tieni premuto e trascina per il joystick. Sul computer: frecce/WASD, Invio o Spazio per interagire.
- Il **!** sopra la testa indica qualcosa da guardare: Kiri, il grammofono (cambia la musica), le casse dei Varga, la porta.
- La porta porta direttamente alla battaglia nel Vicolo Neon (`?lotta=1`).
- Musica d'ambiente generata dal browser (pioggia, pad, carillon), passi sul legno.

## ⚔ Battaglia 3D (prototipo) — `/battaglia/`

Battaglia a turni in stile JRPG con il nostro look: Vicolo Neon in 3D (pioggia, neon, riflessi nelle pozzanghere), Ras e Kiri contro 2 Ratti di Ferro e un Drone Vespa.

- Raggiungibile dal menu principale (**⚔ BATTAGLIA 3D**) e dalla porta del Covo (**⚔ Battaglia 3D (nuova)**). Il combattimento action classico resta com'era.
- Barre ATB (modalità "attesa": si fermano mentre scegli). Menu: **Attacca · Tecnica/Hack · Oggetto · Difendi**.
- Ras: Taglio Alba, Lama Rotante. Kiri: Cortocircuito (×2 sul drone), Virus Neon, Rattoppo (cura). Oggetti: Medikit, Stim Neon, Granata EMP.
- Camera dinamica (giro d'apertura, zoom sugli attacchi, scossoni), transizione a vetro rotto/vortice, numeri danno, lampi sui colpi, posa di vittoria + fanfara e schermata risultati.
- Touch (iPhone orizzontale) e desktop (mouse o frecce/Invio/Esc).
- Modelli 3D condivisi con il Covo: `lib/pc-models.js`.
