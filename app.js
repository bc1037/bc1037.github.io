let cases = [];
let currentCaseIndex = 0;
let stats = {
    casesCleared: parseInt(localStorage.getItem('casesCleared')) || 0,
    flagsCaught: parseInt(localStorage.getItem('flagsCaught')) || 0
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    updateDashboard();
    fetchCases();
});

async function fetchCases() {
    try {
        const response = await fetch('cases.json');
        cases = await response.json();
        // Shuffle cases so it's a new audit every time
        cases.sort(() => Math.random() - 0.5);
        loadCase();
    } catch (error) {
        document.getElementById('scenario-text').innerText = "System Error: Could not connect to IRS database (Check your cases.json connection).";
        document.getElementById('submit-btn').disabled = true;
    }
}

function updateDashboard() {
    document.getElementById('cases-display').innerText = stats.casesCleared;
    document.getElementById('flags-display').innerText = stats.flagsCaught;
    
    // Investigator Ranks Logic
    const totalSolved = stats.casesCleared + stats.flagsCaught;
    let rank = "Junior Investigator 🕵️‍♂️";
    if (totalSolved >= 5) rank = "Field Auditor 💼";
    if (totalSolved >= 15) rank = "Forensic Analyst 🔍";
    if (totalSolved >= 30) rank = "Special Agent 🚔";
    
    document.getElementById('rank-display').innerText = rank;
}

function loadCase() {
    if (currentCaseIndex >= cases.length) {
        document.getElementById('scenario-text').innerText = "All assigned files reviewed. Excellent work, Investigator. 🏛️";
        document.getElementById('questions-container').innerHTML = "";
        document.getElementById('submit-btn').style.display = 'none';
        document.getElementById('case-id').innerText = "DONE";
        document.getElementById('category-title').innerText = "End of Shift";
        return;
    }

    const currentCase = cases[currentCaseIndex];
    
    // Reset UI
    document.getElementById('case-id').innerText = currentCase.id;
    document.getElementById('category-title').innerText = currentCase.category;
    document.getElementById('scenario-text').innerText = currentCase.scenario;
    document.getElementById('feedback-box').classList.add('hidden');
    document.getElementById('submit-btn').disabled = false;
    document.getElementById('submit-btn').style.display = 'block';

    const questionsContainer = document.getElementById('questions-container');
    questionsContainer.innerHTML = ""; // Clear old checkboxes

    // Generate Checkboxes
    currentCase.triageQuestions.forEach((question, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.classList.add('triage-option');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `q-${index}`;
        checkbox.value = index;

        const label = document.createElement('label');
        label.htmlFor = `q-${index}`;
        label.innerText = question;

        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);
        
        // Make the whole div clickable
        optionDiv.addEventListener('click', (e) => {
            if(e.target !== checkbox && e.target !== label) {
               checkbox.checked = !checkbox.checked;
            }
        });

        questionsContainer.appendChild(optionDiv);
    });
}

function submitVerdict() {
    const currentCase = cases[currentCaseIndex];
    const checkboxes = document.querySelectorAll('#questions-container input[type="checkbox"]');
    
    // Check if ALL boxes are checked
    let allChecked = true;
    checkboxes.forEach(box => {
        if (!box.checked) allChecked = false;
    });

    const feedbackBox = document.getElementById('feedback-box');
    const verdictTitle = document.getElementById('verdict-title');
    const irsRuleText = document.getElementById('irs-rule-text');

    // Disable inputs and submit button
    checkboxes.forEach(box => box.disabled = true);
    document.getElementById('submit-btn').style.display = 'none';

    // Clear previous feedback styling
    feedbackBox.className = ''; 

    if (allChecked) {
        // Passed Audit
        feedbackBox.classList.add('verdict-pass');
        verdictTitle.innerText = currentCase.verdictPass;
        stats.casesCleared++;
        triggerConfetti();
    } else {
        // Failed Audit
        feedbackBox.classList.add('verdict-fail');
        verdictTitle.innerText = currentCase.verdictFail;
        stats.flagsCaught++;
    }

    irsRuleText.innerHTML = `<strong>IRS Rule Applied:</strong> <br> ${currentCase.irsRule}`;
    
    // Save to local storage and update stats
    localStorage.setItem('casesCleared', stats.casesCleared);
    localStorage.setItem('flagsCaught', stats.flagsCaught);
    updateDashboard();

    feedbackBox.classList.remove('hidden');
}

function loadNextCase() {
    currentCaseIndex++;
    loadCase();
}

function triggerConfetti() {
    confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#3fb950', '#ffffff', '#58a6ff'] // Green, White, Blue
    });
}