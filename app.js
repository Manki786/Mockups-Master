/**
 * MOCKUPS MASTER V3 — FRONTEND APPLICATION LOGIC
 * Features: Dual AI Provider Support (OpenAI DALL·E 3 & Google Gemini Imagen 3) + Absolute Product Lock Compositing
 */

const API_BASE = 'http://127.0.0.1:8000/api';

const state = {
    sessionId: null,
    uploadedFile: null,
    analysis: null,
    apiKey: localStorage.getItem('gemini_api_key') || '',
    openaiKey: localStorage.getItem('openai_api_key') || '',
    provider: 'openai',
    selectedStyle: 'reference_based_premium',
    pendingGenType: null,
    pollInterval: null,
    isGenerating: false,
    mockups: [],
    videos: []
};

const MOCKUP_DEFS = [
    { id: '01-hero-thumbnail', name: '01 — MAIN HERO THUMBNAIL', desc: 'Photorealistic AI scene (DALL·E 3 / Imagen 3) with Product Lock compositing.' },
    { id: '02-wall-display', name: '02 — WALL DISPLAY MOCKUP', desc: 'Photorealistic oak picture frame on neutral plaster wall with monstera shadow.' },
    { id: '03-tabletop-display', name: '03 — TABLETOP FLAT LAY', desc: 'Overhead natural wood desk flatlay, coffee cup & fountain pen.' },
    { id: '04-happy-adult', name: '04 — HAPPY ADULT HOLDING', desc: 'Photorealistic adult model holding printed sheet in warm room setting.' },
    { id: '05-printing-scene', name: '05 — PRINTING IN PROGRESS', desc: 'Modern desktop printer with print emerging naturally from tray slot.' },
    { id: '06-before-after', name: '06 — BEFORE & AFTER COMPARISON', desc: 'Split-screen comparison layout with BEFORE and AFTER pill badges.' },
    { id: '07-detail-view', name: '07 — PRODUCT DETAIL VIEW', desc: 'Full product with enlarged genuine high-res crop cards.' },
    { id: '08-whats-included', name: '08 — WHAT\'S INCLUDED', desc: 'Product overview with verified features & specs.' },
    { id: '09-why-youll-love-it', name: '09 — WHY YOU\'LL LOVE IT', desc: 'Value proposition layout with green checkmark benefit cards.' },
    { id: '10-how-to-use', name: '10 — HOW TO USE STEP GUIDE', desc: '3-step numbered guide (Download, Print, Enjoy).' }
];

const VIDEO_DEFS = [
    { id: 'instagram-reel', name: 'INSTAGRAM REEL (9:16)', desc: '2-sec visual hook pullback opening, dynamic camera moves, 1080x1920 MP4.' },
    { id: 'facebook-reel', name: 'FACEBOOK REEL (9:16)', desc: 'Smooth, relaxed pacing, gentle camera arcs, 1080x1920 MP4.' },
    { id: 'etsy-listing-video', name: 'ETSY LISTING VIDEO (9:16)', desc: 'High-res photographic focus, silent export, Etsy compliant file size.' }
];

document.addEventListener('DOMContentLoaded', () => {
    initEvents();
    checkApiKeyStatus();
});

