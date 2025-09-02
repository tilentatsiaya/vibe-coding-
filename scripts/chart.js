// scripts/symptom-checker.js

document.addEventListener('DOMContentLoaded', function() {
    const analyzeBtn = document.getElementById('analyze-btn');
    const symptomInput = document.getElementById('symptom-input');
    const gaugeFill = document.getElementById('gauge-fill');
    const riskLevel = document.getElementById('risk-level');
    const ctx = document.getElementById('symptom-chart').getContext('2d');
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
        
        // Simulate API call to analyze symptoms
        simulateAnalysis(symptoms);
    });
    
    function simulateAnalysis(symptoms) {
        // Show loading state
        riskLevel.textContent = 'Analyzing...';
        recommendationText.innerHTML = '<p>Analyzing your symptoms...</p>';
        
        // Simulate API delay
        setTimeout(() => {
            let riskScore = 0;
            let foundSymptoms = [];
            
            // Check for high risk keywords
            malariaKeywords.high.forEach(keyword => {
                if (symptoms.includes(keyword)) {
                    riskScore += 3;
                    foundSymptoms.push(keyword);
                }
            });
            
            // Check for medium risk keywords
            malariaKeywords.medium.forEach(keyword => {
                if (symptoms.includes(keyword)) {
                    riskScore += 2;
                    foundSymptoms.push(keyword);
                }
            });
            
            // Check for low risk keywords
            malariaKeywords.low.forEach(keyword => {
                if (symptoms.includes(keyword)) {
                    riskScore += 1;
                    foundSymptoms.push(keyword);
                }
            });
            
            // Calculate risk percentage (cap at 95%)
            let riskPercentage = Math.min(95, (riskScore / 15) * 100);
            
            // Update UI
            updateRiskAssessment(riskPercentage, foundSymptoms);
            
            // Save to history
            saveToHistory(riskPercentage, symptoms);
            
            // Update chart if it exists
            if (window.updateSymptomChart) {
                window.updateSymptomChart();
            }
        }, 1500);
    }
    
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

        const symptomChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4'],
        datasets: [{
            label: 'Symptom Severity',
            data: [3, 2, 4, 5],
            borderColor: '#2c7da0',
            backgroundColor: 'rgba(44, 125, 160, 0.2)',
            fill: true,
            tension: 0.3
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            }
        }
    }
});

        
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

// scripts/charts.js


    // Load history from localStorage
    let history = JSON.parse(localStorage.getItem('malariaSymptomHistory')) || [];

    const labels = history.map(entry => new Date(entry.date).toLocaleDateString());
    const data = history.map(entry => entry.riskScore);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Risk Score (%)',
                data: data,
                fill: false,
                borderColor: 'blue',
                tension: 0.2
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { min: 0, max: 100 }
            }
        }
    });
}
// Expose globally so symptom-checker.js can call it
  window.updateSymptomChart = updateSymptomChart;

  // Draw initial chart
  updateSymptomChart();
});