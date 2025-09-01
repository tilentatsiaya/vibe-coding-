// scripts/symptom-checker.js

document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const symptomInput = document.getElementById('symptom-input');
    const gaugeFill = document.getElementById('gauge-fill');
    const riskLevel = document.getElementById('risk-level');
    const recommendationText = document.getElementById('recommendation-text');
    
    // Malaria keywords and their risk scores
    const malariaKeywords = {
        high: ['fever', 'chills', 'sweating', 'headache', 'nausea', 'vomiting', 'body aches', 'fatigue'],
        medium: ['diarrhea', 'abdominal pain', 'muscle pain', 'jaundice'],
        low: ['cough', 'mild headache', 'tiredness']
    };
    
    analyzeBtn.addEventListener('click', function() {
        const symptoms = symptomInput.value.toLowerCase();

        if (symptoms.trim() === '') {
            alert('Please describe your symptoms');
            return;
        }

        // Call backend API instead of simulateAnalysis
        riskLevel.textContent = 'Analyzing...';
        recommendationText.innerHTML = '<p>Analyzing your symptoms...</p>';

        fetch('/api/analyze-symptoms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptoms })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateRiskAssessment(data.risk_score, data.found_symptoms);
                // Optionally save to history or fetch history from backend
            } else {
                riskLevel.textContent = 'Error';
                recommendationText.innerHTML = `<p>${data.error}</p>`;
            }
        })
        .catch(err => {
            riskLevel.textContent = 'Error';
            recommendationText.innerHTML = `<p>${err.message}</p>`;
        });
    });
    
    function updateRiskAssessment(percentage, symptoms) {
        // Update gauge
        gaugeFill.style.width = `${percentage}%`;
        
        // Update risk level text
        let level, color;
        if (percentage < 30) {
            level = 'Low Risk';
            color = '#4caf50';
        } else if (percentage < 70) {
            level = 'Medium Risk';
            color = '#ff9800';
        } else {
            level = 'High Risk';
            color = '#f44336';
        }
        
        riskLevel.textContent = level;
        riskLevel.style.color = color;
        
        // Update recommendations
        let recommendations = '';
        if (percentage < 30) {
            recommendations = `
                <p>Your symptoms suggest a low risk of malaria. However, we recommend:</p>
                <ul>
                    <li>Monitor your symptoms for any changes</li>
                    <li>Use mosquito prevention measures</li>
                    <li>Consult a healthcare provider if symptoms persist or worsen</li>
                </ul>
            `;
        } else if (percentage < 70) {
            recommendations = `
                <p>Your symptoms suggest a moderate risk of malaria. We recommend:</p>
                <ul>
                    <li>Consult a healthcare provider within 24 hours</li>
                    <li>Get a malaria test if available</li>
                    <li>Rest and stay hydrated</li>
                    <li>Use mosquito nets and repellents to prevent further exposure</li>
                </ul>
            `;
        } else {
            recommendations = `
                <p style="color: #f44336; font-weight: bold;">Your symptoms suggest a high risk of malaria. We strongly recommend:</p>
                <ul>
                    <li>Seek medical attention immediately</li>
                    <li>Request a malaria test</li>
                    <li>Follow healthcare provider's instructions for treatment</li>
                    <li>Inform them about your symptoms: ${symptoms.join(', ')}</li>
                </ul>
            `;
        }
        
        recommendationText.innerHTML = recommendations;
    }
    
    function saveToHistory(riskScore, symptoms) {
        // Get existing history or initialize empty array
        let history = JSON.parse(localStorage.getItem('malariaSymptomHistory')) || [];
        
        // Add new entry
        history.push({
            date: new Date().toISOString(),
            riskScore: riskScore,
            symptoms: symptoms
        });
        
        // Keep only last 10 entries
        if (history.length > 10) {
            history = history.slice(history.length - 10);
        }
        
        // Save back to localStorage
        localStorage.setItem('malariaSymptomHistory', JSON.stringify(history));
    }
});