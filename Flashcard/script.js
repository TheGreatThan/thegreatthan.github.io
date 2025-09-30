// Vocabulary List (FINAL CLEANED VERSION)
// All combined forms (using /) are now separated for clarity and perfect TTS pronunciation.
const vocabulary = [
    // --- Basic Phrases & Greetings ---
    { french: "Voici", english: "Here is/are", cls: "Adverb / Interjection" },
    { french: "Qui est-ce ?", english: "Who is it?", cls: "Phrase (Q)" },
    { french: "C'est [name]", english: "It is [name]", cls: "Phrase (A)" },
    { french: "Bonjour", english: "Good morning/day", cls: "Interjection / Noun" },
    { french: "Bonsoir", english: "Good evening", cls: "Interjection / Noun" },
    { french: "Salut", english: "Hi/Bye (Informal)", cls: "Interjection" },
    { french: "Coucou", english: "Hey/Peek-a-boo", cls: "Interjection (Informal)" },
    { french: "Ça va (bien) ?", english: "How are you (well)?", cls: "Phrase (Q)" },
    { french: "Oui, ça va bien. Merci beaucoup.", english: "Yes, I'm well. Thank you very much.", cls: "Phrase (A)" },
    { french: "Et vous ?", english: "And you? (Formal/Plural)", cls: "Phrase (Q)" },
    { french: "Et toi ?", english: "And you? (Informal)", cls: "Phrase (Q)" },
    { french: "Moi aussi, merci.", english: "Me too, thanks.", cls: "Phrase (A)" },
    { french: "Au revoir !", english: "Goodbye!", cls: "Interjection" },
    { french: "À bientôt", english: "See you soon", cls: "Interjection" },
    { french: "C'est fini ?", english: "Is it finished?", cls: "Phrase (Q)" },
    { french: "Ça y est ?", english: "Is that it? / Is it done?", cls: "Phrase (Q)" },
    { french: "Une minute, s'il vous plaît", english: "One minute, please (formal)", cls: "Phrase" },
    { french: "Enchanté", english: "Pleased to meet you (Masc.)", cls: "Adj / Interjection (M)" },
    { french: "Enchantée", english: "Pleased to meet you (Fem.)", cls: "Adj / Interjection (F)" },
    
    // --- Identity & Family ---
    { french: "Ma femme", english: "My wife", cls: "Noun (f)" },
    { french: "Mon mari", english: "My husband", cls: "Noun (m)" },
    { french: "Mon", english: "My (m)", cls: "Possessive Adj" },
    
    // Separated Nationalities
    { french: "Italien", english: "Italian (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Italienne", english: "Italian (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Français", english: "French (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Française", english: "French (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Vietnamien", english: "Vietnamese (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Vietnamienne", english: "Vietnamese (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Hollandais", english: "Dutch (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Hollandaise", english: "Dutch (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Allemand", english: "German (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Allemande", english: "German (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Anglais", english: "English (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Anglaise", english: "English (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Espagnol", english: "Spanish (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Espagnole", english: "Spanish (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Européen", english: "European (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Européenne", english: "European (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Américain", english: "American (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Américaine", english: "American (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Canadien", english: "Canadian (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Canadienne", english: "Canadian (Fem.)", cls: "Adj / Noun (F)" },
    { french: "Sud-Coréen", english: "South Korean (Masc.)", cls: "Adj / Noun (M)" },
    { french: "Sud-Coréenne", english: "South Korean (Fem.)", cls: "Adj / Noun (F)" },
    
    { french: "La famille", english: "The family", cls: "Noun (f)" },
    { french: "Un frère", english: "A brother", cls: "Noun (m)" },
    { french: "Une sœur", english: "A sister", cls: "Noun (f)" },
    { french: "L'âge", english: "Age", cls: "Noun (m)" },
    { french: "La possession", english: "Possession", cls: "Noun (f)" },
    { french: "Un ordinateur", english: "A computer", cls: "Noun (m)" },
    { french: "Tu as quel âge ?", english: "How old are you?", cls: "Phrase (Q)" },
    { french: "Un enfant", english: "A child (m)", cls: "Noun (m)" },
    { french: "Une enfant", english: "A child (f)", cls: "Noun (f)" },
    
    // --- Avoir Expressions & Feelings ---
    { french: "Avoir ... ans", english: "To be ... years old", cls: "Verb/Phrase" },
    { french: "Avoir chaud", english: "To be hot", cls: "Verb/Phrase" },
    { french: "Avoir froid", english: "To be cold", cls: "Verb/Phrase" },
    { french: "Avoir soif", english: "To be thirsty", cls: "Verb/Phrase" },
    { french: "Avoir peur", english: "To be afraid", cls: "Verb/Phrase" },
    { french: "Avoir faim", english: "To be hungry", cls: "Verb/Phrase" },
    
    // --- Likes & Dislikes ---
    { french: "Adorer", english: "To adore/love", cls: "Verb (vinf)" },
    { french: "Aimer", english: "To like/love", cls: "Verb (vinf)" },
    { french: "Détester", english: "To hate", cls: "Verb (vinf)" },
    
    // --- Time & Date ---
    { french: "La date", english: "The date", cls: "Noun (f)" },
    { french: "Être né", english: "To be born (Masc.)", cls: "Verb/Phrase (M)" },
    { french: "Être née", english: "To be born (Fem.)", cls: "Verb/Phrase (F)" },
    { french: "Janvier", english: "January", cls: "Noun (m)" },
    { french: "Février", english: "February", cls: "Noun (m)" },
    { french: "Mars", english: "March", cls: "Noun (m)" },
    { french: "Avril", english: "April", cls: "Noun (m)" },
    { french: "Mai", english: "May", cls: "Noun (m)" },
    { french: "Juin", english: "June", cls: "Noun (m)" },
    { french: "Juillet", english: "July", cls: "Noun (m)" },
    { french: "Août", english: "August", cls: "Noun (m)" },
    { french: "Septembre", english: "September", cls: "Noun (m)" },
    { french: "Octobre", english: "October", cls: "Noun (m)" },
    { french: "Novembre", english: "November", cls: "Noun (m)" },
    { french: "Décembre", english: "December", cls: "Noun (m)" },
    { french: "Lundi", english: "Monday", cls: "Noun (m)" },
    { french: "Mardi", english: "Tuesday", cls: "Noun (m)" },
    { french: "Mercredi", english: "Wednesday", cls: "Noun (m)" },
    { french: "Jeudi", english: "Thursday", cls: "Noun (m)" },
    { french: "Vendredi", english: "Friday", cls: "Noun (m)" },
    { french: "Samedi", english: "Saturday", cls: "Noun (m)" },
    { french: "Dimanche", english: "Sunday", cls: "Noun (m)" },
    { french: "en", english: "in (month/year)", cls: "Preposition" },
    
    // --- Places & Geography ---
    { french: "La ville", english: "The city/town", cls: "Noun (f)" },
    { french: "Le pays", english: "The country", cls: "Noun (m)" },
    { french: "à", english: "in/at (city name)", cls: "Preposition" },
    
    // Separated Prepositions for Countries
    { french: "au", english: "in/to (Masc. country, e.g., au Canada)", cls: "Preposition (M)" },
    { french: "en", english: "in/to (Fem. country, e.g., en France)", cls: "Preposition (F)" },
    { french: "aux", english: "in/to (Plural country, e.g., aux États-Unis)", cls: "Preposition (Pl)" },
    
    { french: "Le Mexique", english: "Mexico (Exception)", cls: "Noun (m)" },
    { french: "Le Cambodge", english: "Cambodia (Exception)", cls: "Noun (m)" },
    { french: "À Singapour", english: "In Singapore (Exception)", cls: "Prepositional Phrase" },
    { french: "À Taïwan", english: "In Taiwan (Exception)", cls: "Prepositional Phrase" },
    { french: "À Cuba", english: "In Cuba (Exception)", cls: "Prepositional Phrase" },
    { french: "Plus loin", english: "Further away", cls: "Adverbial Phrase" },
    { french: "Europe", english: "Europe", cls: "Noun (f)" },
    { french: "Union Européenne", english: "European Union", cls: "Noun (f)" },
    { french: "La France", english: "France", cls: "Noun (f)" },
    { french: "Paris", english: "Paris", cls: "Noun (proper)" },
    { french: "Londres", english: "London", cls: "Noun (proper)" },
    { french: "Allemagne", english: "Germany", cls: "Noun (f)" },
    { french: "Berlin", english: "Berlin", cls: "Noun (proper)" },
    { french: "Italie", english: "Italy", cls: "Noun (f)" },
    { french: "Rome", english: "Rome", cls: "Noun (proper)" },
    { french: "Espagne", english: "Spain", cls: "Noun (f)" },
    { french: "Madrid", english: "Madrid", cls: "Noun (proper)" },
    { french: "Suisse", english: "Switzerland / Swiss", cls: "Noun/Adj (F)" },
    { french: "Berne", english: "Bern", cls: "Noun (proper)" },
    { french: "Belgique", english: "Belgium", cls: "Noun (f)" },
    { french: "Bruxelles", english: "Brussels", cls: "Noun (proper)" },
    { french: "Asie", english: "Asia", cls: "Noun (f)" },
    { french: "Vietnam", english: "Vietnam", cls: "Noun (m)" },
    { french: "Hanoï", english: "Hanoi", cls: "Noun (proper)" },
    { french: "Thaïlande", english: "Thailand", cls: "Noun (f)" },
    { french: "Bangkok", english: "Bangkok", cls: "Noun (proper)" },
    { french: "Chine", english: "China", cls: "Noun (f)" },
    { french: "Pékin", english: "Beijing", cls: "Noun (proper)" },
    { french: "Japon", english: "Japan", cls: "Noun (m)" },
    { french: "Tokyo", english: "Tokyo", cls: "Noun (proper)" },
    { french: "Corée du Sud", english: "South Korea", cls: "Noun (f)" },
    { french: "Séoul", english: "Seoul", cls: "Noun (proper)" },
    { french: "Russie", english: "Russia", cls: "Noun (f)" },
    { french: "Moscou", english: "Moscow", cls: "Noun (proper)" },
    { french: "Amérique", english: "America", cls: "Noun (f)" },
    { french: "Canada", english: "Canada", cls: "Noun (m)" },
    { french: "Ottawa", english: "Ottawa", cls: "Noun (proper)" },
    { french: "États-Unis", english: "USA (Plural)", cls: "Noun (m pl)" },
    { french: "Washington", english: "Washington", cls: "Noun (proper)" },
    { french: "Près de moi", english: "Near me", cls: "Prepositional Phrase" },
    { french: "Où", english: "Where (question)", cls: "Adverb (Q)" },
    { french: "Ou", english: "Or (choice)", cls: "Conjunction" },
    { french: "Le quartier", english: "The neighborhood", cls: "Noun (m)" },
    { french: "La mer", english: "The sea", cls: "Noun (f)" },
    { french: "La plage", english: "The beach", cls: "Noun (f)" },
    { french: "La rue", english: "The street", cls: "Noun (f)" },
    { french: "L'appartement", english: "The apartment", cls: "Noun (m)" },
    { french: "L'université", english: "The university", cls: "Noun (f)" },
    { french: "Le lieu", english: "The place/spot", cls: "Noun (m)" },
    { french: "La place", english: "The square/place", cls: "Noun (f)" },

    // --- Classroom & Communication ---
    { french: "Bonjour à tous", english: "Hello everyone", cls: "Phrase" },
    { french: "Je fais l'appel", english: "I'm taking attendance", cls: "Phrase" },
    { french: "Présent", english: "Present (Masc.)", cls: "Adj / Interjection (M)" },
    { french: "Présente", english: "Present (Fem.)", cls: "Adj / Interjection (F)" },
    { french: "S'il te plaît", english: "Please (informal)", cls: "Phrase (Informal)" },
    { french: "Vous allez bien ?", english: "Are you (formal/pl.) well?", cls: "Phrase (Q)" },
    { french: "Très bien", english: "Very well", cls: "Phrase" },
    { french: "Désolé monsieur, je suis en retard", english: "Sorry sir, I'm late (Masc.)", cls: "Phrase" },
    { french: "Désolée madame, je suis en retard", english: "Sorry ma'am, I'm late (Fem.)", cls: "Phrase" },
    { french: "Comment on dit ..... en français ?", english: "How do you say ..... in French?", cls: "Phrase (Q)" },
    { french: "Je ne comprends pas", english: "I don't understand", cls: "Phrase" },
    { french: "Vous comprenez ?", english: "Do you (formal/pl.) understand?", cls: "Phrase (Q)" },
    { french: "Vous avez compris ?", english: "Did you (formal/pl.) understand?", cls: "Phrase (Q)" },
    { french: "Vous pouvez répéter, s'il vous plaît ?", english: "Can you repeat, please?", cls: "Phrase (Q)" },
    { french: "Comment ça s'écrit ?", english: "How is that written/spelled?", cls: "Phrase (Q)" },
    { french: "Une tablette", english: "A tablet", cls: "Noun (f)" },
    { french: "Un smartphone", english: "A smartphone", cls: "Noun (m)" },
    { french: "Un cahier", english: "A notebook", cls: "Noun (m)" },
    { french: "Un livre", english: "A book", cls: "Noun (m)" },
    { french: "Un stylo", english: "A pen", cls: "Noun (m)" },
    { french: "Un crayon", english: "A pencil", cls: "Noun (m)" },
    { french: "Monsieur", english: "Mister/Sir", cls: "Noun (m)" },
    { french: "Madame", english: "Madam/Ma'am", cls: "Noun (f)" },
    { french: "Mademoiselle", english: "Miss", cls: "Noun (f)" },
    { french: "Messieurs", english: "Gentlemen (pl.)", cls: "Noun (m pl)" },
    { french: "Mesdames", english: "Ladies (pl.)", cls: "Noun (f pl)" },
    { french: "Mesdemoiselles", english: "Young Ladies (pl.)", cls: "Noun (f pl)" },
    { french: "La langue", english: "The language/tongue", cls: "Noun (f)" },
    { french: "Un mot", english: "A word", cls: "Noun (m)" },
    { french: "La page suivante", english: "The next page", cls: "Noun (f)" },
    { french: "La page", english: "The page", cls: "Noun (f)" },
    { french: "Un auteur", english: "An author (Masc.)", cls: "Noun (M)" },
    { french: "Une auteure", english: "An author (Fem.)", cls: "Noun (F)" },
    
    // --- Miscellaneous & Descriptions ---
    { french: "Un poisson", english: "A fish", cls: "Noun (m)" },
    { french: "Une voiture", english: "A car", cls: "Noun (f)" },
    { french: "Sympa", english: "Nice/Friendly (Informal)", cls: "Adj" },
    { french: "Sympathique", english: "Nice/Friendly (Formal)", cls: "Adj" },
    { french: "C'est", english: "It is (Singular)", cls: "Phrase" },
    { french: "Avoir un instrument de musique", english: "To have a musical instrument", cls: "Phrase" },
    { french: "Guitare", english: "Guitar", cls: "Noun (f)" },
    { french: "Ce sont", english: "They are (Plural)", cls: "Phrase" },
    { french: "Une photo", english: "A photo", cls: "Noun (f)" },
    { french: "Numéro", english: "Number", cls: "Noun (m)" },
    { french: "Au fait", english: "By the way", cls: "Phrase" },
    { french: "La lumière", english: "The light", cls: "Noun (f)" },
    { french: "Il y a", english: "There is/are", cls: "Phrase" },
    { french: "Calme", english: "Calm", cls: "Adj" },
    { french: "Parler", english: "To speak", cls: "Verb (vinf)" },
    { french: "Chanter", english: "To sing", cls: "Verb (vinf)" },
    { french: "Inviter", english: "To invite", cls: "Verb (vinf)" },
    { french: "Bien", english: "Well/Good", cls: "Adverb" },
    { french: "Manger", english: "To eat", cls: "Verb (vinf)" },
    { french: "Commencer", english: "To begin/start", cls: "Verb (vinf)" },
    { french: "Acheter", english: "To buy", cls: "Verb (vinf)" },
    { french: "Envoyer", english: "To send", cls: "Verb (vinf)" },
    { french: "De fresque", english: "Of fresco/mural", cls: "Noun (f)" },
    { french: "Sur", english: "On/Upon", cls: "Preposition" },
    { french: "Mur", english: "Wall", cls: "Noun (m)" },
    { french: "Montrer", english: "To show", cls: "Verb (vinf)" },
    { french: "Célébrités", english: "Celebrities (Pl.)", cls: "Noun (f pl)" },
    { french: "Personnalités", english: "Personalities (Pl.)", cls: "Noun (f pl)" },
    { french: "Qu'est-ce que c'est ?", english: "What is it?", cls: "Phrase (Q)" },
    { french: "Échange", english: "Exchange", cls: "Noun (m)" },
    { french: "Qui est-ce ?", english: "Who is it?", cls: "Pronoun (Q)" },
    { french: "Quelqu'un", english: "Someone", cls: "Indefinite Pronoun" },
    { french: "Quelque chose", english: "Something", cls: "Indefinite Pronoun" },
    { french: "Associer", english: "To associate/link", cls: "Verb (vinf)" },
    { french: "Pourquoi", english: "Why?", cls: "Adverb (Q)" },
    { french: "Parce que", english: "Because", cls: "Conjunction" },
    { french: "La pluie", english: "The rain", cls: "Noun (f)" },
    { french: "Il pleut", english: "It's raining", cls: "Phrase" },

    // --- Wishes ---
    { french: "Bonne journée", english: "Have a good day", cls: "Interjection" },
    { french: "Bonne soirée", english: "Have a good evening", cls: "Interjection" },
    { french: "Bonne nuit", english: "Good night", cls: "Interjection" },
    { french: "Bon appétit", english: "Enjoy your meal", cls: "Interjection" },
    { french: "Bon week-end", english: "Have a good weekend", cls: "Interjection" },
    { french: "À vous aussi !", english: "You too! (Formal/Plural)", cls: "Phrase" },
    { french: "À toi aussi !", english: "You too! (Informal)", cls: "Phrase" },
    { french: "Bon anniversaire", english: "Happy birthday", cls: "Interjection" },
    { french: "Bonne fête", english: "Happy name day/holiday", cls: "Interjection" },
    { french: "Bonne année", english: "Happy new year", cls: "Interjection" }
];

