let chart;
let isPlaying = false;
let currentStep = 0;
let totalSteps = 0;
let simInterval = null;

const labels = [];
const trueData = [];
const predData = [];

// Init Chart.js
function initChart() {
    const ctx = document.getElementById('predictionChart').getContext('2d');
    
    Chart.defaults.color = '#8b9bb4';
    Chart.defaults.font.family = 'Inter';
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'True YKCX (Ground Truth)',
                    data: trueData,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHitRadius: 10
                },
                {
                    label: 'Predicted YKCX (30m ahead)',
                    data: predData,
                    borderColor: '#ff0055',
                    backgroundColor: 'rgba(255, 0, 85, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 0,
                    pointHitRadius: 10
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12, usePointStyle: true }
                },
                tooltip: {
                    backgroundColor: 'rgba(11, 15, 25, 0.9)',
                    titleColor: '#00f0ff',
                    padding: 12,
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                },
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    title: { display: true, text: 'Magnetic Field (nT)' }
                }
            },
            animation: {
                duration: 400,
                easing: 'linear'
            }
        }
    });
}

// Fetch total steps and start simulation
async function startSimulation() {
    if (totalSteps === 0) {
        try {
            const res = await fetch('/api/simulation/start');
            const data = await res.json();
            totalSteps = data.total_steps;
        } catch (e) {
            console.error("Failed to start simulation", e);
            return;
        }
    }
    
    isPlaying = true;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    simInterval = setInterval(fetchNextStep, 500); // 2 frames per second
}

function pauseSimulation() {
    isPlaying = false;
    clearInterval(simInterval);
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('startBtn').innerText = "Resume Simulation";
}

async function fetchNextStep() {
    if (currentStep >= totalSteps) {
        pauseSimulation();
        return;
    }
    
    try {
        const res = await fetch(`/api/simulation/step/${currentStep}`);
        const data = await res.json();
        
        // Keep only last 60 points to make it scroll like a live ticker
        if (labels.length > 60) {
            labels.shift();
            trueData.shift();
            predData.shift();
        }
        
        labels.push(data.timestamp);
        trueData.push(data.true_ykcx);
        predData.push(data.pred_ykcx);
        
        chart.update();
        
        // Update DOM stats
        document.getElementById('valTrue').innerText = `${data.true_ykcx.toFixed(1)} nT`;
        document.getElementById('valPred').innerText = `${data.pred_ykcx.toFixed(1)} nT`;
        
        const delta = data.pred_ykcx - data.true_ykcx;
        const deltaEl = document.getElementById('valDelta');
        deltaEl.innerText = `${delta > 0 ? '+' : ''}${delta.toFixed(1)} nT`;
        deltaEl.style.color = Math.abs(delta) > 50 ? '#ff0055' : '#00f0ff';
        
        currentStep++;
        
    } catch (e) {
        console.error("Error fetching step", e);
        pauseSimulation();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    
    document.getElementById('startBtn').addEventListener('click', startSimulation);
    document.getElementById('pauseBtn').addEventListener('click', pauseSimulation);
});
