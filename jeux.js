const HIVE_ENGINE_TOKEN = "SECRET"; // Nom du token sur Hive-Engine
const HOUSE_ACCOUNT = "vote-com"; // Compte Hive qui reçoit les mises
const BET_AMOUNT = 0.01; // Montant de la mise en SECRET
const WIN_AMOUNT = 0.02; // Montant du gain si le joueur gagne
const WIN_THRESHOLD = 70; // Résultat minimum pour gagner

// Fonction pour générer un nombre aléatoire entre 1 et 100
function rollDice() {
    return Math.floor(Math.random() * 100) + 1;
}

// Fonction pour placer un pari
function placeBet(player) {
    let json = {
        contractName: "SECRET",
        contractAction: "transfer",
        contractPayload: {
            symbol: HIVE_ENGINE_TOKEN,
            to: HOUSE_ACCOUNT,
            quantity: BET_AMOUNT.toFixed(3),
            memo: "Pari lancé sur Lucky 100"
        }
    };

    hive_keychain.requestCustomJson(
        player,
        "ssc-mainnet-hive",
        "Active",
        JSON.stringify(json),
        "Pari en tokens Hive-Engine",
        (response) => {
            if (response.success) {
                document.getElementById("gameResult").innerText = "Mise acceptée, lancement du dé...";
                processBet(player);
            } else {
                document.getElementById("gameResult").innerText = "Transaction annulée ou refusée.";
            }
        }
    );
}

// Fonction pour vérifier et traiter le pari
function processBet(player) {
    let diceRoll = rollDice();
    document.getElementById("gameResult").innerText = `Résultat du dé : ${diceRoll}`;

    if (diceRoll > WIN_THRESHOLD) {
        document.getElementById("gameResult").innerText += "\nVictoire ! Envoi des gains...";
        payWinner(player);
    } else {
        document.getElementById("gameResult").innerText += "\nDéfaite ! La banque garde la mise.";
    }
}

// Fonction pour payer le gagnant en SECRET
function payWinner(player) {
    let json = {
        contractName: "SECRET",
        contractAction: "transfer",
        contractPayload: {
            symbol: HIVE_ENGINE_TOKEN,
            to: player,
            quantity: WIN_AMOUNT.toFixed(3),
            memo: "Félicitations ! Vous avez gagné à Lucky 100"
        }
    };

    hive_keychain.requestCustomJson(
        HOUSE_ACCOUNT,
        "ssc-mainnet-hive",
        "Active",
        JSON.stringify(json),
        "Paiement des gains",
        (response) => {
            if (response.success) {
                document.getElementById("gameResult").innerText += "\nPaiement effectué avec succès.";
            } else {
                document.getElementById("gameResult").innerText += "\nÉchec du paiement des gains.";
            }
        }
    );
}

// Fonction pour lancer le jeu
function startGame() {
    if (window.hive_keychain) {
        hive_keychain.requestHandshake((response) => {
            if (response.success) {
                let player = response.data.username;
                document.getElementById("gameResult").innerText = `Joueur connecté : ${player}`;
                placeBet(player);
            } else {
                document.getElementById("gameResult").innerText = "Veuillez vous connecter avec Hive Keychain.";
            }
        });
    } else {
        alert("Hive Keychain n'est pas installé. Veuillez l'installer pour jouer.");
    }
}

// Ajouter un écouteur d'événement sur le bouton "Jouer"
document.getElementById("playButton").addEventListener("click", startGame);