function initEvents() {
    // API Modal Handlers
    document.getElementById('api-key-btn').addEventListener('click', () => {
        document.getElementById('api-modal').classList.remove('hidden');
    });
    document.getElementById('close-api-modal').addEventListener('click', () => {
        document.getElementById('api-modal').classList.add('hidden');
    });
    document.getElementById('save-api-key').addEventListener('click', () => {
        const inputKey = document.getElementById('gemini-key-input').value.trim();
        if (inputKey.startsWith('sk-')) {
            state.openaiKey = inputKey;
            localStorage.setItem('openai_api_key', inputKey);
        } else {
            state.apiKey = inputKey;
            localStorage.setItem('gemini_api_key', inputKey);
        }
        checkApiKeyStatus();
        document.getElementById('api-modal').classList.add('hidden');
    });

    // Provider Selector Cards
    document.querySelectorAll('.provider-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.provider-card').forEach(c => {
                c.classList.remove('selected', 'border-emerald-600', 'bg-emerald-50/70', 'border-2');
                c.classList.add('border-transparent', 'bg-gray-50');
            });
            card.classList.add('selected', 'border-emerald-600', 'bg-emerald-50/70', 'border-2');
            card.classList.remove('border-transparent', 'bg-gray-50');
            state.provider = card.dataset.provider;
        });
    });

    // Style Selector Cards
    document.querySelectorAll('.style-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.style-card').forEach(c => {
                c.classList.remove('selected', 'border-etsy-forest', 'bg-emerald-50/50');
                c.classList.add('border-transparent', 'bg-gray-50');
            });
            card.classList.add('selected', 'border-etsy-forest', 'bg-emerald-50/50');
            card.classList.remove('border-transparent', 'bg-gray-50');
            state.selectedStyle = card.dataset.style;
        });
    });

    // Upload Zone
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');

    dropZone.addEventListener('click', (e) => {
        if (e.target.closest('#replace-file-btn')) return;
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFileUpload(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-etsy-forest', 'bg-emerald-50/40');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-etsy-forest', 'bg-emerald-50/40');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-etsy-forest', 'bg-emerald-50/40');
        if (e.dataTransfer.files.length > 0) handleFileUpload(e.dataTransfer.files[0]);
    });

    document.getElementById('replace-file-btn').addEventListener('click', () => fileInput.click());

    document.getElementById('toggle-brief-btn').addEventListener('click', () => {
        document.getElementById('creative-brief-drawer').classList.toggle('hidden');
    });

    // Test Hero Preview Button
    document.getElementById('test-hero-btn').addEventListener('click', () => testHeroMockupPreview());

    // Generation Triggers
    document.getElementById('gen-mockups-btn').addEventListener('click', () => requestCostApproval('mockups'));
    document.getElementById('gen-videos-btn').addEventListener('click', () => requestCostApproval('videos'));
    document.getElementById('gen-all-btn').addEventListener('click', () => requestCostApproval('all'));

    // Cost Approval Modal Buttons
    document.getElementById('close-cost-modal').addEventListener('click', () => {
        document.getElementById('cost-modal').classList.add('hidden');
    });
    document.getElementById('cancel-cost-btn').addEventListener('click', () => {
        document.getElementById('cost-modal').classList.add('hidden');
    });
    document.getElementById('approve-cost-btn').addEventListener('click', () => {
        document.getElementById('cost-modal').classList.add('hidden');
        if (state.pendingGenType) {
            startGeneration(state.pendingGenType);
            state.pendingGenType = null;
        }
    });

    // ZIP Export Buttons
    document.getElementById('download-mockups-zip-btn')?.addEventListener('click', () => downloadZip('mockups'));
    document.getElementById('download-videos-zip-btn')?.addEventListener('click', () => downloadZip('videos'));
    document.getElementById('download-complete-zip-btn')?.addEventListener('click', () => downloadZip('complete'));

    // Image Modal Close
    document.getElementById('close-img-modal')?.addEventListener('click', () => {
        document.getElementById('image-modal').classList.add('hidden');
    });
}

function checkApiKeyStatus() {
    const keyInput = document.getElementById('gemini-key-input');
    const statusSpan = document.getElementById('api-key-status');
    const savedKey = state.openaiKey || state.apiKey;
    if (savedKey) {
        keyInput.value = savedKey;
        const providerName = savedKey.startsWith('sk-') ? 'OpenAI DALL·E 3' : 'Gemini AI';
        statusSpan.innerText = `${providerName} Connected`;
        statusSpan.classList.add('text-emerald-700', 'font-bold');
    } else {
        statusSpan.innerText = 'Configure AI Key';
    }
}

async function handleFileUpload(file) {
    state.uploadedFile = file;
    
    const formData = new FormData();
    formData.append('file', file);

    const headers = {};
    if (state.apiKey) headers['x-gemini-key'] = state.apiKey;
    if (state.openaiKey) headers['x-openai-key'] = state.openaiKey;

    try {
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
            headers: headers
        });

        if (!res.ok) throw new Error('Upload failed');
        const data = await res.json();
        
        state.sessionId = data.session_id;
        state.analysis = data.analysis;

        document.getElementById('upload-prompt').classList.add('hidden');
        document.getElementById('upload-preview').classList.remove('hidden');
        document.getElementById('preview-filename').innerText = file.name;
        document.getElementById('preview-dims').innerText = `${data.analysis.original_width} × ${data.analysis.original_height} px`;
        document.getElementById('preview-orientation').innerText = data.analysis.orientation;
        
        const previewImg = document.getElementById('preview-img');
        previewImg.src = URL.createObjectURL(file);

        document.getElementById('product-lock-badge').classList.remove('hidden');

        renderAnalysisPanel(data.analysis);

        document.getElementById('analysis-section').classList.remove('hidden');
        document.getElementById('controls-section').classList.remove('hidden');

    } catch (err) {
        alert(`Upload failed: ${err.message}. Please make sure backend is running.`);
    }
}