let currentIndex = 0;
const cardContainer = document.getElementById('flashcard-container');
const nextButton = document.getElementById('next-button');

// --- TTS Initialization and Voice Selection ---
const synth = window.speechSynthesis;
const utterance = new SpeechSynthesisUtterance();
let frenchVoice = null;

// Function to find the French voice only once
function setFrenchVoice() {
    if (frenchVoice) return; // Already set
    
    // Get voices and filter for the best French option (fr-FR is standard French)
    const voices = synth.getVoices();
    frenchVoice = voices.find(voice => voice.lang === 'fr-FR' || voice.lang.startsWith('fr'));
    
    // Apply the voice if found
    if (frenchVoice) {
        utterance.voice = frenchVoice;
        utterance.lang = 'fr-FR';
    } else {
        // Fallback
        utterance.lang = 'fr-FR';
    }
}

// Ensure the voice list is loaded before we try to select one
synth.onvoiceschanged = setFrenchVoice;
setFrenchVoice(); 

// Function to speak the French word
function speakFrenchWord(word) {
    utterance.text = word;
    
    if (!frenchVoice) {
        setFrenchVoice();
    }

    if (synth.speaking) {
        synth.cancel();
    }
    
    if (synth) {
        synth.speak(utterance);
    }
}

// Function to render the current card
function renderCard(index) {
    const data = vocabulary[index];
    
    const cleanedFrenchWord = data.french.replace(/'/g, "\\'"); 
    
    const cardHTML = `
        <div class="flashcard" onclick="this.classList.toggle('flipped'); speakFrenchWord('${cleanedFrenchWord}')">
            <div class="front">
                <div class="classification">${data.cls}</div>
                <div class="word">${data.french}</div>
            </div>
            <div class="back">
                <div class="meaning">${data.english}</div>
            </div>
        </div>
    `;

    cardContainer.innerHTML = cardHTML;
    
    document.getElementById('current-index').textContent = index + 1;
    document.getElementById('total-words').textContent = vocabulary.length;
    
    // Speak automatically
    setTimeout(() => {
        speakFrenchWord(data.french);
    }, 100);
}

// Function to move to the next card
function nextCard() {
    currentIndex = (currentIndex + 1) % vocabulary.length; 
    renderCard(currentIndex);
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    if (vocabulary.length > 0) {
        renderCard(currentIndex);
    } else {
        cardContainer.innerHTML = '<p>No vocabulary loaded.</p>';
    }

    nextButton.addEventListener('click', nextCard);
});