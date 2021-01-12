/********************************************************************************************
AUTEURS: Nahuel Londono et Mehran Asadi
DATE: 18 mars 2019
PROGRAM DESCRIPTION: Remake du jeu 2048 dans le cadre du cours IFT3225-H19 a l'UdeM. 

NOTES: Ce script est divise en 2 parties:
       1. Au debut, il contient les differentes fonctions qui se chargent du modele du jeu 
          (la logique).
       2. Vers la fin, il contient les differentes fonctions qui se chargent de la vue du jeu
          soit les aspects visuels et le (DOM). 
*********************************************************************************************/

/************************************* MODELE ***********************************************/

// Variables globales
var tableDuJeu;
var size = 4;
var caseBoitesRemplies = 0;
var moveCount = 0;
var moved = false;
var ready = true;
var settingToRestart = false;
var win = false;

// Detection d'appuie sur une touche
document.onkeydown = inputKey;

// Traitement de l'input du clavier (touches appuyees)
function inputKey(e) 
{
    /* Verifie si l'element 'e' a ete passe comme parametre
    a la fonction de l'evenement, sinon on assigne window.event */
    e = e || window.event;
    
    if(!ready)
    {
        if (e.keyCode == '38' || e.keyCode == '87')     //Fleche vers le haut ou 'W'
        {   
            e.preventDefault();
            slideTable("up");
        }
        else if (e.keyCode == '40' || e.keyCode == '83') //Fleche vers le bas ou 'S'
        {
            e.preventDefault();
            slideTable("down");
        }
        else if (e.keyCode == '37'|| e.keyCode == '65')  //Fleche vers la gauche ou 'A'
        {
            e.preventDefault();
            slideTable("left");
        }
        else if (e.keyCode == '39' || e.keyCode == '68') //Fleche vers la gauche ou 'D'
        {
            e.preventDefault();
            slideTable("right");
        }
    }
}


/* Ajoute un chiffre (soit 2 ou 4) a une position aleatoire dans la tableDuJeu
Il y a 90% de chances que ce soit un 2 et 10% de chance d'etre 4 
(selon le jeu original 2048)*/
function addNewNumber()
{
    caseBoitesRemplies++; // Update du chiffre de caseBoitesRemplies (+1)
    var x, y;            // Positions x et y aleatoires

    // Choix aleatoire du chiffre a rajouter
    var value = Math.random() < 0.9 ? 2 : 4;

    // Choix de la position aleatoire
    do
    { 
        x = Math.floor(Math.random()*size);
        y = Math.floor(Math.random()*size);
    }
    while(tableDuJeu[x][y]!=null);
    
    // Assigne la valeur aleatoire a la position aleatoire dans la tableDuJeu
    tableDuJeu[x][y] = value;
}

// Start le jeu
function start()
{
    if(ready == true)
    {
        begin();
        ready = false;
    }
}

// Initialisation du jeu
function begin()
{
    // Initialisaiton de la table de jeuu (La vue XHTML/DOM)
    for(var i=0; i < size; i++)
    {
        addLigne();
    }

    // Initialisation de la table du jeu (array2D rempli d'elements null)
    tableDuJeu = new Array();
    for (var i = 0; i < size; i++) 
    {
        tableDuJeu[i] = new Array();

        for(var j=0; j < size; j++)
        {
            tableDuJeu[i][j] = null;
        }
    }

    addNewNumber();
    updateTable();
}

// Reinitialisation du jeu
function restart()
{
    var restart = true;

    if(restart)
    {
        // Re-initialisaiton des variables globales du jeu
        ready = true;
        clearGame();
        moveCount = 0;
        caseBoitesRemplies = 0;
        updateMoveCounter();
        settingToRestart = false;
        win = false;
        
        // Demarrage d'une nouvelle partie
        start();
    }
}

// Change les parametres (dimensions) du jeu
function settings()
{
    if(ready)
    {
        var sizeInput = prompt("Indiquez les nouvelles dimensions du jeu:", 4);

        if(sizeInput != null)
        {
            var newSize = parseInt(sizeInput);

            if(newSize > 1 && newSize < 100)
            {
                size = newSize; // Update de la nouvelle size
            }
            else 
            {
                alert("Les dimensions du jeu doivent être entre 2 et 99 inclusivement!");
                settings();
            }
        }
        else 
        {
            ready = false;
            settingToRestart = false;
        }
    }
    else if(confirm("La partie en cours sera perdue. Êtes-vous certains?"))
    {
        ready = true;
        settingToRestart=true;
        settings();

        if(settingToRestart)
            restart();
    }
}


// Deplace les caseBoites
function slideTable(direction)
{
    for(var i=0; i<size; i++)
    {
        switch(direction)
        {
            case "left" :   var tempArray=[];
                            for(var j=0; j<size; j++)
                            {
                                tempArray.push(tableDuJeu[j][i]);
                            }
                            var newline = fusion(tempArray);
                            for(var j=0; j<size; j++)
                            {
                                tableDuJeu[j][i]= newline[j];
                            }
                            break;

            case "right" :  var tempArray=[];
                            for(var j=size-1; j>=0; j--)
                            {
                                tempArray.push(tableDuJeu[j][i]);
                            }
                            var newline = fusion(tempArray);
                            for(var j=0; j<size; j++)
                            {
                                tableDuJeu[j][i]=newline[size-j-1];
                            }
                            break;

            case "down" :   tableDuJeu[i] = fusion(tableDuJeu[i].slice().reverse()).reverse(); 
                            break;
            case "up" :     tableDuJeu[i] = fusion(tableDuJeu[i]); 
                            break;
        }
    }

    updateMovement();
}