function renderAnalysisPanel(analysis) {
    document.getElementById('analysis-category').innerText = analysis.detected_category;
    document.getElementById('analysis-title').value = analysis.suggested_title;
    document.getElementById('analysis-subtitle').value = analysis.suggested_subtitle;

    const paletteContainer = document.getElementById('palette-container');
    paletteContainer.innerHTML = '';
    analysis.dominant_colors.forEach(col => {
        const badge = document.createElement('span');
        badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold border border-gray-200 bg-white shadow-sm';
        badge.innerHTML = `<span class="w-3.5 h-3.5 rounded-full border border-black/20" style="background-color: ${col.hex}"></span> ${col.name}`;
        paletteContainer.appendChild(badge);
    });

    const formatsContainer = document.getElementById('formats-container');
    formatsContainer.innerHTML = '';
    const formats = analysis.confirmed_formats.length > 0 ? analysis.confirmed_formats : ['PDF Print File', 'High-Res PNG'];
    formats.forEach(fmt => {
        const badge = document.createElement('span');
        badge.className = 'bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md font-semibold border border-emerald-300';
        badge.innerText = fmt;
        formatsContainer.appendChild(badge);
    });

    document.getElementById('brief-identity').innerText = analysis.creative_brief.product_identity;
    document.getElementById('brief-style').innerText = analysis.creative_brief.recommended_styling;
    document.getElementById('brief-layout').innerText = analysis.creative_brief.marketing_layout;
    document.getElementById('brief-video').innerText = analysis.creative_brief.video_shot_strategy[0];
}

async function testHeroMockupPreview() {
    if (!state.sessionId) {
        alert('Please upload artwork first.');
        return;
    }

    const testBtn = document.getElementById('test-hero-btn');
    testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-1"></i> Generating Hero Mockup...';
    testBtn.disabled = true;

    try {
        const res = await fetch(`${API_BASE}/test-preview`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: state.sessionId,
                style: state.selectedStyle,
                provider: state.provider,
                custom_title: document.getElementById('analysis-title').value,
                custom_subtitle: document.getElementById('analysis-subtitle').value,
                api_key: state.apiKey,
                openai_key: state.openaiKey
            })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || 'Test preview failed');
        }

        const data = await res.json();
        const imgUrl = `${API_BASE.replace('/api', '')}${data.url}?t=${Date.now()}`;
        
        // Show Hero Thumbnail image modal
        openImageModal(imgUrl);
    } catch (err) {
        alert(`Hero Test failed: ${err.message}`);
    } finally {
        testBtn.innerHTML = '<i class="fa-solid fa-vial-circle-check text-amber-600 mr-1"></i> Test 1 Hero Mockup Preview';
        testBtn.disabled = false;
    }
}

async function requestCostApproval(type) {
    if (!state.sessionId) return;
    state.pendingGenType = type;

    let count = 10;
    if (type === 'videos') count = 0;
    if (type === 'all') count = 10;

    try {
        const res = await fetch(`${API_BASE}/estimate-cost`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: state.provider, count: count })
        });
        const costData = await res.json();

        document.getElementById('cost-provider-name').innerText = costData.model;
        document.getElementById('cost-asset-count').innerText = `${costData.count} Mockup Scenes`;
        document.getElementById('cost-per-unit').innerText = `$${costData.cost_per_image} USD`;
        document.getElementById('cost-total-amount').innerText = `$${costData.total_cost_usd} USD`;
        document.getElementById('approve-btn-amount').innerText = costData.total_cost_usd.toFixed(2);

        document.getElementById('cost-modal').classList.remove('hidden');
    } catch (err) {
        startGeneration(type);
    }
}

