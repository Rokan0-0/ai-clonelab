// Wait for the DOM to be fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    // ===================================================================================
    // === IMPORTANT: PASTE YOUR GOOGLE AI API KEY HERE ==================================
    //
    // Get your free key from Google AI Studio: https://aistudio.google.com/app/apikey
    //
    // ===================================================================================
    const API_KEY = "AIzaSyAKwlvCu-f2j8RR6nXaRSGhQmnNJ7vVgAg"; 
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
    
    // --- Global Element Selectors ---
    const mainModeTabs = {
        scaffolderBtn: document.getElementById('tab-btn-scaffolder'),
        clonelabBtn: document.getElementById('tab-btn-clonelab'),
        scaffolderView: document.getElementById('scaffolder-view'),
        clonelabView: document.getElementById('clonelab-view'),
    };

    const scaffolder = {
        input: document.getElementById('scaffolder-input'),
        generateBtn: document.getElementById('scaffolder-btn-generate'),
        btnText: document.getElementById('scaffolder-btn-text'),
        btnIcon: document.getElementById('scaffolder-btn-icon'),
        spinner: document.getElementById('scaffolder-spinner'),
    };

    const editor = {
        tabBtns: {
            html: document.getElementById('editor-tab-btn-html'),
            css: document.getElementById('editor-tab-btn-css'),
            js: document.getElementById('editor-tab-btn-js'),
        },
        panes: {
            html: document.getElementById('html-editor-pane'),
            css: document.getElementById('css-editor-pane'),
            js: document.getElementById('js-editor-pane'),
        },
        editors: {
            html: document.getElementById('html-editor'),
            css: document.getElementById('css-editor'),
            js: document.getElementById('js-editor'),
        }
    };

    const cssTranslator = {
        input: document.getElementById('css-translator-input'),
        translateBtn: document.getElementById('css-translator-btn'),
        btnText: document.getElementById('css-translator-btn-text'),
        btnIcon: document.getElementById('css-translator-btn-icon'),
        spinner: document.getElementById('css-translator-spinner'),
        outputWrapper: document.getElementById('css-translator-output-wrapper'),
        output: document.getElementById('css-translator-output'),
    };

    const preview = {
        frame: document.getElementById('preview-frame'),
        widthInput: document.getElementById('preview-width'),
        heightInput: document.getElementById('preview-height'),
        rotateBtn: document.getElementById('preview-rotate'),
        responsiveBtns: document.querySelectorAll('.responsive-btn'),
    };

    const errorModal = {
        modal: document.getElementById('error-modal'),
        title: document.getElementById('error-title'),
        message: document.getElementById('error-message'),
        closeBtn: document.getElementById('error-close-btn'),
    };

    // --- Utility Functions ---

    function showErrorModal(title, message) {
        errorModal.title.textContent = title;
        errorModal.message.textContent = message;
        errorModal.modal.classList.remove('hidden');
    }

    function closeErrorModal() {
        errorModal.modal.classList.add('hidden');
    }

    // Simple debounce function
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    // --- Main Mode Tab Logic ---
    function switchMainMode(mode) {
        if (mode === 'scaffolder') {
            mainModeTabs.scaffolderView.classList.remove('hidden');
            mainModeTabs.scaffolderView.classList.add('flex');
            mainModeTabs.clonelabView.classList.add('hidden');
            mainModeTabs.clonelabView.classList.remove('flex-1', 'grid');

            mainModeTabs.scaffolderBtn.classList.add('active');
            mainModeTabs.clonelabBtn.classList.remove('active');
        } else { // 'clonelab'
            mainModeTabs.scaffolderView.classList.add('hidden');
            mainModeTabs.scaffolderView.classList.remove('flex');
            mainModeTabs.clonelabView.classList.remove('hidden');
            mainModeTabs.clonelabView.classList.add('flex-1', 'grid');
            
            mainModeTabs.clonelabBtn.classList.add('active');
            mainModeTabs.scaffolderBtn.classList.remove('active');
        }
    }

    mainModeTabs.scaffolderBtn.addEventListener('click', () => switchMainMode('scaffolder'));
    mainModeTabs.clonelabBtn.addEventListener('click', () => switchMainMode('clonelab'));

    // --- Editor Tab Logic ---
    function switchEditorTab(tab) {
        Object.values(editor.panes).forEach(pane => pane.classList.add('hidden'));
        Object.values(editor.tabBtns).forEach(btn => btn.classList.remove('active'));

        editor.panes[tab].classList.remove('hidden');
        editor.panes[tab].classList.add('flex-1', 'flex', 'flex-col');
        editor.tabBtns[tab].classList.add('active');
    }

    editor.tabBtns.html.addEventListener('click', () => switchEditorTab('html'));
    editor.tabBtns.css.addEventListener('click', () => switchEditorTab('css'));
    editor.tabBtns.js.addEventListener('click', () => switchEditorTab('js'));

    // --- Live Preview Logic ---
    const updatePreview = () => {
        const html = editor.editors.html.value;
        const css = editor.editors.css.value;
        const js = editor.editors.js.value;

        const sourceDoc = `
            <html>
                <head>
                    <script src="https://cdn.tailwindcss.com"><\/script>
                    <style>${css}</style>
                </head>
                <body>
                    ${html}
                    <script>${js}<\/script>
                </body>
            </html>
        `;
        preview.frame.srcdoc = sourceDoc;
    };

    const debouncedUpdate = debounce(updatePreview, 300);
    editor.editors.html.addEventListener('input', debouncedUpdate);
    editor.editors.css.addEventListener('input', debouncedUpdate);
    editor.editors.js.addEventListener('input', debouncedUpdate);

    // --- Responsive Toolbar Logic ---
    preview.responsiveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const w = btn.dataset.w;
            const h = btn.dataset.h;
            
            preview.frame.style.width = w.includes('%') ? w : `${w}px`;
            preview.frame.style.height = h.includes('%') ? h : `${h}px`;

            preview.widthInput.value = w.includes('%') ? '' : w;
            preview.heightInput.value = h.includes('%') ? '' : h;
        });
    });

    preview.widthInput.addEventListener('input', () => {
        const w = preview.widthInput.value;
        if (w) preview.frame.style.width = `${w}px`;
    });

    preview.heightInput.addEventListener('input', () => {
        const h = preview.heightInput.value;
        if (h) preview.frame.style.height = `${h}px`;
    });
    
    preview.rotateBtn.addEventListener('click', () => {
        const w = preview.widthInput.value;
        const h = preview.heightInput.value;
        preview.widthInput.value = h;
        preview.heightInput.value = w;
        preview.frame.style.width = `${h}px`;
        preview.frame.style.height = `${w}px`;
    });

    // --- AI API Call Logic ---

    // API Key Check
    function checkApiKey() {
        if (API_KEY === "PASTE_YOUR_GOOGLE_AI_API_KEY_HERE" || API_KEY === "") {
            showErrorModal("API Key Missing", "Please get your free Google AI API key and paste it into the 'API_KEY' constant at the top of app.js. (See instructions in the file comments).");
            return false;
        }
        return true;
    }

    async function callGemini(prompt, buttonElements) {
        if (!checkApiKey()) {
            return null; // Stop if key is missing
        }

        const { btn, btnText, btnIcon, spinner } = buttonElements;
        
        if (btn) btn.disabled = true;
        if (btnText) btnText.classList.add('hidden');
        if (btnIcon) btnIcon.classList.add('hidden');
        if (spinner) spinner.classList.remove('hidden');

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.1,
                topK: 1,
                topP: 1,
            },
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                if (response.status === 403) {
                     throw new Error(`API Error (403): Forbidden. Check that your API key is correct and enabled.`);
                }
                throw new Error(`API Error (${response.status}): ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                return text;
            } else if (result.promptFeedback) {
                const feedback = JSON.stringify(result.promptFeedback);
                throw new Error(`Content blocked by safety settings: ${feedback}`);
            } else {
                throw new Error("No response from AI. The prompt might be empty or invalid.");
            }

        } catch (error) {
            console.error("AI call failed:", error);
            showErrorModal("AI Generation Failed", `Error: ${error.message}. Check the console for details.`);
            return null;
        } finally {
            if (btn) btn.disabled = false;
            if (btnText) btnText.classList.remove('hidden');
            if (btnIcon) btnIcon.classList.remove('hidden');
            if (spinner) spinner.classList.add('hidden');
        }
    }

    // --- AI Scaffolder Logic ---
    scaffolder.generateBtn.addEventListener('click', async () => {
        const outerHTML = scaffolder.input.value;
        if (!outerHTML) {
            showErrorModal("Input Required", "Please paste the outerHTML before generating.");
            return;
        }

        // =========================================================================
        // === THE BIG CHANGE IS HERE (Thanks to you!) ===
        //
        // We are replacing the old, "skeleton" prompt with a new "rebuilder" prompt.
        // =========================================================================
        const prompt = `
            You are an expert front-end developer. A user has provided the 'outerHTML' from a website. This code is often machine-generated and messy (e.g., from Angular or React).

            Your task is to **REBUILD** this HTML into a *single, clean, human-readable HTML file* using Tailwind CSS for styling.

            - **Keep all content:** Preserve all text, links, and lists.
            - **Recreate layout:** Use Tailwind's flex and grid classes to match the original layout.
            - **Recreate icons:** If you see SVGs, recreate them. If you see icon fonts, try to find a standard SVG alternative or use a placeholder.
            - **Do not use placeholders:** Do not use "<!-- Main content here -->". Rebuild the *actual* content you see in the HTML.
            - **Single file:** The output should be a single HTML file.
            - **Clean code:** The final code should be well-formatted and easy for a human to read and edit.
            - **Output ONLY the HTML code:** Do not include any other text, comments, or markdown (like \`\`\`html) in your response. Just the raw HTML code.

            Here is the 'outerHTML':
            ${outerHTML}
        `;
        
        const skeleton = await callGemini(prompt, {
            btn: scaffolder.generateBtn,
            btnText: scaffolder.btnText,
            btnIcon: scaffolder.btnIcon,
            spinner: scaffolder.spinner
        });

        if (skeleton) {
            // The prompt asks for raw HTML, so we don't need to clean markdown
            editor.editors.html.value = skeleton;
            switchMainMode('clonelab');
            switchEditorTab('html');
            updatePreview();
        }
    });

    // --- AI CSS Translator Logic ---
    cssTranslator.translateBtn.addEventListener('click', async () => {
        const rawCss = cssTranslator.input.value;
        if (!rawCss) {
            showErrorModal("Input Required", "Please paste the raw CSS to translate.");
            return;
        }

        const prompt = `
            You are an expert Tailwind CSS converter. Take this raw CSS and convert it into the equivalent Tailwind classes.
            - For colors that don't have a default Tailwind name, use the JIT syntax like 'bg-[#hexcode]' or 'text-[#hexcode]'.
            - For pixel values, use the closest Tailwind equivalent (e.g., 16px -> p-4) or JIT syntax (e.g., h-[17px]).
            - List any assets (like 'background-image: url(...)') you find separately.
            
            Format the output *exactly* like this, with no extra markdown or text:
            
            TAILWIND CLASSES:
            class="..."

            ASSETS:
            - url("/path/to/image.svg")
            - (or "None")
            
            Here is the raw CSS:
            ${rawCss}
        `;

        const translation = await callGemini(prompt, {
            btn: cssTranslator.translateBtn,
            btnText: cssTranslator.btnText,
            btnIcon: cssTranslator.btnIcon,
            spinner: cssTranslator.spinner
        });

        if (translation) {
            cssTranslator.output.textContent = translation;
            cssTranslator.outputWrapper.classList.remove('hidden');
        }
    });

    // --- Error Modal Logic ---
    errorModal.closeBtn.addEventListener('click', closeErrorModal);
    
    // --- App Initialization ---
    switchMainMode('scaffolder');
    switchEditorTab('html');

    // Run an initial API key check on load
    setTimeout(checkApiKey, 1000); // Delay slightly to let the UI load
});