// Update apres un mouvement
function updateMovement()
{
    if(moved)
    {
        moveCount++;
        updateMoveCounter();
        addNewNumber();
        updateTable();
        moved=false;

        if(isWin())
            gameWon();
    }
    else if(isGameOver())
    {
        gameOver();
    }
}

// Renverse un tableau 
function reverse(array)
{
    var tempArray = array.slice(); 

    for(var l=0; l<size/2; l++)
    {
        var temp = tempArray[l];
        tempArray[l] = tempArray[l-size];
        tempArray[l-size] = temp;
    }

    return tempArray;
}

// Fusion des differentes cases d'une ligne de la table du jeu
function fusion(liste)
{
    var tempArray = liste.slice(); // Copie temporaire du tableau (liste)
    for(var k=0; k<size; k++)
    {
        if(tempArray[k] != null)
        {
            var l = k+1;

            while(tempArray[l]==null && l<=size)
            {
                l++;
            }

            if(tempArray[l] == tempArray[k])
            {
                tempArray[k] = tempArray[k]*2;
                tempArray[l] = null;
                moved = true;
                caseBoitesRemplies--;
            }

            k = l-1;
        }
    }

    var l = 0;

    for(var k=0; k<size; k++)
    {
        if(tempArray[k] != null)
        {
            if(l == k)
                l++;
            else
            {
                tempArray[l] = tempArray[k];
                tempArray[k] = null;
                l++;
                moved = true;
            }
        }
    }
    return tempArray;
}

/* Verifie si le jeu est termine soit qu'il ne reste plus de case libre
et que le joueur n'a pas fait de mouvement permettant de fusionner des caseBoites */
function isGameOver()
{
    if(caseBoitesRemplies < (size*size)) 
        return false;

    for(var i=0; i<size; i++)
    {
        for(var j=0; j<size; j++)
        {
            if((tableDuJeu[i][j] == tableDuJeu[i+1][j]) && i<size-1) 
                return false;
            
            if((tableDuJeu[i][j] == tableDuJeu[i][j+1]) && j<size-1) 
                return false;
        }
        return true;
    }
}

// Verifie si le jeu a ete gagne soit qu'il y aie une case contenant le chiffre '2048'
function isWin()
{
    for(var i=0; i<size; i++)
    {
        for(var j=0; j<size; j++)
        {
            if((tableDuJeu[i][j] == 2048) && !win)
                return true;
        }
    }
    return false;
}


/*************************************** VUE ************************************************/

// Cree les elements xhtml dans l'initialisation de la table du jeu
function addLigne()
{
    var ligne = document.createElement("tr");
    var node = document.createTextNode(" ");
    ligne.appendChild(node);
    
    for(var j=0; j < size; j++)
    {
        var caseElem = document.createElement("td");
        caseElem.appendChild(node);
        ligne.appendChild(caseElem);
    }

    var element = document.getElementById("jeu");
    element.appendChild(ligne);
}

// efface le contenu actuel du jeu
function clearGame()
{
    var element = document.getElementById("jeu");
    var elements = element.getElementsByTagName("tr");
    var count = elements.length; 

    for(var i=0; i<count; i++)
        element.removeChild(document.getElementById("jeu").lastChild);
}

// Mise a jour du compteur de mouvements
function updateMoveCounter()
{
    var element = document.getElementById("moveCount");
    var node = document.createTextNode(moveCount);
    element.replaceChild(node, document.getElementById("moveCount").firstChild);
}

// Mise a jour de la vue du jeu (le tableau)
function updateTable()
{
    var jeu = document.getElementById("jeu");
    var elements = jeu.childNodes;
    var element;

    for(var i=0; i<size; i++)
    {
        var ligne = elements[i+1].childNodes;
        for(var j=0; j<size; j++)
        {
            element = ligne[j];
            var node;
            if(tableDuJeu[j][i] != null)
            {
                node = document.createTextNode(tableDuJeu[j][i]);
            }
            else 
            {
                node = document.createTextNode(" ");
            }

            if(element.hasChildNodes())
            {
                while(element.childNodes.length > 0)
                {
                    element.removeChild(element.firstChild)
                }
            }

            element.style.backgroundColor = colors(tableDuJeu[j][i]);

            if(tableDuJeu[j][i] == 2 || tableDuJeu[j][i] == 4)
                element.style.color= "#000000";
            else 
                element.style.color= "#F9F6F2";

            element.appendChild(node);
        }
    }
}

// Couleurs des cases selon le chiffre (numero)
function colors(numero)
{
    var hexColor = "#000000";

    switch(numero)
    {
        case null : hexColor = "#FFFFFF"; break;
        case 2 :    hexColor = "#D3D3D3"; break;
        case 4 :    hexColor = "#A9A9A9"; break;
        case 8 :    hexColor = "#778899"; break;
        case 16 :   hexColor = "#3b6a99"; break;
        case 32:    hexColor = "#2F4F4F"; break;
        case 64:    hexColor = "#336666"; break;
        case 128:   hexColor = "#336633"; break;
        case 256 :  hexColor = "#66CC99"; break;
        case 512 :  hexColor = "#66CC00"; break;
        case 1024:  hexColor = "#66CCFF"; break;
        case 2048:  hexColor = "#000000"; break;
    }   

    return hexColor;
}

// Message de game over et re-demarrage du jeu
function gameOver()
{
    alert("GAME OVER!" + "\n" + "Nombre de mouvements effectues: " + moveCount + "\n\n" + "Le jeu sera recommence apres la fermeture de cette fenêtre.");
    restart();
}

// Message de game won et re-demarrage du jeu
function gameWon()
{
    win = true;

    if(!confirm("YOU WIN!" + "\n" + "Nombre de mouvements effectues: "+ moveCount + "\n\n" + "Le jeu sera recommence apres la fermeture de cette fenêtre.")) 
        restart();
}