async function startGeneration(type) {
    if (!state.sessionId) return;

    const currentTitle = document.getElementById('analysis-title').value;
    const currentSubtitle = document.getElementById('analysis-subtitle').value;

    await fetch(`${API_BASE}/update-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session_id: state.sessionId,
            title: currentTitle,
            subtitle: currentSubtitle
        })
    });

    const endpoint = type === 'mockups' ? '/generate-mockups' : (type === 'videos' ? '/generate-videos' : '/generate-all');

    document.getElementById('progress-section').classList.remove('hidden');
    if (type === 'mockups' || type === 'all') {
        document.getElementById('mockups-gallery-section').classList.remove('hidden');
        renderMockupPlaceholders();
    }
    if (type === 'videos' || type === 'all') {
        document.getElementById('videos-gallery-section').classList.remove('hidden');
        renderVideoPlaceholders();
    }

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: state.sessionId,
                style: state.selectedStyle,
                provider: state.provider,
                custom_title: currentTitle,
                custom_subtitle: currentSubtitle,
                api_key: state.apiKey,
                openai_key: state.openaiKey
            })
        });

        if (!res.ok) throw new Error('Failed to initiate generation');

        if (state.pollInterval) clearInterval(state.pollInterval);
        state.pollInterval = setInterval(() => pollJobStatus(), 1200);

    } catch (err) {
        alert(`Generation error: ${err.message}`);
    }
}

async function pollJobStatus() {
    if (!state.sessionId) return;
    try {
        const res = await fetch(`${API_BASE}/job-status/${state.sessionId}`);
        if (!res.ok) return;

        const data = await res.json();
        
        document.getElementById('progress-percent').innerText = `${data.progress_percent}%`;
        document.getElementById('progress-bar-fill').style.width = `${data.progress_percent}%`;

        if (data.mockups && data.mockups.length > 0) {
            updateMockupGallery(data.mockups);
        }
        if (data.videos && data.videos.length > 0) {
            updateVideoGallery(data.videos);
        }

        if (data.overall_status === 'failed') {
            clearInterval(state.pollInterval);
            document.getElementById('progress-status-text').innerText = `Generation Blocked: ${data.error}`;
            document.getElementById('progress-status-text').classList.add('text-red-600', 'font-bold');
            document.getElementById('api-modal').classList.remove('hidden');
        } else if (data.overall_status === 'completed') {
            clearInterval(state.pollInterval);
            document.getElementById('progress-status-text').innerText = 'All photorealistic scenes & commercial videos successfully generated!';
            document.getElementById('complete-download-section')?.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Polling error:', err);
    }
}

function renderMockupPlaceholders() {
    const grid = document.getElementById('mockups-grid');
    grid.innerHTML = '';
    MOCKUP_DEFS.forEach(def => {
        const card = document.createElement('div');
        card.id = `card-${def.id}`;
        card.className = 'bg-white rounded-2xl border border-etsy-border overflow-hidden shadow-sm flex flex-col justify-between';
        card.innerHTML = `
            <div class="h-64 bg-gray-100 flex items-center justify-center relative group">
                <i class="fa-solid fa-wand-magic-sparkles fa-spin text-3xl text-emerald-600"></i>
                <div class="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-mono uppercase">${state.provider} Generator</div>
            </div>
            <div class="p-4 space-y-2">
                <h4 class="font-bold text-etsy-forest text-sm">${def.name}</h4>
                <p class="text-xs text-etsy-muted leading-snug">${def.desc}</p>
                <div class="pt-2 flex justify-between items-center opacity-50 pointer-events-none">
                    <button class="text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded font-semibold"><i class="fa-solid fa-download"></i> Download</button>
                    <button class="text-xs text-gray-500 hover:text-etsy-forest"><i class="fa-solid fa-rotate"></i> Regenerate</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateMockupGallery(mockups) {
    mockups.forEach(item => {
        const card = document.getElementById(`card-${item.id}`);
        if (!card) return;

        if (item.status === 'failed') {
            const imgContainer = card.querySelector('.h-64');
            imgContainer.className = 'h-64 bg-red-50 p-4 flex flex-col items-center justify-center text-center text-red-600 text-xs';
            imgContainer.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-2xl mb-2"></i> ${item.error_message || 'API Key Required'}`;
            return;
        }

        if (item.status !== 'completed') return;

        const imgContainer = card.querySelector('.h-64');
        const providerTag = item.provider_used ? item.provider_used.toUpperCase() : 'AI';
        imgContainer.innerHTML = `
            <img src="${API_BASE.replace('/api', '')}${item.preview_url}?t=${Date.now()}" class="w-full h-full object-cover cursor-pointer hover:scale-105 transition duration-300" onclick="openImageModal('${API_BASE.replace('/api', '')}${item.preview_url}')">
            <div class="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">${providerTag} 2000×2000</div>
            <button onclick="openImageModal('${API_BASE.replace('/api', '')}${item.preview_url}')" class="absolute top-2 right-2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow transition"><i class="fa-solid fa-expand text-xs"></i></button>
        `;

        const actionsContainer = card.querySelector('.pt-2');
        actionsContainer.className = 'pt-2 flex justify-between items-center';
        actionsContainer.innerHTML = `
            <a href="${API_BASE.replace('/api', '')}${item.download_url}" download="${item.filename}" class="text-xs bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-lg font-semibold shadow-sm transition flex items-center gap-1">
                <i class="fa-solid fa-download"></i> Download PNG
            </a>
            <button onclick="regenerateIndividualItem('${item.id}')" class="text-xs text-etsy-muted hover:text-etsy-forest font-medium flex items-center gap-1">
                <i class="fa-solid fa-arrows-rotate"></i> Regenerate
            </button>
        `;
    });
}

function renderVideoPlaceholders() {
    const grid = document.getElementById('videos-grid');
    grid.innerHTML = '';
    VIDEO_DEFS.forEach(def => {
        const card = document.createElement('div');
        card.id = `card-${def.id}`;
        card.className = 'bg-white rounded-2xl border border-etsy-border overflow-hidden shadow-sm flex flex-col justify-between';
        card.innerHTML = `
            <div class="h-96 bg-gray-900 flex flex-col items-center justify-center relative text-white p-4">
                <i class="fa-solid fa-film fa-spin text-4xl text-amber-400 mb-3"></i>
                <span class="text-xs text-amber-200">Rendering 30fps MP4 Video...</span>
                <div class="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">9:16 Vertical (1080×1920)</div>
            </div>
            <div class="p-4 space-y-2">
                <h4 class="font-bold text-etsy-forest text-sm">${def.name}</h4>
                <p class="text-xs text-etsy-muted leading-snug">${def.desc}</p>
                <div class="pt-2 flex justify-between items-center opacity-50 pointer-events-none">
                    <button class="text-xs bg-amber-600 text-white px-3 py-1.5 rounded font-semibold"><i class="fa-solid fa-download"></i> Download MP4</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function updateVideoGallery(videos) {
    videos.forEach(item => {
        const card = document.getElementById(`card-${item.id}`);
        if (!card || item.status !== 'completed') return;

        const mediaContainer = card.querySelector('.h-96');
        const videoUrl = `${API_BASE.replace('/api', '')}${item.preview_url}?t=${Date.now()}`;
        mediaContainer.innerHTML = `
            <video src="${videoUrl}" controls class="w-full h-full object-cover rounded-t-xl bg-black"></video>
            <div class="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">1080×1920 MP4</div>
        `;

        const actionsContainer = card.querySelector('.pt-2');
        actionsContainer.className = 'pt-2 flex justify-between items-center';
        actionsContainer.innerHTML = `
            <a href="${videoUrl}" download="${item.filename}" class="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-lg font-semibold shadow-sm transition flex items-center gap-1">
                <i class="fa-solid fa-download"></i> Download MP4
            </a>
            <button onclick="regenerateIndividualItem('${item.id}')" class="text-xs text-etsy-muted hover:text-etsy-forest font-medium flex items-center gap-1">
                <i class="fa-solid fa-arrows-rotate"></i> Regenerate
            </button>
        `;
    });
}

async function regenerateIndividualItem(itemId) {
    if (!state.sessionId) return;
    try {
        const res = await fetch(`${API_BASE}/regenerate-item`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: state.sessionId,
                item_id: itemId,
                provider: state.provider,
                custom_title: document.getElementById('analysis-title').value,
                api_key: state.apiKey,
                openai_key: state.openaiKey
            })
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || 'Regeneration failed');
        }
        pollJobStatus();
    } catch (err) {
        alert(`Regeneration failed: ${err.message}`);
    }
}

function downloadZip(type) {
    if (!state.sessionId) return;
    window.location.href = `${API_BASE}/download/zip/${state.sessionId}/${type}`;
}

function openImageModal(imgUrl) {
    const modal = document.getElementById('image-modal');
    const display = document.getElementById('modal-img-display');
    const dlLink = document.getElementById('modal-download-link');

    display.src = imgUrl;
    dlLink.href = imgUrl;
    modal.classList.remove('hidden');
}
