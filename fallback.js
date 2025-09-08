// Fallback for browsers that don't support ES6 modules
console.log('🚨 FALLBACK SCRIPT LOADED!');

// Basic initialization
window.addEventListener('DOMContentLoaded', () => {
    console.log('💀 Fallback initializing...');
    
    // Show error message
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #0a0e1a;
                border: 2px solid #49f7c2;
                padding: 40px;
                border-radius: 10px;
                text-align: center;
                color: #49f7c2;
                font-family: monospace;
                box-shadow: 0 0 30px rgba(73, 247, 194, 0.5);
            ">
                <h1 style="margin: 0 0 20px 0; text-shadow: 0 0 20px currentColor;">
                    🔥 HACKER LAB v2.0 🔥
                </h1>
                <p style="color: #ff5c7a; margin-bottom: 20px;">
                    ⚠️ ES6 Modules Loading Issue Detected!
                </p>
                <p style="margin-bottom: 20px;">
                    Please make sure you're accessing the app via:<br>
                    <strong style="color: #7ea8ff;">http://localhost:8000</strong>
                </p>
                <p style="color: #ffd36e; font-size: 14px;">
                    NOT via file:// protocol!
                </p>
                <div style="margin-top: 30px; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 5px;">
                    <p style="margin: 0; color: #999;">
                        If the server is not running, execute:<br>
                        <code style="color: #49f7c2;">python -m http.server 8000</code>
                    </p>
                </div>
            </div>
        `;
    }
});
